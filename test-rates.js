import { getRates } from './lib/fetchRates.js';
import { createImageWithRatesRemesas } from './lib/processorRemesas.js';
import { createImageWithRatesEfectivoChile } from './lib/processorEfectivoChile.js';
import fs from 'fs';

async function main() {
  console.log('🔄 Consultando tasas desde Google Sheets...\n');
  const rates = await getRates();

  if (!rates) {
    console.error('❌ Error: No se pudieron obtener las tasas.');
    return;
  }

  console.log('\n✅ Tasas obtenidas con éxito.\n');
  console.log('Orígenes detectados:', Object.keys(rates).join(', '));
  
  console.log('\n--- TASAS DE REMESAS (V73:V82) ---');
  console.log(JSON.stringify(rates.remesas, null, 2));

  console.log('\n--- TASAS DE EFECTIVO CHILE (C250:E266) ---');
  console.log(JSON.stringify(rates.efectivoChile, null, 2));

  console.log('\n🖼️ Probando generación de imagen de Remesas para hoy...');
  const bufferRemesas = await createImageWithRatesRemesas(rates.remesas);
  console.log(`✅ Imagen Remesas generada (${bufferRemesas.length} bytes)`);

  console.log('\n🖼️ Probando generación de imagen de Efectivo Chile...');
  const bufferEfectivoChile = await createImageWithRatesEfectivoChile(rates.efectivoChile);
  console.log(`✅ Imagen Efectivo Chile generada (${bufferEfectivoChile.length} bytes)`);

  fs.writeFileSync('C:/Users/pc/.gemini/antigravity/brain/bf8922be-d90c-4bf0-81d0-471122c8eeb2/efectivo_chile_final.png', bufferEfectivoChile);
  console.log('✅ Guardado en artefactos: efectivo_chile_final.png');
}

main();
