# Manual de Consumo de la API
## Sistema de Monitoreo Ambiental IIAP

**Versión de la API:** v1.0.0
**Base URL:** `http://localhost:3000/api`
**Producción:** `https://api-sensor-iiap.com/api`
**Fecha:** 10/10/2025

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Autenticación](#2-autenticación)
3. [Endpoints Públicos](#3-endpoints-públicos)
4. [Endpoints Privados (Admin)](#4-endpoints-privados-admin)
5. [Códigos de Estado HTTP](#5-códigos-de-estado-http)
6. [Manejo de Errores](#6-manejo-de-errores)
7. [Ejemplos de Uso](#7-ejemplos-de-uso)
8. [Rate Limiting](#8-rate-limiting)
9. [Postman Collection](#9-postman-collection)

---

## 1. Introducción

### 1.1 Descripción de la API

La API REST del Sistema de Monitoreo Ambiental IIAP proporciona:
- **Endpoints públicos** para consultar datos de sensores y lecturas (sin autenticación)
- **Endpoints privados** para administración (requieren autenticación JWT)
- **32 endpoints** organizados en 9 categorías

### 1.2 Formato de Datos

- **Request:** JSON (`Content-Type: application/json`)
- **Response:** JSON con estructura estándar
- **Timestamps:** ISO 8601 (`2025-09-15T14:30:00.000Z`)
- **IDs:** UUID v4 para sensores, Int para lecturas

### 1.3 Estructura de Respuesta Estándar

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Respuesta con Error:**
```json
{
  "success": false,
  "error": "Mensaje de error",
  "details": { ... }
}
```

---

## 2. Autenticación

### 2.1 Obtener Token JWT

**Endpoint:** `POST /api/auth/login`
**Acceso:** Público
**Descripción:** Autenticar administrador y obtener token JWT

**Request Body:**
```json
{
  "email": "admin@iiap.gob.pe",
  "password": "Admin2024!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Administrador IIAP",
      "email": "admin@iiap.gob.pe",
      "rol": "admin"
    }
  },
  "message": "Login exitoso"
}
```

**Errores:**
- `400` - Datos incompletos
- `401` - Credenciales inválidas
- `403` - Usuario inactivo

---

### 2.2 Verificar Token

**Endpoint:** `GET /api/auth/verify`
**Acceso:** Privado
**Descripción:** Validar token JWT activo

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@iiap.gob.pe",
    "rol": "admin"
  },
  "message": "Token válido"
}
```

---

### 2.3 Logout

**Endpoint:** `POST /api/auth/logout`
**Acceso:** Privado
**Descripción:** Cerrar sesión (registra en logs)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## 3. Endpoints Públicos

Los siguientes endpoints **NO requieren autenticación** y están disponibles para acceso público.

---

### 3.1 Sensores

#### 3.1.1 Listar Sensores Activos

**Endpoint:** `GET /api/sensores`
**Descripción:** Obtener todos los sensores activos

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `tipo` | String | Filtrar por tipo de sensor | `?tipo=temperatura` |
| `activo` | Boolean | Filtrar por estado | `?activo=true` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "nombre": "Sensor Temperatura - Lab 1",
      "tipo": "temperatura",
      "latitud": -3.7437,
      "longitud": -73.2516,
      "ubicacion_descripcion": "Laboratorio de Investigación #1",
      "activo": true,
      "created_at": "2025-09-15T10:00:00.000Z",
      "updated_at": "2025-09-20T14:30:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "nombre": "Sensor Humedad - Invernadero",
      "tipo": "humedad",
      "latitud": -3.7440,
      "longitud": -73.2520,
      "ubicacion_descripcion": "Invernadero Principal",
      "activo": true,
      "created_at": "2025-09-16T11:00:00.000Z",
      "updated_at": "2025-09-21T15:45:00.000Z"
    }
  ],
  "count": 2
}
```

---

#### 3.1.2 Obtener Sensor por ID

**Endpoint:** `GET /api/sensores/:id`
**Descripción:** Obtener detalles de un sensor específico

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nombre": "Sensor Temperatura - Lab 1",
    "tipo": "temperatura",
    "latitud": -3.7437,
    "longitud": -73.2516,
    "ubicacion_descripcion": "Laboratorio de Investigación #1",
    "activo": true,
    "created_at": "2025-09-15T10:00:00.000Z",
    "updated_at": "2025-09-20T14:30:00.000Z",
    "_count": {
      "lecturas": 1523,
      "sensor_umbral": 2
    }
  }
}
```

**Errores:**
- `404` - Sensor no encontrado

---

### 3.2 Lecturas

#### 3.2.1 Listar Lecturas

**Endpoint:** `GET /api/lecturas`
**Descripción:** Obtener lecturas con filtros y paginación

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `sensor_id` | UUID | Filtrar por sensor | `?sensor_id=a1b2c3d4...` |
| `tipo` | String | Filtrar por tipo de sensor | `?tipo=temperatura` |
| `start` | ISO Date | Fecha inicio | `?start=2025-09-01T00:00:00Z` |
| `end` | ISO Date | Fecha fin | `?end=2025-09-30T23:59:59Z` |
| `page` | Integer | Número de página (default: 1) | `?page=2` |
| `limit` | Integer | Resultados por página (default: 50, max: 100) | `?limit=20` |
| `order` | String | Ordenamiento (`asc` o `desc`, default: `desc`) | `?order=asc` |

**Ejemplo de URL:**
```
GET /api/lecturas?sensor_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&start=2025-09-15T00:00:00Z&end=2025-09-20T23:59:59Z&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "temperatura": 24.5,
      "humedad": 65.2,
      "presion": null,
      "co2": null,
      "timestamp": "2025-09-20T14:30:00.000Z",
      "sensor": {
        "nombre": "Sensor Temperatura - Lab 1",
        "tipo": "temperatura"
      }
    },
    {
      "id": 1002,
      "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "temperatura": 25.1,
      "humedad": 63.8,
      "presion": null,
      "co2": null,
      "timestamp": "2025-09-20T14:35:00.000Z",
      "sensor": {
        "nombre": "Sensor Temperatura - Lab 1",
        "tipo": "temperatura"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 152,
    "totalPages": 16
  }
}
```

---

#### 3.2.2 Obtener Últimas Lecturas

**Endpoint:** `GET /api/lecturas/latest`
**Descripción:** Obtener las últimas N lecturas de todos los sensores

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `limit` | Integer | Cantidad de lecturas (default: 10, max: 50) | `?limit=5` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2050,
      "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "temperatura": 26.3,
      "humedad": 62.5,
      "timestamp": "2025-09-30T18:45:00.000Z",
      "sensor": {
        "nombre": "Sensor Temperatura - Lab 1",
        "tipo": "temperatura",
        "ubicacion_descripcion": "Laboratorio de Investigación #1"
      }
    }
  ],
  "count": 5
}
```

---

#### 3.2.3 Obtener Estadísticas

**Endpoint:** `GET /api/lecturas/stats`
**Descripción:** Obtener estadísticas agregadas (promedio, máx, mín)

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `sensor_id` | UUID | Sensor específico (requerido) | `?sensor_id=a1b2c3d4...` |
| `start` | ISO Date | Fecha inicio (requerido) | `?start=2025-09-01T00:00:00Z` |
| `end` | ISO Date | Fecha fin (requerido) | `?end=2025-09-30T23:59:59Z` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "periodo": {
      "inicio": "2025-09-01T00:00:00.000Z",
      "fin": "2025-09-30T23:59:59.000Z"
    },
    "temperatura": {
      "promedio": 24.8,
      "minimo": 18.2,
      "maximo": 31.5,
      "count": 1440
    },
    "humedad": {
      "promedio": 64.3,
      "minimo": 45.0,
      "maximo": 82.1,
      "count": 1440
    }
  }
}
```

**Errores:**
- `400` - Parámetros faltantes (sensor_id, start, end)

---

### 3.3 Alertas

#### 3.3.1 Listar Alertas Activas

**Endpoint:** `GET /api/alertas`
**Descripción:** Obtener alertas activas (públicas)

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `activa` | Boolean | Filtrar por estado (default: true) | `?activa=false` |
| `severidad` | String | Filtrar por severidad | `?severidad=alta` |
| `limit` | Integer | Resultados (default: 50) | `?limit=20` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "lectura_id": 1523,
      "tipo": "temperatura",
      "valor_actual": 32.5,
      "umbral": 30.0,
      "severidad": "alta",
      "activa": true,
      "created_at": "2025-09-25T16:20:00.000Z",
      "resuelta_at": null,
      "lectura": {
        "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "timestamp": "2025-09-25T16:20:00.000Z",
        "sensor": {
          "nombre": "Sensor Temperatura - Lab 1",
          "ubicacion_descripcion": "Laboratorio de Investigación #1"
        }
      }
    }
  ],
  "count": 1
}
```

---

### 3.4 Recorridos Guardados

#### 3.4.1 Listar Recorridos

**Endpoint:** `GET /api/recorridos`
**Descripción:** Obtener recorridos guardados públicos

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Recorrido Zona Laboratorios",
      "sensores": [
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "b2c3d4e5-f6a7-8901-bcde-f12345678901"
      ],
      "created_at": "2025-09-18T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 4. Endpoints Privados (Admin)

Los siguientes endpoints **requieren autenticación JWT** mediante header `Authorization: Bearer <token>`.

---

### 4.1 Gestión de Sensores (Admin)

#### 4.1.1 Crear Sensor

**Endpoint:** `POST /api/sensores`
**Acceso:** Privado (Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Sensor CO2 - Oficinas",
  "tipo": "co2",
  "latitud": -3.7445,
  "longitud": -73.2525,
  "ubicacion_descripcion": "Edificio Administrativo - Piso 2",
  "activo": true
}
```

**Validaciones:**
- `nombre`: String, requerido, 3-100 caracteres
- `tipo`: Enum (`temperatura`, `humedad`, `presion`, `co2`), requerido
- `latitud`: Float, requerido, rango [-90, 90]
- `longitud`: Float, requerido, rango [-180, 180]
- `ubicacion_descripcion`: String, opcional, max 255 caracteres
- `activo`: Boolean, opcional (default: true)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "nombre": "Sensor CO2 - Oficinas",
    "tipo": "co2",
    "latitud": -3.7445,
    "longitud": -73.2525,
    "ubicacion_descripcion": "Edificio Administrativo - Piso 2",
    "activo": true,
    "created_at": "2025-09-30T10:15:00.000Z",
    "updated_at": "2025-09-30T10:15:00.000Z"
  },
  "message": "Sensor creado exitosamente"
}
```

**Errores:**
- `400` - Datos de validación inválidos
- `401` - Token inválido o expirado
- `409` - Sensor duplicado (mismo nombre y ubicación)

---

#### 4.1.2 Actualizar Sensor

**Endpoint:** `PUT /api/sensores/:id`
**Acceso:** Privado (Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (parcial):**
```json
{
  "nombre": "Sensor CO2 - Oficinas (Actualizado)",
  "activo": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "nombre": "Sensor CO2 - Oficinas (Actualizado)",
    "tipo": "co2",
    "activo": false,
    "updated_at": "2025-09-30T11:20:00.000Z"
  },
  "message": "Sensor actualizado exitosamente"
}
```

**Errores:**
- `404` - Sensor no encontrado

---

#### 4.1.3 Eliminar Sensor

**Endpoint:** `DELETE /api/sensores/:id`
**Acceso:** Privado (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sensor eliminado exitosamente"
}
```

**Errores:**
- `404` - Sensor no encontrado
- `409` - Sensor tiene lecturas asociadas (considerar desactivar en lugar de eliminar)

---

### 4.2 Gestión de Lecturas (Admin)

#### 4.2.1 Crear Lectura Manualmente

**Endpoint:** `POST /api/lecturas`
**Acceso:** Privado (Admin o Sensor IoT)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "temperatura": 25.3,
  "humedad": 64.8,
  "presion": 1013.2,
  "co2": null
}
```

**Validaciones:**
- `sensor_id`: UUID, requerido, debe existir
- `temperatura`: Float, opcional
- `humedad`: Float, opcional, rango [0, 100]
- `presion`: Float, opcional
- `co2`: Float, opcional
- **Nota:** Al menos un parámetro de medición debe estar presente

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2051,
    "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "temperatura": 25.3,
    "humedad": 64.8,
    "presion": 1013.2,
    "co2": null,
    "timestamp": "2025-09-30T12:00:00.000Z"
  },
  "alertas": [],
  "message": "Lectura registrada exitosamente"
}
```

**Con Alerta Generada:**
```json
{
  "success": true,
  "data": {
    "id": 2052,
    "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "temperatura": 35.5,
    "timestamp": "2025-09-30T12:05:00.000Z"
  },
  "alertas": [
    {
      "id": 46,
      "tipo": "temperatura",
      "valor_actual": 35.5,
      "umbral": 30.0,
      "severidad": "alta",
      "activa": true
    }
  ],
  "message": "Lectura registrada con 1 alerta generada"
}
```

**Errores:**
- `400` - Datos inválidos o sensor_id no existe
- `422` - Ningún parámetro de medición proporcionado

---

#### 4.2.2 Eliminar Lectura

**Endpoint:** `DELETE /api/lecturas/:id`
**Acceso:** Privado (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lectura eliminada exitosamente"
}
```

