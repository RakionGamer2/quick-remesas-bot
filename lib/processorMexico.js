import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

// Registrar la fuente
const fontPath = path.join(process.cwd(), "fonts", "Oswald-Bold.ttf");
console.log("Cargando fuente desde:", fontPath);

try {
  registerFont(fontPath, { family: "Oswald-Bold" });
  console.log("Fuente registrada correctamente");
} catch (err) {
  console.error("Error al registrar la fuente:", err);
}

export async function createImageWithRatesMexico(rates) {
  const imagePath = path.join(process.cwd(), "public", "mexico.jpg");
  const image = await loadImage(imagePath);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 8;
  ctx.font = "47px Oswald-Bold";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000000";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const positions = {
    "CHILE": [375, 130],
    "ECUADOR": [375, 242],
    "COLOMBIA": [375, 334],
    "PERU": [375, 439],
    "BRASIL": [375, 530],
    "PANAMA": [375, 619],
    "REP. DOMINICANA": [400, 718],
    "ARGENTINA": [375, 815],
  };

  for (const [country, value] of Object.entries(rates)) {
    const pos = positions[country];
    if (pos) {
      const text = `${value}`;
      ctx.strokeText(text, pos[0], pos[1]);
      ctx.fillText(text, pos[0], pos[1]);
    }
  }

    const now = new Date().toLocaleString("es-VE", {
    timeZone: "America/Caracas",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  let [date, time] = now.split(" ");
  date = date.replace(",", "");
  const horaFinal = `${time} HRS`;


  ctx.font = "42.25px Oswald-Bold";
  ctx.fillStyle = "#ffffff"; 
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;

  const x = 856;
  const y = 555;

  ctx.strokeText(date, x, y);
  ctx.fillText(date, x, y);

  ctx.strokeText(horaFinal, x, y + 55);
  ctx.fillText(horaFinal, x, y + 55);

  return canvas.toBuffer("image/png");
}
