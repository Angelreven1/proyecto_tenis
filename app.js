const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const dbPath = path.join(__dirname, 'database', 'tenis_factory.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error al abrir la BD:', err.message);
    else console.log('Conectado a la base de datos en database/');
});

// Ruta de Login
app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = `SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?`;
    
    db.get(sql, [correo, contrasena], (err, row) => {
        if (err) return res.status(500).json({ mensaje: "Error interno" });
        if (row) res.json({ mensaje: "Valido", usuario: row });
        else res.status(401).json({ mensaje: "Invalido" });
    });
});

// Ruta de Registro (Soporta nombre, correo, contrasena y rol)
app.post('/register', (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    const sql = `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)`;

    db.run(sql, [nombre, correo, contrasena, rol], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ mensaje: "El correo ya existe" });
            }
            return res.status(500).json({ mensaje: "Error al insertar" });
        }
        res.status(201).json({ mensaje: "Creado", id: this.lastID });
    });
});

app.get('/ping', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Puerto: ${PORT}`));