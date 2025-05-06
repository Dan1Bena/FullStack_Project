const multer = require('multer')
// Importar el modulo 'multer', que sirve para manejar la subida de archivos desde formularios en node.js

// Almacenamiento en memoria
const storage = multer.memoryStorage();
// Se define una estrategia de almacenamientto (RAM) temporal para los archivos subidos. Esto significa que los archivos no se guardan en el disco, sino en un buffer en memoria

const upload = multer({storage});
// Se crea unaa instancia del middleware de subida con laa configuracion de almacenamiento definida (En memoria). Esta instancia puedes ser utilizada en las rutas donde se acepten archivos, por ejemplo, imagenes de perfil.

module.exports = upload;
// Se exporta la configuracion