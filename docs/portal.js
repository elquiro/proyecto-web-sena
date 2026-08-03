// ===============================
// 🔐 PROTECCIÓN DE ACCESO
// ===============================
let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

if (!usuario) {
    window.location.href = "acceso.html";
}

// Variable global para rastrear la vista actual
let vistaActualGlobal = "mis-solicitudes";

// ===============================
// 👤 MOSTRAR DATOS DEL USUARIO
// ===============================
document.addEventListener("DOMContentLoaded", function () {
    const nombreSpan = document.getElementById("usuarioNombre");
    if (nombreSpan) {
        nombreSpan.innerText = usuario.nombre || usuario.correo;
    }

    const mensaje = document.getElementById("mensajeRol");

    if (usuario.tipo === "cliente") {
        if (mensaje) mensaje.innerText = "Gestiona tus solicitudes y certificados.";
        mostrarMenu("menuCliente");
        cambiarVista("mis-solicitudes");
    } else if (usuario.tipo === "proveedor") {
        if (mensaje) mensaje.innerText = "Administra tus trabajos asignados.";
        mostrarMenu("menuProveedor");
        cambiarVista("servicios-disponibles");
    } else if (usuario.tipo === "inspector") {
        if (mensaje) mensaje.innerText = "Supervisa y valida inspecciones.";
        mostrarMenu("menuInspector");
        cambiarVista("solicitudes-asignadas"); // Carga por defecto las disponibles
    } else if (usuario.tipo === "aspirante") {
        if (mensaje) mensaje.innerText = "Consulta tu proceso de ingreso.";
        mostrarMenu("menuAspirante");
        cambiarVista("perfil-aspirante");
    }
});

// ===============================
// 📂 MOSTRAR MENÚ SEGÚN ROL
// ===============================
function mostrarMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.style.display = "block";
    }
}

