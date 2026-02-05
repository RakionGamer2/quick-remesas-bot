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

const PERSISTENT_KEYBOARD = {
  reply_markup: {
    keyboard: [[{ text: "Generar Tasas💸" }]],
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
    const text = (update.message?.text || "").trim();
    const callbackData = update.callback_query?.data;

    if (update.callback_query) {
      await bot.answerCallbackQuery(update.callback_query.id);
    }

    const WELCOME_MESSAGE = `🤖 ¡Hola! Soy QuickRate, tu bot generador de imágenes.

📋 ¿Cómo usarme?

1️⃣ Presiona el botón "Generar Tasas" en tu teclado
2️⃣ Espera mientras proceso las imágenes (máximo 1 minuto)
3️⃣ Recibirás las imágenes con las tasas actualizadas
4️⃣ Usa el botón "🔄 Actualizar Tasas" cuando necesites tasas nuevas, también puedes darle al botón de "Generar Tasas"

💡 Tip: El botón está siempre disponible en tu teclado para que generes tasas cuando quieras.

¡Comencemos! 👇`;

    if (text === "/start" || text === "start") {
      await bot.sendMessage(chatId, WELCOME_MESSAGE, PERSISTENT_KEYBOARD);
      return new Response("ok", { status: 200 });
    }

    if (callbackData === "update_all" || text === "Generar Tasas💸") {
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