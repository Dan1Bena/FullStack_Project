// ====================
// Variables globales
// ====================

//URL base de la API
const API_URL = 'http://localhost:3000/api'

// Arreglo donde se almacenarán la personaas traidas desde la API
let personas = [];

// Variable para determinar si estamos editando
let modoEdicion = false;

// ====================
// ELEMENTOS DEL DOM
// ====================

// Referencia al formulario de personas
const form = document.querySelector('#personasForm');

// Cuerpo de la tabla donde se insertarán las filas dinamicamente
const tablaBody = document.querySelector('#tablaPersonasBody');

// Template HTML para generar filas de tabla
const template = document.querySelector('#template')

// Boton para guardar (Crear o Actualizar)
const btnGuardar = document.querySelector('#btnGuardar');

// Boton para cancelar la edicion
const btnCancelar = document.querySelector('#btnCancelar');

// Input de imagen y su previsualizacion:
const inputImagen = document.querySelector('#imagen');
const previewImagen = document.querySelector('#previewImagen');

// =======================
// CAMPO DEL FORMULARIO
// =======================
const campos = {
    id: document.querySelector('#id_persona'),
    nombre: document.querySelector('#nombre'),
    apellido: document.querySelector('#apellido'),
    tipo_identificacion: document.querySelector('#ipo_identificacion'),
    nuip: document.querySelector('#nuip'),
    email: document.querySelector('#email'),
    clave:  document.querySelector('#clave'),
    salario: document.querySelector('#salario'),
    activo: document.querySelector('#activo')
};

// =======================
// EVENTOS PRINCIPALES
// =======================

document.addEventListener('DOMContentLoaded', () => {
    cargarPersonas(); //Cargar lista inicial
    form.addEventListener('submit', manejarSubmit); //Guardar datos
    btnCancelar.addEventListener('click', resetearFormulario) //cancelar edicion
    inputImagen.addEventListener('change', manejarCambioImagen); //Cargar imagen
});


// =======================
// FUNCIONES DE LOGICA
// =======================








