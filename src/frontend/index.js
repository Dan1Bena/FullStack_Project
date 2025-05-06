// Variables globales
const API_url = "http://localhost:3000/api"; //Se almacena la url con la que nos conectamos al servidor

let personas = []; //Variable que almacenará el array de personas obtenidas en el Backend

//Elementos del DOM
const personaForm = document.getElementById("personasForm"); //Formulario principal
const tablaPersonasBody = document.getElementById("tablaPersonasBody"); //Cuerpo de la tabla conde se cargaran las filas
const btnCancelar = document.getElementById("btnCancelar"); //Este boton limpia el formulario
const imagenInput = document.getElementById("imagen"); //input de tipo 'file' para subir/cargar la imagen
const previewImagen = document.getElementById("previewImagen"); //Elemento imagen de previsualizacion

// Event Listeners
document.addEventListener("DOMContentLoaded", cargarPersonas); //Cuando el DOM esté listo, se cargan las personas

personaForm.addEventListener("submit", manejarSubmit); //Al enviar el formulario, se ejecuta la funcion: 'manejarSubmit' que escucha el click.

btnCancelar.addEventListener("click", limpiarFormulario); //Al hacer click en el boton cancelar, se llama a la funcion para que limpie el formulario

// Funciones para el manejo de personas:
async function cargarPersonas() {
  try {
    const response = await fetch(`${API_url}/personas`); //Se hace la peticion GET al endpoint 'personas'
    personas = await response.json(); //Se almacena la respuesta en fomato JSON en la lista de personas
    await mostrarPersonas(); //Se llama a la funcion para cargar las personas en la tabla
  } catch (error) {
    console.error("Error al cargar personas: ", error);
  }
}

// Iterar sobre cad persona y crear una fila en la tabla
async function mostrarPersonas() {
  tablaPersonasBody.innerHTML = ""; //Limpiar el contenido actual

  for (const persona of personas) {
    const tr = document.createElement("tr"); // Crea una fila HTML

    // Cargar la imagen si existe
    let imagenHTML = "Sin Imagen";

    try {
      const response = await fetch(
        `${API_url}/imagenes/obtener/personas/id_persona/${persona.id_persona}`
      );
      // Se realiza una peticion al backend par obtener la imagen de la persona en base64

      const data = await response.json();

      if (data.imagen) {
        imagenHTML = `<img src = "data:image/jpeg;base64,${data.imagen}" style = "max-width: 100px; max-height: 100px">`;
      }
    } catch (error) {
      console.error("Error al cargar la imagen", error);
    }
    // Se construye la fila HTML con los datos de la persona y los botones de accion:
    tr.innerHTML = `
        <th style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.id_persona}</th>
        <th style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.nombre}</th>
        <th style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.apellido}</th>
        <th style="border: 1px solid #ddd; text-align: center; padding: 8px;">${persona.email}}</th>
        <th style="border: 1px solid #ddd; text-align: center; padding: 8px;">${imagenHTML}</th>
        <th style="border: 1px solid #ddd; text-align: center; padding: 8px;">
            <button onclick= "editarPersona(${persona.id_persona})">Editar</button>
            <button onclick= "eliminarPersona(${persona.id_persona})">Eliminar</button></th>
        `;
    tablaPersonasBody.appendChild(tr); //Se añade la fila a la tabla
  }
}

async function manejarSubmit(e) {
  e.preventDefault(); //Evita que el formulario recargue la pagina

  // Obtener los valores del formulario para crear un objeto persona

  const persona = {
    id_persona: document.getElementById("id_persona").value || null,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    tipo_identificacion: document.getElementById("tipo_identificacion").value,
    nuip: parseInt(document.getElementById("nuip").value),
    email: document.getElementById("email").value,
    clave: document.getElementById("clave").value,
    salario: parseFloat(document.getElementById("salario").value),
    activo: document.getElementById("activo").checked,
  };

  try {
    if (persona.id_persona) {
      // Si hay una imagen selecciona, se actualiza la imagen
      if (imagenInput.files[0]) {
        const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
        await fetch(
          `${API_url}/imagenes/subir/personas/id_persona/${persona.id_persona}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagen: imagenBase64 }),
          }
        );
      }

      // luego se actualizan los datos de la persona
      await actualizarPersona(persona);
    } else {
      // Si es una persona nueva se procede a crearla
      const nuevaPersona = await crearPersona(persona);

      //Si haay una imagen seleccionada, se sube
      if (imagenInput.files[0]) {
        const imagenBase64 = await convertirImagenABase64(imagenInput.files[0]);
        await fetch(
          `${API_url}/imagenes/insertar/personas/id_persona/${nuevaPersona.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagen: imagenBase64 }),
          }
        );
      }
    }

    limpiarFormulario(); //Limpiar formulario
    cargarPersonas(); //Recargar la tabla y mostrar las personas
  } catch (error) {
    console.error("Error la guardar la persona", error);
    alert("Error al guardar los datos:" + error.message);
  }
}

