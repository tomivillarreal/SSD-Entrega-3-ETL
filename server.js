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
import { etl_rental_4 } from './etl/rental/rental-4.js';

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(`Cargando datos...`);
    // await etl_actor();
    // await etl_category();
    // await etl_customer();
    // await etl_film();
    // await etl_language();
    // await etl_payment_type();
    // await etl_staff();
    // await etl_store();
    // await etl_time();
    await etl_rental_4();
    console.log(`Datos cargados en el Data Warehouse`);
});
