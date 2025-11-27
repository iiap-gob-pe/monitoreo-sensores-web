# 🔐 Autenticación con API Keys - Guía Completa

## 📋 Índice

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura de Autenticación](#arquitectura-de-autenticación)
3. [Gestión de API Keys](#gestión-de-api-keys)
4. [Integración con App Móvil](#integración-con-app-móvil)
5. [Configuración de Sensores IoT (Futuro)](#configuración-de-sensores-iot-futuro)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Resolución de Problemas](#resolución-de-problemas)

---

## 📌 Resumen del Sistema

El sistema de monitoreo ambiental del IIAP utiliza **API Keys** para autenticar el envío de datos desde sensores. Cada API Key está **permanentemente vinculada a un sensor específico**, lo que garantiza:

- ✅ **Seguridad**: Imposible enviar datos haciéndose pasar por otro sensor
- ✅ **Simplicidad**: No es necesario enviar `id_sensor` en el body de la petición
- ✅ **Trazabilidad**: Cada lectura está asociada automáticamente al sensor correcto
- ✅ **Flexibilidad**: Soporta tanto sensores con Bluetooth (vía app móvil) como sensores con GPRS/WiFi directo

---

## 🏗️ Arquitectura de Autenticación

### Modelo de Seguridad

```
┌─────────────────┐
│   API Key       │ ──────────────> Identifica a UN sensor específico
└─────────────────┘
        │
        │ Se envía en cada petición
        ▼
┌─────────────────┐
│  POST /lecturas │ ──────────────> Endpoint protegido
└─────────────────┘
        │
        │ Middleware valida y extrae id_sensor
        ▼
┌─────────────────┐
│  Base de Datos  │ ──────────────> Lectura guardada con sensor correcto
└─────────────────┘
```

### Regla Fundamental

> **1 API Key = 1 Sensor (siempre)**

Esto significa:
- Un sensor **SENSOR_001** tiene su propia API Key única
- Esa API Key **SOLO** puede enviar datos para **SENSOR_001**
- No se puede cambiar el sensor asociado a una API Key (es permanente)

---

## 🔑 Gestión de API Keys

### Crear API Key (Interfaz Web)

1. Acceder a: `http://tu-servidor/admin/api-keys`
2. Hacer clic en **"Nueva API Key"**
3. Completar el formulario:
   - **Nombre**: Identificador descriptivo (ej: "API_Key_Sensor_001")
   - **Sensor Asociado**: Seleccionar el sensor de la lista
   - **Descripción** (opcional): Notas adicionales

4. **Guardar la API Key generada** (solo se muestra una vez)

### Crear API Key (CLI)

```bash
cd sensor_monitoreo_api

# Crear API Key para un sensor
node scripts/generarApiKey.js crear "API_Key_Sensor_001" "SENSOR_001" "Sensor zona urbana"

# Listar todas las API Keys
node scripts/generarApiKey.js listar

# Deshabilitar temporalmente
node scripts/generarApiKey.js deshabilitar 1

# Habilitar nuevamente
node scripts/generarApiKey.js habilitar 1

# Eliminar permanentemente
node scripts/generarApiKey.js eliminar 1
```

### Estados de API Keys

- **Activo**: La API Key está habilitada y puede usarse
- **Inactivo**: La API Key está temporalmente deshabilitada
- **Eliminado**: La API Key fue borrada permanentemente

---

## 📱 Integración con App Móvil

### Flujo de Datos Actual

```
┌──────────────┐  Bluetooth   ┌──────────────┐  HTTPS + API Key   ┌──────────────┐
│ Sensor IoT   │ ───────────> │  App Móvil   │ ─────────────────> │  API Web     │
│ (sin GPRS)   │              │  (Android/iOS)│                    │  (Node.js)   │
└──────────────┘              └──────────────┘                    └──────────────┘
                                     │
                                     │ Almacena múltiples API Keys
                                     │ (una por cada sensor)
                                     ▼
                              ┌──────────────┐
                              │ API_Key_001  │ ──> SENSOR_001
                              │ API_Key_002  │ ──> SENSOR_002
                              │ API_Key_003  │ ──> SENSOR_003
                              └──────────────┘
```

### Implementación en la App Móvil

#### 1. Almacenar API Keys

La app móvil debe mantener un **mapeo de sensores a API Keys**:

```kotlin
// Android (Kotlin) - Ejemplo con SharedPreferences
class ApiKeyManager(context: Context) {
    private val prefs = context.getSharedPreferences("api_keys", Context.MODE_PRIVATE)

    // Guardar API Key para un sensor
    fun saveApiKey(sensorId: String, apiKey: String) {
        prefs.edit().putString(sensorId, apiKey).apply()
    }

    // Obtener API Key para un sensor
    fun getApiKey(sensorId: String): String? {
        return prefs.getString(sensorId, null)
    }
}
```

```swift
// iOS (Swift) - Ejemplo con UserDefaults
class ApiKeyManager {
    private let defaults = UserDefaults.standard

    func saveApiKey(sensorId: String, apiKey: String) {
        defaults.set(apiKey, forKey: "apikey_\(sensorId)")
    }

    func getApiKey(sensorId: String) -> String? {
        return defaults.string(forKey: "apikey_\(sensorId)")
    }
}
```

#### 2. Leer Datos del Sensor por Bluetooth

```kotlin
// Conectarse al sensor por Bluetooth y leer datos
val bluetoothDevice = bluetoothAdapter.getRemoteDevice(macAddress)
val socket = bluetoothDevice.createRfcommSocketToServiceRecord(uuid)
socket.connect()

val inputStream = socket.inputStream
val sensorData = inputStream.readBytes() // JSON con datos del sensor

// Parsear datos
val json = JSONObject(String(sensorData))
val sensorId = json.getString("id_sensor")  // ej: "SENSOR_001"
val temperatura = json.getDouble("temperatura")
val humedad = json.getDouble("humedad")
```

#### 3. Enviar Datos a la API

```kotlin
// Obtener la API Key correcta para este sensor
val apiKey = apiKeyManager.getApiKey(sensorId)

if (apiKey == null) {
    Log.e("API", "No hay API Key configurada para $sensorId")
    return
}

// Preparar datos (NO incluir id_sensor, está en la API Key)
val requestBody = JSONObject().apply {
    put("temperatura", temperatura)
    put("humedad", humedad)
    put("co2_nivel", co2Nivel)
    put("latitud", location.latitude)
    put("longitud", location.longitude)
}

// Enviar petición
val request = Request.Builder()
    .url("https://api.iiap.org.pe/api/lecturas")
    .addHeader("X-API-Key", apiKey)  // ← Identifica el sensor
    .addHeader("Content-Type", "application/json")
    .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
    .build()

client.newCall(request).enqueue(object : Callback {
    override fun onResponse(call: Call, response: Response) {
        if (response.isSuccessful) {
            Log.i("API", "Lectura enviada exitosamente para $sensorId")
        } else {
            Log.e("API", "Error: ${response.code} - ${response.message}")
        }
    }

    override fun onFailure(call: Call, e: IOException) {
        Log.e("API", "Error de conexión: ${e.message}")
    }
})
```

#### 4. Manejo de Múltiples Sensores

```kotlin
fun enviarLectura(sensorId: String, datos: SensorData) {
    // Obtener la API Key específica para este sensor
    val apiKey = apiKeyManager.getApiKey(sensorId)

    if (apiKey == null) {
        // Si no tiene API Key, pedirla al usuario o al servidor
        mostrarDialogoConfigurarApiKey(sensorId)
        return
    }

    // Enviar datos usando la API Key correcta
    enviarDatosConApiKey(apiKey, datos)
}

// Cuando el usuario cambia de sensor conectado
fun onSensorConectado(nuevoSensorId: String) {
    sensorActual = nuevoSensorId
    apiKeyActual = apiKeyManager.getApiKey(nuevoSensorId)

    // La app ahora usará la API Key correspondiente al nuevo sensor
}
```

### Ejemplo Completo - React Native

```javascript
// services/ApiKeyService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiKeyService {
  async saveApiKey(sensorId, apiKey) {
    await AsyncStorage.setItem(`apikey_${sensorId}`, apiKey);
  }

  async getApiKey(sensorId) {
    return await AsyncStorage.getItem(`apikey_${sensorId}`);
  }
}

// services/SensorService.js
class SensorService {
  async enviarLectura(sensorId, datos) {
    const apiKey = await apiKeyService.getApiKey(sensorId);

    if (!apiKey) {
      throw new Error(`No se encontró API Key para ${sensorId}`);
    }

    const response = await fetch('https://api.iiap.org.pe/api/lecturas', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        temperatura: datos.temperatura,
        humedad: datos.humedad,
        co2_nivel: datos.co2,
        latitud: datos.lat,
        longitud: datos.lng
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  }
}
```

---

## 📡 Configuración de Sensores IoT (Futuro)

### 🚧 Estado: Funcionalidad Futura

En el futuro, cuando los sensores tengan módulos GPRS/WiFi integrados, podrán enviar datos directamente a la API sin necesidad de la app móvil.

### Flujo Futuro

```
┌──────────────────────────┐
│  Sensor IoT con GPRS     │
│  (ESP32 + SIM800L)       │
│                          │
│  - Lee sensores          │
│  - Conecta a internet    │
│  - Envía a API           │
└────────────┬─────────────┘
             │ HTTPS + API Key
             ▼
┌──────────────────────────┐
│      API Web             │
│  (Node.js + Express)     │
└──────────────────────────┘
```

### Ejemplo - ESP32 con WiFi

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

// Configuración WiFi
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";

// API Key del sensor (obtenida del panel de administración)
const char* API_KEY = "abc123def456...";  // API Key única para este sensor

// Endpoint
const char* API_URL = "https://api.iiap.org.pe/api/lecturas";

void enviarLectura(float temp, float hum, int co2) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Iniciar conexión
    http.begin(API_URL);

    // Headers
    http.addHeader("X-API-Key", API_KEY);  // ← Identifica al sensor
    http.addHeader("Content-Type", "application/json");

    // Preparar JSON (NO incluir id_sensor)
    String jsonData = "{";
    jsonData += "\"temperatura\":" + String(temp) + ",";
    jsonData += "\"humedad\":" + String(hum) + ",";
    jsonData += "\"co2_nivel\":" + String(co2);
    jsonData += "}";

    // Enviar petición
    int httpCode = http.POST(jsonData);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Respuesta: " + response);
    } else {
      Serial.println("Error en HTTP: " + String(httpCode));
    }

    http.end();
  }
}

void setup() {
  Serial.begin(115200);

  // Conectar a WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("WiFi conectado");
}

void loop() {
  // Leer sensores
  float temperatura = leerTemperatura();
  float humedad = leerHumedad();
  int co2 = leerCO2();

  // Enviar a API
  enviarLectura(temperatura, humedad, co2);

  // Esperar 5 minutos
  delay(300000);
}
```

### Ejemplo - ESP32 con GPRS (SIM800L)

```cpp
#include <TinyGsmClient.h>
#include <ArduinoHttpClient.h>

// Pines SIM800L
#define MODEM_TX 27
#define MODEM_RX 26

// APN de tu operador
const char apn[] = "internet.claro.pe";
const char user[] = "";
const char pass[] = "";

// API Key
const char* API_KEY = "abc123def456...";

TinyGsm modem(Serial2);
TinyGsmClient client(modem);
HttpClient http(client, "api.iiap.org.pe", 443);

void enviarLectura(float temp, float hum) {
  String jsonData = "{";
  jsonData += "\"temperatura\":" + String(temp) + ",";
  jsonData += "\"humedad\":" + String(hum);
  jsonData += "}";

  http.beginRequest();
  http.post("/api/lecturas");
  http.sendHeader("X-API-Key", API_KEY);
  http.sendHeader("Content-Type", "application/json");
  http.sendHeader("Content-Length", jsonData.length());
  http.beginBody();
  http.print(jsonData);
  http.endRequest();

  int statusCode = http.responseStatusCode();
  String response = http.responseBody();

  Serial.println("Status: " + String(statusCode));
  Serial.println("Response: " + response);
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, MODEM_RX, MODEM_TX);

  // Inicializar modem
  modem.restart();
  modem.gprsConnect(apn, user, pass);

  Serial.println("GPRS conectado");
}
```

---

## 💡 Ejemplos de Código

### Estructura del Request

```http
POST /api/lecturas HTTP/1.1
Host: api.iiap.org.pe
X-API-Key: abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
Content-Type: application/json

