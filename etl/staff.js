import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_staff(sakila, sakilaDataWareHouse) {
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
