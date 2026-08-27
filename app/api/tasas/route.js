// api/tasas.js
import { getRates } from "../../../lib/fetchRates";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const rates = await getRates();

  if (!rates) {
    return res.status(500).json({ error: 'Error al obtener las tasas' });
  }

  // Opcional: Permitir peticiones desde cualquier origen (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json(rates);
}