{
  "temperatura": 28.5,
  "humedad": 75.2,
  "co2_nivel": 420,
  "co_nivel": 1.2,
  "latitud": -3.7437,
  "longitud": -73.2516,
  "altitud": 120.5,
  "zona": "Urbana"
}
```

**Nota importante**: NO incluir `id_sensor` en el body. El sensor se identifica automáticamente por la API Key.

### Respuestas de la API

#### ✅ Éxito (201 Created)

```json
{
  "success": true,
  "message": "Lectura registrada exitosamente",
  "data": {
    "id_lectura": 12345,
    "id_sensor": "SENSOR_001",
    "temperatura": 28.5,
    "humedad": 75.2,
    "lectura_datetime": "2025-11-26T10:30:00.000Z"
  },
  "sensor_info": {
    "id": "SENSOR_001",
    "nombre": "Sensor Zona Urbana",
    "es_nuevo": false
  }
}
```

#### ❌ API Key faltante (401 Unauthorized)

```json
{
  "success": false,
  "message": "API Key requerida. Incluye el header X-API-Key",
  "code": "API_KEY_MISSING"
}
```

#### ❌ API Key inválida (401 Unauthorized)

```json
{
  "success": false,
  "message": "API Key inválida",
  "code": "API_KEY_INVALID"
}
```

#### ❌ API Key deshabilitada (403 Forbidden)

```json
{
  "success": false,
  "message": "API Key deshabilitada",
  "code": "API_KEY_DISABLED"
}
```

#### ❌ API Key expirada (403 Forbidden)

```json
{
  "success": false,
  "message": "API Key expirada",
  "code": "API_KEY_EXPIRED"
}
```

---

## 🔧 Resolución de Problemas

### Error: "API Key requerida"

**Causa**: No se envió el header `X-API-Key`

**Solución**:
```kotlin
request.addHeader("X-API-Key", apiKey)  // Asegúrate de incluir este header
```

### Error: "API Key inválida"

**Causas posibles**:
1. La API Key es incorrecta (typo al copiarla)
2. La API Key fue eliminada
3. La API Key está hasheada (solo la versión en texto plano funciona)

**Solución**: Verificar que la API Key sea exactamente la que se mostró al crearla

### Error: "API Key deshabilitada"

**Causa**: Un administrador deshabilitó temporalmente la API Key

**Solución**: Contactar al administrador para que la reactive

### Lectura no aparece en el sistema

**Diagnóstico**:
1. Verificar que el request devuelva status 201
2. Comprobar que el sensor existe en la base de datos
3. Revisar logs del servidor

### App móvil no encuentra API Key para un sensor

**Causa**: El sensor no tiene una API Key configurada

**Solución**:
1. El administrador debe crear una API Key para ese sensor
2. Ingresar la API Key en la app móvil
3. La app la almacenará para futuro uso

---

## 📞 Soporte

Para más información o soporte técnico:
- **Email**: soporte@iiap.org.pe
- **Documentación API**: [https://api.iiap.org.pe/docs](https://api.iiap.org.pe/docs)
- **Panel Admin**: [https://monitoreo.iiap.org.pe/admin](https://monitoreo.iiap.org.pe/admin)
