import { getRates } from './lib/fetchRates.js';

async function main() {
  console.log('Consultando tasas desde Google Sheets...\n');
  const rates = await getRates();

  if (!rates) {
    console.error('Error: No se pudieron obtener las tasas.');
    return;
  }

  console.log('\n✅ Tasas obtenidas con éxito.\n');
  console.log('Paises detectados:', Object.keys(rates).join(', '));
  console.log('\n--- DETALLE COMPLETO (JSON) ---');
  console.log(JSON.stringify(rates, null, 2));
}

main();
