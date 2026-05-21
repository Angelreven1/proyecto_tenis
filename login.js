// =========================================================================
// CONFIGURACIÓN DEL FRONTEND - CONEXIÓN CON RENDER
// =========================================================================

// Tu URL oficial del backend en la nube
const BACKEND_URL = 'https://servidor-tenis.onrender.com';

// 1. DESPERTADOR AUTOMÁTICO
// Manda una señal rápida para encender el servidor de Render en cuanto entran a GitHub Pages
fetch(`${BACKEND_URL}/ping`)
    .then(() => console.log("El servidor de Render ha respondido (Despierto)."))
    .catch((err) => console.log("Despertando al servidor en segundo plano...", err));

// 2. ESCUCHA DEL FORMULARIO DE INICIO DE SESIÓN
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue sola

    // Captura los valores escritos por el usuario en los inputs
    const correo = document.getElementById('input-correo').value;
    const contrasena = document.getElementById('input-pass').value;

    // Petición POST directa a tu base de datos en Render
    fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Credenciales incorrectas o error en el servidor');
        }
        return res.json();
    })
    .then(data => {
        // Si el servidor confirma que el usuario existe en tenis_factory.db
        alert("¡Inicio de sesión correcto!");
        window.location.href = 'inicio.html'; // Redirección a tu pantalla principal
    })
    .catch(err => {
        // Si las credenciales no existen o el servidor no responde, pinta el error en el HTML
        const errorMensaje = document.getElementById('mensaje-error');
        if (errorMensaje) {
            errorMensaje.innerText = "Error al conectar con el servidor o datos inválidos.";
        }
        console.error("Fallo en la comunicación con el Backend:", err);
    });
});