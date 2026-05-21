const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Aseguramos que cargue sqlite3
const path = require('path'); // Librería nativa para manejar rutas de carpetas
const app = express();

// Configuración de Permisos y JSON
app.use(cors());
app.use(express.json());

// =========================================================================
// CONEXIÓN CORREGIDA A TU BASE DE DATOS (Entrando a la carpeta 'database')
// =========================================================================
const dbPath = path.join(__dirname, 'database', 'tenis_factory.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado con éxito a la base de datos: tenis_factory.db');
    }
});

// =========================================================================
// TU RUTA DE LOGIN REAL CON CONSULTA A LA BASE DE DATOS
// =========================================================================
app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;

    // Consulta SQL para verificar si el usuario existe en tu base de datos
    const sql = `SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?`;
    
    db.get(sql, [correo, contrasena], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ mensaje: "Error interno del servidor" });
        }
        
        if (row) {
            // Si encuentra la fila, las credenciales son correctas
            res.json({ mensaje: "Usuario encontrado", valido: true, usuario: row });
        } else {
            // Si no encuentra nada, el correo o contraseña están mal
            res.status(401).json({ mensaje: "Credenciales incorrectas", valido: false });
        }
    });
});

// =========================================================================
// RUTA DEL DESPERTADOR (PING)
// =========================================================================
app.get('/ping', (req, res) => {
    res.send('Servidor despierto');
});

// =========================================================================
// CONFIGURACIÓN DEL PUERTO PARA RENDER
// =========================================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo con éxito en el puerto ${PORT}`);
});