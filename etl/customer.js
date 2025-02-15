import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_customer() {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT customer_id, first_name, last_name
            FROM customer
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const customers = rows.map((r) => ({
            id: r.customer_id,
            firstName: r.first_name,
            lastName: r.last_name,
        }));
        // Eliminar y crear la tabla en el Data Warehouse
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS customer;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS customer (
                customer_id INT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL
            );
        `);
        // 3. CARGA (Load)
        for (const customer of customers) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO customer (
                    customer_id, first_name, last_name
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (customer_id)
                DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name
                    ;
                `,
                [
                    customer.id,
                    customer.firstName,
                    customer.lastName,
                ]
            );
        }
        console.log("ETL de customer finalizado");
    } catch (error) {
        console.error("Error in ETL for customer:", error);
    }
}
