import { getRates, getRemesasRates } from './lib/fetchRates.js';
import { createImageWithRatesRemesas } from './lib/processorRemesas.js';

async function main() {
  console.log('🔄 Consultando tasas desde Google Sheets...\n');
  const rates = await getRates();

  if (!rates) {
    console.error('❌ Error: No se pudieron obtener las tasas.');
    return;
  }

  console.log('\n✅ Tasas obtenidas con éxito.\n');
  console.log('Países detectados:', Object.keys(rates).filter(k => k !== 'remesas').join(', '));
  
  console.log('\n--- TASAS DE REMESAS (V73:V82) ---');
  console.log(JSON.stringify(rates.remesas, null, 2));

  console.log('\n🖼️ Probando generación de imagen de Remesas para hoy...');
  const buffer = await createImageWithRatesRemesas(rates.remesas);
  console.log(`✅ Imagen generada exitosamente (${buffer.length} bytes)`);
}

main();
