console.log("JS conectado");

// ==============================
// 🧾 REGISTRO (TODOS LOS TIPOS)
// ==============================

function guardarUsuario(e){
    e.preventDefault();

    let tipo = document.getElementById("tipoUsuario").value;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let usuario = {
        id: Date.now(), // 🔥 IMPORTANTE
        correo: document.querySelector('[name="correo"]').value.trim().toLowerCase(),
        telefono: document.querySelector('[name="telefono"]').value,
        password: document.querySelector('[name="password"]').value,
        tipo: tipo
    };

    // 🔵 CLIENTE
    if(tipo === "cliente"){
        usuario.nombre = document.querySelector('[name="nombre"]').value;
    }

    if(tipo === "proveedor"){
        usuario.empresa = document.querySelector('[name="empresa"]')?.value || "";
        usuario.responsable = document.querySelector('[name="responsable"]')?.value || "";
        usuario.servicio = document.querySelector('[name="tipo-servicio"]')?.value || "";
        usuario.direccion = document.querySelector('[name="direccion"]')?.value || "";

        // nombre para usar en el portal
        usuario.nombre = usuario.responsable || usuario.empresa;
    }
// 🟡 INSPECTOR
if(tipo === "inspector"){
    usuario.nombre = document.querySelector('[name="nombre"]').value;
    usuario.licencia = document.querySelector('[name="licencia"]').value; // 👈 AGREGA ESTO
    usuario.especialidad = document.querySelector('[name="especialidad"]').value; // 👈 AGREGA ESTO
}

    // 🟣 ASPIRANTE (si ya lo tienes)
    if(tipo === "aspirante"){
        usuario.nombre = document.querySelector('[name="nombre"]')?.value || "Aspirante";
        usuario.estudios = document.querySelector('[name="estudios"]')?.value || "No especificado";
        usuario.interes = document.querySelector('[name="interes"]')?.value || "administrativo";
    }


let existe = usuarios.find(u => u.correo === usuario.correo);

    if(existe) {
        alert("Este correo ya está registrado");
        return;
    }

    // 1. AGREGAR A LA LISTA
    usuarios.push(usuario);

  
}

    usuarios.push(usuario);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    console.log("Usuarios guardados:", usuarios);

    alert("¡Usuario registrado con éxito!");

    e.target.reset();

    window.location.href = "acceso.html";



function login(e){
    e.preventDefault();

    let correoIngresado = document.getElementById("correo").value.trim().toLowerCase();
    let passwordIngresado = document.getElementById("password").value.trim();

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let encontrado = usuarios.find(u => 
        u.correo === correoIngresado && 
        u.password === passwordIngresado
    );

    if(encontrado){
        localStorage.setItem("usuarioActivo", JSON.stringify(encontrado));
        alert("¡Bienvenido, " + encontrado.nombre + "!");
        window.location.href = "portal.html";
    } else {
        alert("Correo o contraseña incorrectos");
    }
}


// ==============================
// 👁 VER PASSWORD
// ==============================

function verPassword() {
    let input = document.getElementById("password");

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// Buscamos el botón de modo oscuro
const botonModo = document.querySelector(".modo");

if (botonModo) {
    botonModo.addEventListener("click", function() {
        // Alternamos una clase 'dark-mode' en todo el cuerpo de la página
        document.body.classList.toggle("dark-mode");
        
        // Cambiamos el texto del botón dependiendo del estado
        if (document.body.classList.contains("dark-mode")) {
            botonModo.textContent = "CAMBIAR A MODO CLARO";
        } else {
            botonModo.textContent = "CAMBIAR A MODO OSCURO";
        }
    });

}

// =========================================================================
// 🤖 1. ASIGNACIÓN INTELIGENTE DE INSPECTORES (GitHub / Automático / Manual)
// =========================================================================
function asignarInspectorInteligente() {
    let listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    // Filtrar inspectores reales registrados
    let inspectoresReales = listaUsuarios.filter(u => u.tipo && u.tipo.toLowerCase() === "inspector");

    // Inspectores genéricos para que funcione de inmediato en GitHub
    const inspectoresGenericos = [
        { nombre: "Ing. Roberto Cárdenas (Genérico)", correo: "roberto@certiredes.com" },
        { nombre: "Ing. Diana Marcela Valencia (Genérico)", correo: "diana@certiredes.com" },
        { nombre: "Técnico Carlos Orozco (Genérico)", correo: "carlos@certiredes.com" }
    ];

    let bolsaInspectores = [...inspectoresReales, ...inspectoresGenericos];

    // Regla de control (a partir de la 4ta solicitud pasa a modo manual)
    if (solicitudes.length >= 3) {
        return {
            nombre: "Pendiente de Asignación Manual",
            correo: "admin@certiredes.com",
            modoManual: true
        };
    }

    // Asignación aleatoria entre reales y genéricos
    if (bolsaInspectores.length > 0) {
        let elegido = bolsaInspectores[Math.floor(Math.random() * bolsaInspectores.length)];
        return {
            nombre: elegido.nombre || elegido.correo,
            correo: elegido.correo,
            modoManual: false
        };
    }

    // Respaldo por seguridad
    return {
        nombre: "Inspector Automático (Sistema)",
        correo: "soporte@certiredes.com",
        modoManual: false
    };
}


// =========================================================================
// 🎯 2. GUARDAR SOLICITUD DESDE EL PORTAL
// =========================================================================
function guardarSolicitud(tipo, metodoPago = "nequi") {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    // Llamamos a la función inteligente para asignar el inspector
    let inspectorAsignado = asignarInspectorInteligente();

    const nuevaSolicitud = {
        id: Date.now(),
        usuarioId: usuarioActivo ? usuarioActivo.id : "invitado",
        nombreCliente: usuarioActivo ? usuarioActivo.nombre : "Cliente Portal",
        tipo: tipo,
        metodoPago: metodoPago,
        inspectorAsignadoNombre: inspectorAsignado.nombre,
        inspectorAsignadoCorreo: inspectorAsignado.correo,
        esManual: inspectorAsignado.modoManual,
        estado: inspectorAsignado.modoManual ? "Pendiente de Asignación" : "En proceso",
        fecha: new Date().toLocaleDateString()
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    alert("¡Solicitud guardada correctamente! Inspector asignado: " + inspectorAsignado.nombre);

}