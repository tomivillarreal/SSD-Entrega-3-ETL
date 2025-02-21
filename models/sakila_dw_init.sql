CREATE TABLE IF NOT EXISTS actor (
    actor_id INT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    category_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS film (
    film_id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS language (
    language_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_type (
    payment_type_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
    staff_id INT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS store (
    store_id INT PRIMARY KEY,
    address VARCHAR NOT NULL
);

 CREATE TABLE IF NOT EXISTS time (
    id INT PRIMARY KEY, 
    ano INT NOT NULL, 
    mes INT NOT NULL, 
    dia INT NOT NULL
);

CREATE TABLE IF NOT EXISTS rental (
    id SERIAL PRIMARY KEY,
    category_id INT,
    language_id INT,
    customer_id INT,
    film_id INT,
    payment_type_id INT,
    time_id INT,
    store_id INT,
    income_amount NUMERIC(10,2),
    fine_amount NUMERIC(10,2),
    discount_amount NUMERIC(10,2),
    discount_percent NUMERIC(10,2)
);