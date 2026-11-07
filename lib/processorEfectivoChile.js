import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

// Coordenadas calculadas al centro del área visible de cada píldora (Lienzo 1254x1254)
const TOP_PILLS = {
  gold: [707, 184],
  pagoMovil: [1070, 184], // Pago Móvil (Tasa Silver)
  platinum: [707, 306], // "+90.000"
  diamond:  [1075, 306], // "+250.000"
};

const xLeft = 670;
const xRight = 1068;
const rowY = [640, 735, 830, 923, 1012, 1100];

const COUNTRY_SLOTS = [
  // Columna Izquierda
  { keys: ["Colombia", "colombia"], pos: [xLeft, rowY[0]] },
  { keys: ["Argentina", "argentina"], pos: [xLeft, rowY[1]] },
  { keys: ["EEUU", "eeuu", "Estados Unidos"], pos: [xLeft, rowY[2]] },
  { keys: ["Ecuador", "ecuador"], pos: [xLeft, rowY[3]] },
  { keys: ["Mexico", "México", "mexico"], pos: [xLeft, rowY[4]] },
  { keys: ["Haiti", "Haití", "haiti"], pos: [xLeft, rowY[5]] },

  // Columna Derecha
  { keys: ["Peru", "Perú", "peru"], pos: [xRight, rowY[0]] },
  { keys: ["Brasil", "brasil"], pos: [xRight, rowY[1]] },
  { keys: ["Panama", "Panamá", "panama"], pos: [xRight, rowY[2]] },
  { keys: ["España", "Espana", "españa"], pos: [xRight, rowY[3]] },
  { keys: ["RDominicana", "Dominicana", "República Dominicana"], pos: [xRight, rowY[4]] },
  { keys: ["Bolivia", "bolivia"], pos: [xRight, rowY[5]] },
];

/**
 * Genera la hora en formato "HH:MM Am/Pm hora Vzla" según la zona horaria de Venezuela.
 * @param {Date} date
 * @returns {string} Ejemplo: "11:00 Am hora Vzla"
 */
export function getTimeVzla(date = new Date()) {
  const parts = date.toLocaleTimeString("en-US", {
    timeZone: "America/Caracas",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const [time, period] = parts.split(" ");
  const formattedPeriod = period
    ? period.charAt(0).toUpperCase() + period.slice(1).toLowerCase()
    : "";
  return `${time} ${formattedPeriod} hora Vzla`;
}

export async function createImageWithRatesEfectivoChile(rates, customDate = new Date()) {
  const imagePath = path.join(process.cwd(), "public", "remesas", "efectivo-chile.png");
  const image = await loadImage(imagePath);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";

  const dateObj = customDate instanceof Date ? customDate : new Date();

  // Fecha actual en hora de Venezuela (DD/MM/YYYY)
  const now = dateObj.toLocaleDateString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Hora actual en hora de Venezuela (HH:MM Am/Pm hora Vzla)
  const timeText = getTimeVzla(dateObj);

  // 1. Fecha en el banner curvo amarillo (46px)
  ctx.font = "46px Roboto SemiBold";
  ctx.lineWidth = 5.5;
  const dateX = 159;
  const dateY = 210;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);

  // 2. Hora en el banner curvo amarillo (35px)
  ctx.font = "35px Roboto SemiBold";
  ctx.lineWidth = 4.5;
  const timeX = 190;
  const timeY = 270;
  ctx.strokeText(timeText, timeX, timeY);
  ctx.fillText(timeText, timeX, timeY);

  // 3. Pintar tasas superiores de Venezuela (38px)
  ctx.font = "38px Roboto SemiBold";
  ctx.lineWidth = 5.5;

  // Gold (Venezuela_Gold)
  const goldRate = rates.Venezuela_Gold || rates.Gold || rates.gold;
  if (goldRate) {
    ctx.strokeText(goldRate, TOP_PILLS.gold[0], TOP_PILLS.gold[1]);
    ctx.fillText(goldRate, TOP_PILLS.gold[0], TOP_PILLS.gold[1]);
  }

  // Platinum (+90.000)
  const platRate = rates.Venezuela_Platinum || rates.Platinum || rates.platinum;
  if (platRate) {
    ctx.strokeText(platRate, TOP_PILLS.platinum[0], TOP_PILLS.platinum[1]);
    ctx.fillText(platRate, TOP_PILLS.platinum[0], TOP_PILLS.platinum[1]);
  }

  // Diamond (+250.000)
  const diaRate = rates.Venezuela_Diamond || rates.Diamond || rates.diamond;
  if (diaRate) {
    ctx.strokeText(diaRate, TOP_PILLS.diamond[0], TOP_PILLS.diamond[1]);
    ctx.fillText(diaRate, TOP_PILLS.diamond[0], TOP_PILLS.diamond[1]);
  }

  



  // Pago Móvil (Venezuela_Silver)
  const silverRate = rates.Venezuela_Silver || rates.Silver || rates.silver || rates.pagoMovil;
  if (silverRate) {
    ctx.strokeText(silverRate, TOP_PILLS.pagoMovil[0], TOP_PILLS.pagoMovil[1]);
    ctx.fillText(silverRate, TOP_PILLS.pagoMovil[0], TOP_PILLS.pagoMovil[1]);
  }

  // 4. Pintar tasas de países inferiores (38px)
  for (const slot of COUNTRY_SLOTS) {
    const val = slot.keys.map(k => rates[k]).find(v => v !== undefined && v !== null && v !== "");
    if (val) {
      ctx.strokeText(val, slot.pos[0], slot.pos[1]);
      ctx.fillText(val, slot.pos[0], slot.pos[1]);
    }
  }

  return canvas.toBuffer("image/png");
}