// ===============================
// 🔄 CAMBIO DE VISTAS DINÁMICAS
// ===============================
function cambiarVista(vista) {
    vistaActualGlobal = vista;

    const contenedor = document.getElementById("contenidoDinamico");
    if (!contenedor) return;

    contenedor.innerHTML = ""; // Limpieza de vista previa

    let contenido = "";

    // ================= CLIENTE =================
    if (vista === "nueva-solicitud") {
        contenido = `
            <h3>Selecciona el tipo de servicio</h3>
            <div class="contenedor-servicios">
                <div class="card-portal" onclick="guardarSolicitud('Revisión periódica')">
                    <h4>Revisión periódica</h4>
                    <p>Inspección obligatoria.</p>
                </div>
                <div class="card-portal" onclick="guardarSolicitud('Red nueva')">
                    <h4>Redes nuevas o reformadas</h4>
                    <p>Instalaciones recientes o modificadas.</p>
                </div>
                <div class="card-portal" onclick="guardarSolicitud('Red sin vínculo')">
                    <h4>Red sin vínculo</h4>
                    <p>Sin operador registrado.</p>
                </div>
                <div class="card-portal" onclick="guardarSolicitud('Red vencida')">
                    <h4>Red vencida</h4>
                    <p>Requiere reinspección.</p>
                </div>
            </div>
        `;
    } else if (vista === "mis-solicitudes") {
        contenido = `
            <h3>Mis solicitudes</h3>
            <div id="listaSolicitudes"></div>
        `;
    }

    // ================= PROVEEDOR =================
    else if (vista === "perfil-proveedor") {
        contenido = `
            <h3>Perfil de la Empresa / Proveedor</h3>
            <div class="card-portal" style="background:#fff; padding:20px; border-radius:8px; border: 1px solid #ccc;">
                <p><strong>Empresa:</strong> ${usuario.empresa || 'No especificada'}</p>
                <p><strong>Responsable:</strong> ${usuario.responsable || usuario.nombre}</p>
                <p><strong>Servicio que provee a Certiredes:</strong> ${usuario.servicio || 'Suministro / Mantenimiento'}</p>
                <p><strong>Correo de contacto:</strong> ${usuario.correo}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono || 'Sin registrar'}</p>
                <p><strong>Dirección:</strong> ${usuario.direccion || 'Sin registrar'}</p>
            </div>
        `;
    } else if (vista === "servicios-disponibles") {
        contenido = `
            <h3>Órdenes de Servicio Interno (Certiredes)</h3>
            <p>Servicios contratados por Certiredes a tu empresa (ej. Mantenimiento de equipos, soporte informático, insumos).</p>
            <div id="listaSolicitudes"></div>
        `;
    } else if (vista === "historial-servicios") {
        contenido = `
            <h3>Historial de Entregas y Servicios Finalizados</h3>
            <div id="listaSolicitudes"></div>
        `;
    }

    // ================= INSPECTOR =================
    else if (vista === "solicitudes-asignadas") {
        contenido = `
            <h3>Solicitudes Disponibles / Pendientes</h3>
            <div id="listaSolicitudes"></div>
        `;
    } else if (vista === "en-proceso") {
        contenido = `
            <h3>Inspecciones En Proceso</h3>
            <div id="listaSolicitudes"></div>
        `;
    } else if (vista === "historial-inspecciones") {
        contenido = `
            <h3>Historial de Inspecciones Finalizadas</h3>
            <div id="listaSolicitudes"></div>
        `;
    }

    // ================= ASPIRANTE =================
    else if (vista === "perfil-aspirante") {
        let areasNombre = {
            "administrativo": "Administrativo / Finanzas",
            "atencion": "Atención al Cliente",
            "tecnico": "Servicio Técnico",
            "operativo": "Operativo (Instalaciones y Campo)"
        };
        let areaReal = areasNombre[usuario.interes] || usuario.interes || "Administrativo / Finanzas";

        contenido = `
            <h3>Perfil del Aspirante</h3>
            <div style="background:#fff; color:#333; padding:20px; border-radius:8px; border:1px solid #ccc; line-height: 1.8;">
                <p><strong>Nombre completo:</strong> ${usuario.nombre || 'No registrado'}</p>
                <p><strong>Correo electrónico:</strong> ${usuario.correo}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono || 'Sin registrar'}</p>
                <p><strong>Nivel de estudios:</strong> ${usuario.estudios ? usuario.estudios.toUpperCase() : 'NO ESPECIFICADO'}</p>
                <p><strong>Área a la que se postula:</strong> <span style="color:#007bff; font-weight:bold;">${areaReal}</span></p>
            </div>
        `;
    } else if (vista === "postulacion") {
        let areasNombre = {
            "administrativo": "Administrativo / Finanzas",
            "atencion": "Atención al Cliente",
            "tecnico": "Servicio Técnico",
            "operativo": "Operativo (Instalaciones y Campo)"
        };
        let areaReal = areasNombre[usuario.interes] || usuario.interes || "Administrativo / Finanzas";

        contenido = `
            <h3>Estado del Proceso de Selección</h3>
            <div style="background:#fff; color:#333; padding:20px; border-radius:8px; border:1px solid #ccc; line-height: 1.8;">
                <p><strong>Candidato:</strong> ${usuario.nombre}</p>
                <p><strong>Área / Cargo solicitado:</strong> <span style="font-weight:bold; color:#007bff;">${areaReal}</span></p>
                <p><strong>Área Evaluadora:</strong> Departamento Administrativo y Gestión Humana</p>
                <p><strong>Estado actual:</strong> <span style="background:#fff3cd; color:#856404; padding:4px 8px; border-radius:4px; font-weight:bold;">En Revisión General de Hoja de Vida</span></p>
                <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
                <p>El equipo <strong>Administrativo</strong> de Certiredes está validando tu perfil académico para la vacante de <strong>${areaReal}</strong>.</p>
            </div>
        `;
    } else if (vista === "requisitos") {
        let areasNombre = {
            "administrativo": "Administrativo / Finanzas",
            "atencion": "Atención al Cliente",
            "tecnico": "Servicio Técnico",
            "operativo": "Operativo (Instalaciones y Campo)"
        };
        let areaReal = areasNombre[usuario.interes] || usuario.interes || "Administrativo / Finanzas";

        contenido = `
            <h3>Carga de Documentos para Selección</h3>
            <div style="background:#fff; color:#333; padding:20px; border-radius:8px; border:1px solid #ccc; line-height: 1.8;">
                <p>Adjunta tus documentos para que el <strong>Área Administrativa</strong> continúe con el estudio de tu perfil para el área de <strong>${areaReal}</strong>:</p>
                
                <form onsubmit="alert('¡Documentos enviados con éxito al Área Administrativa!'); return false;" style="margin-top:15px;">
                    <label><strong>Adjuntar Hoja de Vida (PDF):</strong></label><br>
                    <input type="file" required style="margin:10px 0;"><br><br>

                    <label><strong>Adjuntar Documento de Identidad / Certificados:</strong></label><br>
                    <input type="file" style="margin:10px 0;"><br><br>

                    <button type="submit" class="btn" style="background:#28a745; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer;">
                        📤 Adjuntar y Enviar a Gestión Humana
                    </button>
                </form>
            </div>
        `;
    }

    contenedor.innerHTML = contenido;

    // Ejecutar renderizado si la vista requiere lista
    if (["mis-solicitudes", "solicitudes-asignadas", "en-proceso", "historial-inspecciones", "servicios-disponibles", "historial-servicios"].includes(vista)) {
        renderSolicitudes();
    }
}

