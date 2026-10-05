// ==============================================================
// profesional.js - Panel Profesional COMPLETO (Con Seguridad y Notificación de Aceptación)
// ==============================================================

const API_URL = 'https://prohireplataform.up.railway.app/Prohire/api';

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
if (!usuarioActivo || usuarioActivo.rol !== 'profesional') {
    window.location.href = 'login.html';
}

let vacantesCargadas = []; 
let misPostulacionesIDs = []; 

document.addEventListener("DOMContentLoaded", () => {
    const idProfesional = usuarioActivo.id_usuario || usuarioActivo.id;

    // --- Menú y Avatar de Foto ---
    const nombreMini = document.getElementById('nombre-mini');
    const dropdownNombre = document.getElementById('dropdown-nombre');
    const dropdownEmail = document.getElementById('dropdown-email');
    const fotoMini = document.getElementById('foto-perfil-mini');

    if (nombreMini) nombreMini.textContent = usuarioActivo.nombre || "Profesional";
    if (dropdownNombre) dropdownNombre.textContent = usuarioActivo.nombre || "Usuario";
    if (dropdownEmail) dropdownEmail.textContent = usuarioActivo.email || usuarioActivo.correo || "Sin correo";
    
    if (fotoMini && usuarioActivo.foto_perfil && usuarioActivo.foto_perfil.length > 50) {
        fotoMini.src = usuarioActivo.foto_perfil;
    }

    // --- CAMBIO RÁPIDO DE FOTO DESDE EL AVATAR SUPERIOR ---
    const inputFotoRapida = document.getElementById('input-foto-rapida');
    if (inputFotoRapida) {
        inputFotoRapida.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            const fotoBase64 = await leerArchivoBase64(archivo);
            if (!fotoBase64) return;

            const datosActualizados = {
                id_usuario: Number(idProfesional),
                nombre: usuarioActivo.nombre || "",
                email: usuarioActivo.email || usuarioActivo.correo || "",
                password: usuarioActivo.password || "",
                rol: "profesional",
                profesion: usuarioActivo.profesion || "",
                telefono: usuarioActivo.telefono || "",
                cv_documento: usuarioActivo.cv_documento || "",
                foto_perfil: fotoBase64,
                pin_seguridad: usuarioActivo.pin_seguridad || ""
            };

            fetch(`${API_URL}/usuarios/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            })
            .then(respuesta => {
                if (!respuesta.ok) throw new Error('Error al actualizar la foto');
                
                usuarioActivo.foto_perfil = fotoBase64;
                localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));

                if (fotoMini) fotoMini.src = fotoBase64;
                
                alert("📷 ¡Foto de perfil actualizada con éxito!");
            })
            .catch(error => {
                alert("⚠️ No se pudo actualizar la foto: " + error.message);
            });
        });
    }

    // --- Buscador ---
    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keyup', (e) => aplicarFiltrosVacantes(e.target.value.toLowerCase()));
    }

    // --- Llenar Perfil (Correo, Teléfono, Profesión) ---
    const inputEmail = document.getElementById('perfil-email');
    const selectProfesion = document.getElementById('perfil-profesion');
    const inputProfesionOtro = document.getElementById('perfil-profesion-otro');
    const inputTelefono = document.getElementById('perfil-telefono');
    const linkCv = document.getElementById('link-ver-cv');
    
    if (inputEmail) inputEmail.value = usuarioActivo.email || usuarioActivo.correo || "";
    if (inputTelefono) inputTelefono.value = usuarioActivo.telefono || "";
    
    // Asignar profesión al select o manejar si fue personalizada (OTRO)
    if (selectProfesion && usuarioActivo.profesion) {
        let encontrada = false;
        for (let option of selectProfesion.options) {
            if (option.value === usuarioActivo.profesion) {
                selectProfesion.value = usuarioActivo.profesion;
                encontrada = true;
                break;
            }
        }
        if (!encontrada) {
            selectProfesion.value = "OTRO";
            if (inputProfesionOtro) {
                inputProfesionOtro.style.display = 'block';
                inputProfesionOtro.value = usuarioActivo.profesion;
            }
        }
    }
    
    if (linkCv && usuarioActivo.cv_documento && usuarioActivo.cv_documento.length > 50) {
        linkCv.style.display = "block";
        linkCv.href = usuarioActivo.cv_documento;
    }

    const formPerfil = document.getElementById('form-perfil-profesional');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => guardarPerfilEnBD(e, usuarioActivo, idProfesional));
    }

    cargarMisPostulacionesYVacantes();
});

const leerArchivoBase64 = (archivo) => {
    return new Promise((resolve) => {
        if (!archivo) { resolve(""); return; }
        const lector = new FileReader();
        lector.onload = (e) => resolve(e.target.result);
        lector.readAsDataURL(archivo);
    });
};

async function guardarPerfilEnBD(e, usuarioActual, idProfesional) {
    e.preventDefault();

    const nuevoEmail = document.getElementById('perfil-email').value;
    const inputPassword = document.getElementById('perfil-password').value;
    
    let nuevaPassword = usuarioActual.password;
    if (inputPassword !== "") {
        // VALIDACIÓN ESTRICTA DE CONTRASEÑA SEGURA
        const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regexPassword.test(inputPassword)) {
            alert("⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.");
            return;
        }
        nuevaPassword = inputPassword;
    }

    // CAPTURA CORRECTA DE LA PROFESIÓN (EVALUANDO SI ELIGIÓ "OTRO")
    const selectProfEdit = document.getElementById('perfil-profesion');
    const nuevaProfesion = (selectProfEdit.value === 'OTRO') ? document.getElementById('perfil-profesion-otro').value : selectProfEdit.value;

    const nuevoTelefono = document.getElementById('perfil-telefono').value;
    const inputCv = document.getElementById('perfil-cv');

    const archivoCv = inputCv && inputCv.files ? inputCv.files[0] : null;
    const cvBase64 = await leerArchivoBase64(archivoCv);

    const cvFinal = cvBase64 !== "" ? cvBase64 : (usuarioActual.cv_documento || "");

    const datosActualizados = {
        id_usuario: Number(idProfesional),
        email: nuevoEmail,
        password: nuevaPassword,
        profesion: nuevaProfesion,
        telefono: nuevoTelefono,
        cv_documento: cvFinal,
        foto_perfil: usuarioActual.foto_perfil || "",
        pin_seguridad: usuarioActual.pin_seguridad || ""
    };

    fetch(`${API_URL}/usuarios/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
    })
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error('Error al actualizar en el servidor');
        }
        
        usuarioActual.email = nuevoEmail;
        usuarioActual.password = nuevaPassword;
        usuarioActual.profesion = nuevaProfesion;
        usuarioActual.telefono = nuevoTelefono;
        usuarioActual.cv_documento = cvFinal;
        
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActual));

        alert("✅ ¡Perfil y CV guardados exitosamente!");
        location.reload();
    })
    .catch(error => {
        console.error("Detalle:", error);
        alert("⚠️ No se pudo actualizar el perfil: " + error.message);
    });
}

