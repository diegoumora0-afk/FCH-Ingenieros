import urllib.parse
import subprocess
import sys

# Instalador automático de psycopg2
try:
    import psycopg2
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2

db_url = "postgres://neondb_owner:npg_hbA15PytaulJ@ep-small-sunset-ac2uyux1.sa-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()

    # 1. Insertar Usuario
    # Contraseña: "password" encriptada con BCrypt (Spring Security)
    # Generada con BCrypt: $2a$10$wY.uV5Vf4E4Z9U3mU.4YWe6V0mD0wR1XGgL0sT.Jj3Lw3e5h1p6z2 -> "password"
    cursor.execute("""
        INSERT INTO Usuarios (nombre_completo, rol, username, password_hash, estado)
        VALUES ('Usuario Demo', 'Gerente', 'demo', '$2a$10$wY.uV5Vf4E4Z9U3mU.4YWe6V0mD0wR1XGgL0sT.Jj3Lw3e5h1p6z2', true)
        ON CONFLICT (username) DO NOTHING;
    """)

    # 2. Insertar Material
    cursor.execute("""
        INSERT INTO Materiales (codigo_sku, nombre, categoria, unidad_medida, stock_actual, stock_minimo)
        VALUES ('CEM-001', 'Cemento Sol', 'Construccion', 'Bolsa', 100.00, 20.00)
        ON CONFLICT (codigo_sku) DO NOTHING;
    """)

    # 3. Insertar Personal_Obra
    cursor.execute("""
        INSERT INTO Personal_Obra (dni, nombres, apellidos, cargo)
        VALUES ('12345678', 'Juan', 'Perez', 'Maestro de Obra')
        ON CONFLICT (dni) DO NOTHING;
    """)

    # 4. Insertar Proyecto
    # Note: Proyectos no tiene un UNIQUE constraint en la tabla init.sql, así que buscamos si existe
    cursor.execute("SELECT id_proyecto FROM Proyectos WHERE nombre_proyecto = 'Edificio Los Pinos'")
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO Proyectos (nombre_proyecto, ubicacion, estado)
            VALUES ('Edificio Los Pinos', 'Av. Las Palmas 123', 'EN_PROGRESO');
        """)

    # 5. Insertar Proveedor
    cursor.execute("""
        INSERT INTO Proveedores (ruc, razon_social, contacto)
        VALUES ('20123456789', 'Constructora y Distribuidora SAC', '999888777')
        ON CONFLICT (ruc) DO NOTHING;
    """)

    print("✅ Datos de prueba insertados exitosamente.")
except Exception as e:
    print(f"❌ Error insertando datos: {e}")
finally:
    if 'cursor' in locals(): cursor.close()
    if 'conn' in locals(): conn.close()