async function crearPersona(persona) {
  // Se  utiliza el metodo POST para crea una nueva persona en el backend
  // Se envia el objeto 'persona' como cuerpo de la peticion en formacion JSON
  // Se espera la respuesra en formato JSON
  const response = await fetch(`${API_url}/personas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(persona),
  });

  const data = await response.json(); 

  console.log('====================================');
  console.log(data);
  console.log('====================================');


  return data;
}

async function actualizarPersona(persona) {
  // Se  utiliza el metodo PUT para actualizar los datos una persona en el backend
  // Se envia el objeto 'persona' como cuerpo de la peticion en formacion JSON
  // Se espera la respuesta en formato JSON
  // Se utiliza el ID de la persona para identificarla en el backend

  const response = await fetch(`${API_url}/personas/${persona.id_persona}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(persona),
  });
  return await response.json();
}

async function eliminarPersona(id) {
  // Se  utiliza el metodo DELETE para eliminar un registro de una persona en el backend
  // Se envia el objeto 'persona' como cuerpo de la peticion en formacion JSON
  // Se espera la respuesta en formato JSON
  // Se utiliza el ID de la persona para identificarla en el backend

  if (confirm("¿Esta seguro de eliminar este registro?")) {
    try {
      // Intentar primero eliminar la imagen si existe
      await fetch(`${API_url}/personas/${id}`, {
        method: "DELETE",
      });

      // Elimina la persona
      await fetch(`${API_url}/personas/${id}`, {
        method: "DELETE",
      });

      cargarPersonas();
    } catch (error) {
      console.error("Error la eliminar la persona", error);
      alert("Error al eliminar los datos:" + error.message);
    }
  }
}

async function editarPersona(id) {
  const persona = personas.find((p) => p.id_persona === id);

  if (persona) {
    (document.getElementById("id_persona").value = persona.id_persona),
      (document.getElementById("nombre").value = persona.nombre),
      (document.getElementById("apellido").value = persona.apellido),
      (document.getElementById("tipo_identificacion").value =
        persona.tipo_identificacion),
      (document.getElementById("nuip").value = persona.nuip),
      (document.getElementById("email").value = persona.email),
      (document.getElementById("clave").value = ""),
      (document.getElementById("salario").value = persona.salario),
      (document.getElementById("activo").checked = persona.activo);

    // Cargar imagen
    try {
      const response = await fetch(
        `${API_url}/imagenes/obtener/personas/id_persona/${id}`
      );
      const data = await response.json();

      if (data.imagen) {
        previewImagen.src = `data:imagen/jpeg;base64,${data.imagen}`;
        previewImagen.style.display = "block";
      } else {
        previewImagen.style.display = "none";
        previewImagen.src = "";
      }
    } catch (error) {
      console.error("Error al cargar imagen", error);
      previewImagen.style.display = "none";
      previewImagen.src = "";
    }
  }
}

function limpiarFormulario() {
  personaForm.reset();
  document.getElementById("id_persona").value = "";
  previewImagen.style.display = "none";
  previewImagen.src = "";
}

// Funciones para e manejo de imagenes
function manejarImagen(e) {
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      previewImagen.src = e.target.result;
      previewImagen.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    previewImagen.style.display = "none";
    previewImagen.src = "";
  }
  // Se utiliza el método readAsDataURL para leer el archivo como una URL de datos
}

// Funcion para convertir imagen a base64
function convertirImagenABase64(file) {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      // Eliminar el prefijo "data:image/jpeg;base64," del resultado
      const base64 = reader.result.split(',' [1]);
      resolve(base64)
    }
    reader.onerror = error => reject
  });
}
