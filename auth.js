// ==============================================================
// auth.js - Autenticación, Registro (Seguro) y Recuperación
// ==============================================================

const API_URL = 'https://prohireplataform.up.railway.app/Prohire/api';

document.addEventListener('submit', (e) => {
    const form = e.target;

    // ==========================================
    // 1. VALIDACIÓN DE CREDENCIALES (LOGIN)
    // ==========================================
    if (form.id === 'form-login') {
        e.preventDefault();
        const correo = document.getElementById('correo-login').value;
        const pass = document.getElementById('pass-login').value;
        
        const datosLogin = {
            email: correo,
            password: pass
        };

        fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosLogin)
        })
        .then(respuesta => {
            if (!respuesta.ok) throw new Error('Credenciales inválidas');
            return respuesta.json(); 
        })
        .then(usuarioActivo => {
            localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));
            window.location.href = usuarioActivo.rol === 'empresa' ? "panel-empresa.html" : "panel-profesional.html";
        })
        .catch(error => {
            console.error("Error en login:", error);
            alert("⚠️ Datos incorrectos. Verifica tu correo o contraseña.");
        });
    }

   // ==========================================
   // 2. REGISTRO (CON VALIDACIÓN DE CONTRASEÑA Y CAPTURA DE "OTRO")
   // ==========================================
   if (form.id === 'form-registro-profesional' || form.id === 'form-registro-empresa') {
        e.preventDefault();
        
        try {
            const esEmpresa = (form.id === 'form-registro-empresa');
            const rol = esEmpresa ? 'empresa' : 'profesional';
            
            const nombre = esEmpresa ? document.getElementById('nombre-empresa').value : document.getElementById('nombre-prof').value;
            const email = esEmpresa ? document.getElementById('correo-empresa').value : document.getElementById('correo-prof').value;
            const password = esEmpresa ? document.getElementById('pass-empresa').value : document.getElementById('pass-prof').value;
            
            // VALIDACIÓN DE CONTRASEÑA SEGURA
            const regexPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!regexPassword.test(password)) {
                alert("⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.");
                return;
            }

            const telefono = esEmpresa ? document.getElementById('telefono-empresa').value : document.getElementById('telefono-prof').value;
            
            // CAPTURA CORRECTA DE PROFESIÓN / INDUSTRIA (EVALUANDO SI SE ELIGIÓ "OTRO")
            let profesion = "";
            if (esEmpresa) {
                const selectInd = document.getElementById('industria-empresa');
                if (selectInd) {
                    profesion = (selectInd.value === 'OTRO') ? document.getElementById('industria-empresa-otro').value : selectInd.value;
                } else {
                    profesion = "Empresa";
                }
            } else {
                const selectProf = document.getElementById('profesion-prof');
                if (selectProf) {
                    profesion = (selectProf.value === 'OTRO') ? document.getElementById('profesion-prof-otro').value : selectProf.value;
                }
            }
            
            const cajaPin = esEmpresa ? document.getElementById('pin-empresa') : document.getElementById('pin-prof');
            
            if (!cajaPin) {
                alert("⚠️ ¡ALTO! Tu navegador cargó la página vieja que no tiene el PIN. Presiona Ctrl + F5 para actualizarla.");
                return; 
            }

            const pin = cajaPin.value;

            // Objeto completo sincronizado con el DAO de Java y la BD en Railway
            const nuevoUsuario = {
                nombre: nombre,
                email: email,
                password: password,
                rol: rol,
                profesion: profesion, 
                telefono: telefono,
                ruta_cv: "",          // Sincronizado con la BD
                cv_documento: "",     // Sincronizado con la BD
                pin_seguridad: pin,
                foto_perfil: ""       // Sincronizado con la BD
            };

            fetch(`${API_URL}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            })
            .then(async respuesta => {
                if (!respuesta.ok) {
                    const errorData = await respuesta.json().catch(() => ({ error: 'Error desconocido en el servidor' }));
                    throw new Error(errorData.error || 'Error al registrar usuario');
                }
                alert("✅ Registro exitoso. Ya puedes iniciar sesión.");
                window.location.href = "login.html";
            })
            .catch(error => {
                console.error("Error en registro:", error);
                alert("⚠️ Detalle del error: " + error.message);
            });

        } catch (err) {
            alert("⚠️ Ocurrió un error leyendo el formulario.");
            console.error(err);
        }
    }

    // ==========================================
    // 3. RECUPERACIÓN DE CONTRASEÑA (VALIDANDO PIN)
    // ==========================================
    if (form.id === 'form-recuperar') {
        e.preventDefault();
        const correo = document.getElementById('correo-recuperar').value;
        const pinIngresado = document.getElementById('pin-recuperar').value;
        const mensaje = document.getElementById('mensaje-recuperacion');
        
        fetch(`${API_URL}/usuarios/all`)
        .then(res => res.ok ? res.json() : fetch(`${API_URL}/usuarios`).then(r => r.json()))
        .then(usuarios => {
            const usuarioValido = usuarios.find(u => u.email === correo && String(u.pin_seguridad) === String(pinIngresado));

            if (usuarioValido) {
                const passTemporal = Math.floor(100000 + Math.random() * 900000).toString(); 

                const datosActualizados = {
                    id_usuario: usuarioValido.id_usuario,
                    nombre: usuarioValido.nombre || "",         // <--- Añadido para evitar error 400
                    email: usuarioValido.email,
                    password: passTemporal,
                    rol: usuarioValido.rol || "profesional",    // <--- Añadido para evitar error 400
                    profesion: usuarioValido.profesion || "",
                    telefono: usuarioValido.telefono || "",
                    cv_documento: usuarioValido.cv_documento || "",
                    foto_perfil: usuarioValido.foto_perfil || "",
                    pin_seguridad: usuarioValido.pin_seguridad
                };

                fetch(`${API_URL}/usuarios/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosActualizados)
                })
                .then(res => {
                    if(!res.ok) throw new Error("Error guardando nueva clave");
                    mensaje.style.display = 'block';
                    mensaje.innerHTML = `
                        <div style="background: #e8f8f5; padding: 15px; border-radius: 8px; border: 1px solid #2ecc71; margin-top: 15px; text-align: left;">
                            <span style="color: #2ecc71; font-weight: bold;">✅ Identidad Verificada</span><br>
                            <span style="font-size: 13px; color: #333; display: block; margin-top: 5px;">
                                Hemos reseteado tu acceso. Tu nueva contraseña temporal es:<br><br>
                                <center><b style="font-size: 18px; color: #e74c3c; letter-spacing: 1px; background: #fff; padding: 5px 10px; border-radius: 4px; border: 1px dashed #e74c3c;">${passTemporal}</b></center><br>
                                Cópiala, inicia sesión y cámbiala por una segura desde "Mi Perfil".
                            </span>
                        </div>`;
                })
                .catch(err => alert("⚠️ Error conectando con el servidor."));

            } else {
                mensaje.style.display = 'block';
                mensaje.innerHTML = `
                    <div style="background: #fdedec; padding: 10px; border-radius: 8px; border: 1px solid #e74c3c; margin-top: 15px; color: #c0392b; font-size: 13px;">
                        ⚠️ Credenciales inválidas. El correo no existe o el PIN es incorrecto.
                    </div>`;
            }
        })
        .catch(error => {
            alert("⚠️ No se pudo conectar a la base de datos.");
        });
    }
});