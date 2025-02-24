export async function etl_time(sakila, sakilaDataWareHouse) {
  try {
    // 2. Extraer y transformar datos desde sakila (la fuente)
    // Nota: La tabla sakila no tiene la dimensión "time". Extraemos rental_date para conformarla en el DW.
    const extractionQuery = `
      SELECT
          r.rental_id AS id,
          r.rental_date,
          r.customer_id,
          inv.film_id,
          s.store_id,
          r.staff_id,
          p.payment_type_id,
          fc.category_id,
          f.language_id,
          p.amount AS incomeAmount,
          CASE 
              WHEN r.return_date IS NOT NULL 
                   AND r.return_date > r.rental_date + INTERVAL '3 days'
                THEN EXTRACT(day FROM (r.return_date - (r.rental_date + INTERVAL '3 days'))) * 1.00 
              ELSE 0 
          END AS fineAmount,
          COALESCE(d.discount_value, 0) AS discountPercentage,
          CASE 
              WHEN p.discount_id IS NOT NULL THEN 1 
              ELSE 0 
          END AS discountQuantity
      FROM rental r
          JOIN inventory inv ON r.inventory_id = inv.inventory_id
          JOIN film f ON inv.film_id = f.film_id
          JOIN film_category fc ON f.film_id = fc.film_id
          JOIN store s ON inv.store_id = s.store_id
          JOIN "payment" p ON r.rental_id = p.rental_id
          LEFT JOIN discount d ON p.discount_id = d.discount_id;
    `;
    console.log('Ejecutando extracción de datos desde sakila...');
    const { rows } = await sakila.query(extractionQuery);
    console.log(`Extracción completada. Se obtuvieron ${rows.length} registros.`);

    // 3. Insertar los datos transformados en el DW usando la dimensión "time" del DW.
    const client = await sakilaDataWareHouse.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO rental (
            id, 
            time_id, 
            customer_id, 
            film_id, 
            store_id, 
            staff_id, 
            payment_type_id, 
            category_id, 
            language_id, 
            incomeAmount, 
            fineAmount,
            discountPercentage,
            discountQuantity
        )
        VALUES (
            $1, 
            (SELECT id FROM time WHERE ano = $2 AND mes = $3 AND dia = $4 LIMIT 1), 
            $5, 
            $6, 
            $7, 
            $8, 
            $9, 
            $10, 
            $11, 
            $12, 
            $13, 
            $14, 
            $15
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      for (const row of rows) {
        // Convertir rental_date a un objeto Date para extraer año, mes y día.
        const rentalDate = new Date(row.rental_date);
        const rentalYear = rentalDate.getFullYear();
        const rentalMonth = rentalDate.getMonth() + 1; // Los meses en JavaScript son 0-indexados.
        const rentalDay = rentalDate.getDate();

        await client.query(insertQuery, [
          row.id,
          rentalYear,
          rentalMonth,
          rentalDay,
          row.customer_id,
          row.film_id,
          row.store_id,
          row.staff_id,
          row.payment_type_id,
          row.category_id,
          row.language_id,
          row.incomeamount,      // Asegúrate que el nombre coincide con el alias de la consulta
          row.fineamount,
          row.discountpercentage,
          row.discountquantity
        ]);
      }

      await client.query('COMMIT');
      console.log('Carga en DW completada exitosamente.');
    } catch (insertError) {
      await client.query('ROLLBACK');
      console.error('Error durante la inserción en DW. Transacción revertida.', insertError);
    } finally {
      client.release();
    }

    // 4. (Opcional) Consulta unificada de indicadores para validar la carga en el DW.
    const unifiedQuery = `
      WITH 
      q1 AS (
          SELECT 
               store_id,
               payment_type_id,
               ROUND(100.0 * SUM(CASE WHEN discountQuantity = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS porcentaje_alquileres_con_descuento
          FROM rental
          JOIN time t ON rental.time_id = t.id
          WHERE MAKE_DATE(t.ano, t.mes, t.dia) BETWEEN CURRENT_DATE - INTERVAL '1 year' AND CURRENT_DATE
          GROUP BY store_id, payment_type_id
      ),
      q2 AS (
          SELECT
               payment_type_id,
               language_id,
               store_id,
               category_id,
               SUM(incomeAmount) AS total_ingresos
          FROM rental
          JOIN time t ON rental.time_id = t.id
          WHERE MAKE_DATE(t.ano, t.mes, t.dia) BETWEEN CURRENT_DATE - INTERVAL '2 years' AND CURRENT_DATE
          GROUP BY payment_type_id, language_id, store_id, category_id
      ),
      q3 AS (
          SELECT
               staff_id,
               store_id,
               COUNT(DISTINCT film_id) AS cantidad_peliculas_alquiladas
          FROM rental
          JOIN time t ON rental.time_id = t.id
          WHERE MAKE_DATE(t.ano, t.mes, t.dia) BETWEEN CURRENT_DATE - INTERVAL '1 year' AND CURRENT_DATE
          GROUP BY staff_id, store_id
      ),
      q4 AS (
          SELECT
               category_id,
               store_id,
               customer_id,
               COUNT(film_id) AS cantidad_alquiladas_con_descuento
          FROM rental
          JOIN time t ON rental.time_id = t.id
          WHERE discountQuantity = 1
            AND MAKE_DATE(t.ano, t.mes, t.dia) BETWEEN CURRENT_DATE - INTERVAL '2 years' AND CURRENT_DATE
          GROUP BY category_id, store_id, customer_id
      ),
      q5 AS (
          SELECT
               film_id,
               customer_id,
               store_id,
               SUM(fineAmount) AS total_multa
          FROM rental
          JOIN time t ON rental.time_id = t.id
          WHERE MAKE_DATE(t.ano, t.mes, t.dia) BETWEEN CURRENT_DATE - INTERVAL '2 years' AND CURRENT_DATE
          GROUP BY film_id, customer_id, store_id
      )
      SELECT 'Consulta 1' AS consulta, 
             json_build_object('store_id', store_id, 'payment_type_id', payment_type_id) AS dimensiones,
             porcentaje_alquileres_con_descuento AS valor
      FROM q1
      UNION ALL
      SELECT 'Consulta 2',
             json_build_object('payment_type_id', payment_type_id, 'language_id', language_id, 'store_id', store_id, 'category_id', category_id),
             total_ingresos
      FROM q2
      UNION ALL
      SELECT 'Consulta 3',
             json_build_object('staff_id', staff_id, 'store_id', store_id),
             cantidad_peliculas_alquiladas::numeric
      FROM q3
      UNION ALL
      SELECT 'Consulta 4',
             json_build_object('category_id', category_id, 'store_id', store_id, 'customer_id', customer_id),
             cantidad_alquiladas_con_descuento::numeric
      FROM q4
      UNION ALL
      SELECT 'Consulta 5',
             json_build_object('film_id', film_id, 'customer_id', customer_id, 'store_id', store_id),
             total_multa
      FROM q5;
    `;
    const unifiedResult = await sakilaDataWareHouse.query(unifiedQuery);
    console.log('Consulta unificada de indicadores:', unifiedResult.rows);
  } catch (error) {
    console.error('Error en el proceso ETL:', error);
  }
}
