// ===============================
// 🔐 PROTECCIÓN DE ACCESO Y CIERRE DE SESIÓN
// ===============================
let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

if (!usuario) {
    window.location.href = "acceso.html";
}

function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "acceso.html";
}

// Variable global para rastrear la vista actual
let vistaActualGlobal = "mis-solicitudes";

// Variables temporales para nueva solicitud
let servicioSeleccionadoGlobal = "";
let valorServicioGlobal = 0;


// ===============================
// 🛒 SELECCIONAR SERVICIO Y PAGO (CON SCROLL AUTOMÁTICO)
// ===============================
function seleccionarServicio(nombre, valor) {
    servicioSeleccionadoGlobal = nombre;
    valorServicioGlobal = valor;

    const lblNombre = document.getElementById("nombreServicio");
    const lblValor = document.getElementById("valorServicio");

    if (lblNombre) lblNombre.innerText = nombre;
    if (lblValor) lblValor.innerText = "$" + valor.toLocaleString() + " COP";

    // Llevar automáticamente la vista hacia la pasarela de pago para que el usuario no quede perdido
    const seccionPago = document.getElementById("seccion-pago");
    if (seccionPago) {
        seccionPago.scrollIntoView({ behavior: 'smooth' });
    }
}

function procesarPagoReal() {
    if (!servicioSeleccionadoGlobal) {
        alert("Por favor, seleccione un tipo de servicio primero.");
        return;
    }

    const metodoSelect = document.getElementById("selectMetodo");
    const metodoPago = metodoSelect ? metodoSelect.value : "nequi";

    // Llamar a la función principal que guarda y simula el flujo
    guardarSolicitud(servicioSeleccionadoGlobal, metodoPago);
}


// =========================================================================
// 🎯 GUARDAR SOLICITUD Y SIMULAR FLUJO AUTOMÁTICO
// =========================================================================