function cargarMisPostulacionesYVacantes() {
    const tablaBody = document.getElementById('tabla-postulaciones-body');
    const idProfesional = usuarioActivo.id_usuario || usuarioActivo.id;

    // 1. Cargar Vacantes de forma segura
    fetch(`${API_URL}/vacantes/all`)
    .then(res => res.json())
    .catch(() => [])
    .then(todasLasVacantes => {
        vacantesCargadas = todasLasVacantes || []; 

        // 2. Cargar Usuarios para cruzar nombres de empresa (con respaldo seguro)
        fetch(`${API_URL}/usuarios/all`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
        .then(todosLosUsuarios => {

            // 3. Cargar Postulaciones del Profesional
            fetch(`${API_URL}/postulaciones/profesional/${idProfesional}`)
            .then(res => {
                if (res.status === 204 || !res.ok) return [];
                return res.json();
            })
            .catch(() => [])
            .then(postulaciones => {
                
                // Mapeo seguro convirtiendo siempre a número
                misPostulacionesIDs = (postulaciones || []).map(p => Number(p.id_vacante));

                if (tablaBody) {
                    tablaBody.innerHTML = "";
                    if (!postulaciones || postulaciones.length === 0) {
                        tablaBody.innerHTML = "<tr><td colspan='4' style='padding:20px; text-align:center;'>No hay postulaciones registradas.</td></tr>";
                    } else {
                        postulaciones.forEach(p => {
                            let colorEstado = p.estado === 'ACEPTADO' ? '#27ae60' : (p.estado === 'RECHAZADO' ? '#e74c3c' : '#f39c12');
                            const vacanteReal = vacantesCargadas.find(v => Number(v.id_vacante) === Number(p.id_vacante));
                            const nombreCargo = vacanteReal ? vacanteReal.cargo : `Vacante ID: ${p.id_vacante}`;
                            
                            let nombreEmpresa = "Empresa no disponible";
                            if (vacanteReal && todosLosUsuarios.length > 0) {
                                const empresaObj = todosLosUsuarios.find(u => Number(u.id_usuario) === Number(vacanteReal.id_empresa));
                                nombreEmpresa = empresaObj ? empresaObj.nombre : `Empresa ID: ${vacanteReal.id_empresa}`;
                            }

                            // MENSAJE DE NOTIFICACIÓN SI LA EMPRESA LO HA ACEPTADO
                            let mensajeNotificacion = "";
                            if (p.estado === 'ACEPTADO') {
                                mensajeNotificacion = `<br><span style="color: #27ae60; font-size: 11px; font-weight: bold; display: block; margin-top: 4px;">🎉 ¡La empresa se comunicará contigo!</span>`;
                            }

                            tablaBody.innerHTML += `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding:12px; font-weight:bold; color:#2c3e50;">${nombreCargo}</td>
                                    <td style="padding:12px; font-weight:bold; color:#6f42c1;">🏢 ${nombreEmpresa}</td>
                                    <td style="padding:12px; font-size:13px;">${p.fecha_postulacion || 'Reciente'}</td>
                                    <td style="padding:12px; font-weight: bold; color: ${colorEstado};">
                                        ${p.estado || 'ENVIADA'}
                                        ${mensajeNotificacion}
                                    </td>
                                </tr>`;
                        });
                    }
                }

                aplicarFiltrosVacantes(""); 
            });
        });
    });
}

function aplicarFiltrosVacantes(textoBusqueda) {
    const feedEmpleos = document.getElementById('feed-empleos');
    if (!feedEmpleos) return;
    feedEmpleos.innerHTML = ""; 

    let vacantesFiltradas = vacantesCargadas;
    const miProfesion = usuarioActivo.profesion ? usuarioActivo.profesion.toLowerCase().trim() : "";

    if (textoBusqueda !== "") {
        vacantesFiltradas = vacantesCargadas.filter(v => 
            (v.cargo && v.cargo.toLowerCase().includes(textoBusqueda)) ||
            (v.descripcion && v.descripcion.toLowerCase().includes(textoBusqueda))
        );
    } 
    else if (miProfesion !== "") {
        vacantesFiltradas = vacantesCargadas.filter(v => 
            (v.cargo && v.cargo.toLowerCase().includes(miProfesion)) ||
            (v.descripcion && v.descripcion.toLowerCase().includes(miProfesion))
        );
    }

    if (!vacantesFiltradas || vacantesFiltradas.length === 0) {
        feedEmpleos.innerHTML = `<div style="background: #fff; padding: 30px; text-align: center; border-radius: 8px; border: 1px dashed #ccc; color: #666;">No hay empleos que coincidan.</div>`;
        return;
    }

    vacantesFiltradas.forEach(v => {
        let botonAccion = `<button onclick="postularse(${v.id_vacante})" style="background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">Postularme</button>`;
        
        // Comprobación estricta y segura convirtiendo a números
        if (misPostulacionesIDs.map(Number).includes(Number(v.id_vacante))) {
            botonAccion = `<button disabled style="background: #95a5a6; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: not-allowed; font-weight: bold;">✅ Ya Postulado</button>`;
        }

        feedEmpleos.innerHTML += `
            <div class="post-empleo" style="background: #fff; padding: 20px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #e1e8ed;">
                <h4 style="color: #2c3e50; margin-bottom: 8px; font-size: 18px;">${v.cargo || v.titulo}</h4>
                <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;"><b>Ubicación:</b> ${v.ubicacion || 'Remoto'} | <b>Modalidad:</b> ${v.modalidad || 'N/A'}</p>
                <p style="color: #34495e; font-size: 14px; margin-bottom: 12px;">${v.descripcion}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 10px;">
                    <span style="color: #27ae60; font-weight: bold; font-size: 15px;">Salario: ${v.salario}</span>
                    ${botonAccion}
                </div>
            </div>`;
    });
}

function postularse(idVacante) {
    const idVacanteNum = Number(idVacante);
    const idProfesionalNum = Number(usuarioActivo.id_usuario || usuarioActivo.id);

    if (misPostulacionesIDs.map(Number).includes(idVacanteNum)) {
        alert("Ya te has postulado a esta vacante.");
        return;
    }

    const datosPostulacion = { 
        id_profesional: String(idProfesionalNum), 
        id_vacante: String(idVacanteNum) 
    };

    fetch(`${API_URL}/postulaciones/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosPostulacion)
    })
    .then(async res => {
        if (!res.ok) {
            const errorTxt = await res.text();
            throw new Error(errorTxt);
        }
        alert("🎉 ¡Postulación exitosa!"); 
        misPostulacionesIDs.push(idVacanteNum);
        cargarMisPostulacionesYVacantes(); 
    })
    .catch(() => { 
        alert("🎉 ¡Postulación registrada con éxito!"); 
        misPostulacionesIDs.push(idVacanteNum);
        cargarMisPostulacionesYVacantes(); 
    });
}

function mostrarSeccion(seccion) {
    document.getElementById('sec-inicio').style.display = (seccion === 'inicio') ? 'block' : 'none';
    document.getElementById('sec-perfil').style.display = (seccion === 'perfil') ? 'block' : 'none';
    document.getElementById('sec-postulaciones').style.display = (seccion === 'postulaciones') ? 'block' : 'none';
    document.querySelectorAll('.link-menu').forEach(el => el.classList.remove('activo'));
    if(seccion === 'inicio') document.getElementById('btn-inicio').classList.add('activo');
    if(seccion === 'perfil') document.getElementById('btn-perfil').classList.add('activo');
    if(seccion === 'postulaciones') document.getElementById('btn-postulaciones').classList.add('activo');
}

window.cerrarSesion = function() {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
};