// ===============================
// 💾 GUARDAR SOLICITUD (CLIENTE)
// ===============================
function guardarSolicitud(tipo) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    const nueva = {
        id: Date.now(),
        tipo: tipo,
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString(),
        cliente: usuario.correo,
        clienteNombre: usuario.nombre || usuario.correo,
        inspector: "Sin asignar",
        proveedor: "proveedor@test.com"
    };

    solicitudes.push(nueva);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    alert("Solicitud creada correctamente.");
    cambiarVista("mis-solicitudes");
}

// ===============================
// 📋 RENDERIZAR SOLICITUDES SEGÚN EL ROL Y LA VISTA
// ===============================
function renderSolicitudes() {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    const lista = document.getElementById("listaSolicitudes");

    if (!lista) return;

    lista.innerHTML = "";
    let filtradas = [];

    // 1. ROL CLIENTE
    if (usuario.tipo === "cliente") {
        filtradas = solicitudes.filter(s => s.cliente === usuario.correo);
    } 
    
    // 2. ROL INSPECTOR
    else if (usuario.tipo === "inspector") {
        if (vistaActualGlobal === "solicitudes-asignadas") {
            filtradas = solicitudes.filter(s => s.estado === "Pendiente");
        } else if (vistaActualGlobal === "en-proceso") {
            filtradas = solicitudes.filter(s => s.estado === "En proceso" && s.inspector === usuario.correo);
        } else if (vistaActualGlobal === "historial-inspecciones") {
            filtradas = solicitudes
                .filter(s => s.estado === "Finalizado" && s.inspector === usuario.correo)
                .reverse()
                .slice(0, 5);
        } else {
            filtradas = solicitudes.filter(s => s.estado === "Pendiente");
        }
    } 
    
    // 3. ROL PROVEEDOR
    else if (usuario.tipo === "proveedor") {
        let ordenesProveedor = JSON.parse(localStorage.getItem("ordenesProveedor")) || [
            {
                id: 101,
                servicio: "Mantenimiento Preventivo de Equipos de Cómputo",
                solicitante: "Certiredes - Área de TI",
                fecha: new Date().toLocaleDateString(),
                estado: "En proceso"
            },
            {
                id: 102,
                servicio: "Calibración de Manómetros y Detectores de Gas",
                solicitante: "Certiredes - Área Técnica",
                fecha: new Date().toLocaleDateString(),
                estado: "En proceso"
            }
        ];

        if (vistaActualGlobal === "servicios-disponibles") {
            filtradas = ordenesProveedor.filter(o => o.estado !== "Finalizado");
        } else if (vistaActualGlobal === "historial-servicios") {
            filtradas = ordenesProveedor.filter(o => o.estado === "Finalizado");
        } else {
            filtradas = ordenesProveedor.filter(o => o.estado !== "Finalizado");
        }

        if (filtradas.length === 0) {
            lista.innerHTML = "<p style='padding: 10px; color: #666;'>No hay órdenes de servicio pendientes para tu empresa.</p>";
            return;
        }

        let html = "";
        filtradas.forEach((o) => {
            html += `
                <div class="solicitud" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #fff; color: #333;">
                    <h4>📦 ${o.servicio}</h4>
                    <p><strong>Cliente/Contratante:</strong> ${o.solicitante}</p>
                    <p><strong>Estado:</strong> ${o.estado}</p>
                    <p><strong>Fecha de solicitud:</strong> ${o.fecha}</p>
                    
                    ${o.estado !== "Finalizado" ? `
                        <button class="btn" onclick="finalizarOrdenProveedor(${o.id})" style="background-color: #28a745; color: white; margin-top: 10px;">
                            ✅ Entregar Servicio / Marcar Completado
                        </button>
                    ` : `<p style="color: green; font-weight: bold;">✔ Servicio entregado a Certiredes</p>`}
                </div>
            `;
        });

        lista.innerHTML = html;
        return; // Finaliza para el proveedor
    }

    // =========================================================================
    // RENDERIZADO GENERAL PARA CLIENTE E INSPECTOR
    // =========================================================================
    if (filtradas.length === 0) {
        lista.innerHTML = "<p style='padding: 10px; color: #666;'>No hay solicitudes registradas en esta sección.</p>";
        return;
    }

    let html = "";
    filtradas.forEach((s) => {
        html += `
            <div class="solicitud" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #fff; color: #333;">
                <h4>${s.tipo}</h4>
                <p><strong>Estado:</strong> ${s.estado}</p>
                <p><strong>Fecha:</strong> ${s.fecha}</p>
                
                ${usuario.tipo !== "cliente" ? `<p><strong>Cliente:</strong> ${s.clienteNombre || s.cliente}</p>` : ""}
                <p><strong>Inspector:</strong> ${s.inspector || "Sin asignar"}</p>
                <p><em>${obtenerMensaje(s.estado)}</em></p>

                ${usuario.tipo === "cliente" ? `
                    ${s.estado === "Pendiente" ? `
                        <button class="btn" onclick="cancelarSolicitud(${s.id})" style="background-color: #dc3545; color: white; margin-top: 10px;">
                            ❌ Cancelar Solicitud
                        </button>
                    ` : ""}

                    ${s.estado === "Finalizado" ? `
    <div style="margin-top: 10px; padding: 12px; background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 5px;">
        <p style="color: #2e7d32; font-weight: bold; margin-bottom: 8px;">
            ✅ Inspección Aprobada y Certificada
        </p>
        <a href="/docs/certificado_info.html?nombre=${encodeURIComponent(s.clienteNombre || usuario.nombre)}&servicio=${encodeURIComponent(s.tipo)}" 
           target="_blank" 
           class="btn" 
           style="background-color: #28a745; color: white; text-decoration: none; display: inline-block; padding: 8px 12px; border-radius: 4px; font-weight: bold;">
            📄 Ver / Descargar Certificado de ${s.tipo} (PDF)
        </a>
    </div>
` : ""}
                ` : ""}

                ${usuario.tipo === "inspector" ? `
                    ${s.estado === "Pendiente" ? `
                        <button class="btn" onclick="tomarSolicitud(${s.id})" style="background-color: #28a745; color: white; margin-top: 10px;">
                            🙋‍♂️ Asignármela e Iniciar
                        </button>
                    ` : ""}

                    ${s.estado === "En proceso" ? `
                        <button class="btn" onclick="cambiarEstadoSolicitud(${s.id}, 'Finalizado')" style="background-color: #007bff; color: white; margin-top: 10px;">
                            ✅ Finalizar Inspección
                        </button>
                    ` : ""}
                ` : ""}
            </div>
        `;
    });

    lista.innerHTML = html;
}

