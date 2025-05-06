const mysql = require('mysql2/promise') //Versión de mysql2 que trabaja con promesas (Mejor utilidad para async / await)

const dotenv = require('dotenv'); //Para manejar las variables de entorno desde un archivo .env

//Cargar las variables de entorno definidas en .env
dotenv.config();

// Se crea un "pool" de conexiones a la base de datos reutilizables para realizar consultas eficientemente
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportar el pool para utilizarlo en otros archivos del proyecto
module.exports = pool;