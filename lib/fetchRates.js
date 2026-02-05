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

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const firstCell = row[2];
            if (firstCell && typeof firstCell === 'string' && firstCell.includes('-') || (firstCell && firstCell.length > 3)) {
              
                const valueRow = rows[i + 1];
                if (!valueRow) continue;
                for (let j = 2; j <= 11; j++) {
                    const label = row[j];
                    const rawValue = valueRow[j];

                    if (label && rawValue) {
                        const { origin, dest } = parseRoute(label);
                        const value = rawValue
                        if (!result[origin]) result[origin] = {};
                        result[origin][dest] = value;
                    }
                }
                i++; 
            }
        }

        return result;
    } catch (error) {
        console.error("Error procesando el Excel:", error);
        return null;
    }
}

