// ==========================
// MENU HAMBURGUESA
// ==========================
const btn = document.querySelector(".menu-icon");
const menu = document.querySelector(".nav");

if (btn && menu) {
  btn.addEventListener("click", () => {
    menu.classList.toggle("activo");
  });
}

// ==========================
// BOTON VOLVER ARRIBA
// ==========================
const btnTop = document.getElementById("btnTop");

if (btnTop) {
  btnTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// ==========================
// MENSAJE DE BIENVENIDA
// ==========================
window.addEventListener("load", () => {
  alert("Bienvenido a CertiRedes");
});

// ==========================
// cambar a modo oscuro
// ==========================


const btnModo = document.getElementById("modo");

btnModo.addEventListener("click", () => {
  document.body.classList.toggle("oscuro");
});