---

### 4.3 Gestión de Umbrales

#### 4.3.1 Configurar Umbral de Sensor

**Endpoint:** `POST /api/umbrales`
**Acceso:** Privado (Admin)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parametro": "temperatura",
  "minimo": 15.0,
  "maximo": 30.0
}
```

**Validaciones:**
- `sensor_id`: UUID, requerido
- `parametro`: Enum (`temperatura`, `humedad`, `presion`, `co2`), requerido
- `minimo`: Float, opcional
- `maximo`: Float, opcional
- **Nota:** Al menos `minimo` o `maximo` debe estar presente

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "parametro": "temperatura",
    "minimo": 15.0,
    "maximo": 30.0,
    "created_at": "2025-09-30T13:00:00.000Z"
  },
  "message": "Umbral configurado exitosamente"
}
```

**Errores:**
- `409` - Umbral ya existe para este sensor y parámetro (usar PUT para actualizar)

---

#### 4.3.2 Actualizar Umbral

**Endpoint:** `PUT /api/umbrales/:id`
**Acceso:** Privado (Admin)

**Request Body:**
```json
{
  "minimo": 18.0,
  "maximo": 28.0
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "parametro": "temperatura",
    "minimo": 18.0,
    "maximo": 28.0
  },
  "message": "Umbral actualizado exitosamente"
}
```

