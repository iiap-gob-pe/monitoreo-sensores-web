# 📱 Guía de Integración - App Móvil con Sensores Bluetooth

> **Versión**: 1.1
> **Última actualización**: Marzo 2026
> **Flujo**: Sensor (Bluetooth) → App Móvil → API Web → Base de Datos

---

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Flujo de Datos Actual](#flujo-de-datos-actual)
3. [Obtener API Key](#obtener-api-key)
4. [Endpoints de la API](#endpoints-de-la-api)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Manejo de Errores](#manejo-de-errores)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Resumen del Sistema

El sistema de monitoreo ambiental actual funciona con **sensores IoT que transmiten datos vía Bluetooth**. La app móvil actúa como intermediario:

```
┌─────────────┐   Bluetooth   ┌──────────────┐   HTTPS/API   ┌─────────────┐
│   Sensor    │ ────────────> │  App Móvil   │ ────────────> │   API Web   │
│  (ESP32)    │               │ (Android/iOS)│               │  (Backend)  │
└─────────────┘               └──────────────┘               └─────────────┘
                                                                     │
                                                                     v
                                                              ┌─────────────┐
                                                              │  PostgreSQL │
                                                              │ (Base Datos)│
                                                              └─────────────┘
```

### Funcionalidades de la App

✅ **Actual**: Leer datos de sensores vía Bluetooth y enviarlos a la API (`POST /api/lecturas`)
✅ **Actual**: Sensores ESP32 envían CSV directamente vía GPRS (`POST /api/datos`)
🔜 **Futuro**: La app solo monitoreará en tiempo real

---

## 🔄 Flujo de Datos Actual

### Paso 1: Conexión Bluetooth

La app móvil se conecta al sensor ESP32 vía Bluetooth BLE (Bluetooth Low Energy).

**Datos que el sensor transmite por Bluetooth:**
```json
{
  "id_sensor": "SENSOR_001",
  "temperatura": 25.5,
  "humedad": 65.0,
  "co2_nivel": 450,
  "co_nivel": 2.5,
  "timestamp": 1699564800
}
```

### Paso 2: Lectura de Datos

La app lee los datos del sensor y los complementa con:
- **Ubicación GPS** del smartphone
- **Zona** (Urbana/Rural/Industrial)
- **Timestamp** del sistema

### Paso 3: Envío a la API

La app envía los datos a la API con autenticación mediante API Key.

**Endpoint**: `POST /api/lecturas`

**Headers requeridos**:
```http
X-API-Key: tu-api-key-aqui
Content-Type: application/json
```

**Body de ejemplo**:
```json
{
  "id_sensor": "SENSOR_001",
  "temperatura": 25.5,
  "humedad": 65.0,
  "co2_nivel": 450,
  "co_nivel": 2.5,
  "latitud": -3.7437,
  "longitud": -73.2516,
  "altitud": 106.0,
  "zona": "Urbana"
}
```

---

## 🔑 Obtener API Key

### Opción A: Interfaz Web (Recomendado)

1. Acceder al panel de administración
2. Ir a **Gestión API Keys**
3. Clic en **"Nueva API Key"**
4. Seleccionar tipo: **📱 App Móvil (Bluetooth → API)**
5. Completar el formulario:
   - **Nombre**: `App_Android_v1` o `App_iOS_v1`
   - **Descripción**: `App móvil para recolección de datos vía Bluetooth`
6. Copiar la API Key generada (se muestra **una sola vez**)

### Opción B: Script CLI

```bash
cd sensor_monitoreo_api

# Crear API Key para app móvil
node scripts/generarApiKey.js crear "App_Android" app_movil null "App móvil Android v1.0"
```

**Salida**:
```
✅ API Key creada exitosamente!
═══════════════════════════════════════════════
ID:          1
Nombre:      App_Android
Tipo:        app_movil
Descripción: App móvil Android v1.0
═══════════════════════════════════════════════

🔑 API KEY (guárdala en un lugar seguro):
═══════════════════════════════════════════════
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
═══════════════════════════════════════════════
```

⚠️ **IMPORTANTE**: Guarda esta clave de forma segura. No se volverá a mostrar.

---

## 🌐 Endpoints de la API

### Base URL

- **Desarrollo**: `http://localhost:3000/api`
- **Producción**: `https://api.monitoreo.iiap.org.pe/api`

---

### 📊 POST /api/lecturas

Enviar nueva lectura de sensor.

**Autenticación**: API Key requerida

**Headers**:
```http
X-API-Key: tu-api-key-aqui
Content-Type: application/json
```

**Body** (todos los campos opcionales excepto `id_sensor`):
```json
{
  "id_sensor": "SENSOR_001",        // ✅ REQUERIDO
  "temperatura": 25.5,              // Temperatura en °C
  "humedad": 65.0,                  // Humedad relativa en %
  "co2_nivel": 450,                 // CO2 en ppm
  "co_nivel": 2.5,                  // CO en ppm
  "latitud": -3.7437,               // Latitud GPS
  "longitud": -73.2516,             // Longitud GPS
  "altitud": 106.0,                 // Altitud en metros
  "zona": "Urbana"                  // Urbana | Rural | Industrial
}
```

**Respuesta Exitosa** (201 Created):
```json
{
  "success": true,
  "message": "Lectura guardada exitosamente",
  "data": {
    "id_lectura": 1234,
    "id_sensor": "SENSOR_001",
    "temperatura": 25.5,
    "humedad": 65.0,
    "co2_nivel": 450,
    "co_nivel": 2.5,
    "latitud": -3.7437,
    "longitud": -73.2516,
    "altitud": 106.0,
    "zona": "Urbana",
    "lectura_datetime": "2024-11-26T15:30:00.000Z",
    "created_at": "2024-11-26T15:30:00.000Z"
  }
}
```

**Errores posibles**:

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | id_sensor faltante | Incluir id_sensor en el body |
| `401` | API Key faltante | Incluir header X-API-Key |
| `401` | API Key inválida | Verificar que la key sea correcta |
| `403` | API Key deshabilitada | Contactar al administrador |
| `403` | API Key expirada | Solicitar nueva API Key |
| `429` | Demasiadas peticiones | Esperar antes de reintentar |
| `500` | Error del servidor | Reintentar más tarde |

---

### 📡 POST /api/datos

Recibir datos CSV crudos desde sensores ESP32 (vía GPRS o app intermediaria).

**Autenticación**: API Key requerida (vinculada al sensor)

**Headers**:
```http
X-API-Key: api-key-del-sensor
Content-Type: text/csv
X-Fecha: 20240315
```

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `X-API-Key` | Sí | API Key asociada al sensor |
| `Content-Type` | Sí | Debe ser `text/csv` |
| `X-Fecha` | Sí | Fecha del lote en formato `YYYYMMDD` |

**Body** (texto CSV con separador `;`):

El formato del CSV depende de la configuración de variables del sensor:

**Formato legacy** (sin configuración de variables):
```csv
DD/MM/YYYY;HH:MM:SS;Temperatura;Humedad;CO2
15/03/2024;10:30:00;25.5;65.0;450
15/03/2024;10:35:00;26.1;63.2;455
15/03/2024;10:40:00;25.8;64.5;448
```

**Formato dinámico** (con variables configuradas en `sensor_variable`):
```csv
DD/MM/YYYY;HH:MM:SS;Variable1;Variable2;...VariableN
15/03/2024;10:30:00;25.5;65.0;450;2.5
15/03/2024;10:35:00;26.1;63.2;455;2.3
```

El orden de las variables en el CSV debe coincidir con el campo `orden_csv` de la tabla `sensor_variable`.

**Respuesta Exitosa** (200 OK):
```json
{
  "status": "ok",
  "mensaje": "3 registros guardados",
  "fecha": "20240315",
  "filas_procesadas": 3,
  "duplicadas": 0,
  "archivo": "20240315.csv",
  "formato": "legacy (Fecha;Hora;Temp;Hum;CO2)"
}
```

**Respuesta con errores parciales** (200 OK):
```json
{
  "status": "ok",
  "mensaje": "2 registros guardados",
  "fecha": "20240315",
  "filas_procesadas": 2,
  "duplicadas": 0,
  "archivo": "20240315.csv",
  "formato": "legacy (Fecha;Hora;Temp;Hum;CO2)",
  "filas_con_error": 1,
  "errores": [
    {
      "linea": 3,
      "error": "Valores numéricos inválidos",
      "contenido": "15/03/2024;10:40:00;abc;64.5;448"
    }
  ]
}
```

**Errores posibles**:

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Header X-Fecha faltante o formato inválido | Enviar X-Fecha con formato YYYYMMDD |
| `400` | Body vacío | Enviar texto CSV con separador ";" |
| `400` | Ninguna fila válida en el CSV | Verificar formato de fecha (DD/MM/YYYY), hora (HH:MM:SS) y valores numéricos |
| `401` | API Key faltante o inválida | Verificar header X-API-Key |
| `403` | API Key deshabilitada/expirada | Contactar al administrador |
| `429` | Demasiadas peticiones | Esperar antes de reintentar |
| `500` | Error del servidor | Reintentar más tarde |

**Notas importantes**:
- Las filas duplicadas (misma Fecha+Hora) se detectan y omiten automáticamente
- Los datos se guardan tanto en la base de datos como en archivos CSV en el servidor (`datos/YYYYMMDD.csv`)
- El límite de tamaño del body es **5 MB**
- El `last_seen` y estado del sensor se actualizan automáticamente

---

### 📍 GET /api/sensores

Obtener lista de todos los sensores registrados.

**Autenticación**: No requerida (endpoint público)

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id_sensor": "SENSOR_001",
      "nombre_sensor": "Sensor Plaza de Armas",
      "zona": "Urbana",
      "is_movil": false,
      "estado": "Activo",
      "last_seen": "2024-11-26T15:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 💻 Ejemplos de Código

### Android (Kotlin + OkHttp)

```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class ApiClient {
    private val API_KEY = "tu-api-key-aqui"
    private val BASE_URL = "https://api.monitoreo.iiap.org.pe/api"
    private val client = OkHttpClient()

    fun enviarLectura(
        idSensor: String,
        temperatura: Float?,
        humedad: Float?,
        co2: Int?,
        co: Float?,
        latitud: Double?,
        longitud: Double?,
        altitud: Double?,
        zona: String?
    ): Boolean {
        val json = JSONObject().apply {
            put("id_sensor", idSensor)
            temperatura?.let { put("temperatura", it) }
            humedad?.let { put("humedad", it) }
            co2?.let { put("co2_nivel", it) }
            co?.let { put("co_nivel", it) }
            latitud?.let { put("latitud", it) }
            longitud?.let { put("longitud", it) }
            altitud?.let { put("altitud", it) }
            zona?.let { put("zona", it) }
        }

        val requestBody = json.toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$BASE_URL/lecturas")
            .addHeader("X-API-Key", API_KEY)
            .addHeader("Content-Type", "application/json")
            .post(requestBody)
            .build()

        return try {
            val response = client.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}

// Uso
val api = ApiClient()
val success = api.enviarLectura(
    idSensor = "SENSOR_001",
    temperatura = 25.5f,
    humedad = 65.0f,
    co2 = 450,
    co = 2.5f,
    latitud = -3.7437,
    longitud = -73.2516,
    altitud = 106.0,
    zona = "Urbana"
)

if (success) {
    println("✅ Datos enviados correctamente")
} else {
    println("❌ Error al enviar datos")
}
```

---

### iOS (Swift + URLSession)

```swift
import Foundation

class APIClient {
    private let apiKey = "tu-api-key-aqui"
    private let baseURL = "https://api.monitoreo.iiap.org.pe/api"

    func enviarLectura(
        idSensor: String,
        temperatura: Float?,
        humedad: Float?,
        co2: Int?,
        co: Float?,
        latitud: Double?,
        longitud: Double?,
        altitud: Double?,
        zona: String?
    ) {
        var json: [String: Any] = ["id_sensor": idSensor]

        if let temp = temperatura { json["temperatura"] = temp }
        if let hum = humedad { json["humedad"] = hum }
        if let co2Val = co2 { json["co2_nivel"] = co2Val }
        if let coVal = co { json["co_nivel"] = coVal }
        if let lat = latitud { json["latitud"] = lat }
        if let lon = longitud { json["longitud"] = lon }
        if let alt = altitud { json["altitud"] = alt }
        if let z = zona { json["zona"] = z }

        guard let jsonData = try? JSONSerialization.data(withJSONObject: json),
              let url = URL(string: "\(baseURL)/lecturas") else {
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("❌ Error: \(error.localizedDescription)")
                return
            }

            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode == 201 {
                    print("✅ Datos enviados correctamente")
                } else {
                    print("❌ Error código: \(httpResponse.statusCode)")
                }
            }
        }.resume()
    }
}

// Uso
let api = APIClient()
api.enviarLectura(
    idSensor: "SENSOR_001",
    temperatura: 25.5,
    humedad: 65.0,
    co2: 450,
    co: 2.5,
    latitud: -3.7437,
    longitud: -73.2516,
    altitud: 106.0,
    zona: "Urbana"
)
```

---

### React Native (JavaScript)

```javascript
const API_KEY = 'tu-api-key-aqui';
const BASE_URL = 'https://api.monitoreo.iiap.org.pe/api';

async function enviarLectura({
  idSensor,
  temperatura,
  humedad,
  co2,
  co,
  latitud,
  longitud,
  altitud,
  zona
}) {
  try {
    const body = {
      id_sensor: idSensor,
      ...(temperatura !== undefined && { temperatura }),
      ...(humedad !== undefined && { humedad }),
      ...(co2 !== undefined && { co2_nivel: co2 }),
      ...(co !== undefined && { co_nivel: co }),
      ...(latitud !== undefined && { latitud }),
      ...(longitud !== undefined && { longitud }),
      ...(altitud !== undefined && { altitud }),
      ...(zona && { zona })
    };

    const response = await fetch(`${BASE_URL}/lecturas`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos enviados:', data);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Error:', error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return false;
  }
}

// Uso
await enviarLectura({
  idSensor: 'SENSOR_001',
  temperatura: 25.5,
  humedad: 65.0,
  co2: 450,
  co: 2.5,
  latitud: -3.7437,
  longitud: -73.2516,
  altitud: 106.0,
  zona: 'Urbana'
});
```

---

## ⚠️ Manejo de Errores

### Reintentos Automáticos

Implementa lógica de reintentos para errores temporales:

```kotlin
fun enviarConReintentos(data: LecturaData, maxIntentos: Int = 3): Boolean {
    var intentos = 0

    while (intentos < maxIntentos) {
        try {
            val resultado = enviarLectura(data)
            if (resultado) return true

            intentos++
            Thread.sleep(2000 * intentos) // Backoff exponencial
        } catch (e: Exception) {
            intentos++
        }
    }

    return false
}
```

### Cola de Envío Offline

Guarda lecturas localmente si no hay conexión:

```kotlin
class QueueManager {
    private val cola = mutableListOf<LecturaData>()

    fun agregarACola(lectura: LecturaData) {
        cola.add(lectura)
        guardarEnDisco(cola) // Persistir en SQLite o archivo
    }

    suspend fun procesarCola() {
        val pendientes = cola.toList()

        pendientes.forEach { lectura ->
            if (enviarLectura(lectura)) {
                cola.remove(lectura)
            }
        }

        guardarEnDisco(cola)
    }
}
```

---

## ✅ Mejores Prácticas

### 1. Seguridad de la API Key

```kotlin
// ❌ MAL: Hardcodear en el código
const val API_KEY = "a1b2c3d4e5f6..."

// ✅ BIEN: Usar BuildConfig o archivo seguro
val API_KEY = BuildConfig.API_KEY

// ✅ MEJOR: Almacenar en EncryptedSharedPreferences
val encryptedPrefs = EncryptedSharedPreferences.create(...)
val apiKey = encryptedPrefs.getString("api_key", null)
```

### 2. Validación de Datos

```kotlin
fun validarLectura(lectura: LecturaData): Boolean {
    return when {
        lectura.idSensor.isBlank() -> false
        lectura.temperatura != null && (lectura.temperatura < -50 || lectura.temperatura > 80) -> false
        lectura.humedad != null && (lectura.humedad < 0 || lectura.humedad > 100) -> false
        lectura.co2 != null && lectura.co2 < 0 -> false
        else -> true
    }
}
```

### 3. Logging y Monitoreo

```kotlin
fun enviarLectura(data: LecturaData) {
    Log.d("API", "Enviando lectura de ${data.idSensor}")

    val inicio = System.currentTimeMillis()
    val resultado = apiClient.enviar(data)
    val duracion = System.currentTimeMillis() - inicio

    if (resultado) {
        Log.i("API", "✅ Enviado en ${duracion}ms")
        Firebase.analytics.logEvent("lectura_enviada", bundleOf(
            "sensor" to data.idSensor,
            "duracion_ms" to duracion
        ))
    } else {
        Log.e("API", "❌ Fallo al enviar")
    }
}
```

### 4. Rate Limiting

La API tiene límite de **100 peticiones por 15 minutos**. Implementa throttling:

```kotlin
class RateLimiter(private val maxPorMinuto: Int = 10) {
    private val timestamps = mutableListOf<Long>()

    fun puedeEnviar(): Boolean {
        val ahora = System.currentTimeMillis()
        timestamps.removeAll { it < ahora - 60000 } // Remover >1min

        return timestamps.size < maxPorMinuto
    }

    fun registrarEnvio() {
        timestamps.add(System.currentTimeMillis())
    }
}
```

---

## 📞 Soporte

**Documentación adicional**:
- [Guía de Configuración de Sensores](CONFIGURACION_SENSORES_IOT.md)
- [Seguridad y API Keys](SEGURIDAD_API_KEYS.md)
- [Despliegue en Producción](../GUIA_DESPLIEGUE_PRODUCCION.md)

**Contacto**:
- Email: soporte@iiap.org.pe
- Issues: [GitHub Repository](https://github.com/tu-org/sensor-monitoreo)

---

**Última revisión**: Marzo 2026
**Versión API**: 1.1.0
