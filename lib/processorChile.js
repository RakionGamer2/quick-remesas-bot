import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesChile(rates) {
  const imagePath = path.join(process.cwd(), "public", "chile.jpg");
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
    "Peru": [573, 350],
    "Colombia": [533, 477],
    "Ecuador": [677, 606],
    "Brasil": [582, 741],
    "Venezuela": [585, 792],     
    "Argentina": [930, 350],
    "EEUU": [865, 477],         
    "Mexico": [981, 606],
    "Panamá": [882, 735],
    "España": [959, 854],
    "Efectivo": [623, 854]       
  };

  ctx.font = "44px Roboto SemiBold";

  for (const [country, value] of Object.entries(rates)) {
    const pos = positions[country];
    if (pos) {
      const text = `${value}`;
      ctx.strokeText(text, pos[0], pos[1]);
      ctx.fillText(text, pos[0], pos[1]);
    }
  }
  return canvas.toBuffer("image/png");
}