---

#### 4.3.3 Listar Umbrales de Sensor

**Endpoint:** `GET /api/umbrales/:sensor_id`
**Acceso:** Privado (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "parametro": "temperatura",
      "minimo": 18.0,
      "maximo": 28.0,
      "created_at": "2025-09-30T13:00:00.000Z"
    },
    {
      "id": 13,
      "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "parametro": "humedad",
      "minimo": 40.0,
      "maximo": 80.0,
      "created_at": "2025-09-30T13:05:00.000Z"
    }
  ],
  "count": 2
}
```

---

#### 4.3.4 Eliminar Umbral

**Endpoint:** `DELETE /api/umbrales/:id`
**Acceso:** Privado (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Umbral eliminado exitosamente"
}
```

---

### 4.4 Gestión de Alertas (Admin)

#### 4.4.1 Resolver Alerta

**Endpoint:** `PUT /api/alertas/:id/resolver`
**Acceso:** Privado (Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "activa": false,
    "resuelta_at": "2025-09-30T14:00:00.000Z"
  },
  "message": "Alerta resuelta exitosamente"
}
```

---

#### 4.4.2 Eliminar Alerta

**Endpoint:** `DELETE /api/alertas/:id`
**Acceso:** Privado (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alerta eliminada exitosamente"
}
```

