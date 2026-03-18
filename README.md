# Sistema de Monitoreo Ambiental IIAP

<p align="center">
  <img src="logo.jpg" alt="IIAP Logo" width="200"/>
</p>

Plataforma web para el monitoreo ambiental en tiempo real del **Instituto de Investigaciones de la Amazonia Peruana (IIAP)**. Consolida datos capturados por dispositivos IoT (ESP32) para medir temperatura, humedad, calidad del aire (CO/CO2) y geolocalización espacial en la región amazónica.

---

## Índice

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Modelo de Datos](#modelo-de-datos)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Uso](#uso)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Seguridad](#seguridad)
- [Documentación](#documentación)
- [Licencia](#licencia)

---

## Características

### Dashboard en Tiempo Real
- **Mapa interactivo** con Leaflet para visualizar nodos fijos y móviles
- **Mapas de calor** para temperatura, CO y CO2
- **Trazado de recorridos** con historial de telemetría móvil y reducción de ruido geográfico
- **Gráficas analíticas** con Chart.js y Recharts
- **Exportación de reportes** en PDF y Excel

### Gestión de Sensores
- CRUD completo de dispositivos IoT con categorización por zonas geográficas
- Monitoreo de estado y última conexión de cada sensor
- Soporte para sensores fijos y móviles (GPS)

### Sistema de Alertas
- Configuración de umbrales por parámetro y sensor
- Notificaciones automáticas ante valores críticos
- Historial de alertas con resolución

### Administración
- Control de acceso basado en roles (RBAC) con JWT
- Logs de actividad por usuario
- Preferencias de sistema personalizables
- Gestión de API Keys por sensor para autenticación de dispositivos IoT

---

## Arquitectura

El proyecto sigue una arquitectura **cliente-servidor** con separación clara entre frontend y backend:

```
┌─────────────────┐     HTTP/REST     ┌─────────────────┐     Prisma ORM     ┌──────────────┐
│   Frontend      │ ◄──────────────► │   Backend       │ ◄────────────────► │  PostgreSQL  │
│   React + Vite  │                   │   Express.js    │                     │              │
│   Puerto: 5173  │                   │   Puerto: 3000  │                     │              │
└─────────────────┘                   └─────────────────┘                     └──────────────┘
                                             ▲
                                             │ API Key Auth
                                      ┌──────┴──────┐
                                      │  ESP32 IoT  │
                                      │  Sensores   │
                                      └─────────────┘
```

---

## Modelo de Datos

| Tabla | Descripción |
|-------|-------------|
| `sensores` | Registro de dispositivos IoT (fijos/móviles) por zona |
| `lecturas` | Datos ambientales: temperatura, humedad, CO, CO2, GPS |
| `alertas` | Alertas generadas al superar umbrales configurados |
| `sensor_umbral` | Umbrales min/max por parámetro y sensor |
| `usuarios` | Usuarios del sistema con roles y estado |
| `api_keys` | Claves de autenticación para dispositivos IoT |
| `recorridos_guardados` | Trazados GPS almacenados como GeoJSON |
| `logs_actividad` | Auditoría de acciones por usuario |
| `preferencias_sistema` | Configuración personalizada por usuario |

---

## Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | ≥ 22.16.0 | Entorno de ejecución |
| Express.js | 4.21.2 | Framework HTTP |
| Prisma ORM | 6.14.0 | Acceso a base de datos |
| PostgreSQL | ≥ 12 | Base de datos relacional |
| JWT + Bcryptjs | — | Autenticación y hashing |
| Helmet + Rate Limit | — | Seguridad HTTP |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.1.1 | UI reactiva |
| Vite | 7.1.7 | Bundler y dev server |
| Tailwind CSS | 3.4.17 | Estilos utilitarios |
| Leaflet | 1.9.4 | Mapas interactivos |
| Chart.js + Recharts | — | Visualización de datos |
| Axios | — | Cliente HTTP |

---

## Requisitos Previos

- **Node.js** v22 LTS (recomendado) o v24+
- **npm** v10.9.2 o superior
- **PostgreSQL** v12 o superior (local o remoto)
- **Git**

> **Nota:** Se recomienda usar **Node.js v22 LTS** para evitar problemas de compatibilidad con módulos nativos. Si usas Node v24+, la instalación funciona pero puede mostrar advertencias `EBADENGINE` (son inofensivas).

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone git@github.com:iiap-gob-pe/monitoreo-sensores-web.git
cd monitoreo-sensores-web
```

### 2. Configurar el Backend

```bash
cd sensor_monitoreo_api

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección Variables de Entorno)

# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones a la base de datos
npx prisma migrate dev --name init
```

### 3. Configurar el Frontend

```bash
cd environmental-monitoring-web

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
# Verificar que VITE_API_URL apunte a tu backend
```

### 4. Iniciar la aplicación

Ejecutar en **terminales separadas**:

```bash
# Terminal 1 — Backend
cd sensor_monitoreo_api
npm run dev
npm run dev --host 0.0.0.0

# Terminal 2 — Frontend
cd environmental-monitoring-web
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

---

### Solución de problemas comunes

#### Error `Cannot find module '@babel/parser'` u otros módulos faltantes

Esto ocurre cuando `node_modules` está corrupto o fue instalado con una versión diferente de Node. Solución:

```bash
# En la carpeta del proyecto afectado (frontend o backend)
rm -rf node_modules package-lock.json
npm install
```

#### Advertencias `EBADENGINE` durante `npm install`

Son advertencias informativas cuando se usa Node v24+ (el proyecto especifica Node ≥22). **No afectan el funcionamiento** y pueden ignorarse.

#### Error de compilación con `bcrypt` (módulo nativo)

Si `npm install` falla con errores de compilación de `bcrypt`, asegúrate de que el backend use `bcryptjs` (versión JavaScript pura, sin compilación nativa). El proyecto ya usa `bcryptjs` por defecto.

---

## Variables de Entorno

### Backend (`sensor_monitoreo_api/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://postgres:password@localhost:5432/sensores_bd` |
| `CORS_ORIGIN` | URL del frontend permitida | `http://localhost:5173` |
| `JWT_SECRET` | Clave secreta para tokens | Generar con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Expiración del token | `24h` |
| `FRONTEND_PUBLIC_KEY` | Clave estática para el frontend | Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ALERT_CHECK_INTERVAL` | Intervalo de chequeo de alertas (ms) | `60000` |
| `LOG_LEVEL` | Nivel de logging | `info` |

### Frontend (`environmental-monitoring-web/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |
| `VITE_PUBLIC_API_KEY` | Clave pública (debe coincidir con `FRONTEND_PUBLIC_KEY` del backend) | `0dfeef557a...` |
| `VITE_APP_NAME` | Nombre de la aplicación | `IIAP Monitoreo Ambiental` |
| `VITE_APP_VERSION` | Versión | `1.0.0` |
| `VITE_NODE_ENV` | Entorno | `development` |

---

## Uso

### Scripts del Backend

```bash
npm run dev          # Servidor de desarrollo (nodemon)
npm start            # Servidor de producción
npm run prisma:studio    # Abrir Prisma Studio (GUI de BD)
npm run prisma:generate  # Regenerar cliente Prisma
npm run prisma:push      # Sincronizar esquema sin migraciones
npm run prisma:reset     # Resetear base de datos
```

### Scripts del Frontend

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción
npm run preview  # Previsualizar build
npm run lint     # Ejecutar ESLint
```

---

## Estructura del Repositorio

```
monitoreo-sensores-web/
├── environmental-monitoring-web/   # Frontend React (Vite)
│   ├── public/                     # Archivos estáticos
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Componentes reutilizables (botones, modales)
│   │   │   ├── configuracion/      # Componentes de configuración
│   │   │   ├── dashboard/          # MapView, estadísticas, indicadores
│   │   │   ├── layout/             # Sidebar, Navbar, contenedor principal
│   │   │   └── perfil/             # Componentes de perfil de usuario
│   │   ├── config/                 # Constantes y configuración global
│   │   ├── context/                # Context API (AuthContext)
│   │   ├── hooks/                  # Custom hooks
│   │   ├── pages/                  # Vistas enrutadas
│   │   ├── services/               # Clientes Axios para la API
│   │   └── utils/                  # Utilidades y formateadores
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── sensor_monitoreo_api/           # Backend RESTful API (Node.js)
│   ├── prisma/
│   │   ├── migrations/             # Historial de migraciones SQL
│   │   └── schema.prisma           # Esquema de base de datos
│   ├── scripts/
│   │   └── importar_rutas.js       # Importador de datos GPS desde CSV
│   ├── src/
│   │   ├── config/                 # Configuración de conexiones
│   │   ├── controllers/            # Lógica de negocio
│   │   ├── middleware/             # Auth JWT, validadores
│   │   └── routes/                 # Definición de endpoints REST
│   ├── server.js
│   └── package.json
│
├── docs/                           # Documentación del proyecto
│   ├── Actividad_01..06.md         # Reportes de actividades
│   ├── Entregable_01..07.md        # Entregables del proyecto
│   ├── CONFIGURACION_SENSORES_IOT.md
│   ├── INTEGRACION_APP_MOVIL.md
│   ├── AUTENTICACION_API_KEYS.md
│   └── SEGURIDAD_API_KEYS.md
│
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── logo.jpg
└── README.md
```

---

## Seguridad

### Modelo de Autenticación

La API usa **tres niveles de autenticación** según el tipo de cliente:

| Cliente | Método de autenticación | Header requerido |
|---------|------------------------|------------------|
| **ESP32 / IoT** | API Key por sensor | `X-API-Key: <api_key_del_sensor>` |
| **Frontend (sin sesión)** | Clave pública estática | `X-Public-Key: <clave_publica>` |
| **Frontend (con sesión)** | JWT del login | `Authorization: Bearer <token>` |
| **Admin** | JWT + rol admin | `Authorization: Bearer <token>` |

### Protección por Endpoint

| Endpoint | Método | Autenticación | Rate Limit |
|----------|--------|---------------|------------|
| `POST /api/auth/login` | Login | Ninguna | 5 req/15 min por IP |
| `POST /api/datos` | Enviar CSV (ESP32) | API Key del sensor | 30 req/min |
| `POST /api/lecturas` | Enviar lectura JSON (App Movil) | API Key del sensor | 30 req/min |
| `GET /api/lecturas/*` | Consultar datos | JWT o Clave pública | 300 req/min |
| `GET /api/sensores` | Listar sensores | JWT o Clave pública | 300 req/min |
| `GET /api/alertas/*` | Consultar alertas | JWT o Clave pública | 300 req/min |
| `POST /api/sensores` | Crear sensor | JWT (admin) | 300 req/min |
| `POST /api/sensores/:id/regenerar-apikey` | Regenerar API Key | JWT (admin) | 300 req/min |
| `* /api/usuarios` | Gestión usuarios | JWT (admin) | 300 req/min |
| `* /api/admin/*` | Administración | JWT (admin) | 300 req/min |

### Medidas de Seguridad

- **JWT** para autenticación de usuarios con expiración configurable
- **API Keys** individuales por sensor (SHA256 hasheadas en BD), generadas automáticamente al crear un sensor
- **Clave pública del frontend** para acceso de solo lectura sin sesión
- **Bcryptjs** para hashing de contraseñas
- **Helmet** para cabeceras HTTP seguras
- **Rate Limiting** diferenciado: estricto para login (5/15min), moderado para sensores (30/min), general (300/min)
- **CORS** configurado para permitir solo orígenes autorizados
- **Errores internos** no se exponen en producción (solo en `NODE_ENV=development`)

> Consultar [docs/SEGURIDAD_API_KEYS.md](docs/SEGURIDAD_API_KEYS.md) y [docs/AUTENTICACION_API_KEYS.md](docs/AUTENTICACION_API_KEYS.md) para detalles adicionales.

---

## Guía de Integración ESP32

Los dispositivos ESP32 envían datos exclusivamente mediante **`POST /api/datos`** en formato CSV vía HTTP.

### Paso 1: Crear sensor y obtener API Key

Un administrador crea el sensor desde el panel web (`POST /api/sensores`). Al crearlo se genera automáticamente una **API Key única** que se muestra **una sola vez**. Si se pierde, un admin puede regenerarla con `POST /api/sensores/:id/regenerar-apikey`.

### Paso 2: Configurar el ESP32

```cpp
// Arduino/ESP32 - Enviar datos CSV a POST /api/datos
#include <WiFi.h>
#include <HTTPClient.h>

// ============ CONFIGURACIÓN ============
const char* WIFI_SSID     = "tu_red_wifi";
const char* WIFI_PASSWORD = "tu_password_wifi";
const char* API_URL       = "http://tu-servidor:3000/api/datos";
const char* API_KEY       = "tu_api_key_del_sensor";  // Obtenida al crear el sensor
// ========================================

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");
}

/**
 * Envía un lote de lecturas CSV al servidor.
 *
 * @param csvData  Filas CSV con separador ";"
 *                 Campos: Fecha;Hora;Temperatura;Humedad;CO2
 *                 Ejemplo: "17/03/2026;08:30:00 AM;25.5;68.2;420"
 *
 * @param fecha    Fecha del lote en formato YYYYMMDD (ej: "20260317")
 */
void enviarDatosCSV(const String& csvData, const char* fecha) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ERROR: Sin conexion WiFi");
    return;
  }

  HTTPClient http;
  http.begin(API_URL);

  // === HEADERS OBLIGATORIOS ===
  http.addHeader("Content-Type", "text/csv");    // Tipo de contenido CSV
  http.addHeader("X-API-Key", API_KEY);          // Autenticación del sensor
  http.addHeader("X-Fecha", fecha);              // Fecha del lote (YYYYMMDD)

  int httpCode = http.POST(csvData);
  String response = http.getString();

  switch (httpCode) {
    case 200:
      Serial.println("OK: Datos enviados correctamente");
      Serial.println(response);
      break;
    case 401:
      Serial.println("ERROR 401: API Key invalida o faltante");
      break;
    case 403:
      Serial.println("ERROR 403: API Key deshabilitada o expirada");
      break;
    case 429:
      Serial.println("ERROR 429: Demasiadas peticiones, esperar 1 minuto");
      break;
    default:
      Serial.printf("ERROR: HTTP %d\n", httpCode);
      Serial.println(response);
      break;
  }

  http.end();
}