function guardarSolicitud(tipo, metodoPago = "nequi") {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    let listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // 1. Obtener inspectores disponibles de la base de datos

    let inspectoresDisponibles = listaUsuarios.filter(u => u.tipo === "inspector");
    let inspectorAsignadoNombre = "Inspector Automático"; 
    let inspectorAsignadoCorreo = "inspector@certiredes.com";

    if (inspectoresDisponibles.length > 0) {
        let inspectorAleatorio = inspectoresDisponibles[Math.floor(Math.random() * inspectoresDisponibles.length)];
        inspectorAsignadoNombre = inspectorAleatorio.nombre || inspectorAleatorio.correo;
        inspectorAsignadoCorreo = inspectorAleatorio.correo;
    }

    const nuevaId = Date.now();

    // 2. Crear solicitud en estado "Pendiente"
    const nuevaSolicitud = {
        id: nuevaId,
        tipo: tipo,
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString(),
        cliente: usuario.correo,
        clienteNombre: usuario.nombre || usuario.correo,
        inspector: "Sin asignar",
        proveedor: "Certiredes GAS",
        pago: "Pagado (" + metodoPago.toUpperCase() + ")",
        reembolso: "No"
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    // Cambiar la vista para ver cómo inicia el proceso
    cambiarVista("mis-solicitudes");
    
    alert("¡Pago exitoso! Iniciando solicitud...\n\nEstado actual: Pendiente (Tienes tiempo para retractarte si lo deseas).");

    // 3. A los 25 segundos: Pasa a "En proceso" y asigna el inspector (Margen de retractación amplio)
    setTimeout(() => {
        let sols = JSON.parse(localStorage.getItem("solicitudes")) || [];
        let solIndex = sols.findIndex(s => s.id === nuevaId);
        
        if(solIndex !== -1) {
            if (sols[solIndex].estado === "Cancelado") return;

            sols[solIndex].estado = "En proceso";
            sols[solIndex].inspector = inspectorAsignadoNombre;
            sols[solIndex].inspectorCorreo = inspectorAsignadoCorreo;
            localStorage.setItem("solicitudes", JSON.stringify(sols));
            
            if (vistaActualGlobal === "mis-solicitudes") renderSolicitudes();
        }
    }, 25000);

    // 4. A los 50 segundos: Pasa a "Finalizado" y REDIRIGE AL CERTIFICADO
    setTimeout(() => {
        let sols = JSON.parse(localStorage.getItem("solicitudes")) || [];
        let solIndex = sols.findIndex(s => s.id === nuevaId);
        
        if(solIndex !== -1) {
            if (sols[solIndex].estado === "Cancelado") return;

            sols[solIndex].estado = "Finalizado";
            localStorage.setItem("solicitudes", JSON.stringify(sols));
            
            if (vistaActualGlobal === "mis-solicitudes") renderSolicitudes();
            
            alert("✅ ¡Inspección finalizada!\n\nEl inspector " + inspectorAsignadoNombre + " ha completado la revisión. Ya puedes descargar tu certificado.");
            
            const paramNombre = encodeURIComponent(nuevaSolicitud.clienteNombre);
            const paramServicio = encodeURIComponent(nuevaSolicitud.tipo);
            window.location.href = `certificado.html?nombre=${paramNombre}&servicio=${paramServicio}`;
        }
    }, 50000);
}


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
        cambiarVista("solicitudes-asignadas");
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

    contenedor.innerHTML = "";

    let contenido = "";

    // ================= CLIENTE =================
    if (vista === "nueva-solicitud") {
        contenido = `
        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-sizing: border-box;">
            
            <h3 style="color: #004080; margin-top: 0;">Nueva Solicitud de Servicio</h3>
            
            <h2 style="font-size: 0.9em; color: #555;">
                Seleccione el servicio que desea solicitar:
            </h2>

            <!-- SELECCIÓN DEL SERVICIO -->
            <h3>Selecciona el tipo de servicio</h3>

            <div class="contenedor-servicios" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                
                <div class="card-portal" onclick="seleccionarServicio('Revisión periódica', 120000)" style="cursor: pointer; padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #004080;">
                    <h4 style="margin: 0 0 5px 0; color: #fff;">Revisión periódica</h4>
                    <h2 style="margin: 0; font-size: 0.85em; color: #fff;">
                        Inspección obligatoria — $120.000 COP
                    </h2>
                </div>

                <div class="card-portal" onclick="seleccionarServicio('Red nueva', 200000)" style="cursor: pointer; padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #004080;">
                    <h4 style="margin: 0 0 5px 0; color: #fff;">Redes nuevas o reformadas</h4>
                    <h2 style="margin: 0; font-size: 0.85em; color: #fff;">
                        Instalaciones recientes o modificadas — $200.000 COP
                    </h2>
                </div>

                <div class="card-portal" onclick="seleccionarServicio('Red sin vínculo', 160000)" style="cursor: pointer; padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #004080;">
                    <h4 style="margin: 0 0 5px 0; color: #fff;">Red sin vínculo</h4>
                    <h2 style="margin: 0; font-size: 0.85em; color: #fff;">
                        Sin operador registrado — $160.000 COP
                    </h2>
                </div>

                <div class="card-portal" onclick="seleccionarServicio('Red vencida', 170000)" style="cursor: pointer; padding: 12px; border: 1px solid #ccc; border-radius: 6px; background: #004080;">
                    <h4 style="margin: 0 0 5px 0; color: #fff;">Red vencida</h4>
                    <h2 style="margin: 0; font-size: 0.85em; color: #fff;">
                        Requiere reinspección — $170.000 COP
                    </h2>
                </div>

            </div>

            <!-- SIMULADOR DE PAGO -->
            <div id="seccion-pago" style="background: #f9f9f9; border: 1px solid #ccc; padding: 15px; border-radius: 8px;">

                <h4 style="color: #004080; margin-top: 0; margin-bottom: 8px; font-size: 0.95em;">
                    Simular Pasarela de Pago
                </h4>

                <!-- SERVICIO SELECCIONADO -->
                <div id="servicioSeleccionado" style="background: #fff; border: 1px solid #ddd; padding: 10px; border-radius: 5px; margin-bottom: 12px;">
                    <strong>Servicio seleccionado:</strong>
                    <span id="nombreServicio">Ninguno</span>
                    <br>
                    <strong>Valor:</strong>
                    <span id="valorServicio">$0 COP</span>
                </div>

                <label style="font-size: 0.85em; display: block; margin-bottom: 5px;">
                    Seleccione su método de pago:
                </label>

                <select id="selectMetodo" style="width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ccc; box-sizing: border-box;">
                    <option value="nequi">Nequi / Daviplata</option>
                    <option value="bancolombia">Transferencia Bancolombia</option>
                    <option value="pse">PSE (Pagos Seguros en Línea)</option>
                    <option value="efectivo">Pago contra entrega al técnico</option>
                </select>

                <button onclick="procesarPagoReal()" style="background: #28a745; color: white; border: none; padding: 10px; width: 100%; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.9em;">
                    Pagar y Confirmar Solicitud
                </button>

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
            <div class="card-portal" style="background:#fff; padding:20px; border-radius:8px; border: 1px solid #ccc; color:#333;">
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
            <p>Servicios contratados por Certiredes a tu empresa.</p>
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
                
                <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
                <button class="btn" onclick="habilitarEdicionAspirante()" style="background:#ffc107; color:#333; padding:8px 15px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
                    ✏️ Actualizar mis datos
                </button>
            </div>
            <div id="formEdicionAspirante" style="margin-top:15px;"></div>
        `;
    } else if (vista === "postulacion") {
        let estado = usuario.estadoPostulacion || "En Revisión General de Hoja de Vida";

        contenido = `
            <h3>Estado del Proceso de Selección</h3>
            <div style="background:#fff; color:#333; padding:20px; border-radius:8px; border:1px solid #ccc; line-height: 1.8;">
                <p><strong>Candidato:</strong> ${usuario.nombre}</p>
                <p><strong>Estado actual:</strong> 
                    <span style="background:${estado === 'Citado a Entrevista' ? '#d4edda' : '#fff3cd'}; 
                                 color:${estado === 'Citado a Entrevista' ? '#155724' : '#856404'}; 
                                 padding:4px 8px; border-radius:4px; font-weight:bold;">
                        ${estado}
                    </span>
                </p>
                
                ${estado === 'Citado a Entrevista' ? `
                    <div style="margin-top:20px; padding:15px; background:#e2f3ff; border-left: 5px solid #007bff;">
                        <h4 style="margin-top:0;">📅 Cita de Entrevista Confirmada</h4>
                        <p>Te esperamos para la entrevista presencial:</p>
                        <ul>
                            <li><strong>Fecha:</strong> ${usuario.fechaEntrevista}</li>
                            <li><strong>Hora:</strong> ${usuario.horaEntrevista}</li>
                            <li><strong>Entrevistador:</strong> ${usuario.entrevistador}</li>
                            <li><strong>Lugar:</strong> Oficina de Gestión Humana, Certiredes Sede Principal.</li>
                        </ul>
                    </div>
                ` : `
                    <p>El equipo <strong>Administrativo</strong> de Certiredes está validando tu perfil. Por favor, mantente atento a esta sección para futuras actualizaciones.</p>
                `}
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
                
                <form onsubmit="subirDocumentosAspirante(event)" style="margin-top:15px;">
                    <label><strong>Adjuntar Hoja de Vida (PDF):</strong></label><br>
                    <input type="file" id="archivoHdV" required style="margin:10px 0;"><br><br>

                    <label><strong>Adjuntar Documento de Identidad / Certificados:</strong></label><br>
                    <input type="file" id="archivoDoc" style="margin:10px 0;"><br><br>

                    <button type="submit" class="btn" style="background:#28a745; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer;">
                        📤 Adjuntar y Enviar a Gestión Humana
                    </button>
                </form>
            </div>
        `;
    }

    contenedor.innerHTML = contenido;

    if (["mis-solicitudes", "solicitudes-asignadas", "en-proceso", "historial-inspecciones", "servicios-disponibles", "historial-servicios"].includes(vista)) {
        renderSolicitudes();
    }
}