---

### 4.5 Recorridos Guardados (Admin)

#### 4.5.1 Crear Recorrido

**Endpoint:** `POST /api/recorridos`
**Acceso:** Privado (Admin)

**Request Body:**
```json
{
  "nombre": "Recorrido Zona Invernaderos",
  "sensores": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "c3d4e5f6-a7b8-9012-cdef-123456789012"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Recorrido Zona Invernaderos",
    "sensores": ["a1b2c3d4...", "b2c3d4e5...", "c3d4e5f6..."],
    "created_at": "2025-09-30T15:00:00.000Z"
  },
  "message": "Recorrido guardado exitosamente"
}
```

---

#### 4.5.2 Actualizar Recorrido

**Endpoint:** `PUT /api/recorridos/:id`
**Acceso:** Privado (Admin)

**Request Body:**
```json
{
  "nombre": "Recorrido Zona Invernaderos (Actualizado)",
  "sensores": ["a1b2c3d4...", "b2c3d4e5..."]
}
```

---

#### 4.5.3 Eliminar Recorrido

**Endpoint:** `DELETE /api/recorridos/:id`
**Acceso:** Privado (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Recorrido eliminado exitosamente"
}
```

---

### 4.6 Logs de Actividad

#### 4.6.1 Listar Logs

**Endpoint:** `GET /api/logs`
**Acceso:** Privado (Admin)

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `usuario_id` | Integer | Filtrar por usuario | `?usuario_id=1` |
| `accion` | String | Filtrar por tipo de acción | `?accion=CREATE_SENSOR` |
| `start` | ISO Date | Fecha inicio | `?start=2025-09-01T00:00:00Z` |
| `end` | ISO Date | Fecha fin | `?end=2025-09-30T23:59:59Z` |
| `limit` | Integer | Resultados (default: 50) | `?limit=100` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 245,
      "usuario_id": 1,
      "accion": "CREATE_SENSOR",
      "detalles": "{\"sensor_id\":\"c3d4e5f6...\",\"nombre\":\"Sensor CO2 - Oficinas\"}",
      "timestamp": "2025-09-30T10:15:00.000Z",
      "usuario": {
        "nombre": "Administrador IIAP",
        "email": "admin@iiap.gob.pe"
      }
    }
  ],
  "count": 1
}
```

