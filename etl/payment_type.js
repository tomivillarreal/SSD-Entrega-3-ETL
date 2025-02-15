import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_payment_type() {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT payment_type_id, name
            FROM payment_type
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const paymentTypes = rows.map((r) => ({
            id: r.payment_type_id,
            name: r.name,
        }));
        // Eliminar y crear la tabla en el Data Warehouse
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS payment_type;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS payment_type (
                payment_type_id INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `);
        // 3. CARGA (Load)
        for (const pt of paymentTypes) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO payment_type (payment_type_id, name)
                VALUES ($1, $2)
                ON CONFLICT (payment_type_id)
                DO UPDATE SET
                    name = EXCLUDED.name
                    ;
                `,
                [pt.id, pt.name]
            );
        }
        console.log("ETL de payment_type finalizado");
    } catch (error) {
        console.error("Error in ETL for payment_type:", error);
    }
}
