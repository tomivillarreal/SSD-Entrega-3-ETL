import { sakila, sakilaDataWareHouse } from "../models/db.js";

export async function etl_film() {
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
        // Eliminar y crear la tabla en el Data Warehouse
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS film;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS film (
                film_id INT PRIMARY KEY,
                title VARCHAR(255) NOT NULL
            );
        `);
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