---

### 4.7 Preferencias del Sistema

#### 4.7.1 Obtener Preferencias

**Endpoint:** `GET /api/preferencias`
**Acceso:** Privado (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "clave": "intervalo_lecturas",
      "valor": "300",
      "updated_at": "2025-09-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "clave": "retencion_datos_dias",
      "valor": "365",
      "updated_at": "2025-09-15T10:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

#### 4.7.2 Actualizar Preferencia

**Endpoint:** `PUT /api/preferencias/:clave`
**Acceso:** Privado (Admin)

**Request Body:**
```json
{
  "valor": "600"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "clave": "intervalo_lecturas",
    "valor": "600",
    "updated_at": "2025-09-30T16:00:00.000Z"
  },
  "message": "Preferencia actualizada exitosamente"
}
```

---

## 5. Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Petición exitosa (GET, PUT, DELETE) |
| **201** | Created | Recurso creado exitosamente (POST) |
| **400** | Bad Request | Datos de entrada inválidos |
| **401** | Unauthorized | Token JWT inválido o expirado |
| **403** | Forbidden | Usuario sin permisos |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto (recurso duplicado) |
| **422** | Unprocessable Entity | Validación de negocio fallida |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Error del servidor |

---

## 6. Manejo de Errores

### 6.1 Estructura de Error Estándar

```json
{
  "success": false,
  "error": "Mensaje de error descriptivo",
  "details": {
    "field": "nombre",
    "message": "El nombre es requerido"
  },
  "code": "VALIDATION_ERROR"
}
```

### 6.2 Códigos de Error Personalizados

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Error de validación de datos |
| `AUTH_TOKEN_INVALID` | Token JWT inválido |
| `AUTH_TOKEN_EXPIRED` | Token JWT expirado |
| `RESOURCE_NOT_FOUND` | Recurso no encontrado |
| `DUPLICATE_RESOURCE` | Recurso duplicado |
| `UNAUTHORIZED` | Sin autorización |
| `RATE_LIMIT_EXCEEDED` | Límite de peticiones excedido |

### 6.3 Ejemplos de Errores

**Error de Validación (400):**
```json
{
  "success": false,
  "error": "Datos de validación inválidos",
  "details": [
    {
      "field": "latitud",
      "message": "Debe estar entre -90 y 90"
    },
    {
      "field": "tipo",
      "message": "Debe ser: temperatura, humedad, presion o co2"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

**Error de Autenticación (401):**
```json
{
  "success": false,
  "error": "Token JWT inválido o expirado",
  "code": "AUTH_TOKEN_EXPIRED"
}
```

**Error de Recurso No Encontrado (404):**
```json
{
  "success": false,
  "error": "Sensor no encontrado",
  "details": {
    "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "code": "RESOURCE_NOT_FOUND"
}
```

---

## 7. Ejemplos de Uso

### 7.1 cURL

#### Ejemplo 1: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iiap.gob.pe",
    "password": "Admin2024!"
  }'
```

#### Ejemplo 2: Crear Sensor (con JWT)
```bash
curl -X POST http://localhost:3000/api/sensores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nombre": "Sensor Presión - Lab 2",
    "tipo": "presion",
    "latitud": -3.7450,
    "longitud": -73.2530,
    "ubicacion_descripcion": "Laboratorio #2"
  }'
```

#### Ejemplo 3: Consultar Lecturas con Filtros
```bash
curl -X GET "http://localhost:3000/api/lecturas?sensor_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&start=2025-09-01T00:00:00Z&end=2025-09-30T23:59:59Z&limit=10"
```

#### Ejemplo 4: Obtener Estadísticas
```bash
curl -X GET "http://localhost:3000/api/lecturas/stats?sensor_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&start=2025-09-01T00:00:00Z&end=2025-09-30T23:59:59Z"
```

---

### 7.2 JavaScript (Fetch API)

#### Ejemplo 1: Login y Almacenar Token
```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    // Guardar token en localStorage
    localStorage.setItem('token', data.data.token);
    console.log('Login exitoso:', data.data.usuario);
    return data.data.token;
  } else {
    console.error('Error:', data.error);
  }
}

// Uso
login('admin@iiap.gob.pe', 'Admin2024!');
```

---

#### Ejemplo 2: Crear Lectura (Sensor IoT)
```javascript
async function enviarLectura(sensorId, datos) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/lecturas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sensor_id: sensorId,
      temperatura: datos.temperatura,
      humedad: datos.humedad,
      presion: datos.presion,
      co2: datos.co2
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Lectura enviada:', result.data);
    if (result.alertas && result.alertas.length > 0) {
      console.warn('Alertas generadas:', result.alertas);
    }
  } else {
    console.error('Error:', result.error);
  }
}

// Uso
enviarLectura('a1b2c3d4-e5f6-7890-abcd-ef1234567890', {
  temperatura: 26.5,
  humedad: 62.3,
  presion: 1012.5,
  co2: null
});
```

---

#### Ejemplo 3: Obtener Lecturas Filtradas
```javascript
async function obtenerLecturas(sensorId, fechaInicio, fechaFin) {
  const params = new URLSearchParams({
    sensor_id: sensorId,
    start: fechaInicio,
    end: fechaFin,
    limit: 20
  });

  const response = await fetch(`http://localhost:3000/api/lecturas?${params}`);
  const data = await response.json();

  if (data.success) {
    console.log(`Total: ${data.pagination.total} lecturas`);
    return data.data;
  }
}

// Uso
obtenerLecturas(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2025-09-01T00:00:00Z',
  '2025-09-30T23:59:59Z'
).then(lecturas => {
  lecturas.forEach(lectura => {
    console.log(`${lectura.timestamp}: ${lectura.temperatura}°C`);
  });
});
```

---

#### Ejemplo 4: Configurar Umbral
```javascript
async function configurarUmbral(sensorId, parametro, minimo, maximo) {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/api/umbrales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sensor_id: sensorId,
      parametro: parametro,
      minimo: minimo,
      maximo: maximo
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('Umbral configurado:', data.data);
  } else {
    console.error('Error:', data.error);
  }
}

