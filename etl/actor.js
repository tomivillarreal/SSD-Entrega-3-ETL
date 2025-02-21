export async function etl_actor(sakila, sakilaDataWareHouse) {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT actor_id, first_name, last_name
            FROM actor
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const actors = rows.map((r) => ({
            id: r.actor_id,
            firstName: r.first_name,
            lastName: r.last_name,
        }));
        // 3. CARGA (Load)
        for (const actor of actors) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO actor (actor_id, first_name, last_name)
                VALUES ($1, $2, $3)
                ON CONFLICT (actor_id)
                DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name
                    ;
                `,
                [actor.id, actor.firstName, actor.lastName]
            );
        }
        console.log("ETL de actor finalizado");
    } catch (error) {
        console.error("Error in ETL for actor:", error);
    }
}
