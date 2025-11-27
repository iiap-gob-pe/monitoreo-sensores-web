# 📱 Configuración de App Móvil para Envío de Datos

## 🎯 Cómo Funciona en Producción

### URLs de la API según el Entorno

```
┌─────────────────────────────────────────────────────────────────┐
│ DESARROLLO LOCAL (Pruebas en tu red WiFi)                      │
│ URL: http://192.168.1.X:3000/api                               │
│ - Tu PC y tu celular deben estar en la MISMA red WiFi          │
│ - Usa la IP local de tu PC (encontrarla con ipconfig)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PRODUCCIÓN (App desplegada - acceso desde cualquier lugar)     │
│ URL: https://api.monitoreo.iiap.org.pe/api                     │
│ - Los celulares acceden por Internet (NO necesitan estar cerca)│
│ - Funciona desde cualquier país, ciudad o red WiFi             │
│ - Solo requieren conexión a Internet (WiFi o datos móviles)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ CORS y Apps Móviles - Explicación

### ¿Por qué las apps móviles NO necesitan estar en la configuración CORS?

El endpoint **POST /api/lecturas** (envío de datos) es **completamente público** y NO requiere autenticación.

**CORS_ORIGIN** en el `.env` es solo para:
- ✅ El **frontend web** (React) que corre en el navegador
- ✅ Otras **aplicaciones web** que consultan la API desde el navegador

**Las apps móviles nativas** (Android/iOS/Flutter):
- ❌ **NO están sujetas a CORS** (no son navegadores)
- ✅ Pueden hacer peticiones POST desde cualquier lugar
- ✅ No necesitan estar en la lista de `CORS_ORIGIN`

### Diagrama de Acceso

```
┌─────────────────┐
│  Frontend Web   │  ◄── NECESITA estar en CORS_ORIGIN
│  (React/Vite)   │      (ej: https://monitoreo.iiap.org.pe)
└─────────────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────────────────────────┐
│   API Backend (Node.js/Express)    │
│   https://api.monitoreo.iiap.org.pe │
└─────────────────────────────────────┘
         ▲
         │ HTTP Request
         │
┌─────────────────┐
│   App Móvil     │  ◄── NO necesita CORS
│ (Android/iOS)   │      (acceso nativo, no navegador)
└─────────────────┘
```

---

## 🔐 Autenticación con API Key

### ¿Por qué se requiere API Key?

El endpoint **POST /api/lecturas** ahora está **protegido con API Key** para evitar que cualquier persona pueda enviar datos falsos al sistema.

**Características de seguridad implementadas:**
- ✅ **API Key requerida** en header `X-API-Key`
- ✅ **Rate Limiting**: 100 peticiones por IP cada 15 minutos
- ✅ API Keys almacenadas hasheadas (SHA256)
- ✅ Pueden deshabilitarse sin eliminar
- ✅ Soportan fecha de expiración opcional

### Obtener una API Key

**Solo los administradores pueden generar API Keys**. Solicita una al administrador del sistema o genera una usando el script:

```bash
# Generar nueva API Key para un sensor
cd sensor_monitoreo_api
node scripts/generarApiKey.js crear "ESP32_Sensor_001" sensor "Sensor en zona urbana"

# Generar API Key para app móvil
node scripts/generarApiKey.js crear "App_Android_v1" app_movil "App móvil Android"

# Listar todas las API Keys
node scripts/generarApiKey.js listar
```

**La API Key se mostrará UNA SOLA VEZ al crearla. Guárdala en un lugar seguro.**

---

## 🔧 Configuración en Desarrollo Local

### 1. Encontrar la IP de tu PC

**Windows**:
```bash
ipconfig
# Busca "Adaptador de LAN inalámbrica Wi-Fi"
# IPv4: 192.168.1.100  ← Esta es tu IP
```

**Mac/Linux**:
```bash
ifconfig
# o
ip addr
# Busca la IP que empieza con 192.168.x.x
```

### 2. Configurar la App Móvil

**Android (Kotlin)**:
```kotlin
object ApiConfig {
    // Para desarrollo local (mismo WiFi)
    // const val BASE_URL = "http://192.168.1.100:3000/api"

    // Para producción
    const val BASE_URL = "https://api.monitoreo.iiap.org.pe/api"

    // ⚠️ IMPORTANTE: Reemplaza con tu API Key real
    const val API_KEY = "TU_API_KEY_AQUI"
}

// Ejemplo de uso con Retrofit
interface ApiService {
    @Headers(
        "X-API-Key: \${ApiConfig.API_KEY}",
        "Content-Type: application/json"
    )
    @POST("/lecturas")
    suspend fun enviarLectura(@Body lectura: Lectura): Response<ApiResponse>
}
```

**iOS (Swift)**:
```swift
struct APIConfig {
    // Para desarrollo local (mismo WiFi)
    // static let baseURL = "http://192.168.1.100:3000/api"

    // Para producción
    static let baseURL = "https://api.monitoreo.iiap.org.pe/api"

    // ⚠️ IMPORTANTE: Reemplaza con tu API Key real
    static let apiKey = "TU_API_KEY_AQUI"
}

// Ejemplo de uso con URLSession
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue(APIConfig.apiKey, forHTTPHeaderField: "X-API-Key")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
```

**React Native**:
```javascript
const API_CONFIG = {
  // Para desarrollo local (mismo WiFi)
  // baseURL: 'http://192.168.1.100:3000/api',

  // Para producción
  baseURL: 'https://api.monitoreo.iiap.org.pe/api',

  // ⚠️ IMPORTANTE: Reemplaza con tu API Key real
  apiKey: 'TU_API_KEY_AQUI',
};

// Ejemplo de uso con fetch
fetch(`${API_CONFIG.baseURL}/lecturas`, {
  method: 'POST',
  headers: {
    'X-API-Key': API_CONFIG.apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(lectura),
});
```

**ESP32 (C++)**:
```cpp
#include <HTTPClient.h>

// Configuración
const char* API_URL = "https://api.monitoreo.iiap.org.pe/api/lecturas";
const char* API_KEY = "TU_API_KEY_AQUI"; // ⚠️ Reemplaza con tu API Key

void enviarLectura() {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("X-API-Key", API_KEY);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{\"id_sensor\":\"SENSOR_001\",\"temperatura\":25.5}";
  int httpCode = http.POST(jsonData);

  if (httpCode == 200) {
    Serial.println("✅ Lectura enviada correctamente");
  } else if (httpCode == 401) {
    Serial.println("❌ API Key inválida o faltante");
  } else if (httpCode == 429) {
    Serial.println("⚠️ Rate limit excedido, reintenta en 15 minutos");
  }

  http.end();
}
```

### 3. Configurar Permisos de Red (Android)

**AndroidManifest.xml**:
```xml
<!-- Permitir tráfico HTTP en desarrollo (solo localhost) -->
<application
    android:usesCleartextTraffic="true"
    ...>
```

**⚠️ IMPORTANTE**: En producción, elimina `usesCleartextTraffic="true"` y usa solo HTTPS.

---

## 🚀 Flujo de Trabajo Recomendado

### Fase 1: Desarrollo Local
```env
# App móvil conectada al servidor local
BASE_URL = http://192.168.1.100:3000/api

Requisitos:
- ✅ PC y celular en la misma red WiFi
- ✅ Backend corriendo en tu PC (npm run dev)
- ✅ Firewall de Windows permitiendo conexiones en puerto 3000
```

### Fase 2: Servidor de Pruebas (Staging)
```env
# App móvil conectada a servidor de pruebas
BASE_URL = http://staging.monitoreo.iiap.org.pe/api

Requisitos:
- ✅ Servidor con IP pública o dominio
- ✅ Celular con conexión a Internet
- ✅ Backend desplegado en el servidor
```

### Fase 3: Producción
```env
# App móvil conectada al servidor de producción
BASE_URL = https://api.monitoreo.iiap.org.pe/api

Requisitos:
- ✅ Dominio con certificado SSL (HTTPS)
- ✅ Celular con conexión a Internet (desde cualquier lugar)
- ✅ Backend en servidor de producción
```

---

## 🔒 Seguridad en Producción

### 1. Usar HTTPS
```
❌ http://api.monitoreo.iiap.org.pe/api   (inseguro)
✅ https://api.monitoreo.iiap.org.pe/api  (seguro con SSL)
```

### 2. No Hardcodear la URL
**Mal** ❌:
```kotlin
const val BASE_URL = "http://192.168.1.100:3000/api"
```

**Bien** ✅:
```kotlin
const val BASE_URL = BuildConfig.API_URL

// En build.gradle
buildConfigField("String", "API_URL", "\"https://api.monitoreo.iiap.org.pe/api\"")
```

### 3. Validar Certificados SSL (Producción)
En producción, la app validará automáticamente el certificado SSL del servidor. No necesitas configuración adicional si usas un certificado válido (Let's Encrypt, etc.)

---

## 🧪 Testing

### Probar Conectividad desde el Celular

**1. Verificar que el celular puede acceder al servidor**:
```bash
# Desde el navegador del celular
http://192.168.1.100:3000/api/health

# Debe mostrar:
{
  "success": true,
  "message": "Monitoreo Ambiental API está funcionando correctamente"
}
```

**2. Probar endpoint de lecturas con Postman Mobile o Thunder Client**:
```bash
POST http://192.168.1.100:3000/api/lecturas
Content-Type: application/json
X-API-Key: 9ae53faa7dcefc4786470ba7be52e4126d9e9b978553c09a80101039fef5cd65

{
  "id_sensor": "TEST_MOBILE_001",
  "temperatura": 25.5,
  "humedad": 68.2,
  "latitud": -3.74912,
  "longitud": -73.25383
}
```

**⚠️ IMPORTANTE**: Reemplaza el valor de `X-API-Key` con tu API Key real.

**Respuestas esperadas**:
- ✅ `200 OK`: Lectura creada correctamente
- ❌ `401 Unauthorized`: API Key faltante o inválida
- ❌ `403 Forbidden`: API Key deshabilitada o expirada
- ⚠️ `429 Too Many Requests`: Rate limit excedido (espera 15 minutos)

---

## 🆘 Troubleshooting

### Error: "Unable to connect to server"

**Desarrollo Local**:
1. Verifica que PC y celular están en la misma red WiFi
2. Verifica la IP con `ipconfig` (debe coincidir)
3. Verifica que el backend está corriendo (npm run dev)
4. Verifica firewall de Windows:
   ```bash
   # Permitir conexiones en puerto 3000
   netsh advfirewall firewall add rule name="Node API" dir=in action=allow protocol=TCP localport=3000
   ```

**Producción**:
1. Verifica que el dominio resuelve correctamente (ping)
2. Verifica que el servidor está corriendo
3. Verifica que el puerto 3000 (o el que uses) está abierto
4. Verifica certificado SSL si usas HTTPS

### Error: "SSL Handshake Failed"

**Solución**: El servidor de producción necesita un certificado SSL válido.

Opciones gratuitas:
- Let's Encrypt (gratis, recomendado)
- Cloudflare (gratis, incluye CDN)

### Error: "CORS policy blocked" (solo navegadores)

**Esto NO afecta a apps móviles nativas**. Es solo para aplicaciones web.

### Error: "API Key requerida" o "401 Unauthorized"

**Causa**: No se está enviando el header `X-API-Key` o la API Key es inválida.

**Solución**:
1. Verifica que estás enviando el header `X-API-Key` en todas las peticiones POST
2. Verifica que la API Key sea correcta (copia/pega sin espacios)
3. Verifica que la API Key esté activa:
   ```bash
   cd sensor_monitoreo_api
   node scripts/generarApiKey.js listar
   ```
4. Si perdiste la API Key, genera una nueva:
   ```bash
   node scripts/generarApiKey.js crear "NuevoNombre" sensor
   ```

### Error: "403 Forbidden - API Key deshabilitada"

**Causa**: La API Key existe pero fue deshabilitada por el administrador.

**Solución**:
1. Contacta al administrador del sistema
2. O habilítala tú mismo:
   ```bash
   node scripts/generarApiKey.js habilitar <ID>
   ```

### Error: "429 Too Many Requests - Rate limit excedido"

**Causa**: Has enviado más de 100 peticiones en 15 minutos desde la misma IP.

**Solución**:
1. Espera 15 minutos antes de volver a intentar
2. Verifica que no estés enviando datos en un bucle infinito
3. Si necesitas enviar datos más frecuentemente, contacta al administrador para ajustar el rate limit

---

## 📞 Documentación Relacionada

- **Manual API Completo**: `docs/Entregable_04_Manual_API.md`
- **Guía de Despliegue**: `GUIA_DESPLIEGUE_PRODUCCION.md`
- **Estándares de Código**: `GUIA_ESTANDARES.md`

---

**Última actualización**: 20 de Noviembre, 2025
**Versión**: 1.0.0
