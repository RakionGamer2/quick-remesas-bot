import Papa from 'papaparse';
import 'dotenv/config';

const SHEET_URL = process.env.SHEET_URL;

const parseRoute = (label) => {
    const parts = label.split(/\s*-\s*|\s+a\s+|\s+/i);
    if (parts.length >= 2) {
        return { 
            origin: parts[0].trim(), 
            dest: parts.slice(1).join(' ').trim() 
        };
    }
    return { origin: label, dest: 'unknown' };
};

export async function getRates() {
    try {
        const res = await fetch(SHEET_URL);
        const csvText = await res.text();

        const { data: rows } = Papa.parse(csvText, { header: false });
        const result = {};
        
        let inBlueTable = false; // Bandera para saber si estamos dentro de la tabla azul

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const firstCell = row[2]; // Índice 2 equivale a la columna C

            // Si ya entramos a la tabla azul y encontramos una celda vacía, significa que la tabla terminó.
            // Rompemos el bucle para no sobreescribir los datos con las tablas de abajo.
            if (inBlueTable && (!firstCell || firstCell.trim() === '')) {
                break;
            }

            // Detectamos si es una fila de encabezados (ej. "Chile-Peru")
            if (firstCell && typeof firstCell === 'string' && firstCell.includes('-')) {
                inBlueTable = true; // Marcamos que ya encontramos la tabla
                
                const valueRow = rows[i + 1];
                if (!valueRow) continue;
                
                // Recorremos las columnas de la C (2) a la L (11)
                for (let j = 2; j <= 11; j++) {
                    const label = row[j];
                    const rawValue = valueRow[j];

                    if (label && rawValue) {
                        const { origin, dest } = parseRoute(label);
                        const value = rawValue;
                        if (!result[origin]) result[origin] = {};
                        result[origin][dest] = value;
                    }
                }
                i++; // Saltamos la fila de valores para no procesarla como encabezado
            }
        }

        return result;
    } catch (error) {
        console.error("Error procesando el Excel:", error);
        return null;
    }
}
