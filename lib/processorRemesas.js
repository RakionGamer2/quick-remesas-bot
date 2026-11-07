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
  "Chile":     [617, 204],
  "Peru":      [943, 287],
  "Perú":      [943, 287],
  "Colombia":  [533, 319],
  "Brasil":    [862, 399],
  "Argentina": [622, 431],
  "Panamá":    [950, 514],
  "Panama":    [950, 514],
  "EEUU":      [572, 539],
  "eeuu":      [572, 539],
  "España":    [862, 592],
  "Mexico":    [691, 620],
  "México":    [691, 620],
};

export async function createImageWithRatesRemesas(rates, optionalDay = null) {
  // Determinar el día de la semana según horario de Venezuela
  const resolvedDay = (optionalDay || new Date().toLocaleDateString("es-VE", {
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
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";

  // Fecha actual en hora de Venezuela
  const now = new Date().toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Fecha debajo del rótulo "Hoy [Día]"
  ctx.font = "44px Roboto SemiBold";
  const dateX = 140;
  const dateY = 218;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);

  // Pintar tasas en las píldoras con fuente 44px
  ctx.font = "44px Roboto SemiBold";
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
