# Data Warehouse - Sakila

Este repositorio contiene la configuración necesaria para desplegar un entorno de Data Warehouse basado en la base de datos Sakila.

## Pasos para configurar el entorno PEBLEYOS

Sigue estos pasos para poner en marcha el entorno en tu máquina local.

### 1. Clonar el repositorio

```sh
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

### 2. Asegurar que Docker Desktop está en ejecución

Antes de continuar, verifica que Docker Desktop esté abierto y funcionando en tu sistema.

### 3. Cargar la imagen de la base de datos

Ejecuta el siguiente comando para cargar la imagen de la base de datos desde el archivo `ssd_sakila.tar`:

```sh
docker load -i ssd_sakila.tar
```

### 4. Levantar los contenedores con Docker Compose

Ejecuta el siguiente comando para construir y ejecutar los servicios en segundo plano:

```sh
docker-compose up --build -d
```

Este comando iniciará todos los servicios definidos en el archivo `docker-compose.yml`.

## Verificación

Para asegurarte de que los contenedores están corriendo correctamente, puedes utilizar:

```sh
docker ps
```

Si necesitas detener los contenedores, usa:

```sh
docker-compose down
```

## Contacto
Si tienes algún problema o duda, consulta con el equipo de desarrollo.

---

¡Listo! Con estos pasos tendrás el entorno del Data Warehouse de Sakila en funcionamiento.
