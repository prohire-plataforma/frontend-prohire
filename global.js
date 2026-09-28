// ==============================================================
// global.js - Lógica general de la plataforma PROHIRE
// ==============================================================

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('usuarioActivo'));

    const nameTags = document.querySelectorAll('#nombre-mini, #nombre-mini-empresa');
    if (user && nameTags.length > 0) {
        nameTags.forEach(tag => tag.innerText = user.nombre);
    }
});

// Navegación unificada entre secciones para ambos paneles
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

    // Sincronización exacta con las funciones de carga
    if (seccion === 'postulaciones' && typeof cargarMisPostulacionesYVacantes === 'function') {
        cargarMisPostulacionesYVacantes();
    }
    if (seccion === 'postulantes' && typeof cargarPostulantesParaEmpresa === 'function') {
        cargarPostulantesParaEmpresa();
    }
    if (seccion === 'vacantes' && typeof actualizarMisVacantes === 'function') {
        actualizarMisVacantes();
    }
};

window.mostrarSeccionEmpresa = window.mostrarSeccion;