// ===============================
// 💾 GUARDAR CAMBIOS (INICIAL)
// ===============================
function guardarCambios(e) {
    e.preventDefault();

    let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    usuario.nombre = document.getElementById("nombre").value;
    usuario.correo = document.getElementById("correo").value;
    usuario.telefono = document.getElementById("telefono").value;

    let inputFoto = document.getElementById("fotoInput");

    if (inputFoto.files.length > 0) {
        reducirImagen(inputFoto.files[0], function(imagenReducida) {
            usuario.foto = imagenReducida;
            guardarTodo(usuario, usuarios);
        });
    } else {
        guardarTodo(usuario, usuarios);
    }
}


document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("fotoInput");
    const img = document.getElementById("fotoUsuario");
    
    // PREVISUALIZAR FOTO
    input.onchange = function() {
        const archivo = this.files[0];

        if (archivo) {
            const reader = new FileReader();

            reader.onload = function(e) {
                img.src = e.target.result;
            };

            reader.readAsDataURL(archivo);
        }
    };

    // 🔒 SESIÓN
    let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (!usuarioActivo) {
        window.location.href = "acceso.html";
        return;
    }

    // 📥 CARGAR DATOS
    document.getElementById("nombre").value = usuarioActivo.nombre;
    document.getElementById("correo").value = usuarioActivo.correo;
    document.getElementById("telefono").value = usuarioActivo.telefono;

    document.getElementById("nombreUsuario").innerText = usuarioActivo.nombre;
    document.getElementById("tipoUsuario").innerText = usuarioActivo.tipo;

    if (usuarioActivo.foto) {
        img.src = usuarioActivo.foto;
    } else {
        img.src = "img/default.png"; // Nota: Corregí el error tipográfico "dafault" por "default" manteniendo la ruta segura
    }
});


function reducirImagen(file, callback) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const MAX_WIDTH = 300;

            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            callback(dataUrl);
        };
    };

    reader.readAsDataURL(file);
}

// ===============================
// 🧠 GUARDADO REAL (ACTUALIZADO)
// ===============================
function guardarTodo(usuario, usuarios) {
    console.log("💾 GUARDANDO:", usuario);
    console.log("📦 LISTA USUARIOS:", usuarios);

    // 1. Asegurar que el usuario tenga un ID único
    if (!usuario.id) {
        usuario.id = Date.now().toString();
    }

    // 2. Buscar al usuario en la lista usando el ID
    let index = usuarios.findIndex(u => u.id == usuario.id);

    // 3. Si existe, lo reemplazamos; si no, lo añadimos
    if (index !== -1) {
        usuarios[index] = usuario;
    } else {
        usuarios.push(usuario);
    }

    // 4. Guardar en localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

    // 5. Actualizar la vista (interfaz)
    document.getElementById("nombreUsuario").innerText = usuario.nombre;

    if (usuario.foto) {
        document.getElementById("fotoUsuario").src = usuario.foto;
    }

    alert("¡Perfil actualizado correctamente!");
}
// ===============================
// ❌ CANCELAR
// ===============================
function cancelar() {
    let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    document.getElementById("nombre").value = usuario.nombre;
    document.getElementById("correo").value = usuario.correo;
    document.getElementById("telefono").value = usuario.telefono;

    document.getElementById("nombreUsuario").innerText = usuario.nombre;

    if (usuario.foto) {
        document.getElementById("fotoUsuario").src = usuario.foto;
    } else {
        document.getElementById("fotoUsuario").src = "img/default.png";
    }
}


// ===============================
// 🚪 CERRAR SESIÓN
// ===============================
function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "acceso.html";
}


// ===============================
// 📋 GUARDAR SOLICITUD TIPO
// ===============================
function guardarSolicitud(tipo) {
    let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    const nueva = {
        id: Date.now(),
        usuarioId: usuario.id, // 👈 IMPORTANTE
        tipo: tipo,
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString()
    };
    
    solicitudes.push(nueva);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    alert("¡Solicitud guardada correctamente!");

    if (typeof cambiarVista === "function") {
        cambiarVista("mis-solicitudes");
    }
}


// ===============================
// 🔄 ACTUALIZAR ESTADO
// ===============================
function actualizarEstados() {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    solicitudes = solicitudes.map(s => {
        if (s.estado === "Pendiente") {
            if (Math.random() > 0.5) {
                s.estado = "En proceso";
            }
        } else if (s.estado === "En proceso") {
            if (Math.random() > 0.5) {
                s.estado = "Finalizado";
            }
        }

        return s;
    });

    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
}


// ===============================
// 🤖 GENERAR DATOS AUTOMÁTICOS (MODO DEMO INTELIGENTE)
// ===============================
function verificarYGenerarSolicitudesAutomaticas() {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    // Si la lista está totalmente vacía, creamos 4 registros falsos muy profesionales
    if (solicitudes.length === 0) {
        const clientesFalsos = ["Carlos Gómez", "María Fernanda López", "Andrés Felipe Pérez", "Luisa Fernanda Torres", "Jorge Eliécer Riascos"];
        const serviciosFalsos = ["Revisión periódica ($120.000)", "Red nueva ($200.000)", "Red vencida ($170.000)", "Inspección de gas comercial ($160.000)"];
        const inspectoresFalsos = ["Ing. Roberto Cárdenas", "Ing. Diana Marcela Valencia", "Técnico Carlos Orozco", "Ing. Mauricio Benítez"];
        const estadosFalsos = ["Pendiente", "En proceso", "Finalizado"];

        for (let i = 0; i < 4; i++) {
            solicitudes.push({
                id: 1000 + i,
                usuarioId: "demo_" + i,
                tipo: serviciosFalsos[Math.floor(Math.random() * serviciosFalsos.length)],
                nombreCliente: clientesFalsos[Math.floor(Math.random() * clientesFalsos.length)],
                inspectorAsignado: inspectoresFalsos[Math.floor(Math.random() * inspectoresFalsos.length)],
                estado: estadosFalsos[Math.floor(Math.random() * estadosFalsos.length)],
                fecha: new Date().toLocaleDateString()
            });
        }

        // Guardamos los datos automáticos en el LocalStorage
        localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    }
}

// Ejecutar esta verificación apenas carga cualquier script que use solicitudes
verificarYGenerarSolicitudesAutomaticas();