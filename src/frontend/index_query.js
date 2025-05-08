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
    clave: document.querySelector('#clave'),
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

// Cargar todas las personas desde la API
async function cargarPersonas() {
    try {
        const response = await fetch(`${API_URL}/personas`);
        personas = await response.json();
        mostrarPersonas();
    } catch (error) {
        console.error('Error al cargar personas', error);
    }
}

async function mostrarPersonas() {
    tablaBody.innerHTML = ''; //Limpiar la tabla

    personas.forEach(async persona => {
        const clone = template.content.cloneNode(true); //Clonar template
        const celdas = clone.querySelectorAll('td');

        // Llenar celdas con los datos de la personas
        celdas[0].textContent = persona.id_persona;
        celdas[1].textContent = persona.nombre;
        celdas[2].textContent = persona.apellido;
        celdas[3].textContent = persona.email;

        // imagen por defecto
        let imagenHTML = 'Sin imagen';

        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`);
            const data = await response.json();
            if (data.imagen) {
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}" style = "max-width: 100px"; max-height: 100px;">`
            }
        } catch (error) {
            console.error('Error al cargar imagen', error);
        }

        celdas[4].innerHTML = imagenHTML;

        // botones de accion
        const btnEditar = document.querySelector('.btn-editar');

        const btnEliminar = document.querySelector('.btn-eliminar');

        btnEditar.addEventListener('click', () => editarPersona(persona));

        btnEliminar.addEventListener('click', () => eliminarPersona(persona.id_persona));

        tablaBody.appendChild(clone);
    });
}

// Manejo del submit del formulario (crear o actualizar persona)
async function manejarSubmit(e) {
    e.preventDefault();

    // Recolectar datos desde el formulario
    const persona = {
        nombre: campos.nombre.value,
        apellido: campos.apellido.value,
        tipo_identificacion: campos.tipo_identificacion.value,
        nuip: campos.nuip.value,
        email: campos.email.value,
        clave: campos.clave.value,
        salario: parseFloat(campos.salario.value),
        activo: campos.activo.checked
    }

    try {
        if (modoEdicion) {
            persona.id_persona = campos.id.value;

            if (inputImagen.files[0]) {
                const imagenBase64 = await convertirImagenABase64(inputImagen.files[0])
                await fetch(`${API_URL}/imagenes/subir/personas/id_persona/${persona.id_persona}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }

            await actualizarPersona(persona);
        } else {
            const response = await crearPersona(persona);

            if (!response.id) {
                throw new Error("El servidor no devolió el ID de la persona creada");
            }

            if (inputImagen.files[0]) {
                const imagenBase64 = await convertirImagenABase64(inputImagen.files[0]);
                await fetch(`${API_URL}/imagenes/insertar/personas/id_persona/${response.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }
        }

        resetearFormulario();
        cargarPersonas();
    } catch (error) {
        console.error('Error al guardar persona', error);
        alert('Error al guardar persona' + error.message);
    }
}

// Crear una nueva persona en la base de datos
async function crearPersona(persona) {
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    });

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.id) {
        throw new Error("El servidor no contiene el ID de la persona creada");
    }

    return data;
}

// Actualizar los datos de una persona existente
async function actualizarPersona(persona) {
    const response = await fetch(`${API_URL}/personas/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    })

    const data = await response.json();
    return data;
}

// Eliminar una persona existente junto a su imagen
async function eliminarPersona(id) {

    if (!confirm('¿Estas seguro de eliminar esta person?')) return;

    try {
        await fetch(`${API_URL}/imagenes/eliminar/personas/id_persona/${id}`, {
            method: 'DELETE'
        });
        await fetch(`${API_URL}/personas/id_persona/${id}`, {
            method: 'DELETE'
        });

        cargarPersonas();
    } catch (error) {
        console.error('Error al eliminar persona', error);
        alert('Error al eliminar persona' + error.message);
    }
}

// Cargar los datos de una persona al formulario para editarlos
async function editarPersona(persona) {
    modoEdicion = true;

    // Cargar campos
    campos.id.value = persona.id_persona;
    campos.nombre.value = persona.nombre;
    campos.apellido.value = persona.apellido;
    campos.tipo_identificacion.value = persona.tipo_identificacion;
    campos.nuip.value = persona.nuip;
    campos.email.value = persona.email;
    campos.clave.value = persona.clave;
    campos.salario.value = persona.salario;
    campos.activo.value = persona.activo;

    // Cargar imagen 
    try {
        const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`);
        const data = await response.json()

        if (data.imagen) {
            previewImagen.src = `data:image/jpeg;base64,${data.imagen}`;
            previewImagen.style.display = 'block';
        } else {
            previewImagen.src = '';
            previewImagen.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al cargar la  imagen: ', error);
        previewImagen.src = '';
        previewImagen.style.display = 'none';
    }
    btnGuardar.textContent = 'Guardar Cambios' //Cambiar el texto del boton
}

// limpiar el formulario 
function resetearFormulario() {
    modoEdicion = false;
    form.reset();
    previewImagen.src = '';
    previewImagen.style.display = 'none';
    btnGuardar.textContent = 'Guardar';
}

// Previzualizar imagen cuando se selecciona
function manejarCambioImagen(e) {
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImagen.src = e.target.result;
            previewImagen.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        previewImagen.src = '';
        previewImagen.style.display = 'none';
    }
}

// Convierte una imagen a base64 para enviarla al backend
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; //Quitar prefijo MIME
            resolve(base64);
        }

        reader.onerror = error => reject(error);
    })
}
