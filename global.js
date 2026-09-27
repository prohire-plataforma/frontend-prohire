// ==============================================================
// global.js - Lógica general de mi plataforma (PROHIRE)
// ==============================================================

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('usuarioActivo'));

    // Actualizo los nombres en la barra superior si hay un usuario logueado
    const nameTags = document.querySelectorAll('#nombre-mini, #nombre-mini-empresa');
    if (user && nameTags.length > 0) {
        nameTags.forEach(tag => tag.innerText = user.nombre);
    }
});

// Función para navegar entre las secciones de los paneles sin recargar la página
window.mostrarSeccion = function(seccion) {
    const secciones = ['sec-inicio', 'sec-perfil', 'sec-postulaciones', 'sec-vacantes', 'sec-postulantes', 'sec-publicar'];
    
    secciones.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });

    const target = document.getElementById(`sec-${seccion}`);
    if (target) {
        target.style.display = 'block';
        document.querySelectorAll('.link-menu').forEach(link => link.classList.remove('activo'));
        document.getElementById(`btn-${seccion}`)?.classList.add('activo');
    }

    // Recargas automáticas al navegar por las vistas
    if (seccion === 'postulaciones' && typeof cargarHistorialPostulaciones === 'function') cargarHistorialPostulaciones();
    if (seccion === 'postulantes' && typeof cargarPostulantesParaEmpresa === 'function') cargarPostulantesParaEmpresa();
    if (seccion === 'vacantes' && typeof actualizarMisVacantes === 'function') actualizarMisVacantes();
    if (seccion === 'perfil' && typeof actualizarPerfil === 'function') actualizarPerfil();
};

window.mostrarSeccionEmpresa = window.mostrarSeccion;