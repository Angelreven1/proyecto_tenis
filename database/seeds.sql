INSERT OR IGNORE INTO proveedores (id, nombre, contacto, telefono, email) VALUES 
(1, 'Suelas del Norte S.A.', 'Ing. Carlos Mendoza', '555-0192', 'ventas@suelasnorte.com'),
(2, 'Textiles Deportivos Elite', 'Lic. Martha Gómez', '555-0143', 'martha@textileselite.com');

INSERT OR IGNORE INTO productos (id, modelo, descripcion, precio_venta, costo_produccion, proveedor_id) VALUES 
(1, 'Smash Pro Volley', 'Tenis especializado para canchas de arcilla con alta amortiguación.', 1850.00, 750.00, 1),
(2, 'Aero Court Speed', 'Diseño ultra ligero para jugadores de fondo con suela de alta tracción.', 2200.00, 900.00, 1),
(3, 'Classic Club Leather', 'Estilo retro casual en piel vacuna transpirable.', 1500.00, 500.00, 2);

INSERT OR IGNORE INTO inventario (id, producto_id, talla, color, cantidad) VALUES 
(1, 1, 26.0, 'Blanco/Azul', 15),
(2, 1, 27.0, 'Blanco/Azul', 22),
(3, 2, 25.5, 'Fosforescente', 8),
(4, 3, 26.0, 'Blanco Clásico', 30);

INSERT OR IGNORE INTO ordenes_produccion (usuario_id, producto_id, cantidad, fecha, estado) VALUES 
(1, 1, 50, '2026-05-18', 'Completado'),
(1, 3, 100, '2026-05-19', 'Completado');

INSERT OR IGNORE INTO ventas (id, cliente_nombre, fecha, total) VALUES 
(1, 'Luis Fernando Garza', '2026-05-20', 3700.00),
(2, 'María Paula Rojas', '2026-05-21', 1500.00);

INSERT OR IGNORE INTO detalle_ventas (venta_id, inventario_id, cantidad, precio_unitario) VALUES 
(1, 1, 2, 1850.00),
(2, 4, 1, 1500.00);

-- Insertar Materia Prima Inicial al Almacén
INSERT OR IGNORE INTO materia_prima (id, nombre, cantidad_stock, unidad_medida, proveedor_id) VALUES 
(1, 'Suela de Goma Pro-Grip', 500.0, 'Pares', 1),
(2, 'Tela Sintética Transpirable', 300.0, 'Metros', 2),
(3, 'Agujetas Deportivas Negras', 1000.0, 'Piezas', 2),
(4, 'Piel Vacuna Premium', 150.0, 'Metros', 2);

-- Insertar la Receta del Producto 1 (Smash Pro Volley requiere: 1 par de suelas, 0.8m de tela y 2 agujetas)
INSERT OR IGNORE INTO recetas_producto (producto_id, materia_prima_id, cantidad_requerida) VALUES 
(1, 1, 1.0), 
(1, 2, 0.8), 
(1, 3, 2.0);

-- Insertar la Receta del Producto 3 (Classic Club Leather requiere: 1 par de suelas, 1.2m de piel vacuna y 2 agujetas)
INSERT OR IGNORE INTO recetas_producto (producto_id, materia_prima_id, cantidad_requerida) VALUES 
(3, 1, 1.0), 
(4, 1.2), 
(3, 3, 2.0);