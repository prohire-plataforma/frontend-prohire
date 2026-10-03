# PROHIRE - MVP de Registro y Contratación de Profesionales

##  Descripción del Proyecto
Aquí presento **PROHIRE**, una plataforma web (Producto Mínimo Viable) que armé para conectar empresas con profesionales. La idea fue dejar una interfaz moderna y limpia, y cuadrar toda la lógica de fondo usando JavaScript puro, simulando la base de datos con el `localStorage` del navegador para no enredarnos con servidores externos en esta fase.

Este proyecto es para la evidencia **GA6-220501096-AA4-EV01**.

##  Tecnologías que utilicé
Todo se montó a punta de tecnologías nativas:
* **HTML5:** Para darle estructura y orden a todas las vistas.
* **CSS3:** Para la maquetación (diseño en tarjetas) y que todo se viera bien presentado.
* **Vanilla JavaScript:** Para darle vida a la página, manejar el DOM y los datos.
* **LocalStorage:** Para guardar la información (usuarios, ofertas y postulaciones) directo en el navegador.

## | Arquitectura y Pantallas
Para que la navegación no fuera un dolor de cabeza, dividí la plataforma en estas vistas:

### 1. Pantalla de Bienvenida (`index.html`)
Es la cara del proyecto. Dejé el logo y dos botones claritos: "Iniciar Sesión" y "Registrarse", para que la gente sepa de una a dónde ir.

### 2. Registro y Rol (`seleccion.html`)
Monté un sistema de tarjetas visuales para que el usuario escoja si es Empresa o Profesional. Dependiendo de lo que elija, el sistema le bota el formulario que es, pidiendo solo los datos estrictamente necesarios.

### 3. Inicio de Sesión (`login.html`)
Un formulario sencillo y al grano. Le puse validaciones nativas (`required`) para que no dejen campos vacíos, y le dejé sus enlaces para recuperar la clave o crear cuenta nueva.

### 4. Recuperación de Acceso (`olvido-pass.html`)
En vez de mostrar la contraseña vieja (que es cero seguro), le metí un sistema que genera una clave temporal aleatoria (tipo `Prohire-8492`), borra la anterior y se la muestra al usuario ahí mismo en pantalla para que vuelva a entrar.

### 5. Panel de la Empresa (`panel-empresa.html`)
Un tablero de control dividido en tres cosas clave:
* **Publicar Vacante:** El formulario para subir la oferta laboral.
* **Mis Vacantes:** Para ver lo publicado. Le agregué un botón para eliminar, que además hace limpieza y borra a los candidatos de esa oferta para no saturar la vista.
* **Ver Candidatos:** Una tabla donde la empresa revisa perfiles y le da "Aceptar" o "Rechazar" a la gente con un solo clic.

### 6. Panel del Profesional (`panel-profesional.html`)
Es el espacio del candidato, y lo cuadré en tres módulos:
* **Mi Perfil:** Para que actualicen sus datos y suban la hoja de vida.
* **Muro de Empleos:** Donde salen las ofertas publicadas y se aplica directamente.
* **Historial de Postulaciones:** Para hacerle seguimiento al proceso. Le dejé una validación clave: si la empresa borra la oferta, al candidato le sale automáticamente un aviso gris que dice "OFERTA ELIMINADA".

##  Cómo probar el proyecto
Para correr esto y revisar la evidencia, los pasos son breves:
1. Descomprimir el archivo ZIP.
2. Abrir el `index.html` en Chrome, Edge o Firefox (no hay que instalar servidores raros).
3. **Botón de reinicio:** Abajo a la derecha dejé un botón rojo de emergencia. Si le das clic, la función `limpiarBaseDeDatos()` borra todo el historial y deja la plataforma en blanco para poder empezar las pruebas desde cero.