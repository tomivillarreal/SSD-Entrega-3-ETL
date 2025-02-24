export async function etl_time(sakila, sakilaDataWareHouse) {
  try {
    // Extraer año, mes y día de la columna rental_date en la tabla rental.
    const { rows: rental } = await sakila.query(`
      SELECT DISTINCT 
        EXTRACT(YEAR FROM rental_date)::INT AS year, 
        EXTRACT(MONTH FROM rental_date)::INT AS month, 
        EXTRACT(DAY FROM rental_date)::INT AS day 
      FROM rental
    `);

    // Generar cadenas únicas "year-month-day" y ordenarlas.
    const tiempos = rental
      .map(r => `${r.year}-${r.month}-${r.day}`)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();

    // Preparar los valores para la inserción.
    const timeValues = tiempos
      .map((tiempo, index) => {
        const [year, month, day] = tiempo.split("-");
        return `(${index + 1}, ${year}, ${month}, ${day})`;
      })
      .join(", ");

    // Insertar los valores en la tabla time.
    await sakilaDataWareHouse.query(`
      INSERT INTO time (id, ano, mes, dia)
      VALUES ${timeValues}
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("ETL de time finalizado");
  } catch (error) {
    console.error("Error in ETL for time:", error);
  }
}