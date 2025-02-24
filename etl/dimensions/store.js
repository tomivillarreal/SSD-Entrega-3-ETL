export async function etl_store(sakila, sakilaDataWareHouse) {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT store_id, address.address, 
            FROM store
            LEFT JOIN address ON store.address_id = address.address_id
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const stores = rows.map((r) => ({
            id: r.store_id,
            address: r.address,
        }));
        // 3. CARGA (Load)
        for (const store of stores) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO store (store_id, address)
                VALUES ($1, $2, $3)
                ON CONFLICT (store_id)
                DO UPDATE SET
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
