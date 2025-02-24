import express from 'express';
import { etl_category } from './etl/dimensions/category.js';
import { etl_customer } from './etl/dimensions/customer.js';
import { etl_film } from './etl/dimensions/film.js';
import { etl_language } from './etl/dimensions/language.js';
import { etl_payment_type } from './etl/dimensions/payment_type.js';
import { etl_staff } from './etl/dimensions/staff.js';
import { etl_store } from './etl/dimensions/store.js';
import { etl_time } from './etl/dimensions/time.js';
import { sakila, sakilaDataWareHouse } from './models/db.js';
import { etl_rental } from './etl/fact/rental.js';

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(`Inicializando databases...`);
    const sakilaRelationalDatabase = sakila;
    const sakilaDataWarehouse = sakilaDataWareHouse;
    console.log(`Databases inicializadas`);
    console.log(`Cargando datos en el Data Warehouse...`);
    await etl_category(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_customer(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_film(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_language(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_payment_type(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_staff(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_store(sakilaRelationalDatabase, sakilaDataWarehouse);
    await etl_time(sakilaRelationalDatabase, sakilaDataWarehouse);
    console.log(`Ejecutando querys en el Data Warehouse...`);
    await etl_rental(sakilaRelationalDatabase, sakilaDataWarehouse);
    console.log(`Datos cargados en el Data Warehouse`);
});
