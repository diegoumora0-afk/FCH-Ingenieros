-- 1. Tabla: Usuarios
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- 2. Tabla: Personal_Obra
CREATE TABLE Personal_Obra (
    id_personal SERIAL PRIMARY KEY,
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL
);

-- 3. Tabla: Materiales
CREATE TABLE Materiales (
    id_material SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    stock_actual DECIMAL(10,2) DEFAULT 0.00,
    stock_minimo DECIMAL(10,2) DEFAULT 0.00
);

-- 4. Tabla: Proyectos
CREATE TABLE Proyectos (
    id_proyecto SERIAL PRIMARY KEY,
    nombre_proyecto VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL
);

-- 5. Tabla: Proveedores
CREATE TABLE Proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    contacto VARCHAR(255)
);

-- 6. Tabla: Solicitudes_Material
CREATE TABLE Solicitudes_Material (
    id_solicitud SERIAL PRIMARY KEY,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_personal INT NOT NULL,
    sector_obra VARCHAR(255),
    estado_solicitud VARCHAR(50) NOT NULL,
    CONSTRAINT fk_solicitud_personal FOREIGN KEY (id_personal) REFERENCES Personal_Obra(id_personal)
);

-- 7. Tabla: Movimientos
CREATE TABLE Movimientos (
    id_movimiento SERIAL PRIMARY KEY,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA')),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_personal INT,
    id_proyecto INT,
    id_proveedor INT,
    id_solicitud INT,
    nro_guia VARCHAR(50),
    observaciones TEXT,
    CONSTRAINT fk_movimiento_usuario FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    CONSTRAINT fk_movimiento_personal FOREIGN KEY (id_personal) REFERENCES Personal_Obra(id_personal),
    CONSTRAINT fk_movimiento_proyecto FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto),
    CONSTRAINT fk_movimiento_proveedor FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor),
    CONSTRAINT fk_movimiento_solicitud FOREIGN KEY (id_solicitud) REFERENCES Solicitudes_Material(id_solicitud)
);

-- 8. Tabla: Detalle_Movimiento
CREATE TABLE Detalle_Movimiento (
    id_detalle SERIAL PRIMARY KEY,
    id_movimiento INT NOT NULL,
    id_material INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_movimiento FOREIGN KEY (id_movimiento) REFERENCES Movimientos(id_movimiento),
    CONSTRAINT fk_detalle_material FOREIGN KEY (id_material) REFERENCES Materiales(id_material)
);

-- 9. Tabla: Kardex_Inventario
CREATE TABLE Kardex_Inventario (
    id_kardex SERIAL PRIMARY KEY,
    id_material INT NOT NULL,
    id_movimiento INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    saldo_inicial DECIMAL(10,2) NOT NULL,
    ingreso DECIMAL(10,2) DEFAULT 0.00,
    salida DECIMAL(10,2) DEFAULT 0.00,
    saldo_final DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_kardex_material FOREIGN KEY (id_material) REFERENCES Materiales(id_material),
    CONSTRAINT fk_kardex_movimiento FOREIGN KEY (id_movimiento) REFERENCES Movimientos(id_movimiento)
);
