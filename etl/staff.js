import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_staff() {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT staff_id, first_name, last_name
            FROM staff
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const staffList = rows.map((r) => ({
            id: r.staff_id,
            firstName: r.first_name,
            lastName: r.last_name,
        }));
        // Eliminar y crear la tabla en el Data Warehouse
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS staff;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS staff (
                staff_id INT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL
            );
        `);
        // 3. CARGA (Load)
        for (const staff of staffList) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO staff (
                    staff_id, first_name, last_name
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (staff_id)
                DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name
                    ;
                `,
                [
                    staff.id,
                    staff.firstName,
                    staff.lastName
                ]
            );
        }
        console.log("ETL de staff finalizado");
    } catch (error) {
        console.error("Error in ETL for staff:", error);
    }
}
