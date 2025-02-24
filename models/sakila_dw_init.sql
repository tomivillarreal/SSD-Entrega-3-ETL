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
    id INT PRIMARY KEY,          -- Clave surrogate que identifica cada transacción
    time_id INT NOT NULL,               -- Clave foránea a la dimensión de tiempo
    customer_id INT NOT NULL,           -- Clave foránea a la dimensión de cliente
    film_id INT NOT NULL,               -- Clave foránea a la dimensión de film
    store_id INT NOT NULL,              -- Clave foránea a la dimensión de tienda
    staff_id INT NOT NULL,              -- Clave foránea a la dimensión de staff
    payment_type_id INT NOT NULL,       -- Clave foránea a la dimensión de tipo de pago
    category_id INT NOT NULL,                   -- Opcional: se puede incluir para preservar el valor histórico
    language_id INT NOT NULL,                   -- Opcional: se puede incluir para preservar el valor histórico
    incomeAmount DECIMAL(10,2) NOT NULL,  -- Monto de ingreso
    fineAmount DECIMAL(10,2) NOT NULL,    -- Monto de multa (si aplica)
    discountPercentage DECIMAL(5,2),      -- Porcentaje de descuento (para análisis, se utilizará promedio u otra función)
    discountQuantity INT,                 -- Cantidad de descuento, de acuerdo al negocio
    CONSTRAINT fk_time FOREIGN KEY (time_id) REFERENCES time(id),
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    CONSTRAINT fk_film FOREIGN KEY (film_id) REFERENCES film(film_id),
    CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES store(store_id),
    CONSTRAINT fk_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    CONSTRAINT fk_payment_type FOREIGN KEY (payment_type_id) REFERENCES payment_type(payment_type_id),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES category(category_id),
    CONSTRAINT fk_language FOREIGN KEY (language_id) REFERENCES language(language_id)
    -- Si decides mantener category_id y language_id en la tabla de hechos, puedes agregar las claves foráneas
);