void loop() {
  // Ejemplo: construir CSV con datos de sensores
  String csv = "";
  csv += "17/03/2026;08:00:00 AM;25.3;65.1;410\n";
  csv += "17/03/2026;08:03:00 AM;25.5;64.8;415\n";
  csv += "17/03/2026;08:06:00 AM;25.7;64.5;420\n";

  enviarDatosCSV(csv, "20260317");

  delay(180000); // Esperar 3 minutos antes del siguiente envio
}
```

### Formato CSV esperado

```
17/03/2026;08:00:00 AM;25.3;65.1;410
17/03/2026;08:03:00 AM;25.5;64.8;415
17/03/2026;08:06:00 AM;25.7;64.5;420
```

> **Sin fila de cabecera.** El CSV contiene solo filas de datos, no enviar "Fecha;Hora;..." como primera línea.

| Campo | Formato | Ejemplo |
|-------|---------|---------|
| Fecha | `DD/MM/YYYY` | `17/03/2026` |
| Hora | `HH:MM:SS AM/PM` o `HH:MM:SS` (24h) | `08:30:00 AM` |
| Temperatura | Decimal (°C) | `25.5` |
| Humedad | Decimal (%) | `68.2` |
| CO2 | Entero (ppm) | `420` |

### Headers HTTP requeridos

| Header | Valor | Obligatorio |
|--------|-------|-------------|
| `Content-Type` | `text/csv` | Si |
| `X-API-Key` | API Key del sensor | Si |
| `X-Fecha` | `YYYYMMDD` (fecha del lote) | Si |

### Respuestas del servidor

| HTTP Code | Significado | Acción del ESP32 |
|-----------|-------------|------------------|
| `200` | Datos procesados correctamente | Continuar normalmente |
| `400` | CSV con formato inválido | Revisar formato de datos |
| `401` | API Key faltante o inválida | Verificar header `X-API-Key` |
| `403` | API Key deshabilitada o expirada | Contactar administrador |
| `429` | Rate limit excedido (>30 req/min) | Esperar 1 minuto y reintentar |
| `500` | Error interno del servidor | Reintentar en 5 minutos |

### Límites y recomendaciones

- **Rate limit:** Máximo 30 peticiones por minuto por IP
- **Tamaño máximo:** 5 MB por petición CSV
- **Intervalo recomendado:** 1 envío cada 3 minutos
- **Deduplicación automática:** El servidor descarta filas con Fecha+Hora duplicadas del mismo día
- **Sin fila de encabezado:** No enviar "Fecha;Hora;Temperatura..." como primera fila, solo datos

---

## Documentación

La carpeta `docs/` contiene documentación detallada del proyecto:

- **Actividades:** Reportes de avance del desarrollo
- **Entregables:** Documentación formal de cada fase
- **Guías técnicas:**
  - [Configuración de Sensores IoT](docs/CONFIGURACION_SENSORES_IOT.md)
  - [Integración con App Móvil](docs/INTEGRACION_APP_MOVIL.md)
  - [Autenticación con API Keys](docs/AUTENTICACION_API_KEYS.md)
  - [Seguridad de API Keys](docs/SEGURIDAD_API_KEYS.md)

---

## Licencia

Proyecto desarrollado por el **Instituto de Investigaciones de la Amazonia Peruana (IIAP)**.
