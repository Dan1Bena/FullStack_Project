const db = require("../config/db");
// Se importa la conexion a la base de dato desde el archivo db.js

class ImagenesController {

    async subirImagen(tabla, campoId, id, imagenBase64) {
        try {

            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            // si no exitro retorna un error
            if (registro.length === 0) {
                return { error: 'No se encontro el registro con el ID proporcionado' };
            };

            //Convertimos la imagen de base64 a Buffer (Formato binario)
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            // Crear la consulta para actualizar el campo 'imagen' del registro
            const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
            const [result] = await db.query(query, [tabla, bufferImagen, campoId, id]);

            // Vaalidar si la actualizacion fue exitosa
            if (result.affectedRows > 0) {
                return { message: 'Imagen actualizada correctamente' };
            } else {
                return { error: "Error al actualizar la imagen" };
            };

        } catch (error) {
            console.log('Error al subir la imagen:', error);
            throw error
        };
    };

    async obtenerImagen(tabla, campoId, id) {
        try {
            //Consultar los registros del campo imagen
            const [rows] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            //Validar si el campo existe
            if (rows.length === 0) {
                return { error: 'registro no encontrado' };
            };

            //Verificar si el campo imagen esta  vacio
            if (!rows[0].imagen) {
                return { error: 'no hay una imagen asociada a este registro' };
            };

            // Convertir imagen de binario a base64
            const imagenBase64 = rows[0].imagen.toString('base64');

            return { imagen: imagenBase64 }
        } catch (error) {
            console.log('Error al obtener la imagen:', error);
            throw error
        };
    };

    async eliminarImagen(tabla, campoId, id) {
        try {
            //Verificar que el registro existe
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            if (registro.length === 0) {
                return { error: 'registro no encontrado' };
            }

            //Establecer el valor del campo imagen como "NULL" para eliminnar la imagen
            const [query] = await db.query(`UPDATE ?? SET imagen = NULL WHERE ?? = ?`, [tabla, campoId, id]);

            if (query.affectedRows > 0) {
                return { message: 'Imagen eliminada correctamente' };
            } else {
                return { error: 'Error al eliminar la imagen' };
            };
        } catch (error) {
            console.log('Error al eliminar la imagen:', error);
            throw error
        };
    };

    async insertarImagen(tabla, campoId, id, imagenBase64) {
        try {
            // Verificar que el registro existe:
            const [registro] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            if (registro.length === 0) {
                return { error: 'registro no encontrado' };
            }

            //Convertimos la imagen de base64 a Buffer (Formato binario)
            const bufferImagen = Buffer.from(imagenBase64, 'base64');

            // Consultamos si hay una imagen existente asociada a ese registro:
            const [imagenExiste] = await db.query(`SELECT imagen FROM ?? WHERE ?? = ?`, [tabla, campoId, id]);

            // Si ya existe una imagen, actualizar
            if (imagenExiste[0]?.imagen) {

                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [
                    tabla,
                    bufferImagen,
                    campoId,
                    id
                ]);

                if (result.affectedRows > 0) {
                    return { message: 'La imagen se ha actualizado correctamente' };
                } else {
                    return { error: 'Error al actualizar la imagen' };
                };

            } else {
                // Si no existe una imagen, insertar una nueva
                const query = `UPDATE ?? SET imagen = ? WHERE ?? = ?`;
                const [result] = await db.query(query, [
                    tabla,
                    bufferImagen,
                    campoId,
                    id
                ]);

                if (result.affectedRows > 0) {
                    return { message: 'La imagen se ha insertado correctamente' };
                } else {
                    return { error: 'Error al insertar la imagen' };
                }

            };

        } catch (error) {
            console.log('Error al insertar la imagen:', error);
            throw error;
        };
    };

    // Metodo general que decide si sube una imagen o solo la obtiene
    async procesarImagen(tabla, campoId, id, imagenBase64 = null) {
        // si se pasa una imagen, la sube:
        if (imagenBase64) {
            return await this.subirImagen(tabla, campoId, id, imagenBase64);
        } else {
            // Si no, intenta recuperarla:
            return await this.obtenerImagen(tabla, campoId, id);
        };
    };

};

// exportar la instancia del conttrollador para que pueda ser utilizado en rutas u otros modulos
module.exports = new ImagenesController();