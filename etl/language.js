import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_language() {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT language_id, name
            FROM language
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const languages = rows.map((r) => ({
            id: r.language_id,
            name: r.name,
        }));
        // Eliminar y crear la tabla en el Data Warehouse
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS language;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS language (
                language_id INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `);
        // 3. CARGA (Load)
        for (const lang of languages) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO language (language_id, name)
                VALUES ($1, $2)
                ON CONFLICT (language_id)
                DO UPDATE SET
                    name = EXCLUDED.name
                    ;
                `,
                [lang.id, lang.name]
            );
        }
        console.log("ETL de language finalizado");
    } catch (error) {
        console.error("Error in ETL for language:", error);
    }
}
