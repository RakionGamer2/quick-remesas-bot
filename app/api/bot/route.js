import { bot } from "../../../lib/telegram";
import { getRates } from "../../../lib/fetchRates";
import { createImageWithRatesVenezuela } from "../../../lib/processorVenezuela";
import { createImageWithRatesPeru } from "../../../lib/processorPeru";
import { createImageWithRatesChile } from "../../../lib/processorChile";
import { createImageWithRatesArgentina } from "../../../lib/processorArgentina";
import { createImageWithRatesBrasil } from "../../../lib/processorBrasil";
import { createImageWithRatesColombia } from "../../../lib/processorColombia";
import { createImageWithRatesEfectivo } from "../../../lib/processorEfectivo";
import { createImageWithRatesEEUU } from "../../../lib/processorEEUU";
import { createImageWithRatesEspana } from "../../../lib/processorEspana";
import { createImageWithRatesPanama } from "../../../lib/processorPanama";

const IMAGE_PROCESSORS = [
  { key: 'chile', processor: createImageWithRatesChile },
  { key: 'peru', processor: createImageWithRatesPeru },
  { key: 'argentina', processor: createImageWithRatesArgentina },
  { key: 'colombia', processor: createImageWithRatesColombia },
  { key: 'brasil', processor: createImageWithRatesBrasil },
  { key: 'eeuu', processor: createImageWithRatesEEUU },
  { key: 'espana', processor: createImageWithRatesEspana },
  { key: 'panama', processor: createImageWithRatesPanama },
  { key: 'venezuela', processor: createImageWithRatesVenezuela },
  { key: 'efectivo', processor: createImageWithRatesEfectivo },
];

// Se añade el nuevo botón al teclado principal
const PERSISTENT_KEYBOARD = {
  reply_markup: {
    keyboard: [
      [
        { text: "Generar Tasas💸" },
        { text: "Consultar Tasas📊" }
      ]
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

const UPDATE_BUTTON = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Actualizar Tasas🔄",
          callback_data: "update_all",
        },
      ],
    ],
  },
};

export async function POST(req) {
  try {
    const update = await req.json();

    const chatId =
      update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    const rawText = (update.message?.text || "").trim();
    const text = rawText.toLowerCase();
    const callbackData = update.callback_query?.data;

    if (update.callback_query) {
      await bot.answerCallbackQuery(update.callback_query.id);
    }

    const WELCOME_MESSAGE = `🤖 ¡Hola! Soy QuickRate, tu bot generador de imágenes.

📋 ¿Cómo usarme?

1️⃣ Presiona "Generar Tasas💸" para procesar las imágenes
2️⃣ Presiona "Consultar Tasas📊" (o escribe "tasas") para ver los valores en texto
3️⃣ Usa el botón "🔄 Actualizar Tasas" cuando necesites tasas nuevas

¡Comencemos! 👇`;

    if (text === "/start" || text === "start") {
      await bot.sendMessage(chatId, WELCOME_MESSAGE, PERSISTENT_KEYBOARD);
      return new Response("ok", { status: 200 });
    }

    // Manejo de consulta de tasas en texto
    if (text === "consultar tasas📊" || text === "consultar tasas" || text === "tasas" || text === "tasa") {
      const rawRates = await getRates();

      if (!rawRates || Object.keys(rawRates).length === 0) {
        await bot.sendMessage(
          chatId,
          "No encontré tasas disponibles en este momento.",
          PERSISTENT_KEYBOARD
        );
        return new Response("ok", { status: 200 });
      }

      let message = "📊 *TASAS ACTUALES*\n\n";

      for (const [origin, destinations] of Object.entries(rawRates)) {
        if (typeof destinations === 'object' && destinations !== null) {
          for (const [dest, rate] of Object.entries(destinations)) {
            message += `*${origin}-${dest}*: ${rate}\n`;
          }
        }
      }

      await bot.sendMessage(chatId, message, {
        parse_mode: "Markdown",
        ...PERSISTENT_KEYBOARD,
      });

      return new Response("ok", { status: 200 });
    }

    // Manejo de generación de imágenes
    if (callbackData === "update_all" || text === "generar tasas💸") {
      const processingMsg = await bot.sendMessage(
        chatId,
        "⏳ Procesando imágenes... Esto puede durar máximo 1 minuto"
      );

      const rawRates = await getRates();

      const rates = {
        ecuador: rawRates["Ecuador"] || rawRates["ECUADOR"],
        mexico: rawRates["Mexico"] || rawRates["México"] || rawRates["MEXICO"],
        venezuela: { ...(rawRates["Venezuela"] || {}), ...(rawRates["Vzla"] || {}) },
        peru: rawRates["Perú"] || rawRates["Peru"] || rawRates["PERU"],
        chile: rawRates["Chile"] || rawRates["CHILE"],
        argentina: rawRates["Argentina"] || rawRates["ARGENTINA"],
        brasil: rawRates["Brasil"] || rawRates["BR"] || rawRates["BRASIL"],
        colombia: rawRates["Colombia"] || rawRates["COLOMBIA"],
        eeuu: rawRates["EEUU"] || rawRates["eeuu"],
        espana: rawRates["España"] || rawRates["españa"],
        panama: rawRates["Panamá"] || rawRates["Panama"],
        efectivo: rawRates["Efectivo"] || rawRates["efectivo"],
      };

      if (Object.values(rates).every(val => !val || Object.keys(val).length === 0)) {
        await bot.editMessageText("No encontré tasas disponibles en este momento", {
          chat_id: chatId,
          message_id: processingMsg.message_id,
        });
        return new Response("ok", { status: 200 });
      }

      const imagePromises = IMAGE_PROCESSORS
        .filter(({ key }) => rates[key] && Object.keys(rates[key]).length > 0)
        .map(async ({ key, processor }) => {
          try {
            const buffer = await processor(rates[key]);
            return { buffer };
          } catch (error) {
            console.error(`Error procesando ${key}:`, error);
            return null;
          }
        });

      const images = (await Promise.all(imagePromises)).filter(Boolean);

      if (images.length === 0) {
        await bot.sendMessage(
          chatId,
          "No se pudieron generar imágenes en este momento",
          PERSISTENT_KEYBOARD
        );
        return new Response("ok", { status: 200 });
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const isLast = i === images.length - 1;

        await bot.sendPhoto(chatId, img.buffer, {
          caption: img.caption,
          reply_markup: isLast ? UPDATE_BUTTON.reply_markup : undefined,
        });
      }

      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("ok", { status: 200 });
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: "API Bot funcionando" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
