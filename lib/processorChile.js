import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesChile(rates) {
  const imagePath = path.join(process.cwd(), "public", "chile-1.png");
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

  // Fecha
  const now = new Date().toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  ctx.font = "44px Roboto SemiBold";
  const dateX = 908;
  const dateY = 93;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);


  const xLeft = 398;
  const xRight = 974
  const startY = 482;
  const stepY = 126; // Distancia vertical entre cada fila
  const positions = {
    "Peru":     [xLeft, startY],              // 482
    "Colombia": [xLeft, startY + stepY],      // 482 + 126 = 608
    "Ecuador":  [xLeft, startY + stepY * 2],  // 482 + 252 = 734
    "Brasil":   [xLeft, startY + stepY * 3],  // 482 + 378 = 860
    "Bolivia":  [xLeft, startY + stepY * 4],  // 482 + 504 = 986
    "Haití":    [xLeft, startY + stepY * 5],  // 482 + 630 = 1112
    // Columna derecha
    "Argentina":[xRight, startY],               
    "EEUU": [xRight, startY + stepY],      
    "Mexico":  [xRight, startY + stepY * 2],  
    "Panamá":   [xRight, startY + stepY * 3],  
    "España":  [xRight, startY + stepY * 4], 
    "R Dominicana":    [xRight, startY + stepY * 5],
  };

  // Pintar tasas de países
  ctx.font = "32px Roboto SemiBold";
  for (const [country, value] of Object.entries(rates)) {
    // Si viene alguna variación de efectivo en el objeto, la ignoramos aquí
    if (country.toLowerCase().includes("efectivo")) continue;

    const pos = positions[country];
    if (pos) {
      const text = `${value}`;
      ctx.strokeText(text, pos[0], pos[1]);
      ctx.fillText(text, pos[0], pos[1]);
    }
  }

  // Pintar exactamente "Consultar Tasa" fijo en la casilla de efectivo
 

  return canvas.toBuffer("image/png");
}
