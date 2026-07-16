# Manual de API - FCH Ingenieros WMS

Este documento describe todos los endpoints disponibles en el backend del Sistema de Gestión de Almacenes (WMS). 

**Base URL:** `http://localhost:8080`
**Autenticación:** Todas las rutas (excepto `/api/auth/login`) requieren enviar un encabezado HTTP con el token JWT:
`Authorization: Bearer <tu_token_aqui>`

---

## 🔐 1. Autenticación (`/api/auth`)
Se encarga del acceso al sistema y generación de tokens.

* **POST** `/api/auth/login`
  * **Uso:** Iniciar sesión en el sistema.
  * **Body esperado:** `{"username": "demo", "password": "password"}`
  * **Respuesta:** Devuelve el token JWT y los datos del usuario logueado.

---

## 📦 2. Materiales (`/api/materiales`)
Gestión del catálogo de materiales, herramientas y EPPs.

* **GET** `/api/materiales`
  * **Uso:** Lista todos los materiales registrados en el sistema.
* **GET** `/api/materiales/{id}`
  * **Uso:** Obtiene la información detallada de un material específico.
* **GET** `/api/materiales/buscar?q={texto}`
  * **Uso:** Busca materiales por nombre o código (SKU).
* **GET** `/api/materiales/stock-minimo`
  * **Uso:** Devuelve únicamente los materiales cuyo stock actual es menor o igual a su stock mínimo (útil para notificaciones de reposición).
* **POST** `/api/materiales`
  * **Uso:** Registra un nuevo material en el catálogo.
* **PUT** `/api/materiales/{id}`
  * **Uso:** Modifica los datos de un material existente.

---

## 🚚 3. Movimientos (`/api/movimientos`)
Control de entradas y salidas de inventario. Estos endpoints afectan directamente el stock de los materiales y registran líneas en el Kardex de forma automática.

* **GET** `/api/movimientos`
  * **Uso:** Muestra el historial de todas las transacciones (entradas y salidas).
* **GET** `/api/movimientos/{id}`
  * **Uso:** Muestra el detalle de una transacción (quién la hizo, qué materiales se movieron y qué cantidades).
* **POST** `/api/movimientos/entrada`
  * **Uso:** Ingresa materiales al almacén provenientes de un proveedor. Aumenta el stock.
* **POST** `/api/movimientos/salida`
  * **Uso:** Despacha materiales hacia una cuadrilla, personal de obra o proyecto. Disminuye el stock. Falla automáticamente si no hay stock suficiente.

---

## 📝 4. Solicitudes de Material (`/api/solicitudes`)
Manejo de pedidos hechos por residentes/cuadrillas al almacén central.

* **GET** `/api/solicitudes`
  * **Uso:** Lista todas las solicitudes. Puede filtrarse añadiendo `?estado=Pendiente`.
* **GET** `/api/solicitudes/{id}`
  * **Uso:** Ver el detalle de una solicitud con todos sus items.
* **GET** `/api/solicitudes/personal/{idPersonal}`
  * **Uso:** Ver todo el historial de solicitudes creadas por un trabajador específico.
* **POST** `/api/solicitudes`
  * **Uso:** Crea un nuevo pedido de materiales. Se guarda por defecto en estado "Pendiente".
* **PUT** `/api/solicitudes/{id}/aprobar`
  * **Uso:** El almacenero o gerente aprueba el pedido.
* **PUT** `/api/solicitudes/{id}/rechazar`
  * **Uso:** El almacenero o gerente rechaza el pedido.

---

## 📖 5. Kardex de Inventario (`/api/kardex`)
Auditoría inmutable de todas las alteraciones de inventario. Útil para contabilidad y rastreo histórico de bienes.

* **GET** `/api/kardex`
  * **Uso:** Lista todos los registros del Kardex (cada línea de movimiento).
* **GET** `/api/kardex/material/{id}`
  * **Uso:** Muestra la historia de vida de un solo material específico (cuándo entró, cuándo salió, a qué costo, y el saldo tras cada movimiento).

---

## 📊 6. Reportes (`/api/reportes`)
Endpoints diseñados específicamente para proveer datos a dashboards y a gerencia.

* **GET** `/api/reportes/inventario-general`
  * **Uso:** Dashboard global. Devuelve valorizaciones, total de ítems en almacén, alertas consolidadas, etc.
* **GET** `/api/reportes/consumo-personal/{id}`
  * **Uso:** Calcula qué cantidad de recursos y valor económico ha consumido o retirado una cuadrilla o trabajador a lo largo del tiempo.
* **GET** `/api/reportes/proyecto/{id}?fechaInicio=...&fechaFin=...`
  * **Uso:** Resume los gastos y movimientos de materiales asociados a un proyecto específico de construcción en un lapso de tiempo.

---

## 👥 7. Administración Base (Usuarios, Proyectos, Proveedores, Personal)
Endpoints CRUD básicos para mantener los catálogos auxiliares del sistema.

**Usuarios (`/api/usuarios`)**
* **GET** `/api/usuarios` y `/api/usuarios/{id}`: Listar y Ver.
* **POST** `/api/usuarios`: Crear un usuario con acceso al sistema (Genera hash BCrypt internamente).
* **PATCH** `/api/usuarios/{id}/estado`: Suspender o reactivar un usuario (pasando `?activo=true|false`).

**Personal de Obra (`/api/personal`)**
* **GET**, **POST**, **PUT** en la ruta base: Gestión de los trabajadores de campo y residentes.

**Proveedores (`/api/proveedores`)**
* **GET**, **POST**, **PUT** en la ruta base: Gestión de las empresas que surten materiales al almacén.

**Proyectos (`/api/proyectos`)**
* **GET**, **POST**, **PUT** en la ruta base: Gestión de las obras en ejecución a las cuales se asocian los despachos de material.
