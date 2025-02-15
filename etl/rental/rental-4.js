import { sakila, sakilaDataWareHouse } from "../../models/db.js";

export async function etl_rental_4() {
    try {
        // 1. Extracción: obtener alquileres con descuentos de los últimos 30 años.
        const extractQuery = `
            SELECT 
                r.rental_id, 
                r.customer_id, 
                r.inventory_id, 
                i.film_id, 
                c.category_id,
                s.store_id,
                p.amount AS payment_amount,
                d.discount_value,  -- Obtenemos el descuento real
                r.rental_date
            FROM rental r
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN store s ON i.store_id = s.store_id
            JOIN film f ON i.film_id = f.film_id
            JOIN film_category fc ON f.film_id = fc.film_id
            JOIN category c ON fc.category_id = c.category_id
            JOIN payment p ON r.rental_id = p.rental_id
            JOIN discount d ON p.discount_id = d.discount_id  -- Aquí unimos con discount
            WHERE d.discount_value > 0 
            AND r.rental_date >= NOW() - INTERVAL '30 years';
        `;
        const { rows } = await sakila.query(extractQuery);
        console.log("Extracción completada." + rows.length + " registros obtenidos.");
        // 2. Crear la tabla de hechos TH_Rental en el Data Warehouse.
        await sakilaDataWareHouse.query(`DROP TABLE IF EXISTS rental;`);
        await sakilaDataWareHouse.query(`
            CREATE TABLE IF NOT EXISTS rental (
                id SERIAL PRIMARY KEY,
                customer_id INT NOT NULL,
                film_id INT NOT NULL,
                category_id INT NOT NULL,
                store_id INT NOT NULL,
                time_id INT NOT NULL,
                discount_amount NUMERIC(10,2) NOT NULL
            );
        `);

        // 3. Carga: Insertar cada registro en TH_Rental.
        for (const row of rows) {
            // Extraer año, mes y día en JavaScript antes de insertarlo.
            const rentalDate = new Date(row.rental_date);
            const rentalYear = rentalDate.getFullYear();
            const rentalMonth = rentalDate.getMonth() + 1; // getMonth() devuelve valores de 0 a 11
            const rentalDay = rentalDate.getDate();

            const insertQuery = `
                INSERT INTO rental (customer_id, film_id, category_id, store_id, time_id, discount_amount)
                VALUES (
                    $1, 
                    $2, 
                    $3, 
                    $4, 
                    (SELECT id FROM time WHERE ano = $5 AND mes = $6 AND dia = $7 LIMIT 1), 
                    $8
                )
                ON CONFLICT DO NOTHING;
            `;

            await sakilaDataWareHouse.query(insertQuery, [
                row.customer_id,
                row.film_id,
                row.category_id,
                row.store_id,
                rentalYear,  // Pasamos el año extraído en JavaScript
                rentalMonth, // Pasamos el mes extraído en JavaScript
                rentalDay,   // Pasamos el día extraído en JavaScript
                row.discount_value,
            ]);
        }
        console.log("Carga completada en la tabla de hechos.");
    } catch (err) {
        console.error("Error en ETL:", err);
    }
}
