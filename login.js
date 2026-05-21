const BACKEND_URL = 'https://servidor-tenis.onrender.com';

// 1. DESPERTADOR AUTOMÁTICO
fetch(`${BACKEND_URL}/ping`)
    .then(() => console.log("Servidor de Render conectado."))
    .catch((err) => console.log("Despertando servidor...", err));

// 2. LOGICA PARA INICIAR SESIÓN
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const correo = document.getElementById('input-correo').value;
    const contrasena = document.getElementById('input-pass').value;

    fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
    })
    .then(res => {
        if (!res.ok) throw new Error('Credenciales incorrectas');
        return res.json();
    })
    .then(data => {
        alert("¡Inicio de sesión correcto!");
        window.location.href = 'inicio.html';
    })
    .catch(err => {
        document.getElementById('mensaje-error').innerText = "Error al conectar con el servidor o datos inválidos.";
    });
});

// 3. LOGICA PARA CREAR USUARIO (FUNCIONANDO A LA PAR)
document.getElementById('form-registro').addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('reg-nombre').value;
    const correo = document.getElementById('reg-correo').value;
    const contrasena = document.getElementById('reg-pass').value;
    const rol = document.getElementById('reg-rol').value;

    fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena, rol })
    })
    .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.mensaje); });
        return res.json();
    })
    .then(data => {
        alert("¡Usuario creado con éxito en la Base de Datos! Ya puede iniciar sesión.");
        document.getElementById('form-registro').reset();
        document.getElementById('mensaje-error-registro').innerText = "";
    })
    .catch(err => {
        document.getElementById('mensaje-error-registro').innerText = err.message || "Error al registrar.";
    });
});