// Uso
configurarUmbral(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'temperatura',
  18.0,
  28.0
);
```

---

### 7.3 Python (Requests)

#### Ejemplo 1: Cliente Completo
```python
import requests
from datetime import datetime, timedelta

class IIAPSensorAPI:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
        self.token = None

    def login(self, email, password):
        """Autenticarse y obtener token"""
        response = requests.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )
        data = response.json()
        if data['success']:
            self.token = data['data']['token']
            print(f"Login exitoso: {data['data']['usuario']['nombre']}")
            return True
        else:
            print(f"Error: {data['error']}")
            return False

    def get_headers(self):
        """Obtener headers con autenticación"""
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

    def crear_sensor(self, nombre, tipo, latitud, longitud, descripcion=None):
        """Crear nuevo sensor"""
        payload = {
            'nombre': nombre,
            'tipo': tipo,
            'latitud': latitud,
            'longitud': longitud,
            'ubicacion_descripcion': descripcion
        }
        response = requests.post(
            f'{self.base_url}/sensores',
            json=payload,
            headers=self.get_headers()
        )
        return response.json()

    def enviar_lectura(self, sensor_id, temperatura=None, humedad=None,
                       presion=None, co2=None):
        """Enviar lectura de sensor"""
        payload = {'sensor_id': sensor_id}
        if temperatura is not None:
            payload['temperatura'] = temperatura
        if humedad is not None:
            payload['humedad'] = humedad
        if presion is not None:
            payload['presion'] = presion
        if co2 is not None:
            payload['co2'] = co2

        response = requests.post(
            f'{self.base_url}/lecturas',
            json=payload,
            headers=self.get_headers()
        )
        return response.json()

    def obtener_lecturas(self, sensor_id, fecha_inicio, fecha_fin, limit=50):
        """Obtener lecturas con filtros"""
        params = {
            'sensor_id': sensor_id,
            'start': fecha_inicio.isoformat() + 'Z',
            'end': fecha_fin.isoformat() + 'Z',
            'limit': limit
        }
        response = requests.get(
            f'{self.base_url}/lecturas',
            params=params
        )
        return response.json()

    def obtener_estadisticas(self, sensor_id, fecha_inicio, fecha_fin):
        """Obtener estadísticas"""
        params = {
            'sensor_id': sensor_id,
            'start': fecha_inicio.isoformat() + 'Z',
            'end': fecha_fin.isoformat() + 'Z'
        }
        response = requests.get(
            f'{self.base_url}/lecturas/stats',
            params=params
        )
        return response.json()

