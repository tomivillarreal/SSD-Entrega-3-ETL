import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_store() {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT store_id, manager_staff_id, address.address, 
            FROM store
            LEFT JOIN address ON store.address_id = address.address_id
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const stores = rows.map((r) => ({
            id: r.store_id,
            managerStaffId: r.manager_staff_id,
            address: r.address,
        }));
        // Eliminar y crear la tabla en el Data Warehouse
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS store;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS store (
                store_id INT PRIMARY KEY,
                manager_staff_id INT NOT NULL,
                address VARCHAR NOT NULL
            );
        `);
        // 3. CARGA (Load)
        for (const store of stores) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO store (store_id, manager_staff_id, address)
                VALUES ($1, $2, $3)
                ON CONFLICT (store_id)
                DO UPDATE SET
                    manager_staff_id = EXCLUDED.manager_staff_id,
                    address = EXCLUDED.address;
                `,
                [store.id, store.managerStaffId, store.address]
            );
        }
        console.log("ETL de store finalizado");
    } catch (error) {
        console.error("Error in ETL for store:", error);
    }
}
