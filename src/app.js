const express = require('express');
// Importar el framework Express para crear el servidor

const cors = require('cors')
// Importar CORS para permitir solicitudess desde otros dominios (Muy util cuando el frontend y backend estan separados).

const app = express();
// Crear la instancia de la aplicacion Express.

const imagenesRoutes = require('./routes/imagenes.routes');
// Importar las rutas para el manejo de imagenes desde el archivo correspondiente.

// Middlewares:

app.use(cors());
// Habilita los CORS (Permite que el servidor reciba petticiones desde ottros origenes).

app.use(express.json({limit : '50mb'}));
// Permite recibir datos en formato json, estableciendo un limite de 50MB (ideal para datos grandes como imagenes en base64).

app.use(express.urlencoded({extended : true, limit : '50mb'}));
//Permite recibir dattoss codificados de formularios (Como los enviados por POST dessde HTML), tambien con un limite de 50MB

//Rutas:
app.use('/api/imagenes', imagenesRoutes);
// Asocia todas las rutas de imagenes bajo el prefijo '/api/imagenes'.

app.use('/api/personas', require('./routes/personas.routes'));
// Asocia todass las rutas de personas bajo el prefijo '/api/personas'.

module.exports = app
// Exportar la app configurada para ser utilizada por el archivo principal del servidor (En este caso, el archivo server.js).
