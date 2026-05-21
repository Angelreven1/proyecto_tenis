-- =========================================================================
-- DATOS DE PRUEBA (SEEDS) PARA SMART TENNIS MANAGER - CORREGIDO
-- =========================================================================

-- Insertar Proveedores
INSERT OR IGNORE INTO proveedores (id, nombre, contacto, telefono, email) VALUES 
(1, 'Suelas del Norte S.A.', 'Ing. Carlos Mendoza', '555-0192', 'ventas@suelasnorte.com'),
(2, 'Textiles Deportivos Elite', 'Lic. Martha Gómez', '555-0143', 'martha@textileselite.com');

-- Insertar Catálogo de Tenis Inicial
INSERT OR IGNORE INTO productos (id, modelo, descripcion, precio_venta, costo_produccion, proveedor_id) VALUES 
(1, 'Smash Pro Volley', 'Tenis especializado para canchas de arcilla con alta amortiguación.', 1850.00, 750.00, 1),
(2, 'Aero Court Speed', 'Diseño ultra ligero para jugadores de fondo con suela de alta tracción.', 2200.00, 900.00, 1),
(3, 'Classic Club Leather', 'Estilo retro casual en piel vacuna transpirable.', 1500.00, 500.00, 2);

-- Insertar Existencias en el Inventario (Columna corregida a 'cantidad')
INSERT OR IGNORE INTO inventario (id, producto_id, talla, color, cantidad) VALUES 
(1, 1, 26.0, 'Blanco/Azul', 15),
(2, 1, 27.0, 'Blanco/Azul', 22),
(3, 2, 25.5, 'Fosforescente', 8),
(4, 3, 26.0, 'Blanco Clásico', 30);

-- Insertar Historial de Órdenes
INSERT OR IGNORE INTO ordenes_produccion (usuario_id, producto_id, cantidad, fecha, estado) VALUES 
(1, 1, 50, '2026-05-18', 'Completado'),
(1, 3, 100, '2026-05-19', 'Completado');

-- Insertar Ventas Históricas
INSERT OR IGNORE INTO ventas (id, cliente_nombre, fecha, total) VALUES 
(1, 'Luis Fernando Garza', '2026-05-20', 3700.00),
(2, 'María Paula Rojas', '2026-05-21', 1500.00);

-- Insertar Detalles de las Ventas
INSERT OR IGNORE INTO detalle_ventas (venta_id, inventario_id, cantidad, precio_unitario) VALUES 
(1, 1, 2, 1850.00),
(2, 4, 1, 1500.00);