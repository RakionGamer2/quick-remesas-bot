import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(process.cwd(), "fonts", "Roboto-SemiBold.ttf");

try {
  registerFont(fontPath, { family: "Roboto SemiBold" });
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesVenezuela(rates) {
  const imagePath = path.join(process.cwd(), "public", "venezuela.jpg");
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
  const dateX = 410; 
  const dateY = 89;
  ctx.strokeText(now, dateX, dateY);
  ctx.fillText(now, dateX, dateY);


   const timePart = new Date().toLocaleString("en-VE", {
    timeZone: "America/Caracas",
    hour: "2-digit",    
    minute: "2-digit",
    hour12: true  
  });

  ctx.font = "44px Roboto SemiBold"; 
  const timeText = `${timePart} Hora Vzla`;
  const timeX = 770; 
  ctx.strokeText(timeText, timeX, dateY);
  ctx.fillText(timeText, timeX, dateY);


  const positions = {
    "Chile": [177, 351],
    "Argentina": [178, 469],
    "EEUU": [523, 470],
    "Brasil": [490, 725],
    "Venezuela": [587, 792],     
    "Peru": [526, 351],
    "Colombia": [497, 605],         
    "Ecuador": [200, 724],
    "Mexico": [186, 838],
    "España": [516, 838],
    "Panamá": [210, 601]
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