// ===============================
// 📋 RENDERIZAR SOLICITUDES
// ===============================
function renderSolicitudes() {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    const lista = document.getElementById("listaSolicitudes");

    if (!lista) return;

    lista.innerHTML = "";
    let filtradas = [];

    if (usuario.tipo === "cliente") {
        filtradas = solicitudes.filter(s => s.cliente === usuario.correo);
    }
    else if (usuario.tipo === "inspector") {
        let correoInspector = usuario.correo;
        let nombreInspector = usuario.nombre || usuario.correo;
    

        if (vistaActualGlobal === "solicitudes-asignadas") {
            filtradas = solicitudes.filter(s =>
                s.estado === "Pendiente" &&
                (!s.inspector || s.inspector === "Sin asignar")
            );
        }
        else if (vistaActualGlobal === "en-proceso") {
            filtradas = solicitudes.filter(s =>
                s.estado === "En proceso" &&
                (
                    s.inspector === nombreInspector ||
                    s.inspector === correoInspector ||
                    s.inspectorCorreo === correoInspector
                )
            );
        }
        else if (vistaActualGlobal === "historial-inspecciones") {
            filtradas = solicitudes
                .filter(s =>
                    s.estado === "Finalizado" &&
                    (
                        s.inspector === nombreInspector ||
                        s.inspector === correoInspector ||
                        s.inspectorCorreo === correoInspector
                    )
                )
                .reverse();
        }
        else {
            filtradas = solicitudes.filter(s => s.estado === "Pendiente");
        }
    }
    else if (usuario.tipo === "proveedor") {
        let ordenesProveedor = JSON.parse(localStorage.getItem("ordenesProveedor")) || [
            { id: 101, servicio: "Mantenimiento Preventivo de Equipos de Cómputo", solicitante: "Certiredes - Área de TI", fecha: new Date().toLocaleDateString(), estado: "En proceso" },
            { id: 102, servicio: "Calibración de Manómetros y Detectores de Gas", solicitante: "Certiredes - Área Técnica", fecha: new Date().toLocaleDateString(), estado: "En proceso" }
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
        return;
    }

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
                    ${s.estado !== "Finalizado" && s.estado !== "Cancelado" ? `
                    <button class="btn" onclick="cancelarSolicitud(${s.id})" style="background-color: #dc3545; color: white; margin-top: 10px;">
                        ❌ Cancelar Solicitud y Solicitar Reembolso
                    </button>
                ` : ""}
                    ${s.estado === "Finalizado" ? `
                        <div style="margin-top: 10px; padding: 12px; background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 5px;">
                            <p style="color: #2e7d32; font-weight: bold; margin-bottom: 8px;">
                                ✅ Inspección Aprobada y Certificada
                            </p>
                            <a href="certificado.html?nombre=${encodeURIComponent(s.clienteNombre || usuario.nombre)}&servicio=${encodeURIComponent(s.tipo)}" 
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
// ✍️ FUNCIONES DE ASPIRANTE
// ===============================
function habilitarEdicionAspirante() {
    const contenedorEdicion = document.getElementById("formEdicionAspirante");
    if (!contenedorEdicion) return;

    contenedorEdicion.innerHTML = `
        <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; color:#333; margin-top:10px;">
            <h4>Editar Datos Personales</h4>
            <label>Nombre:</label><br>
            <input type="text" id="editNombre" value="${usuario.nombre || ''}" style="width:100%; padding:6px; margin:5px 0 10px 0;"><br>
            
            <label>Teléfono:</label><br>
            <input type="text" id="editTelefono" value="${usuario.telefono || ''}" style="width:100%; padding:6px; margin:5px 0 10px 0;"><br>

            <label>Nivel de Estudios:</label><br>
            <input type="text" id="editEstudios" value="${usuario.estudios || ''}" style="width:100%; padding:6px; margin:5px 0 10px 0;"><br>

            <button class="btn" onclick="guardarEdicionAspirante()" style="background:#28a745; color:white; padding:8px 12px; border:none; border-radius:4px; cursor:pointer;">
                💾 Guardar Cambios
            </button>
        </div>
    `;
}

function guardarEdicionAspirante() {
    usuario.nombre = document.getElementById("editNombre").value;
    usuario.telefono = document.getElementById("editTelefono").value;
    usuario.estudios = document.getElementById("editEstudios").value;

    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

    let listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    listaUsuarios = listaUsuarios.map(u => {
        if (u.correo === usuario.correo) {
            u.nombre = usuario.nombre;
            u.telefono = usuario.telefono;
            u.estudios = usuario.estudios;
        }
        return u;
    });
    localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));

    alert("¡Datos actualizados con éxito!");
    cambiarVista("perfil-aspirante");
}

function subirDocumentosAspirante(event) {
    event.preventDefault();
    let archivoHdV = document.getElementById("archivoHdV").value;
    if (!archivoHdV) {
        alert("Por favor selecciona tu Hoja de Vida.");
        return;
    }

    usuario.estadoPostulacion = "En Revisión General de Hoja de Vida";
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

    alert("¡Documentos enviados con éxito al Departamento Administrativo!");

    setTimeout(() => {
        usuario.estadoPostulacion = "Citado a Entrevista";
        usuario.fechaEntrevista = "2026-08-15";
        usuario.horaEntrevista = "09:00 AM";
        usuario.entrevistador = "Dra. Martha Lucía Rodríguez";
        localStorage.setItem("usuarioActivo", JSON.stringify(usuario));

        if (vistaActualGlobal === "postulacion") {
            cambiarVista("postulacion");
        }
    }, 8000);

    cambiarVista("postulacion");
}


// ==========================================================
// 👷 INSPECTOR TOMA UNA SOLICITUD PENDIENTE
// ==========================================================
function tomarSolicitud(id) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    const solicitud = solicitudes.find(s => s.id === id);

    if (!solicitud) {
        alert("No se encontró la solicitud.");
        return;
    }

    if (solicitud.estado !== "Pendiente") {
        alert("Esta solicitud ya fue asignada o procesada.");
        return;
    }

    const inspectorNombre = usuario.nombre || usuario.correo;

    solicitudes = solicitudes.map(s => {
        if (s.id === id) {
            s.inspector = inspectorNombre;
            s.inspectorCorreo = usuario.correo;
            s.estado = "En proceso";
            s.fechaAsignacion = new Date().toLocaleDateString();
        }
        return s;
    });

    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    alert(
        "¡Solicitud asignada correctamente!\n\n" +
        "Servicio: " + solicitud.tipo + "\n" +
        "Inspector: " + inspectorNombre + "\n\n" +
        "La inspección ahora se encuentra EN PROCESO."
    );

    cambiarVista("en-proceso");
}


// ==========================================================
// 🛠️ CAMBIAR ESTADO DE SOLICITUD
// ==========================================================
function cambiarEstadoSolicitud(id, nuevoEstado) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    
    solicitudes = solicitudes.map(s => {
        if (s.id === id) {
            s.estado = nuevoEstado;
        }
        return s;
    });

    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    alert("¡Estado de la solicitud actualizado a: " + nuevoEstado + "!");
    renderSolicitudes();
}


// ===============================
// ❌ CANCELAR SOLICITUD + REEMBOLSO
// ===============================
function cancelarSolicitud(id) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    const solicitud = solicitudes.find(s => s.id === id);

    if (!solicitud) {
        alert("No se encontró la solicitud.");
        return;
    }

    if (solicitud.estado === "Finalizado") {
        alert("Esta solicitud ya fue finalizada y no puede cancelarse.");
        return;
    }

    const confirmar = confirm(
        "¿Deseas cancelar esta solicitud?\n\n" +
        "Servicio: " + solicitud.tipo + "\n\n" +
        "Se realizará un reembolso simulado del pago."
    );

    if (!confirmar) return;

    solicitudes = solicitudes.map(s => {
        if (s.id === id) {
            s.estado = "Cancelado";
            s.reembolso = "Procesado";
        }
        return s;
    });

    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    alert(
        "Solicitud cancelada correctamente.\n\n" +
        "💰 Reembolso simulado: Procesado"
    );

    renderSolicitudes();
}


// ===============================
// 📦 FINALIZAR ORDEN PROVEEDOR
// ===============================
function finalizarOrdenProveedor(id) {
    let ordenesProveedor = JSON.parse(localStorage.getItem("ordenesProveedor")) || [];
    
    ordenesProveedor = ordenesProveedor.map(o => {
        if (o.id === id) {
            o.estado = "Finalizado";
        }
        return o;
    });

    localStorage.setItem("ordenesProveedor", JSON.stringify(ordenesProveedor));
    alert("¡Servicio entregado y marcado como completado con éxito!");
    renderSolicitudes();
}

// ===============================
// 💬 MENSAJES SEGÚN ESTADO
// ===============================
function obtenerMensaje(estado) {
    const mensajes = {
        "Pendiente": "<span style='background-color: #fff3cd; color: #856404; padding: 3px 6px; border-radius: 4px; font-weight: bold;'>Pendiente</span>: Solicitud pendiente por asignación de inspector. Puedes retractarte y solicitar reembolso si lo deseas.",
        "En proceso": "<span style='background-color: #cce5ff; color: #004085; padding: 3px 6px; border-radius: 4px; font-weight: bold;'>En proceso</span>: Inspección técnica en curso.",
        "Finalizado": "<span style='background-color: #d4edda; color: #155724; padding: 3px 6px; border-radius: 4px; font-weight: bold;'>Finalizado</span>: Inspección finalizada. Certificado disponible."
    };
    return mensajes[estado] || "Estado desconocido.";
}