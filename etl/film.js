export async function etl_film(sakila, sakilaDataWareHouse) {
    try {
        // 1. EXTRACCIÓN (Extract)
        const { rows } = await sakila.query(`
            SELECT film_id, title
            FROM film
            ;
        `);
        // 2. TRANSFORMACIÓN (Transform)
        const films = rows.map((r) => ({
            id: r.film_id,
            title: r.title,
        }));
        // 3. CARGA (Load)
        for (const film of films) {
            await sakilaDataWareHouse.query(
                `
                INSERT INTO film (
                    film_id, title
                )
                VALUES ($1, $2)
                ON CONFLICT (film_id)
                DO UPDATE SET
                    title = EXCLUDED.title
                    ;
                `,
                [
                    film.id,
                    film.title,
                ]
            );
        }
        console.log("ETL de film finalizado");
    } catch (error) {
        console.error("Error in ETL for film:", error);
    }
}
