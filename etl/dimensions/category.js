export async function etl_category(sakila, sakilaDataWareHouse) {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
      SELECT category_id, name
      FROM category
    `);
        // 2. TRANSFORMACIÓN (Transform)
        const categories = rows.map((r) => ({
            id: r.category_id,
            name: r.name,
        }));
        // 3. CARGA (Load)
        for (const category of categories) {
            await sakilaDataWareHouse.query(
                `
        INSERT INTO category (category_id, name)
        VALUES ($1, $2)
        ON CONFLICT (category_id)
        DO UPDATE SET
        name = EXCLUDED.name
        ;
      `,
                [category.id, category.name]
            );
        }
        console.log("ETL de category finalizado");
    } catch (error) {
        console.error("Error in ETL for category:", error);
    }
}