# Manual Técnico del Backend
## Sistema de Monitoreo Ambiental IIAP

**Versión:** 1.0.0
**Fecha:** 10/10/2025
**Período de desarrollo:** 15/09/2025 - 10/10/2025 (26 días)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Metodología de Desarrollo](#2-metodología-de-desarrollo)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Diseño UML](#4-diseño-uml)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Stack Tecnológico](#6-stack-tecnológico)
7. [Seguridad](#7-seguridad)
8. [Instalación y Configuración](#8-instalación-y-configuración)
9. [Estructura del Proyecto](#9-estructura-del-proyecto)
10. [Testing](#10-testing)
11. [Despliegue](#11-despliegue)

---

## 1. Introducción

### 1.1 Propósito del Documento
Este manual técnico documenta la arquitectura, diseño e implementación del backend del Sistema de Monitoreo Ambiental del IIAP, desarrollado entre el 15 de septiembre y el 10 de octubre de 2025.

### 1.2 Alcance del Sistema
El backend proporciona una API RESTful robusta para:
- Gestión de sensores ambientales IoT
- Almacenamiento y consulta de lecturas en tiempo real
- Sistema de alertas automatizado
- Panel de administración con autenticación JWT
- Acceso público sin autenticación para visualización de datos

### 1.3 Audiencia
- Desarrolladores backend
- Administradores de sistemas
- Equipo de DevOps
- Auditores técnicos

---

## 2. Metodología de Desarrollo

### 2.1 SCRUM para 1 Desarrollador

El proyecto se desarrolló utilizando **SCRUM adaptado para un solo desarrollador** durante 26 días, organizados en **4 sprints**.

#### 2.1.1 Roles y Responsabilidades

| Rol | Responsable | Actividades |
|-----|-------------|-------------|
| **Product Owner** | Equipo IIAP | Definición de requisitos, priorización del backlog |
| **Scrum Master** | Desarrollador | Facilitación del proceso, eliminación de impedimentos |
| **Developer** | Desarrollador | Implementación, testing, documentación |

#### 2.1.2 Eventos SCRUM Adaptados

**Daily Standup (Auto-reflexión diaria - 10 min)**
- ¿Qué logré ayer?
- ¿Qué haré hoy?
- ¿Hay impedimentos?
- Registro en bitácora personal

**Sprint Planning (Inicio de cada sprint - 2 horas)**
- Revisión del backlog priorizado
- Selección de user stories según capacidad
- Definición de tareas técnicas
- Estimación de puntos de historia

**Sprint Review (Último día del sprint - 1 hora)**
- Demo funcional de features implementados
- Validación con stakeholders
- Actualización del producto

**Sprint Retrospective (Último día del sprint - 1 hora)**
- ¿Qué salió bien?
- ¿Qué se puede mejorar?
- Acciones de mejora para el siguiente sprint

### 2.2 Sprints Ejecutados

#### **Sprint 1: Infraestructura y Base de Datos** (15-21 septiembre, 7 días)

**Objetivo:** Establecer la base técnica del proyecto

| User Story | Puntos | Estado |
|------------|--------|--------|
| US-01: Configurar proyecto Node.js + Express | 3 | ✅ Completado |
| US-02: Integrar Prisma ORM con PostgreSQL | 5 | ✅ Completado |
| US-03: Diseñar esquema de base de datos | 8 | ✅ Completado |
| US-04: Configurar variables de entorno | 2 | ✅ Completado |
| US-05: Implementar estructura MVC | 5 | ✅ Completado |

**Velocity:** 23 puntos
**Retrospectiva:**
- ✅ Buena decisión usar Prisma (migrations automáticas)
- ⚠️ Mejorar: Documentar decisiones arquitectónicas desde el inicio

---

#### **Sprint 2: Autenticación y Endpoints Básicos** (22-28 septiembre, 7 días)

**Objetivo:** Implementar autenticación y CRUD básico de sensores

| User Story | Puntos | Estado |
|------------|--------|--------|
| US-06: Sistema de autenticación JWT | 8 | ✅ Completado |
| US-07: Middleware de autorización | 5 | ✅ Completado |
| US-08: CRUD de sensores | 5 | ✅ Completado |
| US-09: Endpoints de lecturas | 5 | ✅ Completado |
| US-10: Validación de datos con express-validator | 3 | ✅ Completado |
| US-11: Manejo de errores centralizado | 3 | ✅ Completado |

**Velocity:** 29 puntos
**Retrospectiva:**
- ✅ JWT implementado correctamente con refresh tokens
- ✅ Validaciones robustas previenen errores
- 🔄 Mejorar: Añadir más tests unitarios

---

#### **Sprint 3: Lógica de Negocio Avanzada** (29 septiembre - 5 octubre, 7 días)

**Objetivo:** Implementar features complejos (alertas, umbrales, filtros)

| User Story | Puntos | Estado |
|------------|--------|--------|
| US-12: Sistema de umbrales personalizados | 8 | ✅ Completado |
| US-13: Detección automática de alertas | 8 | ✅ Completado |
| US-14: Filtros avanzados de lecturas | 5 | ✅ Completado |
| US-15: Estadísticas y agregaciones | 5 | ✅ Completado |
| US-16: Endpoints de alertas | 5 | ✅ Completado |
| US-17: Gestión de recorridos guardados | 3 | ✅ Completado |
| US-18: CRUD de preferencias del sistema | 3 | ✅ Completado |
| US-19: Logs de actividad administrativa | 3 | ✅ Completado |
| US-20: Paginación y ordenamiento | 3 | ✅ Completado |
| US-21: Exportación de datos (JSON) | 2 | ✅ Completado |

**Velocity:** 45 puntos
**Retrospectiva:**
- ✅ Sistema de alertas funciona correctamente con umbrales dinámicos
- ✅ Filtros optimizados con índices en BD
- 🔄 Mejorar: Considerar caché para consultas frecuentes

---

#### **Sprint 4: Seguridad, Testing y Documentación** (6-10 octubre, 5 días)

**Objetivo:** Asegurar calidad, seguridad y documentación completa

| User Story | Puntos | Estado |
|------------|--------|--------|
| US-22: Implementar Helmet.js para seguridad | 3 | ✅ Completado |
| US-23: Configurar CORS | 2 | ✅ Completado |
| US-24: Rate limiting en endpoints públicos | 3 | ✅ Completado |
| US-25: Tests de integración (cobertura 75%) | 8 | ✅ Completado |
| US-26: Documentación de API (manual técnico + API) | 5 | ✅ Completado |

**Velocity:** 21 puntos
**Retrospectiva:**
- ✅ Seguridad robusta implementada
- ✅ Cobertura de tests alcanzada (75%)
- ✅ Documentación completa y clara

---

### 2.3 Métricas Finales del Proyecto

| Métrica | Valor |
|---------|-------|
| **User Stories Completadas** | 26/26 (100%) |
| **Puntos de Historia Totales** | 118 puntos |
| **Velocidad Promedio** | 29.5 puntos/sprint |
| **Endpoints Implementados** | 32 |
| **Cobertura de Tests** | 75% |
| **Días de Desarrollo** | 26 días |
| **Sprints Ejecutados** | 4 |

---

## 3. Arquitectura del Sistema

### 3.1 Patrón Arquitectónico

El backend implementa una **arquitectura de 3 capas** combinada con el patrón **MVC (Model-View-Controller)**:

```
┌─────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN            │
│     (API REST - Express Routes)         │
│  - Recibe peticiones HTTP               │
│  - Valida datos de entrada              │
│  - Retorna respuestas JSON              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       CAPA DE LÓGICA DE NEGOCIO         │
│         (Controllers + Services)        │
│  - Autenticación y autorización         │
│  - Lógica de alertas                    │
│  - Validaciones de negocio              │
│  - Cálculos y agregaciones              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        CAPA DE ACCESO A DATOS           │
│        (Prisma ORM + PostgreSQL)        │
│  - Modelos de datos                     │
│  - Consultas a BD                       │
│  - Transacciones                        │
└─────────────────────────────────────────┘
```

**[INSERTAR DIAGRAMA: Arquitectura 3 Capas - Vista Completa]**

### 3.2 Patrón MVC Detallado

```
src/
├── routes/          → RUTAS (Enrutamiento HTTP)
│   ├── auth.routes.js
│   ├── sensores.routes.js
│   └── lecturas.routes.js
│
├── controllers/     → CONTROLADORES (Lógica de presentación)
│   ├── authController.js
│   ├── sensoresController.js
│   └── lecturasController.js
│
├── services/        → SERVICIOS (Lógica de negocio)
│   ├── alertService.js
│   └── statsService.js
│
├── models/          → MODELOS (Prisma schema)
│   └── prisma/schema.prisma
│
└── middlewares/     → MIDDLEWARE (Cross-cutting concerns)
    ├── auth.js
    ├── errorHandler.js
    └── validator.js
```

**[INSERTAR DIAGRAMA: Patrón MVC - Flujo de Datos]**

### 3.3 Flujo de una Petición

1. **Cliente** → Envía petición HTTP (POST /api/lecturas)
2. **Route** → Enruta a `lecturasRoutes.js`
3. **Middleware** → Valida JWT (si es privado)
4. **Validator** → Valida datos con express-validator
5. **Controller** → `lecturasController.create()`
6. **Service** → `alertService.checkThresholds()` (si aplica)
7. **Prisma** → Guarda en PostgreSQL
8. **Response** → Retorna JSON al cliente

**[INSERTAR DIAGRAMA: Flujo de Petición HTTP]**

### 3.4 Decisiones Arquitectónicas (ADR)

#### ADR-001: Uso de Prisma ORM
- **Decisión:** Usar Prisma en lugar de SQL raw o Sequelize
- **Razón:** Type-safety, migrations automáticas, mejor DX
- **Consecuencias:** Dependencia del ORM, curva de aprendizaje

#### ADR-002: Arquitectura de 3 Capas
- **Decisión:** Separar routes, controllers y services
- **Razón:** Separación de responsabilidades, testabilidad
- **Consecuencias:** Más archivos, pero mejor mantenibilidad

#### ADR-003: JWT para Autenticación
- **Decisión:** JWT stateless en lugar de sesiones
- **Razón:** Escalabilidad, no requiere almacenamiento de sesión
- **Consecuencias:** No se pueden revocar tokens antes de expiración

---

## 4. Diseño UML

### 4.1 Diagrama de Casos de Uso

**Actores:**
- **Administrador** (usuario autenticado)
- **Usuario Público** (usuario no autenticado)
- **Sistema Sensor ESP32** (actor externo - dispositivo IoT)

**Casos de Uso Principales:**

**Nota:** Nomenclatura basada en mejores prácticas de IBM (verbos activos + objeto).

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| **CU-01** | **Autenticarse en el Sistema** | Administrador | Iniciar sesión con credenciales para acceder al panel administrativo |
| **CU-02** | **Gestionar Sensores** | Administrador | Crear, modificar, eliminar y consultar sensores del sistema |
| **CU-03** | **Configurar Umbrales de Alertas** | Administrador | Definir valores mínimos y máximos para generar alertas automáticas |
| **CU-04** | **Gestionar Alertas** | Administrador | Consultar y resolver alertas generadas por el sistema |
| **CU-05** | **Enviar Datos Ambientales** | Sistema Sensor ESP32 | Transmitir lecturas de sensores al backend vía HTTP POST |
| **CU-06** | **Visualizar Dashboard Público** | Usuario Público | Acceder a la vista general con KPIs y datos en tiempo real |
| **CU-07** | **Consultar Lecturas Históricas** | Usuario Público | Filtrar y visualizar lecturas almacenadas con criterios avanzados |
| **CU-08** | **Visualizar Estadísticas** | Usuario Público | Consultar promedios, máximos y mínimos por período de tiempo |
| **CU-09** | **Gestionar Recorridos Móviles** | Administrador | Guardar, nombrar y visualizar trayectorias de sensores móviles |
| **CU-10** | **Exportar Datos** | Usuario Público/Admin | Descargar reportes en formatos PDF, Excel o CSV |

```mermaid
graph TB
    Admin((Administrador))
    Public((Usuario Público))
    ESP32((Sistema Sensor ESP32))

    Admin --> CU01[CU-01: Autenticarse en el Sistema]
    Admin --> CU02[CU-02: Gestionar Sensores]
    Admin --> CU03[CU-03: Configurar Umbrales de Alertas]
    Admin --> CU04[CU-04: Gestionar Alertas]
    Admin --> CU09[CU-09: Gestionar Recorridos Móviles]

    Public --> CU06[CU-06: Visualizar Dashboard Público]
    Public --> CU07[CU-07: Consultar Lecturas Históricas]
    Public --> CU08[CU-08: Visualizar Estadísticas]
    Public --> CU10[CU-10: Exportar Datos]

    ESP32 --> CU05[CU-05: Enviar Datos Ambientales]

    CU05 -.-> CU04

    style Admin fill:#4CAF50
    style Public fill:#2196F3
    style ESP32 fill:#FF9800
```

**[INSERTAR DIAGRAMA: Casos de Uso - Vista General (imagen exportada de Mermaid o herramienta UML)]**

### 4.2 Diagrama de Clases

#### 4.2.1 Modelos de Prisma (Base de Datos)

```mermaid
classDiagram
    class sensores {
        +String id_sensor PK
        +String nombre_sensor
        +String zona
        +Boolean is_movil
        +String description
        +DateTime installation_date
        +DateTime created_at
        +DateTime last_seen
        +String estado
        +crear(datos) sensores
        +obtenerPorId(id) sensores
        +obtenerTodos(filtros) sensores[]
        +actualizar(id, datos) sensores
        +eliminar(id) boolean
        +actualizarUltimaConexion(id) void
        +cambiarEstado(id, estado) void
        +contarTotal() int
        +obtenerEstadisticas() Object
        +verificarExiste(id) boolean
        +obtenerMoviles() sensores[]
        +obtenerPorZona(zona) sensores[]
    }

    class lecturas {
        +Int id_lectura PK
        +String id_sensor FK
        +DateTime lectura_datetime
        +Decimal temperatura
        +Decimal humedad
        +Int co2_nivel
        +Decimal co_nivel
        +Decimal latitud
        +Decimal longitud
        +Decimal altitud
        +String zona
        +DateTime created_at
        +crear(datos) lecturas
        +obtenerPorId(id) lecturas
        +obtenerTodas(filtros, paginacion) lecturas[]
        +obtenerPorSensor(idSensor, limit) lecturas[]
        +obtenerUltima(idSensor) lecturas
        +obtenerUltimas(limit) lecturas[]
        +obtenerPorRangoFechas(inicio, fin) lecturas[]
        +obtenerPorZona(zona) lecturas[]
        +calcularEstadisticas(filtros) Object
        +calcularPromedios(idSensor, periodo) Object
        +contarTotal() int
        +obtenerParaExportar(filtros) lecturas[]
        +validarCoordenadas() boolean
    }

    class alertas {
        +Int id_alerta PK
        +String id_sensor FK
        +String alerta_tipo
        +String parametro_nombre
        +Decimal umbral_valor
        +Decimal actual_valor
        +String mensaje
        +String gravedad
        +DateTime se_activo_at
        +DateTime resuelto_at
        +Boolean is_resolved
        +crear(datos) alertas
        +obtenerPorId(id) alertas
        +obtenerTodas(filtros, paginacion) alertas[]
        +obtenerActivas() alertas[]
        +obtenerPorSensor(idSensor) alertas[]
        +marcarResuelta(id, usuarioId) alertas
        +eliminar(id) boolean
        +contarActivas() int
        +contarPorGravedad(gravedad) int
        +obtenerRecientes(limit) alertas[]
        +calcularGravedad(parametro, diferencia) String
    }

    class sensor_umbral {
        +Int id_sensor_umbral PK
        +String id_sensor FK
        +String parametro_nombre
        +Decimal min_umbral
        +Decimal max_umbral
        +Boolean alerta_habilitar
        +DateTime created_at
        +DateTime updated_at
        +crear(datos) sensor_umbral
        +obtenerPorId(id) sensor_umbral
        +obtenerPorSensor(idSensor) sensor_umbral[]
        +obtenerPorParametro(idSensor, parametro) sensor_umbral
        +actualizar(id, datos) sensor_umbral
        +eliminar(id) boolean
        +habilitarAlertas(id) void
        +deshabilitarAlertas(id) void
        +verificarExiste(idSensor, parametro) boolean
        +validarRangos(min, max) boolean
        +obtenerActivos(idSensor) sensor_umbral[]
    }

    class usuarios {
        +Int id_usuario PK
        +String username UK
        +String email UK
        +String password_hash
        +String nombre_completo
        +String rol
        +String estado
        +DateTime ultimo_acceso
        +DateTime created_at
        +DateTime updated_at
        +crear(datos) usuarios
        +obtenerPorId(id) usuarios
        +obtenerPorUsername(username) usuarios
        +obtenerPorEmail(email) usuarios
        +obtenerTodos() usuarios[]
        +actualizar(id, datos) usuarios
        +eliminar(id) boolean
        +cambiarPassword(id, passwordNuevo) boolean
        +verificarPassword(password) boolean
        +actualizarUltimoAcceso(id) void
        +activar(id) void
        +desactivar(id) void
        +cambiarRol(id, nuevoRol) void
        +verificarEstadoActivo(id) boolean
    }

    class logs_actividad {
        +Int id_log PK
        +Int id_usuario FK
        +String username
        +String accion
        +String tabla_afectada
        +String id_registro
        +String detalles
        +String ip_address
        +DateTime created_at
        +registrar(datos) logs_actividad
        +obtenerPorId(id) logs_actividad
        +obtenerTodos(filtros, paginacion) logs_actividad[]
        +obtenerPorUsuario(idUsuario) logs_actividad[]
        +obtenerPorTabla(tabla) logs_actividad[]
        +obtenerPorFecha(fecha) logs_actividad[]
        +obtenerRecientes(limit) logs_actividad[]
        +eliminarAntiguos(dias) int
        +contarPorAccion(accion) int
    }

    class recorridos_guardados {
        +Int id_recorrido PK
        +String id_sensor FK
        +String nombre_recorrido
        +DateTime fecha_recorrido
        +DateTime hora_inicio
        +DateTime hora_fin
        +Int total_puntos
        +Decimal distancia_km
        +Int duracion_minutos
        +Json puntos_geojson
        +Json metadata
        +DateTime created_at
        +String usuario_creo
        +crear(datos) recorridos_guardados
        +obtenerPorId(id) recorridos_guardados
        +obtenerTodos() recorridos_guardados[]
        +obtenerPorSensor(idSensor) recorridos_guardados[]
        +obtenerPorUsuario(usuario) recorridos_guardados[]
        +eliminar(id) boolean
        +calcularDistancia(puntos) Decimal
        +calcularDuracion(inicio, fin) int
        +contarPuntos(geojson) int
        +validarGeoJSON(geojson) boolean
        +obtenerPorFecha(fecha) recorridos_guardados[]
    }

    class preferencias_sistema {
        +Int id_preferencia PK
        +Int id_usuario FK UK
        +String zona_horaria
        +String formato_fecha
        +Int intervalo_actualizacion
        +Int registros_por_pagina
        +Boolean mostrar_graficos
        +Boolean animaciones_graficos
        +DateTime created_at
        +DateTime updated_at
        +crear(datos) preferencias_sistema
        +obtenerPorUsuario(idUsuario) preferencias_sistema
        +actualizar(idUsuario, datos) preferencias_sistema
        +eliminar(idUsuario) boolean
        +restaurarDefecto(idUsuario) preferencias_sistema
        +validarIntervalo(intervalo) boolean
        +validarZonaHoraria(zona) boolean
    }

    sensores "1" --> "*" lecturas : tiene
    sensores "1" --> "*" alertas : genera
    sensores "1" --> "*" sensor_umbral : configura
    sensores "1" --> "*" recorridos_guardados : registra
    usuarios "1" --> "*" logs_actividad : realiza
    usuarios "1" --> "1" preferencias_sistema : tiene
```

#### 4.2.2 Controladores (Capa de Lógica)

**Nota:** Los controladores son funciones que reciben peticiones HTTP (req, res) y coordinan la lógica de negocio.

```mermaid
classDiagram
    class authController {
        -PrismaClient prisma
        -jwt jsonwebtoken
        -bcrypt bcryptjs
        +login(req, res) Promise~Response~
        +verificar(req, res) Promise~Response~
        +logout(req, res) Promise~Response~
        +refreshToken(req, res) Promise~Response~
        -generarToken(usuario) string
        -validarCredenciales(username, password) Promise~boolean~
        -registrarAcceso(usuarioId, ip) Promise~void~
    }

    class sensorController {
        -PrismaClient prisma
        +obtenerTodos(req, res) Promise~Response~
        +obtenerPorId(req, res) Promise~Response~
        +crear(req, res) Promise~Response~
        +actualizar(req, res) Promise~Response~
        +eliminar(req, res) Promise~Response~
        +obtenerEstadisticas(req, res) Promise~Response~
        +obtenerPorZona(req, res) Promise~Response~
        +cambiarEstado(req, res) Promise~Response~
        +obtenerMoviles(req, res) Promise~Response~
        +obtenerActivos(req, res) Promise~Response~
        -validarDatosSensor(datos) boolean
        -registrarLog(accion, sensorId, usuarioId) Promise~void~
    }

    class lecturaController {
        -PrismaClient prisma
        -alertService alertService
        +crear(req, res) Promise~Response~
        +obtenerTodas(req, res) Promise~Response~
        +obtenerUltimas(req, res) Promise~Response~
        +obtenerPorSensor(req, res) Promise~Response~
        +obtenerEstadisticas(req, res) Promise~Response~
        +obtenerLecturasAvanzado(req, res) Promise~Response~
        +obtenerParaExportar(req, res) Promise~Response~
        +obtenerPorRangoFechas(req, res) Promise~Response~
        +obtenerPorZona(req, res) Promise~Response~
        +calcularPromedios(req, res) Promise~Response~
        +obtenerUltimaPorSensor(req, res) Promise~Response~
        -autoRegistrarSensor(idSensor, datos) Promise~void~
        -detectarSensorMovil(idSensor) Promise~boolean~
        -procesarAlertasAutomaticas(lectura) Promise~void~
    }

    class alertaController {
        -PrismaClient prisma
        +obtenerTodas(req, res) Promise~Response~
        +obtenerPorId(req, res) Promise~Response~
        +obtenerActivas(req, res) Promise~Response~
        +obtenerPorSensor(req, res) Promise~Response~
        +obtenerPorGravedad(req, res) Promise~Response~
        +marcarResuelta(req, res) Promise~Response~
        +eliminar(req, res) Promise~Response~
        +contarActivas(req, res) Promise~Response~
        +obtenerRecientes(req, res) Promise~Response~
        -registrarResolucion(alertaId, usuarioId) Promise~void~
    }

    class umbralController {
        -PrismaClient prisma
        +obtenerPorSensor(req, res) Promise~Response~
        +obtenerPorParametro(req, res) Promise~Response~
        +obtenerActivos(req, res) Promise~Response~
        +crear(req, res) Promise~Response~
        +actualizar(req, res) Promise~Response~
        +eliminar(req, res) Promise~Response~
        +habilitar(req, res) Promise~Response~
        +deshabilitar(req, res) Promise~Response~
        -validarRangos(min, max) boolean
        -verificarDuplicado(sensorId, parametro) Promise~boolean~
        -registrarLog(accion, umbralId, usuarioId) Promise~void~
    }

    class recorridosController {
        -PrismaClient prisma
        +obtenerTodos(req, res) Promise~Response~
        +obtenerPorId(req, res) Promise~Response~
        +obtenerPorSensor(req, res) Promise~Response~
        +obtenerPorUsuario(req, res) Promise~Response~
        +crear(req, res) Promise~Response~
        +eliminar(req, res) Promise~Response~
        +obtenerPorFecha(req, res) Promise~Response~
        -calcularDistanciaTotal(puntos) number
        -calcularDuracion(inicio, fin) number
        -validarGeoJSON(geojson) boolean
        -verificarSensorMovil(sensorId) Promise~boolean~
    }

    class preferenciasSistemaController {
        -PrismaClient prisma
        +obtenerPreferencias(req, res) Promise~Response~
        +actualizarPreferencias(req, res) Promise~Response~
        +restaurarDefecto(req, res) Promise~Response~
        -validarIntervalo(intervalo) boolean
        -validarZonaHoraria(zona) boolean
        -obtenerDefecto() Object
    }

    class usuarioController {
        -PrismaClient prisma
        -bcrypt bcryptjs
        +obtenerTodos(req, res) Promise~Response~
        +obtenerPorId(req, res) Promise~Response~
        +crear(req, res) Promise~Response~
        +actualizar(req, res) Promise~Response~
        +eliminar(req, res) Promise~Response~
        +activar(req, res) Promise~Response~
        +desactivar(req, res) Promise~Response~
        +cambiarRol(req, res) Promise~Response~
        -hashPassword(password) Promise~string~
        -validarEmail(email) boolean
        -verificarDuplicado(username, email) Promise~boolean~
        -registrarLog(accion, usuarioId) Promise~void~
    }

    class perfilController {
        -PrismaClient prisma
        -bcrypt bcryptjs
        +obtenerPerfil(req, res) Promise~Response~
        +actualizarPerfil(req, res) Promise~Response~
        +cambiarPassword(req, res) Promise~Response~
        +actualizarPreferencias(req, res) Promise~Response~
        -verificarPasswordActual(usuarioId, password) Promise~boolean~
        -validarPasswordNuevo(password) boolean
        -registrarCambioPassword(usuarioId) Promise~void~
    }

    class logsController {
        -PrismaClient prisma
        +obtenerTodos(req, res) Promise~Response~
        +obtenerPorUsuario(req, res) Promise~Response~
        +obtenerPorTabla(req, res) Promise~Response~
        +obtenerPorFecha(req, res) Promise~Response~
        +obtenerRecientes(req, res) Promise~Response~
        +eliminarAntiguos(req, res) Promise~Response~
        +contarPorAccion(req, res) Promise~Response~
        -formatearLogs(logs) Object[]
    }

    authController --> PrismaClient : usa
    sensorController --> PrismaClient : usa
    lecturaController --> PrismaClient : usa
    lecturaController --> alertService : usa
    alertaController --> PrismaClient : usa
    umbralController --> PrismaClient : usa
    recorridosController --> PrismaClient : usa
    preferenciasSistemaController --> PrismaClient : usa
    usuarioController --> PrismaClient : usa
    perfilController --> PrismaClient : usa
    logsController --> PrismaClient : usa

    class PrismaClient {
        +sensores
        +lecturas
        +alertas
        +sensor_umbral
        +usuarios
        +logs_actividad
        +recorridos_guardados
        +preferencias_sistema
        +$connect() Promise~void~
        +$disconnect() Promise~void~
        +$transaction(callback) Promise~any~
    }

    class alertService {
        -PrismaClient prisma
        +checkThresholds(lectura) Promise~Alerta[]~
        +calcularGravedad(parametro, diferencia) String
        +crearAlerta(datos) Promise~Alerta~
        +enviarNotificacion(alerta) Promise~void~
    }
```

#### 4.2.3 Middlewares

**Nota:** Los middlewares son funciones que se ejecutan antes de los controladores para validar, autenticar o procesar peticiones.

```mermaid
classDiagram
    class authMiddleware {
        -jwt jsonwebtoken
        -PrismaClient prisma
        +verificarToken(req, res, next) Promise~void~
        +verificarTokenOpcional(req, res, next) Promise~void~
        +verificarRolAdmin(req, res, next) Promise~void~
        +verificarRolSuperAdmin(req, res, next) Promise~void~
        -extraerToken(req) string
        -decodificarToken(token) Object
        -verificarUsuarioActivo(usuarioId) Promise~boolean~
        -adjuntarUsuario(req, usuario) void
    }

    class validationMiddleware {
        -expresValidator express-validator
        +validarSensor(req, res, next) void
        +validarLectura(req, res, next) void
        +validarUmbral(req, res, next) void
        +validarUsuario(req, res, next) void
        +validarAlerta(req, res, next) void
        +validarRecorrido(req, res, next) void
        +validarLogin(req, res, next) void
        +validarCambioPassword(req, res, next) void
        +validarFiltros(req, res, next) void
        +procesarErroresValidacion(req, res, next) void
        -sanitizarEntrada(valor) string
        -validarRangoCoordenadas(lat, lon) boolean
        -validarFormatoFecha(fecha) boolean
    }

    class errorHandler {
        +manejarError(err, req, res, next) void
        +errorNotFound(req, res, next) void
        +errorValidacion(err, req, res, next) void
        +errorAutenticacion(err, req, res, next) void
        +errorBaseDatos(err, req, res, next) void
        -formatearError(err) Object
        -registrarError(err, req) Promise~void~
        -determinarCodigoHTTP(err) number
        -esErrorProduccion() boolean
    }

    class rateLimiter {
        -expressRateLimit express-rate-limit
        +limitarPeticionesGenerales(req, res, next) void
        +limitarPeticionesAuth(req, res, next) void
        +limitarPeticionesAPI(req, res, next) void
        +limitarCreacionRecursos(req, res, next) void
        -configurarLimite(ventana, max) Object
        -mensajeExcedido(req) string
    }

    class corsMiddleware {
        -cors cors
        +configurarCORS(req, res, next) void
        +verificarOrigen(origin, callback) void
        -origenePermitidos() string[]
        -opcionesCORS() Object
    }

    class loggerMiddleware {
        -morgan morgan
        +registrarPeticion(req, res, next) void
        +registrarRespuesta(req, res, next) void
        -formatearLog(req) string
        -obtenerIP(req) string
        -calcularTiempoRespuesta(inicio) number
    }

    class securityMiddleware {
        -helmet helmet
        +configurarHelmet(req, res, next) void
        +sanitizarEntrada(req, res, next) void
        +prevenir SQLInjection(req, res, next) void
        +prevenirXSS(req, res, next) void
        +configurarCSP(req, res, next) void
        +configurarHSTS(req, res, next) void
        -limpiarHTML(texto) string
    }

    authMiddleware --> jwt : usa
    authMiddleware --> PrismaClient : verifica usuario
    validationMiddleware --> expresValidator : usa
    rateLimiter --> expressRateLimit : usa
    corsMiddleware --> cors : usa
    loggerMiddleware --> morgan : usa
    securityMiddleware --> helmet : usa
```

**[INSERTAR DIAGRAMA: Diagrama de Clases Completo (imagen exportada de Mermaid o herramienta UML)]**

### 4.3 Diagramas de Secuencia

#### 4.3.1 Secuencia: Autenticación de Administrador

**Archivos involucrados:**
- Cliente (Frontend/Postman)
- `src/routes/auth.js`
- `src/controllers/authController.js`
- `prisma.usuarios` (modelo)
- PostgreSQL (base de datos)

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant Route as auth.js
    participant Controller as authController.js
    participant Model as usuarios
    participant DB as PostgreSQL

    Admin->>Route: POST /api/auth/login
    Route->>Controller: Enviar credenciales

    Controller->>Controller: Validar campos

    Controller->>Model: Buscar usuario por username
    Model->>DB: Consultar tabla usuarios
    DB-->>Model: Retornar datos
    Model-->>Controller: Datos del usuario

    Controller->>Controller: Verificar estado activo
    Controller->>Controller: Verificar contraseña
    Controller->>Controller: Generar token JWT

    Controller->>Model: Actualizar último acceso
    Model->>DB: Actualizar registro

    Controller->>Model: Registrar login en logs
    Model->>DB: Insertar log de actividad

    Controller-->>Route: Token y datos de usuario
    Route-->>Admin: Respuesta exitosa
```

**[INSERTAR DIAGRAMA: Secuencia de Autenticación (imagen exportada)]**

---

#### 4.3.2 Secuencia: Envío de Lectura y Generación de Alerta

**Archivos involucrados:**
- Sistema Sensor ESP32 (actor externo)
- `src/routes/lecturas.js`
- `src/controllers/lecturaController.js`
- `prisma.sensores`, `prisma.lecturas`, `prisma.sensor_umbral`, `prisma.alertas` (modelos)
- PostgreSQL

```mermaid
sequenceDiagram
    participant ESP32 as Sistema Sensor ESP32
    participant Route as lecturas.js
    participant Controller as lecturaController.js
    participant Sensores as sensores
    participant Lecturas as lecturas
    participant Umbrales as sensor_umbral
    participant Alertas as alertas
    participant DB as PostgreSQL

    ESP32->>Route: POST /api/lecturas
    Route->>Controller: Recibir datos del sensor

    Controller->>Sensores: Verificar si sensor existe
    Sensores->>DB: Consultar sensor
    DB-->>Sensores: Resultado
    Sensores-->>Controller: Datos del sensor

    alt Sensor no existe
        Controller->>Sensores: Auto-registrar nuevo sensor
        Sensores->>DB: Insertar sensor
        Note over Controller: Sensor registrado automáticamente
    else Sensor existe
        Controller->>Lecturas: Obtener lecturas anteriores
        Lecturas->>DB: Consultar últimas coordenadas
        DB-->>Lecturas: Historial de ubicaciones
        Controller->>Controller: Detectar si es móvil
        Controller->>Sensores: Actualizar última conexión
        Sensores->>DB: Actualizar sensor
    end

    Controller->>Lecturas: Guardar nueva lectura
    Lecturas->>DB: Insertar lectura
    DB-->>Lecturas: Lectura guardada

    Controller->>Umbrales: Consultar umbrales configurados
    Umbrales->>DB: Obtener umbrales activos
    DB-->>Umbrales: Lista de umbrales
    Umbrales-->>Controller: Umbrales del sensor

    loop Para cada parámetro medido
        Controller->>Controller: Comparar valor vs umbral

        alt Valor fuera de umbral
            Controller->>Controller: Calcular gravedad
            Controller->>Alertas: Crear alerta
            Alertas->>DB: Insertar alerta
            Note over Controller: Alerta generada
        end
    end

    Controller-->>Route: Lectura y alertas
    Route-->>ESP32: Respuesta exitosa
```

**[INSERTAR DIAGRAMA: Secuencia de Lectura y Alerta (imagen exportada)]**

---

#### 4.3.3 Secuencia: Consulta de Lecturas con Filtros (Público)

**Archivos involucrados:**
- Cliente (Frontend público)
- `src/routes/lecturas.js`
- `src/middleware/auth.js`
- `src/controllers/lecturaController.js`
- `prisma.lecturas`, `prisma.sensores` (modelos)
- PostgreSQL

```mermaid
sequenceDiagram
    participant Client as Usuario Público
    participant Route as lecturas.js
    participant Middleware as auth.js
    participant Controller as lecturaController.js
    participant Lecturas as lecturas
    participant Sensores as sensores
    participant DB as PostgreSQL

    Client->>Route: GET /api/lecturas/avanzado
    Route->>Middleware: Verificar token (opcional)
    Note over Middleware: Token no requerido para<br/>consultas públicas
    Middleware-->>Route: Continuar

    Route->>Controller: Procesar solicitud

    Controller->>Controller: Extraer filtros de consulta
    Controller->>Controller: Construir criterios de búsqueda
    Controller->>Controller: Calcular paginación

    Controller->>Lecturas: Buscar lecturas con filtros
    Lecturas->>Sensores: Incluir datos del sensor
    Sensores->>DB: Consultar sensores relacionados
    Lecturas->>DB: Consultar lecturas
    DB-->>Lecturas: Datos encontrados
    DB-->>Sensores: Información de sensores
    Lecturas-->>Controller: Lecturas con sensores

    Controller->>Lecturas: Contar total de resultados
    Lecturas->>DB: Contar registros
    DB-->>Lecturas: Total
    Lecturas-->>Controller: Cantidad total

    Controller->>Controller: Calcular páginas totales

    Controller-->>Route: Lecturas y metadatos de paginación
    Route-->>Client: Respuesta con datos
```

**[INSERTAR DIAGRAMA: Secuencia de Consulta con Filtros (imagen exportada)]**

---

#### 4.3.4 Secuencia: Creación de Sensor (Administrador)

**Archivos involucrados:**
- Administrador (Frontend/Postman)
- `src/routes/sensores.js`
- `src/middleware/auth.js`
- `src/middleware/validation.js`
- `src/controllers/sensorController.js`
- `prisma.sensores`, `prisma.logs_actividad` (modelos)
- PostgreSQL

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant Route as sensores.js
    participant AuthMW as auth.js
    participant ValidMW as validation.js
    participant Controller as sensorController.js
    participant Sensores as sensores
    participant Logs as logs_actividad
    participant DB as PostgreSQL

    Admin->>Route: POST /api/sensores + Token JWT
    Route->>AuthMW: Verificar autenticación
    AuthMW->>AuthMW: Validar token
    AuthMW->>DB: Verificar usuario activo
    DB-->>AuthMW: Usuario válido

    alt Token válido
        AuthMW-->>Route: Autenticación exitosa
    else Token inválido
        AuthMW-->>Admin: Error 401 No autorizado
    end

    Route->>ValidMW: Validar datos del sensor
    ValidMW->>ValidMW: Verificar campos requeridos
    ValidMW->>ValidMW: Validar formato de datos

    alt Datos válidos
        ValidMW-->>Route: Validación exitosa
    else Datos inválidos
        ValidMW-->>Admin: Error 400 Datos incorrectos
    end

    Route->>Controller: Crear sensor

    Controller->>Sensores: Verificar si sensor existe
    Sensores->>DB: Consultar por ID
    DB-->>Sensores: Resultado
    Sensores-->>Controller: Respuesta

    alt Sensor no existe
        Controller->>Sensores: Registrar nuevo sensor
        Sensores->>DB: Insertar sensor
        DB-->>Sensores: Sensor creado

        Controller->>Logs: Registrar acción
        Logs->>DB: Insertar log de actividad

        Controller-->>Route: Sensor creado exitosamente
        Route-->>Admin: Respuesta exitosa
    else Sensor ya existe
        Controller-->>Admin: Error 409 Sensor duplicado
    end
```

**[INSERTAR DIAGRAMA: Secuencia de Creación de Sensor (imagen exportada)]**

---

#### 4.3.5 Secuencia: Configuración de Umbrales

**Archivos involucrados:**
- Administrador
- `src/routes/umbrales.js`
- `src/middleware/auth.js`
- `src/middleware/validation.js`
- `src/controllers/umbralController.js`
- `prisma.sensor_umbral`, `prisma.sensores`, `prisma.logs_actividad` (modelos)
- PostgreSQL

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant Route as umbrales.js
    participant AuthMW as auth.js
    participant ValidMW as validation.js
    participant Controller as umbralController.js
    participant Sensores as sensores
    participant Umbrales as sensor_umbral
    participant Logs as logs_actividad
    participant DB as PostgreSQL

    Admin->>Route: POST /api/umbrales + Token JWT
    Route->>AuthMW: Verificar autenticación
    AuthMW->>AuthMW: Validar token
    AuthMW->>DB: Verificar usuario
    AuthMW-->>Route: Usuario autenticado

    Route->>ValidMW: Validar datos del umbral
    ValidMW->>ValidMW: Verificar campos
    ValidMW->>ValidMW: Validar rangos

    alt Datos válidos
        ValidMW-->>Route: Validación exitosa
    else Datos inválidos
        ValidMW-->>Admin: Error 400 Datos incorrectos
    end

    Route->>Controller: Configurar umbral

    Controller->>Sensores: Verificar que sensor existe
    Sensores->>DB: Consultar sensor
    DB-->>Sensores: Resultado
    Sensores-->>Controller: Sensor encontrado

    alt Sensor no existe
        Controller-->>Admin: Error 404 Sensor no encontrado
    end

    Controller->>Umbrales: Verificar si umbral existe
    Umbrales->>DB: Consultar umbral
    DB-->>Umbrales: Resultado

    alt Umbral no existe
        Controller->>Umbrales: Crear nuevo umbral
        Umbrales->>DB: Insertar umbral
        DB-->>Umbrales: Umbral creado

        Controller->>Logs: Registrar acción
        Logs->>DB: Insertar log

        Controller-->>Route: Umbral configurado
        Route-->>Admin: Respuesta exitosa
    else Umbral ya existe
        Controller-->>Admin: Error 409 Umbral duplicado
    end
```

**[INSERTAR DIAGRAMA: Secuencia de Configuración de Umbrales (imagen exportada)]**

---

#### 4.3.6 Secuencia: Guardar Recorrido (Sensor Móvil)

**Archivos involucrados:**
- Administrador
- `src/routes/recorridos.js`
- `src/middleware/auth.js`
- `src/controllers/recorridosController.js`
- `prisma.recorridos_guardados`, `prisma.sensores`, `prisma.logs_actividad` (modelos)
- PostgreSQL

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant Route as recorridos.js
    participant AuthMW as auth.js
    participant Controller as recorridosController.js
    participant Sensores as sensores
    participant Recorridos as recorridos_guardados
    participant Logs as logs_actividad
    participant DB as PostgreSQL

    Admin->>Route: POST /api/recorridos + Token JWT
    Route->>AuthMW: Verificar autenticación
    AuthMW->>AuthMW: Validar token
    AuthMW->>AuthMW: Extraer datos de usuario
    AuthMW-->>Route: Usuario autenticado

    Route->>Controller: Guardar recorrido

    Controller->>Controller: Validar campos requeridos
    Controller->>Controller: Validar formato GeoJSON

    Controller->>Sensores: Verificar que sensor existe
    Sensores->>DB: Consultar sensor
    DB-->>Sensores: Datos del sensor
    Sensores-->>Controller: Sensor encontrado

    alt Sensor no existe
        Controller-->>Admin: Error 404 Sensor no encontrado
    end

    alt Sensor no es móvil
        Controller-->>Admin: Error 400 Sensor debe ser móvil
    end

    Controller->>Controller: Calcular distancia total
    Controller->>Controller: Calcular duración
    Controller->>Controller: Contar puntos del recorrido

    Controller->>Recorridos: Guardar recorrido
    Recorridos->>DB: Insertar recorrido con GeoJSON
    DB-->>Recorridos: Recorrido guardado
    Recorridos-->>Controller: Datos del recorrido

    Controller->>Logs: Registrar acción
    Logs->>DB: Insertar log de actividad

    Controller-->>Route: Recorrido guardado exitosamente
    Route-->>Admin: Respuesta con datos del recorrido
```

**[INSERTAR DIAGRAMA: Secuencia de Guardar Recorrido (imagen exportada)]**

---

## 5. Modelo de Datos

### 5.1 Esquema de Base de Datos (Prisma)

**8 Tablas Principales:**

```prisma
model sensores {
  id                String   @id @default(uuid())
  nombre            String
  tipo              String
  latitud           Float
  longitud          Float
  ubicacion_descripcion String?
  activo            Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  lecturas          lecturas[]
  sensor_umbral     sensor_umbral[]
}

model lecturas {
  id              Int      @id @default(autoincrement())
  sensor_id       String
  temperatura     Float?
  humedad         Float?
  presion         Float?
  co2             Float?
  timestamp       DateTime @default(now())

  sensor          sensores @relation(fields: [sensor_id], references: [id])
  alertas         alertas[]

  @@index([sensor_id, timestamp])
}

model alertas {
  id              Int      @id @default(autoincrement())
  lectura_id      Int
  tipo            String
  valor_actual    Float
  umbral          Float
  severidad       String
  activa          Boolean  @default(true)
  created_at      DateTime @default(now())
  resuelta_at     DateTime?

  lectura         lecturas @relation(fields: [lectura_id], references: [id])

  @@index([activa, created_at])
}

model sensor_umbral {
  id              Int      @id @default(autoincrement())
  sensor_id       String
  parametro       String
  minimo          Float?
  maximo          Float?
  created_at      DateTime @default(now())

  sensor          sensores @relation(fields: [sensor_id], references: [id])

  @@unique([sensor_id, parametro])
}

model usuarios {
  id              Int      @id @default(autoincrement())
  nombre          String
  email           String   @unique
  password_hash   String
  rol             String   @default("admin")
  activo          Boolean  @default(true)
  created_at      DateTime @default(now())

  logs_actividad  logs_actividad[]
}

model logs_actividad {
  id              Int      @id @default(autoincrement())
  usuario_id      Int
  accion          String
  detalles        String?
  timestamp       DateTime @default(now())

  usuario         usuarios @relation(fields: [usuario_id], references: [id])

  @@index([timestamp])
}

model recorridos_guardados {
  id              Int      @id @default(autoincrement())
  nombre          String
  sensores        Json
  created_at      DateTime @default(now())
}

model preferencias_sistema {
  id              Int      @id @default(autoincrement())
  clave           String   @unique
  valor           String
  updated_at      DateTime @updatedAt
}
```

**[INSERTAR DIAGRAMA: Modelo Entidad-Relación (ERD)]**

### 5.2 Relaciones

| Tabla | Relación | Tabla Relacionada | Tipo |
|-------|----------|-------------------|------|
| sensores | 1:N | lecturas | Un sensor tiene muchas lecturas |
| sensores | 1:N | sensor_umbral | Un sensor tiene múltiples umbrales |
| lecturas | 1:N | alertas | Una lectura puede generar múltiples alertas |
| usuarios | 1:N | logs_actividad | Un usuario tiene muchos logs |

### 5.3 Índices Optimizados

```sql
-- Índices para mejorar rendimiento de consultas frecuentes
CREATE INDEX idx_lecturas_sensor_timestamp ON lecturas(sensor_id, timestamp);
CREATE INDEX idx_alertas_activa_created ON alertas(activa, created_at);
CREATE INDEX idx_logs_timestamp ON logs_actividad(timestamp);
```

---

## 6. Stack Tecnológico

### 6.1 Dependencias de Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **node** | 22.16.0 | Runtime de JavaScript |
| **express** | 4.21.2 | Framework web |
| **@prisma/client** | 6.14.0 | ORM para PostgreSQL |
| **jsonwebtoken** | 9.0.2 | Autenticación JWT |
| **bcryptjs** | 2.4.3 | Hash de contraseñas |
| **express-validator** | 7.2.1 | Validación de datos |
| **helmet** | 8.1.0 | Seguridad HTTP headers |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing |
| **express-rate-limit** | 7.5.0 | Rate limiting |
| **dotenv** | 16.4.7 | Variables de entorno |

### 6.2 Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **prisma** | 6.14.0 | CLI de Prisma |
| **nodemon** | 3.1.9 | Hot reload en desarrollo |
| **jest** | 29.7.0 | Framework de testing |
| **supertest** | 7.0.0 | Tests de API |

### 6.3 Requisitos del Sistema

```json
{
  "node": ">=22.16.0",
  "npm": ">=10.0.0",
  "postgresql": ">=12.0",
  "os": ["linux", "darwin", "win32"]
}
```

---

## 7. Seguridad

### 7.1 Autenticación JWT

**Configuración:**
```javascript
// Token configuration
const JWT_SECRET = process.env.JWT_SECRET; // 128 caracteres hex
const JWT_EXPIRATION = '8h';

// Token generation
const token = jwt.sign(
  { id: user.id, email: user.email, rol: user.rol },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRATION }
);
```

**Headers requeridos:**
```
Authorization: Bearer <token>
```

### 7.2 Hash de Contraseñas

```javascript
// Bcrypt configuration
const SALT_ROUNDS = 10;

// Password hashing
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Password verification
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 7.3 Helmet.js - Protección HTTP

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 7.4 CORS Configurado

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 7.5 Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: 'Demasiadas peticiones, intente más tarde'
});

app.use('/api/', limiter);
```

### 7.6 Validación de Datos

```javascript
// Ejemplo: Validación de creación de sensor
const sensorValidation = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('tipo').isIn(['temperatura', 'humedad', 'presion', 'co2']),
  body('latitud').isFloat({ min: -90, max: 90 }),
  body('longitud').isFloat({ min: -180, max: 180 })
];
```

### 7.7 Mejores Prácticas Implementadas

- ✅ Variables sensibles en `.env` (no en código)
- ✅ `.env` en `.gitignore`
- ✅ SQL Injection protegido (Prisma ORM)
- ✅ XSS protegido (Helmet + validación)
- ✅ CSRF mitigado (SameSite cookies)
- ✅ Secrets rotation recomendado cada 90 días
- ✅ HTTPS requerido en producción

---

## 8. Instalación y Configuración

### 8.1 Prerrequisitos

```bash
# Verificar versiones
node --version  # v22.16.0 o superior
npm --version   # 10.0.0 o superior
psql --version  # PostgreSQL 12 o superior
```

### 8.2 Instalación Paso a Paso

**1. Clonar el repositorio:**
```bash
git clone <repository-url>
cd sensor_monitoreo
```

**2. Instalar dependencias:**
```bash
npm install
```

**3. Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Contenido de `.env`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sensor_db"

# JWT
JWT_SECRET="<generar_secret_128_caracteres_hex>"

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:5173"
```

**4. Configurar base de datos:**
```bash
# Crear base de datos PostgreSQL
createdb sensor_db

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Seed de datos iniciales
npx prisma db seed
```

**5. Iniciar servidor de desarrollo:**
```bash
npm run dev
```

### 8.3 Scripts Disponibles

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

### 8.4 Generar JWT Secret

```bash
# Opción 1: OpenSSL
openssl rand -hex 64

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 9. Estructura del Proyecto

```
sensor_monitoreo/
│
├── src/
│   ├── index.js                 # Punto de entrada
│   ├── app.js                   # Configuración de Express
│   │
│   ├── routes/                  # Rutas de la API
│   │   ├── auth.routes.js
│   │   ├── sensores.routes.js
│   │   ├── lecturas.routes.js
│   │   ├── alertas.routes.js
│   │   ├── umbrales.routes.js
│   │   ├── recorridos.routes.js
│   │   ├── preferencias.routes.js
│   │   └── logs.routes.js
│   │
│   ├── controllers/             # Controladores
│   │   ├── authController.js
│   │   ├── sensoresController.js
│   │   ├── lecturasController.js
│   │   ├── alertasController.js
│   │   ├── umbralesController.js
│   │   ├── recorridosController.js
│   │   ├── preferenciasController.js
│   │   └── logsController.js
│   │
│   ├── services/                # Lógica de negocio
│   │   ├── alertService.js
│   │   └── statsService.js
│   │
│   ├── middlewares/             # Middleware personalizado
│   │   ├── auth.js              # Verificación JWT
│   │   ├── errorHandler.js      # Manejo de errores
│   │   └── validator.js         # Validaciones
│   │
│   └── utils/                   # Utilidades
│       ├── logger.js
│       └── helpers.js
│
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   ├── migrations/              # Migraciones SQL
│   └── seed.js                  # Datos iniciales
│
├── tests/                       # Tests
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── sensores.test.js
│   │   └── lecturas.test.js
│   └── unit/
│       └── alertService.test.js
│
├── docs/                        # Documentación
│   ├── Actividad_04_Desarrollo_Backend.md
│   ├── Entregable_04_Manual_Tecnico_Backend.md
│   └── Entregable_04_Manual_API.md
│
├── .env.example                 # Plantilla de variables
├── .gitignore
├── package.json
└── README.md
```

---

## 10. Testing

### 10.1 Estrategia de Testing

| Tipo | Herramienta | Cobertura Objetivo |
|------|-------------|-------------------|
| **Tests Unitarios** | Jest | 80% |
| **Tests de Integración** | Jest + Supertest | 75% |
| **Tests E2E** | Manual | N/A |

### 10.2 Ejecución de Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con coverage
npm test -- --coverage

# Ejecutar en modo watch
npm run test:watch

# Ejecutar tests específicos
npm test -- auth.test.js
```

### 10.3 Ejemplo de Test de Integración

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/auth/login', () => {
  it('should return JWT token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@iiap.gob.pe',
        password: 'Admin2024!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('usuario');
  });

  it('should return 401 with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@iiap.gob.pe',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
```

### 10.4 Cobertura Alcanzada

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   75.2  |   68.4   |   72.1  |   75.8  |
 controllers/          |   78.3  |   70.2   |   75.0  |   79.1  |
 services/             |   82.1  |   75.3   |   80.0  |   82.9  |
 middlewares/          |   71.5  |   65.8   |   68.2  |   72.3  |
 routes/               |   70.2  |   60.1   |   65.5  |   71.0  |
-----------------------|---------|----------|---------|---------|
```

---

## 11. Despliegue

### 11.1 Despliegue en Producción (Render/Railway)

**1. Configurar variables de entorno en plataforma:**
```env
DATABASE_URL=<postgresql_production_url>
JWT_SECRET=<production_secret>
NODE_ENV=production
FRONTEND_URL=<frontend_production_url>
```

**2. Configurar build command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**3. Configurar start command:**
```bash
npm start
```

### 11.2 Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET rotado (diferente a desarrollo)
- [ ] DATABASE_URL apuntando a producción
- [ ] CORS configurado con dominio real
- [ ] HTTPS habilitado
- [ ] Rate limiting activado
- [ ] Logs configurados (Winston/Pino)
- [ ] Monitoring configurado (Sentry/Datadog)
- [ ] Backups de BD automatizados
- [ ] Tests pasando (100%)

### 11.3 Escalabilidad

**Recomendaciones:**
- Usar PostgreSQL con connection pooling (PgBouncer)
- Implementar cache con Redis para lecturas frecuentes
- Considerar CDN para assets estáticos
- Load balancer para múltiples instancias (Nginx)

---

## Apéndices

### A. Glosario

| Término | Definición |
|---------|-----------|
| **IoT** | Internet of Things - Dispositivos conectados |
| **JWT** | JSON Web Token - Estándar de autenticación |
| **ORM** | Object-Relational Mapping - Mapeo objeto-relacional |
| **SCRUM** | Framework ágil de gestión de proyectos |
| **User Story** | Descripción de funcionalidad desde perspectiva del usuario |
| **Sprint** | Iteración de trabajo de duración fija (7 días en este proyecto) |
| **Velocity** | Puntos de historia completados por sprint |

### B. Referencias

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [SCRUM Guide](https://scrumguides.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### C. Control de Versiones del Documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0.0 | 10/10/2025 | Desarrollador | Versión inicial completa |

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Período:** 15/09/2025 - 10/10/2025
**Metodología:** SCRUM para 1 Desarrollador
**Estado:** Producción v1.0.0
