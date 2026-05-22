const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'database', 'tenis_factory.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la BD:', err.message);
    } else {
        console.log('Conectado a la base de datos en database/tenis_factory.db');
        inicializarBaseDeDatos();
    }
});

function inicializarBaseDeDatos() {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const seedsPath = path.join(__dirname, 'database', 'seeds.sql');

    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql, (err) => {
            if (err) console.error('Error al ejecutar schema.sql:', err.message);
            else console.log('Estructura de tablas del Smart Tennis Manager verificada.');
        });
    }

    if (fs.existsSync(seedsPath)) {
        const seedsSql = fs.readFileSync(seedsPath, 'utf8');
        db.exec(seedsSql, (err) => {
            if (err) console.error('Error al ejecutar seeds.sql:', err.message);
            else console.log('Datos de prueba (seeds) cargados correctamente.');
        });
    }
}

// =========================================================================
// RUTAS DE USUARIOS
// =========================================================================
app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = `SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?`;
    db.get(sql, [correo, contrasena], (err, row) => {
        if (err) return res.status(500).json({ mensaje: "Error interno" });
        if (row) res.json({ mensaje: "Valido", usuario: row });
        else res.status(401).json({ mensaje: "Invalido" });
    });
});

app.post('/register', (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    const sql = `INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nombre, correo, contrasena, rol], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ mensaje: "El correo ya existe" });
            return res.status(500).json({ mensaje: "Error al insertar" });
        }
        res.status(201).json({ mensaje: "Creado", id: this.lastID });
    });
});

// =========================================================================
// RUTAS DE PRODUCTOS E INVENTARIO TERMINADO
// =========================================================================
app.get('/productos', (req, res) => {
    db.all(`SELECT * FROM productos`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/productos', (req, res) => {
    const { modelo, descripcion, precio_venta, costo_produccion, proveedor_id } = req.body;
    const sql = `INSERT INTO productos (modelo, descripcion, precio_venta, costo_produccion, proveedor_id) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [modelo, descripcion, precio_venta, costo_produccion, proveedor_id || null], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ mensaje: "Este modelo de tenis ya existe" });
            return res.status(500).json({ mensaje: "Error al guardar" });
        }
        res.status(201).json({ mensaje: "Creado", id: this.lastID });
    });
});

app.get('/inventario', (req, res) => {
    const sql = `SELECT i.id, p.modelo, i.talla, i.color, i.cantidad FROM inventario i JOIN productos p ON i.producto_id = p.id`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// =========================================================================
// NUEVA RUTA INTEGRADA: ÓRDENES DE PRODUCCIÓN + DESCUENTO DE MATERIA PRIMA
// =========================================================================
app.get('/ordenes', (req, res) => {
    const sql = `SELECT o.id, u.nombre AS operario, p.modelo, o.cantidad, o.fecha, o.estado FROM ordenes_produccion o JOIN usuarios u ON o.usuario_id = u.id JOIN productos p ON o.producto_id = p.id ORDER BY o.fecha DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/ordenes', (req, res) => {
    const { usuario_id, producto_id, cantidad, talla, color } = req.body;

    // 1. Consultar si la receta de este tenis exige materiales
    db.all(`SELECT materia_prima_id, cantidad_requerida FROM recetas_producto WHERE producto_id = ?`, [producto_id], (err, ingredientes) => {
        if (err) return res.status(500).json({ mensaje: "Error al consultar receta" });

        // 2. Registrar la orden de producción de todas formas
        db.run(`INSERT INTO ordenes_produccion (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)`, [usuario_id, producto_id, cantidad], function(err) {
            if (err) return res.status(500).json({ mensaje: "Error al crear la orden" });

            // 3. Descontar cada ingrediente de la materia prima multiplicando por el lote fabricado
            ingredientes.forEach(ing => {
                const totalDescontar = ing.cantidad_requerida * cantidad;
                db.run(`UPDATE materia_prima SET cantidad_stock = cantidad_stock - ? WHERE id = ?`, [totalDescontar, ing.materia_prima_id]);
            });

            // 4. Sumar el calzado terminado al inventario público (o crearlo si no existía esa variante)
            db.get(`SELECT id FROM inventario WHERE producto_id = ? AND talla = ? AND color = ?`, [producto_id, talla, color], (err, invRow) => {
                if (invRow) {
                    db.run(`UPDATE inventario SET cantidad = cantidad + ? WHERE id = ?`, [cantidad, invRow.id]);
                } else {
                    db.run(`INSERT INTO inventario (producto_id, talla, color, cantidad) VALUES (?, ?, ?, ?)`, [producto_id, talla, color, cantidad]);
                }
                res.status(201).json({ mensaje: "Producción completada e insumos descontados del almacén" });
            });
        });
    });
});

// =========================================================================
// RUTAS DE VENTAS
// =========================================================================
app.get('/ventas', (req, res) => {
    db.all(`SELECT * FROM ventas ORDER BY fecha DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/ventas', (req, res) => {
    const { cliente_nombre, inventario_id, cantidad, precio_unitario } = req.body;
    const total = cantidad * precio_unitario;

    db.get(`SELECT cantidad FROM inventario WHERE id = ?`, [inventario_id], (err, row) => {
        if (err) return res.status(500).json({ mensaje: "Error al verificar stock" });
        if (!row || row.cantidad < cantidad) return res.status(400).json({ mensaje: "Stock insuficiente" });

        db.run(`INSERT INTO ventas (cliente_nombre, total) VALUES (?, ?)`, [cliente_nombre, total], function(err) {
            if (err) return res.status(500).json({ mensaje: "Error al crear ticket" });
            const ventaId = this.lastID;

            db.run(`INSERT INTO detalle_ventas (venta_id, inventario_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`, [ventaId, inventario_id, cantidad, precio_unitario], () => {
                db.run(`UPDATE inventario SET cantidad = cantidad - ? WHERE id = ?`, [cantidad, inventario_id], () => {
                    res.status(201).json({ mensaje: "Venta guardada" });
                });
            });
        });
    });
});

// =========================================================================
// NUEVAS RUTAS: MATERIA PRIMA (Para los tableros de tus compañeros)
// =========================================================================
app.get('/materiaprima', (req, res) => {
    db.all(`SELECT * FROM materia_prima`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/ping', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en el puerto: ${PORT}`));