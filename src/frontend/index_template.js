// Variables globales
const API_URL = 'http://localhost:3000/api'; //URL de la API backend
let personas = [] //Arreglo donde se almacenas las personas obtenidas del servidor

// Elementos del DOM 
const personasForm = document.getElementById('personasForm'); //formulario
const tablaPersonasBody = document.getElementById('tablaPersonasBody'); //Cuerpo donde se cargarán las personas
const btnCancelar = document.getElementById('btnCancelar'); //Boton para limpiar el formulario
const imagenInput = document.getElementById('imagen'); ///input de la imagen
const previewImagen = document.getElementById('previewImagen'); // Lugar donde se mostrará la previsualizacion de la imagen

//Eventos:
document.addEventListener('DOMContentLoaded', cargarPersonas); //Carga los registros desde el backend
personasForm.addEventListener('submit', manejarSubmit); //Enviar los datos del formulario
btnCancelar.addEventListener('click', limpiarFormulario); // Limpiar el formulario
imagenInput.addEventListener('change', manejarImagen); //Cargar la previsualizacion cuando se selecciona una imagen

// Funcion que obtiene personas del backend
async function cargarPersonas() {
    try {
        const response = await fetch(`${API_URL}/personas`); //Solicitud GET a la API
        personas = await response.json(); //Almacena la respuesta en el arreglo 'personas'
        await mostrarPersonas(); //llama al metodo y muestra las personas en la tabla
    } catch (error) {
        console.error('Error al cargar personas', error);
    }
}

// Funcion para mostrar todas las personas en la tabla
async function mostrarPersonas() {
    // Limpia el contenido actual del cuerrpo de la tabla para evitar duplicados
    tablaPersonasBody.innerHTML = '';

    // Obtiene la plantilla (<template>) que contiene la estructura de una fila la tabla
    const template = document.getElementById('template');

    // Recorre la lista de personas obtenidas desde el backend
    for (const persona of personas) {
        // Clona el conttenindo de la plantilla (la fila predefinida)
        const clone = template.content.cloneNode(true);

        // obtiene todas las celdas <td> dentro del clon
        const tds = clone.querySelectorAll('td');

        // Inicializa el contenide de imagen como 'Sin imagen' por defecto
        let imagenHTML = 'Sin imagen';

        // Intentamos obtener la imagen guardada de la persona desde el backend
        try {
            // Realiza una peticcion get al endpoint de imagenn dee la persona por su ID
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${persona.id_persona}`);

            // convierte la respuesta en un objeto JSON
            const data = await response.json()

            // Si hay una imagen en la respuesta, se construte la etiqueta <img> coonn la imagen en base64
            if (data.imagen) {
                imagenHTML = `<img src="data:image/jpeg;base64,${data.imagen}" style = "max-width: 100px"; max-height: 100px;">`;
            }
        } catch (error) {
            console.error('Error al cargar la imagen', error);
        }
        // LLena las celdas con los datos de la persona
        tds[0].textContent = persona.id_persona;
        tds[1].textContent = persona.nombre;
        tds[2].textContent = persona.apellido;
        tds[3].textContent = persona.email;
        tds[4].textContent = imagenHTML;

        // Busca los botones de editar y eliminar dentro del clon
        const btnEditar = clone.querySelectorAll('.btn-editar');
        const btnEliminar = clone.querySelectorAll('.btn-eliminar');

        // Le asigna el evento de click al boton de editar, llamando a la funcion con el ID de la persona
        btnEditar.addEventListener('click', () => editarPersona(persona.id_persona));

        // Le asigna el evento de click al boton de eliminar, llamando a la funcion con el ID de la persona
        btnEliminar.addEventListener('click', () => eliminarPersona(persona.id_persona));

        // Finalmente, agregamos la fila clonada (Con los datos y botones ya configurados) al cuerpo de la tabla
        tablaPersonasBody.appendChild(clone);
    }
}

