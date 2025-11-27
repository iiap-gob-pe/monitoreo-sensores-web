# 🔐 Sistema de Autenticación con API Keys

## 📋 Tabla de Contenidos
- [Introducción](#introducción)
- [¿Por qué API Keys?](#por-qué-api-keys)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Gestión de API Keys](#gestión-de-api-keys)
- [Implementación en Dispositivos](#implementación-en-dispositivos)
- [Rate Limiting](#rate-limiting)
- [Seguridad](#seguridad)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

El sistema de monitoreo ambiental implementa un mecanismo de autenticación mediante **API Keys** para proteger el endpoint de envío de lecturas (`POST /api/lecturas`).

### ¿Qué es una API Key?

Una API Key es un **token de autenticación estático** que identifica y autoriza a un dispositivo (sensor ESP32, app móvil, etc.) para enviar datos al sistema.

**Características:**
- ✅ Cadena hexadecimal de 64 caracteres
- ✅ Almacenada hasheada en la base de datos (SHA256)
- ✅ Se envía en cada petición mediante el header `X-API-Key`
- ✅ Puede ser deshabilitada sin eliminarla
- ✅ Soporta fecha de expiración opcional

---

## 🤔 ¿Por qué API Keys?

### Problema Original

Antes de implementar API Keys, el endpoint `POST /api/lecturas` era **completamente público**. Cualquier persona podía enviar datos falsos al sistema, comprometiendo la integridad de la información.

```bash
# ❌ ANTES: Cualquiera podía hacer esto
curl -X POST http://api.monitoreo.iiap.org.pe/api/lecturas \
  -H "Content-Type: application/json" \
  -d '{"id_sensor":"FALSO","temperatura":999}'
```

### Solución Implementada

Ahora **solo dispositivos autorizados** con una API Key válida pueden enviar datos:

```bash
# ✅ AHORA: Se requiere API Key
curl -X POST https://api.monitoreo.iiap.org.pe/api/lecturas \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 9ae53faa7dcefc4786470ba7be52e4126d9e9b978553c09a80101039fef5cd65" \
  -d '{"id_sensor":"SENSOR_001","temperatura":25.5}'
```

### ¿Por qué API Keys y no JWT?

| Característica | API Key | JWT |
|---------------|---------|-----|
| **Complejidad** | ⭐ Simple | ⭐⭐⭐ Compleja |
| **Uso en IoT** | ✅ Ideal | ❌ No recomendado |
| **Expira automáticamente** | ❌ No (configurable) | ✅ Sí |
| **Rotación** | ⚠️ Manual | ✅ Automática |
| **Almacenamiento en ESP32** | ✅ Fácil (hardcoded) | ❌ Difícil (necesita refresh) |

**Para sensores IoT (ESP32), las API Keys son la mejor opción porque:**
- Los sensores no tienen login/logout
- Son stateless (sin sesiones)
- No necesitan renovación automática de tokens
- Más fácil de implementar en hardware limitado

---

## 🏗️ Arquitectura del Sistema

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│  1. DISPOSITIVO (ESP32, App Móvil)                         │
│     - Almacena API Key en el código                         │
│     - Envía API Key en header X-API-Key                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTP POST
┌─────────────────────────────────────────────────────────────┐
│  2. MIDDLEWARE: Rate Limiter                                │
│     - Límite: 100 peticiones / 15 min por IP               │
│     - Retorna 429 si se excede                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. MIDDLEWARE: verificarApiKey                             │
│     - Lee header X-API-Key                                  │
│     - Hashea con SHA256                                     │
│     - Busca en base de datos                                │
│     - Valida: existe, activa, no expirada                   │
│     - Actualiza ultima_uso                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ API Key válida
┌─────────────────────────────────────────────────────────────┐
│  4. CONTROLADOR: lecturaController.crear                    │
│     - Procesa los datos del sensor                          │
│     - Guarda lectura en base de datos                       │
│     - Retorna 200 OK                                        │
└─────────────────────────────────────────────────────────────┘
```

### Tabla en Base de Datos

```sql
CREATE TABLE api_keys (
  id_api_key       SERIAL PRIMARY KEY,
  key_name         VARCHAR(100) NOT NULL,           -- "ESP32_Sensor_001"
  api_key          VARCHAR(64) UNIQUE NOT NULL,     -- Hash SHA256
  tipo_dispositivo VARCHAR(20) DEFAULT 'sensor',    -- sensor | app_movil
  descripcion      TEXT,
  esta_activo      BOOLEAN DEFAULT true,
  ultima_uso       TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  created_by       INT,                             -- ID del admin
  expires_at       TIMESTAMP                        -- NULL = nunca expira
);
```

### Flujo de Validación

```
1. Dispositivo envía petición con header X-API-Key
                │
                ▼
2. Middleware extrae API Key del header
                │
                ▼
3. Hash SHA256 de la API Key recibida
                │
                ▼
4. Busca en BD: api_keys WHERE api_key = hash
                │
         ┌──────┴──────┐
         ▼             ▼
    ❌ No existe    ✅ Existe
    401 Unauthorized   │
                      ▼
                ¿Está activa?
                │
         ┌──────┴──────┐
         ▼             ▼
    ❌ No         ✅ Sí
    403 Forbidden     │
                      ▼
                ¿Ha expirado?
                │
         ┌──────┴──────┐
         ▼             ▼
    ✅ No         ❌ Sí
    Continúa      403 Forbidden
```

---

## 🛠️ Gestión de API Keys

### Script de Gestión

El sistema incluye un script CLI completo para administrar API Keys:

```bash
cd sensor_monitoreo_api
node scripts/generarApiKey.js [comando] [opciones]
```

### Comandos Disponibles

#### 1. Crear API Key

```bash
# Sintaxis
node scripts/generarApiKey.js crear <nombre> [tipo] [descripcion]

# Ejemplos
node scripts/generarApiKey.js crear "ESP32_Zona_Urbana" sensor "Sensor fijo en zona urbana"
node scripts/generarApiKey.js crear "App_Android_v1" app_movil "App móvil Android"
node scripts/generarApiKey.js crear "ESP32_Movil_001" sensor
```

**Salida:**
```
✅ API Key creada exitosamente!

═══════════════════════════════════════════════════════════
📋 INFORMACIÓN DE LA API KEY
═══════════════════════════════════════════════════════════
ID:          1
Nombre:      ESP32_Zona_Urbana
Tipo:        sensor
Descripción: Sensor fijo en zona urbana
Creada:      26/11/2025, 16:32:35
Expira:      Nunca
═══════════════════════════════════════════════════════════

🔑 API KEY (guárdala en un lugar seguro):
═══════════════════════════════════════════════════════════
9ae53faa7dcefc4786470ba7be52e4126d9e9b978553c09a80101039fef5cd65
═══════════════════════════════════════════════════════════

⚠️  IMPORTANTE:
   - Esta es la ÚNICA vez que verás la API Key completa
   - Guárdala en el código del ESP32 o app móvil
   - Si la pierdes, deberás crear una nueva
```

#### 2. Listar API Keys

```bash
node scripts/generarApiKey.js listar
```

**Salida:**
```
📋 API KEYS REGISTRADAS
═══════════════════════════════════════════════════════════════════════════
ID  | Nombre                 | Tipo        | Activo | Última Uso
─────────────────────────────────────────────────────────────────────────
1   | ESP32_Zona_Urbana      | sensor      | ✅ Sí   | 26/11/2025, 16:45:12
2   | App_Android_v1         | app_movil   | ✅ Sí   | Nunca
3   | ESP32_Test_Dev         | sensor      | ❌ No   | 25/11/2025, 10:20:33
═══════════════════════════════════════════════════════════════════════════
```

#### 3. Deshabilitar API Key

```bash
# Deshabilita sin eliminar (se puede reactivar después)
node scripts/generarApiKey.js deshabilitar <ID>

# Ejemplo
node scripts/generarApiKey.js deshabilitar 2
```

**Salida:**
```
✅ API Key "App_Android_v1" deshabilitada exitosamente.
```

#### 4. Habilitar API Key

```bash
# Reactiva una API Key previamente deshabilitada
node scripts/generarApiKey.js habilitar <ID>

# Ejemplo
node scripts/generarApiKey.js habilitar 2
```

#### 5. Eliminar API Key

```bash
# ⚠️ CUIDADO: Elimina permanentemente (no se puede recuperar)
node scripts/generarApiKey.js eliminar <ID>

# Ejemplo
node scripts/generarApiKey.js eliminar 3
```

---

## 📱 Implementación en Dispositivos

### ESP32 (Arduino/PlatformIO)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

// Configuración WiFi
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";

// Configuración API
const char* API_URL = "https://api.monitoreo.iiap.org.pe/api/lecturas";
const char* API_KEY = "9ae53faa7dcefc4786470ba7be52e4126d9e9b978553c09a80101039fef5cd65";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }

  Serial.println("✅ WiFi conectado");
}

void enviarLectura(float temp, float hum, float co2) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", API_KEY);

    // Construir JSON
    String jsonData = "{";
    jsonData += "\"id_sensor\":\"ESP32_001\",";
    jsonData += "\"temperatura\":" + String(temp) + ",";
    jsonData += "\"humedad\":" + String(hum) + ",";
    jsonData += "\"co2_nivel\":" + String(co2);
    jsonData += "}";

    int httpCode = http.POST(jsonData);

    if (httpCode == 200) {
      Serial.println("✅ Lectura enviada correctamente");
    } else if (httpCode == 401) {
      Serial.println("❌ API Key inválida");
    } else if (httpCode == 429) {
      Serial.println("⚠️ Rate limit excedido");
    } else {
      Serial.printf("❌ Error HTTP: %d\n", httpCode);
    }

    http.end();
  }
}

void loop() {
  float temp = leerTemperatura();
  float hum = leerHumedad();
  float co2 = leerCO2();

  enviarLectura(temp, hum, co2);

  delay(60000); // Enviar cada 60 segundos
}
```

### Android (Kotlin + Retrofit)

```kotlin
// ApiConfig.kt
object ApiConfig {
    const val BASE_URL = "https://api.monitoreo.iiap.org.pe/api/"
    const val API_KEY = "9ae53faa7dcefc4786470ba7be52e4126d9e9b978553c09a80101039fef5cd65"
}

// ApiService.kt
interface ApiService {
    @Headers(
        "X-API-Key: ${ApiConfig.API_KEY}",
        "Content-Type: application/json"
    )
    @POST("lecturas")
    suspend fun enviarLectura(@Body lectura: Lectura): Response<ApiResponse>
}

// LecturaRepository.kt
class LecturaRepository {
    private val apiService = RetrofitClient.create<ApiService>()

    suspend fun enviarLectura(lectura: Lectura): Result<ApiResponse> {
        return try {
            val response = apiService.enviarLectura(lectura)

            when (response.code()) {
                200 -> Result.success(response.body()!!)
                401 -> Result.failure(Exception("API Key inválida"))
                403 -> Result.failure(Exception("API Key deshabilitada"))
                429 -> Result.failure(Exception("Rate limit excedido"))
                else -> Result.failure(Exception("Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### iOS (Swift + URLSession)

```swift
// APIConfig.swift
struct APIConfig {
    static let baseURL = "https://api.monitoreo.iiap.org.pe/api"
    static let apiKey = "9ae53faa7dcefc4786470ba7be52e4126d9e9b978553c09a80101039fef5cd65"
}

// LecturaService.swift
class LecturaService {
    func enviarLectura(_ lectura: Lectura) async throws -> ApiResponse {
        let url = URL(string: "\(APIConfig.baseURL)/lecturas")!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(APIConfig.apiKey, forHTTPHeaderField: "X-API-Key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let jsonData = try JSONEncoder().encode(lectura)
        request.httpBody = jsonData

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw LecturaError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200:
            return try JSONDecoder().decode(ApiResponse.self, from: data)
        case 401:
            throw LecturaError.invalidApiKey
        case 403:
            throw LecturaError.apiKeyDisabled
        case 429:
            throw LecturaError.rateLimitExceeded
        default:
            throw LecturaError.httpError(httpResponse.statusCode)
        }
    }
}
```

---

## ⏱️ Rate Limiting

### Configuración Actual

```javascript
// src/app.js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                  // 100 peticiones por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);
```

### ¿Cómo Funciona?

El rate limiting **limita el número de peticiones por IP** en un período de tiempo:

- **Ventana**: 15 minutos (900,000 ms)
- **Límite**: 100 peticiones por ventana
- **Criterio**: Por dirección IP del cliente

### Headers de Respuesta

Cuando se aplica rate limiting, la API retorna estos headers:

```http
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1700000000
```

- `RateLimit-Limit`: Total de peticiones permitidas
- `RateLimit-Remaining`: Peticiones restantes en la ventana actual
- `RateLimit-Reset`: Timestamp UNIX cuando se reinicia el contador

### Respuesta al Exceder el Límite

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "success": false,
  "message": "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### Ajustar Rate Limiting

Para cambiar los límites, edita `src/app.js`:

```javascript
// Ejemplo: 200 peticiones cada 30 minutos
const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,  // 30 minutos
  max: 200,                  // 200 peticiones
  // ... resto de configuración
});
```

---

## 🔒 Seguridad

### Almacenamiento Seguro

#### ✅ Buenas Prácticas

1. **En ESP32**: Hardcoded está bien (el firmware es privado)
```cpp
const char* API_KEY = "tu_api_key_aqui";
```

2. **En Apps Móviles**: Usar variables de entorno o BuildConfig
```kotlin
// Android - build.gradle
buildConfigField("String", "API_KEY", "\"${project.findProperty("API_KEY")}\"")

// Uso
val apiKey = BuildConfig.API_KEY
```

3. **Nunca en Git**: Añadir al .gitignore
```gitignore
# .gitignore
*.env
secrets.h
config_private.h
```

#### ❌ Malas Prácticas

- ❌ Hardcodear en código que se sube a GitHub público
- ❌ Enviar API Keys por email sin encriptar
- ❌ Compartir la misma API Key para todos los dispositivos
- ❌ Loguear la API Key completa en consola/logs

### Rotación de API Keys

Si una API Key se ve comprometida:

1. **Deshabilitar la API Key antigua**
```bash
node scripts/generarApiKey.js deshabilitar 1
```

2. **Crear nueva API Key**
```bash
node scripts/generarApiKey.js crear "ESP32_001_Nueva" sensor
```

3. **Actualizar el dispositivo con la nueva key**

4. **Eliminar la antigua (opcional)**
```bash
node scripts/generarApiKey.js eliminar 1
```

### Hashing SHA256

Las API Keys **nunca se almacenan en texto plano** en la base de datos:

```javascript
// Generación (solo al crear)
const plainKey = crypto.randomBytes(32).toString('hex');
const hashedKey = crypto.createHash('sha256').update(plainKey).digest('hex');

// Validación (en cada petición)
const receivedKey = req.headers['x-api-key'];
const hashedReceived = crypto.createHash('sha256').update(receivedKey).digest('hex');

// Buscar en BD
const apiKey = await prisma.api_keys.findUnique({
  where: { api_key: hashedReceived }
});
```

**Ventaja**: Si alguien accede a la base de datos, **no puede usar las API Keys** porque están hasheadas.

---

## 🆘 Troubleshooting

### Error: "API Key requerida"

**Código HTTP**: 401 Unauthorized

**Mensaje**:
```json
{
  "success": false,
  "message": "API Key requerida. Incluye el header X-API-Key",
  "code": "API_KEY_MISSING"
}
```

**Solución**:
- Verifica que estás enviando el header `X-API-Key`
- Revisa que el nombre del header sea exacto (case-sensitive)

### Error: "API Key inválida"

**Código HTTP**: 401 Unauthorized

**Mensaje**:
```json
{
  "success": false,
  "message": "API Key inválida",
  "code": "API_KEY_INVALID"
}
```

**Solución**:
- Verifica que la API Key sea correcta (copia/pega)
- Verifica que no haya espacios al inicio/final
- Lista las keys activas: `node scripts/generarApiKey.js listar`

### Error: "API Key deshabilitada"

**Código HTTP**: 403 Forbidden

**Mensaje**:
```json
{
  "success": false,
  "message": "API Key deshabilitada",
  "code": "API_KEY_DISABLED"
}
```

**Solución**:
- La API Key existe pero fue deshabilitada
- Habilítala: `node scripts/generarApiKey.js habilitar <ID>`

### Error: "API Key expirada"

**Código HTTP**: 403 Forbidden

**Mensaje**:
```json
{
  "success": false,
  "message": "API Key expirada",
  "code": "API_KEY_EXPIRED"
}
```

**Solución**:
- La API Key tenía fecha de expiración y ya venció
- Crea una nueva API Key

### Error: "Rate limit excedido"

**Código HTTP**: 429 Too Many Requests

**Mensaje**:
```json
{
  "success": false,
  "message": "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Solución**:
- Espera 15 minutos antes de reintentar
- Verifica que no haya un bucle infinito enviando datos
- Si es legítimo, ajusta el rate limit en `src/app.js`

---

## 📞 Soporte

Para más información consulta:
- **Configuración de Apps**: `docs/CONFIGURACION_APP_MOVIL.md`
- **Manual API Completo**: `docs/Entregable_04_Manual_API.md`
- **Guía de Despliegue**: `GUIA_DESPLIEGUE_PRODUCCION.md`

---

**Última actualización**: 26 de Noviembre, 2025
**Versión**: 1.0.0
