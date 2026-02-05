import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesBrasil(rates) {
  const imagePath = path.join(process.cwd(), "public", "brasil.jpg");
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
    "Chile": [570, 354],
    "Argentina": [548, 477],
    "EEUU": [668, 608],
    "Mexico": [590, 742],
    "Venezuela": [587, 792],     
    "Peru": [923, 350],
    "Colombia": [873, 477],         
    "Ecuador": [978, 608],
    "Panamá": [887, 737],
    "España": [930, 865],
    "Efectivo": [613, 856]       
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