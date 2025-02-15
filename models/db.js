import pkg from 'pg';
const { Pool } = pkg;
const SAKILA_DATABASE_URL="postgres://postgres:1188@localhost:5432/sakila"
const SAKILA_DATAWAREHOUSE_URL="postgres://postgres:1188@localhost:5432/sakila_dw"

export const sakila = new Pool({
    //   connectionString: process.env.SAKILA_DATABASE_URL,
    host: 'localhost',
    database: 'postgres',
    password: '1188',
    user: 'postgres',
});

export const sakilaDataWareHouse = new Pool({
    //   connectionString: process.env.SAKILA_DATAWAREHOUSE_URL,
    host: 'localhost',
    database: 'sakila_dw',
    password: '1188',
    user: 'postgres',
});