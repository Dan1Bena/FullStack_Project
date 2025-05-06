// Importamos el modulo de express
const express = require('express');

// Crear un nuevo router de Express para manejar las rutass de manera modular
const router = express.Router();

// Importar el controlador generico para las operaciones CRUD
const CrudController = require('../controllers/crud.controller');

// Instanciar el controlador para usar sus metodos:
const crud = new CrudController();

// definir el nombre de la tabla en la base de datos:
const tabla = 'personas';

// Definir el nombre del campo de la tabla:
const idCampo = 'id_persona';

// Ruta para obtener todos los registros de personas
router.get('/', async (req, res) => {
    try {
        // Utilizar el motod 'ObtenerTodos' del controlador para traer todos los registros
        const personas = await crud.obtenerTodos(tabla);
        // Respuesta del arreglo de personas en formato JSON 
        res.json(personas);
    } catch (error) {
        res.status(500).json({ error: error.message })
    };
});

// Ruta para obtener un registro especifico por su ID
router.get('/:id', async (req, res) => {
    try {
        // Utilizar el metodo obtenerUno:
        const persona = await crud.obtenerUno(tabla, idCampo, req.params.id);

        // Respuesta del arreglo de persona en formato JSON 
        res.json(persona);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    };
});

// Ruta para crear un nuevo registro en la BD
router.post('/', async (req, res) => {
    try {
        // Utilizar el metodo crear con los datos enviados en el cuerpo del request
        const nuevaPersona = await crud.crear(tabla, req.body);

        // Respuestta con el nuevo registro creado y codigo 201:
        res.status(201).json(nuevaPersona);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    };
});

// Ruta para actualizar un registro existente por su ID
router.put('/:id', async (req, res) => {
    try {
        // Utilizar el metodo actualizar con el id y los nuevos datos
        const personaActualizada = await crud.actualizar(tabla, req.body, idCampo, req.params.id);

        // Respuesta del arreglo con el registro actualizado en formato JSON 
        res.json(personaActualizada);
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    };
});

// Ruta para eliminar un registro existente por su ID
router.delete('/:id', async (req, res) => {
    try {
        // Utilizar el métod eliminar con el ID recibido
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);

        // Respuesttaa con un mensaje o confimacion de eliminacion
        res.json(resultado)
    } catch (error) {
        // Manejar errores de servidor
        res.status(500).json({ error: error.message });
    };
});

// Exportacion del router
module.exports = router;

