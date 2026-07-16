-- 1. Insertar Usuario
-- Contraseña en texto plano: "password"
-- Hash BCrypt verificado para "password":
INSERT INTO Usuarios (nombre_completo, rol, username, password_hash, estado)
VALUES ('Usuario Demo', 'Gerente', 'demo', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', true)
ON CONFLICT (username) DO NOTHING;

-- 2. Insertar Material
INSERT INTO Materiales (codigo_sku, nombre, categoria, unidad_medida, stock_actual, stock_minimo)
VALUES ('CEM-001', 'Cemento Sol', 'Construccion', 'Bolsa', 100.00, 20.00)
ON CONFLICT (codigo_sku) DO NOTHING;

-- 3. Insertar Personal_Obra
INSERT INTO Personal_Obra (dni, nombres, apellidos, cargo)
VALUES ('12345678', 'Juan', 'Perez', 'Maestro de Obra')
ON CONFLICT (dni) DO NOTHING;

-- 4. Insertar Proveedor
INSERT INTO Proveedores (ruc, razon_social, contacto)
VALUES ('20123456789', 'Constructora y Distribuidora SAC', '999888777')
ON CONFLICT (ruc) DO NOTHING;

-- 5. Insertar Proyecto
INSERT INTO Proyectos (id_proyecto, nombre_proyecto, ubicacion, estado)
VALUES (1, 'Edificio Los Pinos', 'Av. Las Palmas 123', 'EN_PROGRESO')
ON CONFLICT (id_proyecto) DO NOTHING;
