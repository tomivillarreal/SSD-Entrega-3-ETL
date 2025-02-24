import express from 'express';
import { etl_category } from './etl/category.js';
import { etl_actor } from './etl/actor.js';
import { etl_customer } from './etl/customer.js';
import { etl_film } from './etl/film.js';
import { etl_language } from './etl/language.js';
import { etl_payment_type } from './etl/payment_type.js';
import { etl_staff } from './etl/staff.js';
import { etl_store } from './etl/store.js';
import { etl_time } from './etl/time.js';
import { sakila, sakilaDataWareHouse } from './models/db.js';
import { etl_rental } from './querys_dw/rental.js';

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(`Inicializando databases...`);
    const sakilaRelationalDatabase = sakila;
    const sakilaDataWarehouse = sakilaDataWareHouse;
    console.log(`Databases inicializadas`);
    console.log(`Cargando datos en el Data Warehouse...`);
    // await etl_actor(sakilaRelationalDatabase, sakilaDataWarehouse);
    // setTimeout(async () => {
        // await etl_category(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_customer(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_film(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_language(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_payment_type(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_staff(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_store(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_time(sakilaRelationalDatabase, sakilaDataWarehouse);
        console.log(`Datos cargados en el Data Warehouse`);
        console.log(`Ejecutando querys en el Data Warehouse...`);
        // await etl_rental_4(sakilaRelationalDatabase, sakilaDataWarehouse);
        // await etl_rental_1(sakilaRelationalDatabase, sakilaDataWarehouse);
        await etl_rental(sakilaRelationalDatabase, sakilaDataWarehouse);
        console.log(`Datos cargados en el Data Warehouse`);
    // }, 6000);
});
