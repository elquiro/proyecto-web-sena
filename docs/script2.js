// 1. Buscamos el botón y el menú en la página
const boton = document.querySelector('.btn-hamburguesa');
const menu = document.querySelector('.nav-navegacion');

// 2. Le decimos al botón que escuche cuando le das clic
boton.addEventListener('click', () => {
    
    // 3. Si el menú tiene "display: none", lo cambia a "block" para mostrarlo.
    //    Si ya se está mostrando, lo vuelve a esconder.
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
    }
});

//////////////////////////////////////////////////////////////////////////////////

// =========================
// INICIALIZAR USUARIOS
// =========================
if (!localStorage.getItem("usuarios")) {
    localStorage.setItem("usuarios", JSON.stringify([]));
}

// =========================
// REGISTRO
// =========================
function registrar(e){
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !correo || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const existe = usuarios.find(u => u.correo === correo);

    if (existe) {
        alert("El usuario ya existe");
        return;
    }

    const nuevoUsuario = {
        nombre: nombre,
        correo: correo,
        password: password
    };

    usuarios.push(nuevoUsuario);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Usuario creado correctamente");

    window.location.href = "acceso.html";
}
// =========================
// LOGIN (ACCESO)
// =========================
function login(e){
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    let usuarios = JSON.parse(localStorage.getItem("usuarios"));

    if (!usuarios || usuarios.length === 0) {
        alert("No hay usuarios registrados");
        return;
    }

    const usuario = usuarios.find(u =>
        u.correo === correo && u.password === password
    );

    if (usuario) {
        localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

        alert("Ingreso exitoso");
        window.location.href = "portal.html";
    } else {
        alert("Correo o contraseña incorrectos");
    }
}

// =========================
// LOGOUT
// =========================
function logout(){
    localStorage.removeItem("usuarioActivo");
    window.location.href = "acceso.html";
}