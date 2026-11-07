import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

const TEMPLATES_BY_DAY = {
  lunes: "remesas-lunes.png",
  martes: "remesas-martes.png",
  miercoles: "remesas-miercoles.png",
  jueves: "remesas-jueves.png",
  viernes: "remesas-viernes.png",
  sabado: "remesas-sabado.png",
  domingo: "remesas-sabado.png", // Fallback para domingo
};

// Coordenadas calculadas al centro del área visible de cada píldora (Lienzo 1080x1080)
const POSITIONS = {
  "Chile":     [620, 234],
  "Peru":      [946, 287],
  "Perú":      [946, 287],
  "Colombia":  [574, 330],
  "Brasil":    [872, 379],
  "Argentina": [632, 416],
  "Panamá":    [945, 480],
  "Panama":    [945, 480],
  "EEUU":      [594, 512],
  "eeuu":      [594, 512],
  "España":    [890, 575],
  "Mexico":    [688, 610],
  "México":    [688, 610],
};

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

export async function createImageWithRatesRemesas(rates, optionalDay = null, customDate = new Date()) {
  const dateObj = customDate instanceof Date ? customDate : new Date();

  // Determinar el día de la semana según horario de Venezuela
  const resolvedDay = (optionalDay || dateObj.toLocaleDateString("es-VE", {
    timeZone: "America/Caracas",
    weekday: "long",
  })).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const templateName = TEMPLATES_BY_DAY[resolvedDay] || "remesas-lunes.png";
  const imagePath = path.join(process.cwd(), "public", "remesas", templateName);
  const image = await loadImage(imagePath);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";

  // Fecha actual en hora de Venezuela (DD/MM/YYYY)
  const now = dateObj.toLocaleDateString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Hora actual en hora de Venezuela (HH:MM Am/Pm hora Vzla)
  const timeText = getTimeVzla(dateObj);

  // 1. Fecha exactamente alineada con la plantilla de referencia (43px, en X: 142, Y: 209)
  ctx.font = "43px Roboto SemiBold";
  ctx.lineWidth = 5.5;
  const dateX = 142;
  const dateY = 209;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);

  // 2. Hora exactamente alineada debajo de la fecha (32px, en X: 177, Y: 260)
  ctx.font = "32px Roboto SemiBold";
  ctx.lineWidth = 4.5;
  const timeX = 177;
  const timeY = 258;
  ctx.strokeText(timeText, timeX, timeY);
  ctx.fillText(timeText, timeX, timeY);

  // 3. Pintar tasas en las píldoras con fuente 42px
  ctx.font = "42px Roboto SemiBold";
  ctx.lineWidth = 6;
  for (const [country, value] of Object.entries(rates)) {
    // Los días lunes la plantilla no incluye la casilla de Panamá
    if (resolvedDay === "lunes" && country.toLowerCase().includes("panam")) {
      continue;
    }

    const pos = POSITIONS[country];
    if (pos) {
      const text = `${value}`;
      ctx.strokeText(text, pos[0], pos[1]);
      ctx.fillText(text, pos[0], pos[1]);
    }
  }

  return canvas.toBuffer("image/png");
}