//Funcion que maneja el envio del formulario al crear o editar persona
async function manejarSubmit(e) {
    e.preventDefault(); //Evita que el boton recargue la pagina por defecto, esencial cuando manejamos un submit

    const persona = {
        id_persona: document.getElementById('id_persona').value || null,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        tipo_identificacion: document.getElementById('tipo_identificacion').value,
        nuip: parseInt(document.getElementById('nuip').value),
        email: document.getElementById('email').value,
        clave: document.getElementById('clave').value,
        salario: parseFloat(document.getElementById('salario').value),
        activo: document.getElementById('activo').checked
    }

    try {
        if (persona.id_persona) {
            //si estamos editando (id_persona existe)

            // subir imagen si fue seleccionada
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/subir/personas/id_persona/${persona.id_persona}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }

            // Actualizar los datos del registro
            await actualizarPersona(persona);
        } else {
            // Si es un nuevo registro
            const nuevaPersona = await crearPersona(persona) //Crear persona
            if (imagenInput.files[0]) {
                const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
                await fetch(`${API_URL}/imagenes/insertar/personas/id_persona/${nuevaPersona.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imagen: imagenBase64 })
                });
            }
            limpiarFormulario();
            cargarPersonas();
        }
    } catch (error) {
        console.error('Error al guardar persona', error);
        alert('Error al guardar los datoss'+ error.message)
    }
}

// Funcion para crear un registro nuevo enn la base de datos
async function crearPersona(persona) {
    const response = await fetch(`${API_URL}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    });
    return await response.json(); //Devuelve el objeto "persona" creado con su ID
}

// Funcion para actualizar un registro exitente de una persona en la BD
async function actualizarPersona(persona) {
    const response = await fetch(`${API_URL}/personas/${persona.id_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
    }) 
    return await response.json()
}   

// Funcion para eliminar un registro y su imagen existente en la BD
async function eliminarPersona(id) {
    if (confirm('¿Esta seguro de eliminar esta persona?')) {
        try {
            await fetch(`${API_URL}/imagenes/eliminar/personas/id_persona/${id}`,{
                method : 'DELETE'
            }); //Eliminar la imagen

            await fetch(`${API_URL}/personas/${id}`, {
                method : 'DELETE'
            }); //Eliminar la persona

            cargarPersonas(); // Recagas la lista
        } catch (error) {
            console.error('Error al eliminar persona', error);
            alert('Error al eliminar la persona', error.message);
        }
    }
}

// Llena el formulario con los datos de una persona para editarla
async function editarPersona(id) {
    const persona = personas.find(p => p.id_persona = id);

    if (persona) {
        document.getElementById('id_persona').value = persona.id_persona;
        document.getElementById('nombre').value = persona.nombre;
        document.getElementById('apellido').value = persona.apellido;
        document.getElementById('tipo_identificacion').value = persona.tipo_identificacion;
        document.getElementById('nuip').value = persona.nuip;
        document.getElementById('email').value = persona.email;
        document.getElementById('clave').value = '';
        document.getElementById('salario').value = persona.salario;
        document.getElementById('activo').value = persona.activo;

        //Carga la imagen si existe
        try {
            const response = await fetch(`${API_URL}/imagenes/obtener/personas/id_persona/${id}`);
            const data = await response.json();

            if (data.imagen) {
                previewImagen.src = `data:image/jpeg;base64,${data.imagen}`;
                previewImagen.style.display = 'block';
            } else {
                previewImagen.src = '';
                previewImagen.style.display = 'none';
            }
        } catch (error) {
            console.error('Error al cargar imagen', error);
            previewImagen.src = '';
            previewImagen.style.display = 'none';
        }
    }
}

function limpiarFormulario() {
    personasForm.requestFullscreen();
    document.getElementById('id_persona').value = '';
    previewImagen.src = '';
    previewImagen.style.display = 'none';
}

function manejarImagen(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImagen.src = e.target.result;
            previewImagen.style.display = 'block';
        }
        reader.readAsDataURL(file); //leer la imagen como una URL
    } else {
        previewImagen.src = '';
        previewImagen.style.display = 'none';
    }
}

// Convierte imagen a base64 para enviarla al backend
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]//Elimina el prefijo del data URL
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    })
}