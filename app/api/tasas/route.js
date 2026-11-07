import { getRates } from "../../../lib/fetchRates";

export async function GET() {
  const rates = await getRates();

  if (!rates) {
    return Response.json({ error: 'Error al obtener las tasas' }, { status: 500 });
  }

  return Response.json(rates, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