# Uso
if __name__ == '__main__':
    api = IIAPSensorAPI()

    # Login
    api.login('admin@iiap.gob.pe', 'Admin2024!')

    # Crear sensor
    sensor = api.crear_sensor(
        nombre='Sensor Python Test',
        tipo='temperatura',
        latitud=-3.7437,
        longitud=-73.2516,
        descripcion='Sensor de prueba desde Python'
    )
    print(f"Sensor creado: {sensor['data']['id']}")

    # Enviar lectura
    lectura = api.enviar_lectura(
        sensor_id=sensor['data']['id'],
        temperatura=25.5,
        humedad=65.0
    )
    print(f"Lectura enviada: {lectura['data']['id']}")

    # Obtener lecturas
    hoy = datetime.now()
    ayer = hoy - timedelta(days=1)
    lecturas = api.obtener_lecturas(
        sensor_id=sensor['data']['id'],
        fecha_inicio=ayer,
        fecha_fin=hoy
    )
    print(f"Total de lecturas: {lecturas['pagination']['total']}")
```

---

## 8. Rate Limiting

### 8.1 Límites Configurados

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| **Públicos** | 100 requests | 15 minutos |
| **Privados (Admin)** | 200 requests | 15 minutos |
| **POST /api/lecturas** | 1000 requests | 15 minutos (para sensores IoT) |

### 8.2 Headers de Rate Limit

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1632758400
```

### 8.3 Respuesta al Exceder Límite (429)

```json
{
  "success": false,
  "error": "Demasiadas peticiones. Intente más tarde.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 900
}
```

---

## 9. Postman Collection

### 9.1 Importar Colección

**Archivo:** `postman_collection.json` (adjunto en repositorio)

**Pasos:**
1. Abrir Postman
2. File → Import
3. Seleccionar `postman_collection.json`
4. Configurar variables de entorno:
   - `base_url`: `http://localhost:3000/api`
   - `token`: (se actualiza automáticamente al hacer login)

### 9.2 Variables de Entorno

```json
{
  "base_url": "http://localhost:3000/api",
  "token": "",
  "sensor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "admin_email": "admin@iiap.gob.pe",
  "admin_password": "Admin2024!"
}
```

### 9.3 Colecciones Incluidas

1. **Authentication**
   - Login
   - Verify Token
   - Logout

2. **Sensores (Public)**
   - Get All Sensors
   - Get Sensor by ID

3. **Sensores (Admin)**
   - Create Sensor
   - Update Sensor
   - Delete Sensor

4. **Lecturas (Public)**
   - Get Lecturas
   - Get Latest Lecturas
   - Get Stats

