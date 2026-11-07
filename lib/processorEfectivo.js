import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesEfectivo(rates) {
  const imagePath = path.join(process.cwd(), "public", "efectivo-1.png");
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

  const now = new Date().toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); 

  // Fecha centrada en cápsula superior
  ctx.font = "44px Roboto SemiBold"; 
  const dateX = 962; 
  const dateY = 138;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);

  const xLeft = 400;
  const xRight = 970;
  const rowY = [481, 608, 725, 827, 927, 1027];

  const positions = {
    // Columna Izquierda
    "Chile":                [xLeft,  rowY[0]],
    "Argentina":            [xLeft,  rowY[1]],
    "Panamá":               [xLeft,  rowY[2]],
    "Panama":               [xLeft,  rowY[2]],
    "Ecuador":              [xLeft,  rowY[3]],
    "Mexico":               [xLeft,  rowY[4]],
    "México":               [xLeft,  rowY[4]],
    "Bolivia":              [xLeft,  rowY[5]],

    // Columna Derecha
    "Peru":                 [xRight, rowY[0]],
    "Perú":                 [xRight, rowY[0]],
    "Colombia":             [xRight, rowY[1]],
    "EEUU":                 [xRight, rowY[2]],
    "Brasil":               [xRight, rowY[3]],
    "España":               [xRight, rowY[4]],
    "R Dominicana":         [xRight, rowY[5]],
    "Dominicana":           [xRight, rowY[5]],
    "República Dominicana": [xRight, rowY[5]],

    // Fila Central Inferior
    "Haití":                [686, 1132],
    "Haiti":                [686, 1132],
  };

  // Pintar tasas de países
  ctx.font = "33px Roboto SemiBold";
  for (const [country, value] of Object.entries(rates)) {
    if (country.toLowerCase().includes("efectivo")) continue;

    const pos = positions[country];
    if (pos) {
      const text = `${value}`;
      ctx.strokeText(text, pos[0], pos[1]);
      ctx.fillText(text, pos[0], pos[1]);
    }
  }

  return canvas.toBuffer("image/png");
}
