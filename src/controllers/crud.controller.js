const db = require("../config/db");
// Se importa la conexion a la base de dato desde el archivo db.js

class CrudController {
  // metodo para obtener todos los registros de una tabla
  async obtenerTodos(tabla) {
    try {
      //Realizar consulta SQL:
      const [resultados] = await db.query(`SELECT * FROM ${tabla}`);
      return resultados; //Devuelve un array con los resultados
    } catch (error) {
      throw error; //Lanza el error
    }
  }

  // metodo para obtener un unico registro de una tabla
  async obtenerUno(tabla, idcampo, id) {
    try {
      //Realizar consulta SQL:
      const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [
        tabla,
        idcampo,
        id,
      ]);
      return resultado[0]; //Devuelve solo el primer del array con los resultados
    } catch (error) {
      throw error;
    }
  }

  async crear(tabla, data) {
    try {
      //Realizar la insercion en la tabla indicada:
      const [resultado] = await db.query(`INSERT INTO ?? SET ? `, [
        tabla,
        data,
      ]);
      return { ...data, id: resultado.insertId }; //Devuelve el objeto creado, incluyendo el ID generado automaticamente
    } catch (error) {
      throw error;
    }
  }

  async actualizar(tabla, data, idCampo, id) {
    try {
      //Realizar consulta SQL:
      const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data, idCampo, id])

      // verificar si modifico algun registro existente
      if (resultado.affectedRows === 0) {
        throw new Error("Registro no encontrado");
      }
      // Devuelve el registro modificado
      return await this.obtenerUno(tabla, idCampo, id)
    } catch (error) {
      throw error
    }
  }

  async eliminar(tabla, idCampo, id) {
    try {

      const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id])

      // verificar si eliminó el registro 
      if (resultado.affectedRows === 0) {
        throw new Error("Registro no encontrado");
      }
      // Mostrar mensaje de exito:
      return { message : "Registro eliminado con exito" }
    } catch (error) {
      throw error
    }
  }
}


module.exports = CrudController;