5. **Lecturas (Admin)**
   - Create Lectura
   - Delete Lectura

6. **Alertas**
   - Get Alertas
   - Resolver Alerta
   - Delete Alerta

7. **Umbrales**
   - Create Umbral
   - Update Umbral
   - Get Umbrales
   - Delete Umbral

8. **Recorridos**
   - Get Recorridos
   - Create Recorrido
   - Update Recorrido
   - Delete Recorrido

9. **Logs**
   - Get Logs

10. **Preferencias**
    - Get Preferencias
    - Update Preferencia

---

## Apéndice A: Resumen de Endpoints

### Tabla Completa (32 Endpoints)

| # | Método | Endpoint | Acceso | Descripción |
|---|--------|----------|--------|-------------|
| 1 | POST | `/api/auth/login` | Público | Login admin |
| 2 | GET | `/api/auth/verify` | Privado | Verificar token |
| 3 | POST | `/api/auth/logout` | Privado | Cerrar sesión |
| 4 | GET | `/api/sensores` | Público | Listar sensores |
| 5 | GET | `/api/sensores/:id` | Público | Obtener sensor |
| 6 | POST | `/api/sensores` | Privado | Crear sensor |
| 7 | PUT | `/api/sensores/:id` | Privado | Actualizar sensor |
| 8 | DELETE | `/api/sensores/:id` | Privado | Eliminar sensor |
| 9 | GET | `/api/lecturas` | Público | Listar lecturas |
| 10 | GET | `/api/lecturas/latest` | Público | Últimas lecturas |
| 11 | GET | `/api/lecturas/stats` | Público | Estadísticas |
| 12 | POST | `/api/lecturas` | Privado | Crear lectura |
| 13 | DELETE | `/api/lecturas/:id` | Privado | Eliminar lectura |
| 14 | GET | `/api/alertas` | Público | Listar alertas |
| 15 | GET | `/api/alertas/:id` | Público | Obtener alerta |
| 16 | PUT | `/api/alertas/:id/resolver` | Privado | Resolver alerta |
| 17 | DELETE | `/api/alertas/:id` | Privado | Eliminar alerta |
| 18 | GET | `/api/umbrales/:sensor_id` | Privado | Listar umbrales |
| 19 | POST | `/api/umbrales` | Privado | Crear umbral |
| 20 | PUT | `/api/umbrales/:id` | Privado | Actualizar umbral |
| 21 | DELETE | `/api/umbrales/:id` | Privado | Eliminar umbral |
| 22 | GET | `/api/recorridos` | Público | Listar recorridos |
| 23 | GET | `/api/recorridos/:id` | Público | Obtener recorrido |
| 24 | POST | `/api/recorridos` | Privado | Crear recorrido |
| 25 | PUT | `/api/recorridos/:id` | Privado | Actualizar recorrido |
| 26 | DELETE | `/api/recorridos/:id` | Privado | Eliminar recorrido |
| 27 | GET | `/api/logs` | Privado | Listar logs |
| 28 | GET | `/api/logs/:id` | Privado | Obtener log |
| 29 | GET | `/api/preferencias` | Privado | Listar preferencias |
| 30 | GET | `/api/preferencias/:clave` | Privado | Obtener preferencia |
| 31 | PUT | `/api/preferencias/:clave` | Privado | Actualizar preferencia |
| 32 | POST | `/api/preferencias` | Privado | Crear preferencia |

---

## Apéndice B: Glosario

| Término | Definición |
|---------|-----------|
| **JWT** | JSON Web Token - Token de autenticación |
| **UUID** | Identificador único universal (v4) |
| **ISO 8601** | Formato estándar de fecha/hora |
| **CRUD** | Create, Read, Update, Delete |
| **Query Parameters** | Parámetros en la URL (?key=value) |
| **Body** | Cuerpo de la petición HTTP (JSON) |
| **Bearer Token** | Método de autenticación (Authorization: Bearer <token>) |
| **Rate Limiting** | Límite de peticiones por tiempo |

---

## Contacto y Soporte

**Equipo de Desarrollo:** IIAP - Sistema de Monitoreo Ambiental
**Versión del Manual:** 1.0.0
**Última Actualización:** 10/10/2025

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**API Version:** v1.0.0
**Estado:** Producción