// ===============================
// ✍️ INSPECTOR ASIGNA Y PASA A "EN PROCESO"
// ===============================
function tomarSolicitud(id) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    
    solicitudes = solicitudes.map(s => {
        if (s.id === id) {
            s.inspector = usuario.correo;
            s.estado = "En proceso";
        }
        return s;
    });

    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    alert("¡Te has asignado esta inspección! Ahora se encuentra en la sección 'En proceso'.");
    
    cambiarVista("en-proceso");
}

// ===============================
// 🔄 CAMBIAR ESTADO A FINALIZADO
// ===============================
function cambiarEstadoSolicitud(id, nuevoEstado) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    
    solicitudes = solicitudes.map(s => {
        if (s.id === id) {
            s.estado = nuevoEstado;
        }
        return s;
    });

    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    alert("¡Inspección finalizada con éxito! Ha sido movida al Historial.");
    
    cambiarVista("historial-inspecciones");
}

// ===============================
// ❌ CANCELAR SOLICITUD
// ===============================
function cancelarSolicitud(id) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    solicitudes = solicitudes.filter(s => s.id !== id);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    renderSolicitudes();
}

// ===============================
// 💬 MENSAJES SEGÚN ESTADO
// ===============================
function obtenerMensaje(estado) {
    const mensajes = {
        "Pendiente": "Solicitud pendiente por asignación de inspector.",
        "En proceso": "Inspección técnica en curso.",
        "Finalizado": "Inspección finalizada. Certificado generado."
    };
    return mensajes[estado] || "Estado no definido";
}

// ===============================
// 🚪 LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "acceso.html";
}

// ===============================
// 🛠️ FINALIZAR ORDEN DE PROVEEDOR
// ===============================
function finalizarOrdenProveedor(id) {
    let ordenes = JSON.parse(localStorage.getItem("ordenesProveedor")) || [
        { id: 101, servicio: "Mantenimiento Preventivo de Equipos de Cómputo", solicitante: "Certiredes - Área de TI", fecha: new Date().toLocaleDateString(), estado: "En proceso" },
        { id: 102, servicio: "Calibración de Manómetros y Detectores de Gas", solicitante: "Certiredes - Área Técnica", fecha: new Date().toLocaleDateString(), estado: "En proceso" }
    ];

    ordenes = ordenes.map(o => {
        if (o.id === id) {
            o.estado = "Finalizado";
        }
        return o;
    });

    localStorage.setItem("ordenesProveedor", JSON.stringify(ordenes));
    alert("¡Servicio reportado como completado a Certiredes!");
    renderSolicitudes();
}