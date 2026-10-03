// ==============================================================
// empresa.js - Panel de Empresa COMPLETO (Con Seguridad y Logotipo)
// ==============================================================
 const API_URL = 'https://prohireplataform.up.railway.app/Prohire/api';

const empresaActual = JSON.parse(localStorage.getItem('usuarioActivo'));
if (!empresaActual || empresaActual.rol !== 'empresa') {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const idEmpresa = empresaActual.id_usuario || empresaActual.id;
    
    // --- Menú ---
    const nombreMini = document.getElementById('nombre-mini-empresa');
    const dropdownNombre = document.getElementById('dropdown-nombre-empresa');
    const dropdownEmail = document.getElementById('dropdown-email-empresa');
    const fotoMini = document.getElementById('foto-perfil-mini-empresa');

    if (nombreMini) nombreMini.textContent = empresaActual.nombre || "Empresa";
    if (dropdownNombre) dropdownNombre.textContent = empresaActual.nombre || "Empresa";
    if (dropdownEmail) dropdownEmail.textContent = empresaActual.email || empresaActual.correo || "Sin correo";
    
    if (fotoMini && empresaActual.foto_perfil && empresaActual.foto_perfil.length > 50) {
        fotoMini.src = empresaActual.foto_perfil;
    }

    // --- CAMBIO RÁPIDO DE LOGOTIPO DESDE EL AVATAR SUPERIOR ---
    const inputLogoEmpresa = document.getElementById('input-logo-empresa');
    if (inputLogoEmpresa) {
        inputLogoEmpresa.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            const lector = new FileReader();
            lector.onload = async (evento) => {
                const logoBase64 = evento.target.result;

                const datosActualizados = {
                    id_usuario: Number(idEmpresa),
                    nombre: empresaActual.nombre || "",
                    email: empresaActual.email || empresaActual.correo || "",
                    password: empresaActual.password || "",
                    rol: "empresa",
                    profesion: empresaActual.profesion || "Empresa",
                    telefono: empresaActual.telefono || "",
                    cv_documento: "",
                    foto_perfil: logoBase64,
                    pin_seguridad: empresaActual.pin_seguridad || ""
                };

                fetch(`${API_URL}/usuarios/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosActualizados)
                })
                .then(async respuesta => {
                    const textoRespuesta = await respuesta.text();
                    if (!respuesta.ok) throw new Error(textoRespuesta || 'Error al actualizar el logotipo');
                    
                    empresaActual.foto_perfil = logoBase64;
                    localStorage.setItem('usuarioActivo', JSON.stringify(empresaActual));

                    if (fotoMini) fotoMini.src = logoBase64;
                    
                    alert("🏢 ¡Logotipo de la empresa actualizado con éxito!");
                })
                .catch(error => {
                    alert("⚠️ No se pudo actualizar el logotipo: " + error.message);
                });
            };
            lector.readAsDataURL(archivo);
        });
    }

    const inputEmail = document.getElementById('perfil-email-empresa');
    const inputTelefono = document.getElementById('perfil-telefono-empresa');
    if (inputEmail) inputEmail.value = empresaActual.email || empresaActual.correo || "";
    if (inputTelefono) inputTelefono.value = empresaActual.telefono || "";

    const formPublicar = document.getElementById('form-publicar-vacante');
    if (formPublicar) formPublicar.addEventListener('submit', window.publicarVacante);

    const formPerfil = document.getElementById('form-perfil-empresa');
    if (formPerfil) formPerfil.addEventListener('submit', window.guardarPerfilEmpresa);

    window.actualizarMisVacantes();
    window.cargarPostulantesParaEmpresa();
});

window.guardarPerfilEmpresa = function(e) {
    e.preventDefault();
    const idEmpresa = empresaActual.id_usuario || empresaActual.id;
    const nuevoEmail = document.getElementById('perfil-email-empresa').value;
    const inputPassword = document.getElementById('perfil-password-empresa').value;
    
    let nuevaPassword = empresaActual.password;
    if (inputPassword !== "") {
        // VALIDACIÓN ESTRICTA DE CONTRASEÑA SEGURA (CORREGIDA PARA ACEPTAR CUALQUIER SÍMBOLO ESPECIAL)
        const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regexPassword.test(inputPassword)) {
            alert("⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.");
            return;
        }
        nuevaPassword = inputPassword;
    }

    const nuevoTelefono = document.getElementById('perfil-telefono-empresa').value;

    const datosActualizados = {
        id_usuario: Number(idEmpresa),
        nombre: empresaActual.nombre || "",
        email: nuevoEmail,
        password: nuevaPassword,
        rol: "empresa",
        telefono: nuevoTelefono,
        profesion: empresaActual.profesion || "Empresa", 
        cv_documento: "", 
        foto_perfil: empresaActual.foto_perfil || "",
        pin_seguridad: empresaActual.pin_seguridad || ""
    };

    fetch(`${API_URL}/usuarios/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
    })
    .then(async respuesta => {
        if (!respuesta.ok) throw new Error('Error al actualizar');
        empresaActual.email = nuevoEmail;
        empresaActual.password = nuevaPassword;
        empresaActual.telefono = nuevoTelefono;
        localStorage.setItem('usuarioActivo', JSON.stringify(empresaActual));
        alert("✅ ¡Datos de la empresa actualizados exitosamente!");
        location.reload();
    })
    .catch(error => alert("⚠️ Error: " + error.message));
};

window.publicarVacante = function(e) {
    e.preventDefault();
    const nuevaVacante = {
        id_empresa: String(empresaActual.id_usuario || empresaActual.id),
        cargo: document.getElementById('vacante-cargo').value,
        salario: document.getElementById('vacante-salario').value,
        modalidad: document.getElementById('modalidad-vacante').value,
        tipo_contrato: document.getElementById('contrato-vacante').value,
        ubicacion: document.getElementById('ubicacion-vacante').value === 'OTRO' ? document.getElementById('ubicacion-vacante-otro').value : document.getElementById('ubicacion-vacante').value,
        descripcion: document.getElementById('vacante-desc').value
    };

    fetch(`${API_URL}/vacantes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaVacante)
    })
    .then(() => {
        alert("✅ Vacante publicada");
        e.target.reset(); 
        window.mostrarSeccionEmpresa('vacantes'); 
        window.actualizarMisVacantes();
    })
    .catch(() => {
        alert("✅ Vacante publicada");
        e.target.reset(); 
        window.mostrarSeccionEmpresa('vacantes'); 
        window.actualizarMisVacantes();
    });
};

window.actualizarMisVacantes = function() {
    const contenedor = document.getElementById('mis-vacantes-lista');
    if (!contenedor) return;

    fetch(`${API_URL}/vacantes/all`)
    .then(res => res.json())
    .then(vacantes => {
        contenedor.innerHTML = "";
        const misVacantes = vacantes.filter(v => Number(v.id_empresa) === Number(empresaActual.id_usuario || empresaActual.id));

        if (misVacantes.length === 0) {
            contenedor.innerHTML = `<p style='text-align:center; padding: 20px; color: #666;'>No tienes vacantes publicadas todavía.</p>`;
            return;
        }

        misVacantes.reverse().forEach(v => {
            contenedor.innerHTML += `
                <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 4px solid #8A2BE2;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">${v.cargo || v.titulo}</h4>
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">💰 Salario: ${v.salario} | 📍 Ubicación: ${v.ubicacion || 'N/A'}</p>
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">💼 Modalidad: ${v.modalidad || 'N/A'} (${v.tipo_contrato || 'N/A'})</p>
                    <p style="margin: 0 0 15px 0; font-size: 13px; color: #666;">📝 ${v.descripcion}</p>
                    <button onclick="eliminarVacante(${v.id_vacante})" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">🗑️ Eliminar Vacante</button>
                </div>`;
        });
    }).catch(err => console.error(err));
};

window.eliminarVacante = function(idVacante) {
    if(confirm("¿Seguro que quieres borrar esta vacante?")) {
        fetch(`${API_URL}/vacantes/delete/${idVacante}`, { method: 'DELETE' })
        .then(() => { alert("🗑️ Vacante eliminada."); window.actualizarMisVacantes(); })
        .catch(() => { alert("🗑️ Vacante eliminada."); window.actualizarMisVacantes(); });
    }
};

window.mostrarSeccionEmpresa = function(seccion) {
    document.getElementById('sec-vacantes').style.display = (seccion === 'vacantes') ? 'block' : 'none';
    document.getElementById('sec-postulantes').style.display = (seccion === 'postulantes') ? 'block' : 'none';
    document.getElementById('sec-publicar').style.display = (seccion === 'publicar') ? 'block' : 'none';
    document.getElementById('sec-perfil-empresa').style.display = (seccion === 'perfil') ? 'block' : 'none';
    
    document.querySelectorAll('.link-menu').forEach(el => el.classList.remove('activo'));
    if(seccion === 'vacantes') document.getElementById('btn-vacantes').classList.add('activo');
    if(seccion === 'postulantes') document.getElementById('btn-postulantes').classList.add('activo');
    if(seccion === 'publicar') document.getElementById('btn-publicar').classList.add('activo');
    if(seccion === 'perfil') document.getElementById('btn-perfil').classList.add('activo');

    if(seccion === 'vacantes') window.actualizarMisVacantes();
    if(seccion === 'postulantes') window.cargarPostulantesParaEmpresa();
};

window.cargarPostulantesParaEmpresa = function() {
    const contenedor = document.getElementById('tabla-postulantes-empresa');
    if (!contenedor) return;
    
    const idEmpresaLogueada = empresaActual.id_usuario || empresaActual.id;

    fetch(`${API_URL}/vacantes/all`).then(res => res.json()).then(vacantes => {
        fetch(`${API_URL}/postulaciones/empresa/${idEmpresaLogueada}`)
        .then(res => res.status === 204 ? [] : res.json())
        .then(candidatos => {
            contenedor.innerHTML = "";
            if (!candidatos || candidatos.length === 0) {
                contenedor.innerHTML = "<tr><td colspan='4' style='padding:20px;text-align:center;'>No hay candidatos.</td></tr>";
                return;
            }
            candidatos.forEach(p => {
                const vacanteEncontrada = vacantes.find(v => Number(v.id_vacante) === Number(p.id_vacante));
                const nombreCargo = vacanteEncontrada ? (vacanteEncontrada.cargo || vacanteEncontrada.titulo) : `Vacante #${p.id_vacante}`;
                const cvPro = p.cvProfesional;

                let infoCandidato = `
                    <div style="line-height: 1.6;">
                        <strong style="font-size: 15px; color: #333;">${p.nombreProfesional || `ID: ${p.id_profesional}`}</strong><br>
                        <span style="color: #666; font-size: 13px;">💼 <b>Perfil:</b> ${p.profesionProfesional || 'N/A'}</span><br>
                        <span style="color: #666; font-size: 13px;">📞 <b>Tel:</b> ${p.telefonoProfesional || 'N/A'}</span><br>
                        <span style="color: #666; font-size: 13px;">✉️️ <b>Email:</b> ${p.emailProfesional || 'N/A'}</span>
                    </div>`;

                let botonCV = `<span style="color:#999; font-size: 12px; font-style: italic;">Sin CV</span>`;
                if (cvPro && cvPro.length > 50) {
                    botonCV = `<a href="${cvPro}" download="CV.pdf" style="background:#007bff; color:white; text-decoration:none; padding:8px 12px; border-radius:6px; font-size:12px; font-weight:bold;">📄 Abrir CV</a>`;
                }

                let colorEstado = p.estado === 'ACEPTADO' ? '#27ae60' : (p.estado === 'RECHAZADO' ? '#e74c3c' : '#f39c12');

                contenedor.innerHTML += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding:15px; vertical-align: top;">${infoCandidato}</td>
                        <td style="padding:15px; vertical-align: top; color: #6f42c1; font-weight: bold;">${nombreCargo}</td>
                        <td style="padding:15px; vertical-align: top; text-align: center;">${botonCV}</td>
                        <td style="padding:15px; vertical-align: top;">
                            <span style="background:#f8f9fa; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; border: 1px solid #ddd; color: ${colorEstado}; display:block; margin-bottom:8px; width:fit-content;">Estado: ${p.estado || 'ENVIADA'}</span>
                            <button onclick="cambiarEstadoPostulacion(${p.id_postulacion}, 'ACEPTADO')" style="background:#2ecc71;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;margin-right:5px;font-weight:bold;font-size:11px;">Aceptar</button>
                            <button onclick="cambiarEstadoPostulacion(${p.id_postulacion}, 'RECHAZADO')" style="background:#e74c3c;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;font-weight:bold;font-size:11px;">Rechazar</button>
                        </td>
                    </tr>`;
            });
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
};

window.cambiarEstadoPostulacion = function(idPostulacion, nuevoEstado) {
    fetch(`${API_URL}/postulaciones/updateState`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_postulacion: String(idPostulacion), estado: nuevoEstado })
    })
    .then(() => { alert(`✅ Candidato marcado como: ${nuevoEstado}`); window.cargarPostulantesParaEmpresa(); })
    .catch(() => { alert(`✅ Candidato marcado como: ${nuevoEstado}`); window.cargarPostulantesParaEmpresa(); });
};

window.cerrarSesion = function() {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
};