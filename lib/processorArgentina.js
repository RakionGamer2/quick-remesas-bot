import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesArgentina(rates) {
  const imagePath = path.join(process.cwd(), "public", "argentina.jpg");
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

  ctx.font = "44px Roboto SemiBold"; 
  const dateX = 908; 
  const dateY = 93;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);

  const positions = {
    "Chile": [565, 354],
    "Colombia": [549, 477],
    "Ecuador": [677, 608],
    "Brasil": [586, 742],
    "Venezuela": [585, 792],     
    "Perú": [927, 352],
    "EEUU": [865, 477],         
    "Mexico": [981, 608],
    "Panamá": [904, 742],
    "España": [954, 856]
  };

  ctx.font = "44px Roboto SemiBold";

  for (const [country, value] of Object.entries(rates)) {
    if (country.toLowerCase().includes("efectivo")) continue;

    const pos = positions[country];
    if (pos) {
      const text = `${value}`;
      ctx.strokeText(text, pos[0], pos[1]);
      ctx.fillText(text, pos[0], pos[1]);
    }
  }

  // Pintar "Consultar Tasa" en la posición de Efectivo de Argentina
  const [cashX, cashY] = [623, 856];
  ctx.font = "32px Roboto SemiBold";
  const cashText = "Consultar Tasa";
  ctx.strokeText(cashText, cashX, cashY);
  ctx.fillText(cashText, cashX, cashY);

  return canvas.toBuffer("image/png");
}
