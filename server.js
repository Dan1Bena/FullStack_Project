// Se importa la configuracion principal de la aplicaion desde el archivo app.js ubicaado en la carpeta src
const app = require('./src/app');

// Se cargan las variables de entorno definidas en el archivo .env:
require('dotenv').config();

// Se define el puerto en el que se ejecutará el servidor. si no hay una variablle de entorno para el puerto, usará el 3000 por defecto:
const PORT = process.env.PORT || 3000;

//Se inicia el servidor en el puerto especificado y muesttra un mensaje por consola cuando esté corriendo correctamente:
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
