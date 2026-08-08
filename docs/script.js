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

    // 🟡 INSPECTOR (si ya lo tienes)
    if(tipo === "inspector"){
        usuario.nombre = document.querySelector('[name="nombre"]').value;
    }

    // 🟣 ASPIRANTE (si ya lo tienes)
    if(tipo === "aspirante"){
        usuario.nombre = document.querySelector('[name="nombre"]')?.value || "Aspirante";
        usuario.estudios = document.querySelector('[name="estudios"]')?.value || "No especificado";
        usuario.interes = document.querySelector('[name="interes"]')?.value || "administrativo";
    }


let existe = usuarios.find(u => u.correo === usuario.correo);

if(existe){
    alert("Este correo ya está registrado");
    return;
}





    usuarios.push(usuario);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    console.log("Usuarios guardados:", usuarios);

    alert("¡Usuario registrado con éxito!");

    e.target.reset();

    window.location.href = "acceso.html";
}


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