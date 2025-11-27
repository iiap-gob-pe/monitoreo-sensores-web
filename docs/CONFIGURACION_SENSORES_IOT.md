# 📡 Guía de Configuración - Sensores IoT con Conectividad Directa

> **Versión**: 1.0
> **Última actualización**: Noviembre 2024
> **Flujo**: Sensor IoT (GPRS/WiFi) → API Web → Base de Datos
> **Estado**: 🚧 **Funcionalidad futura** - Los sensores actuales usan Bluetooth

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos de Hardware](#requisitos-de-hardware)
3. [Obtener API Key](#obtener-api-key)
4. [Configuración ESP32 + WiFi](#configuración-esp32--wifi)
5. [Configuración ESP32 + GPRS](#configuración-esp32--gprs)
6. [Código Arduino](#código-arduino)
7. [Pruebas y Debugging](#pruebas-y-debugging)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Este documento describe cómo configurar sensores IoT para que envíen datos **directamente** a la API, sin necesidad de una app móvil intermediaria.

### Flujo de Datos

```
┌─────────────────┐   HTTPS/API   ┌─────────────┐
│  Sensor IoT     │ ────────────> │   API Web   │
│ (ESP32 + GPRS)  │               │  (Backend)  │
│ (ESP32 + WiFi)  │               │             │
└─────────────────┘               └─────────────┘
                                        │
                                        v
                                 ┌─────────────┐
                                 │  PostgreSQL │
                                 └─────────────┘
```

### Ventajas vs Bluetooth

| Característica | Bluetooth + App | GPRS/WiFi Directo |
|----------------|-----------------|-------------------|
| **Rango** | ~10 metros | Ilimitado |
| **Autonomía** | Depende de app | Totalmente autónomo |
| **Latencia** | Alta (requiere app) | Baja (directo) |
| **Cobertura** | Solo con smartphone cerca | Cobertura celular/WiFi |
| **Costo** | Bajo (sin plan datos) | Medio (plan datos SIM) |

---

## 🔧 Requisitos de Hardware

### Opción A: ESP32 + WiFi

**Componentes**:
- ESP32 DevKit v1 (o similar)
- Sensor DHT22 (temperatura/humedad)
- Sensor MQ-135 (CO2/CO)
- GPS Module NEO-6M (opcional)
- Fuente de alimentación 5V

**Ventajas**:
- ✅ Bajo costo
- ✅ Fácil configuración
- ✅ Bajo consumo energético

**Desventajas**:
- ❌ Requiere red WiFi cercana
- ❌ No funciona en áreas remotas

---

### Opción B: ESP32 + GPRS (SIM800L)

**Componentes**:
- ESP32 DevKit v1
- Módulo GPRS SIM800L
- Tarjeta SIM con plan de datos
- Sensor DHT22
- Sensor MQ-135
- GPS Module NEO-6M (opcional)
- Batería LiPo 3.7V 2000mAh + cargador
- Panel solar 5V (opcional)

**Ventajas**:
- ✅ Funciona en cualquier lugar con cobertura celular
- ✅ Totalmente autónomo
- ✅ Ideal para áreas remotas

**Desventajas**:
- ❌ Mayor costo (SIM + plan datos)
- ❌ Mayor consumo energético
- ❌ Más complejo de configurar

---

## 🔑 Obtener API Key

### Paso 1: Registrar el Sensor en el Sistema

Primero debes crear el sensor en la base de datos:

1. Acceder al panel web → **Sensores** → **Nuevo Sensor**
2. Completar información:
   - **ID Sensor**: `SENSOR_001` (único, usar este ID en el código)
   - **Nombre**: `Sensor Plaza de Armas`
   - **Zona**: `Urbana`
   - **Tipo**: `Fijo` (si no es móvil)
   - **Descripción**: `Sensor con GPRS en plaza principal`

### Paso 2: Crear API Key Asociada

**Vía Interfaz Web**:
1. Ir a **Gestión API Keys** → **Nueva API Key**
2. Seleccionar tipo: **📡 Sensor IoT Directo (GPRS/WiFi → API)**
3. Completar:
   - **Nombre**: `ESP32_Plaza_Armas`
   - **Sensor Asociado**: Seleccionar `SENSOR_001`
   - **Descripción**: `Sensor con SIM800L en plaza`
4. **Copiar la API Key** (se muestra una sola vez)

**Vía CLI**:
```bash
cd sensor_monitoreo_api

# Crear API Key para sensor específico
node scripts/generarApiKey.js crear "ESP32_Plaza_Armas" sensor "SENSOR_001" "Sensor con GPRS"
```

⚠️ **IMPORTANTE**:
- Una API Key de tipo "sensor" está **permanentemente vinculada** a un `id_sensor` específico
- No se puede reutilizar para otros sensores
- El sensor **NO debe** enviar `id_sensor` en el cuerpo de la petición (se identifica automáticamente)

---

## 📶 Configuración ESP32 + WiFi

### Conexiones de Hardware

```
ESP32          DHT22
------         -----
3.3V    ----   VCC
GND     ----   GND
GPIO4   ----   DATA

ESP32          MQ-135
------         ------
3.3V    ----   VCC
GND     ----   GND
GPIO34  ----   AOUT
```

### Código Arduino (WiFi)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ========== CONFIGURACIÓN ==========
const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";
const char* API_URL = "https://api.monitoreo.iiap.org.pe/api/lecturas";
const char* API_KEY = "TU_API_KEY_AQUI";  // ← Copiar desde panel web

// Sensores
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MQ135_PIN 34

DHT dht(DHT_PIN, DHT_TYPE);

// Intervalo de envío (milisegundos)
const unsigned long INTERVALO_ENVIO = 60000; // 1 minuto
unsigned long ultimoEnvio = 0;

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  dht.begin();

  // Conectar a WiFi
  Serial.println("Conectando a WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ========== LOOP PRINCIPAL ==========
void loop() {
  unsigned long ahora = millis();

  // Enviar cada X minutos
  if (ahora - ultimoEnvio >= INTERVALO_ENVIO) {
    enviarLectura();
    ultimoEnvio = ahora;
  }

  delay(1000);
}

// ========== FUNCIONES ==========
void enviarLectura() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi desconectado, reconectando...");
    WiFi.reconnect();
    return;
  }

  // Leer sensores
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  int co2_raw = analogRead(MQ135_PIN);
  float co2_ppm = map(co2_raw, 0, 4095, 400, 2000); // Calibración aproximada

  // Validar lecturas
  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("❌ Error al leer DHT22");
    return;
  }

  // Crear JSON
  StaticJsonDocument<256> doc;
  // ⚠️ NO incluir "id_sensor" - se identifica por API Key
  doc["temperatura"] = temperatura;
  doc["humedad"] = humedad;
  doc["co2_nivel"] = (int)co2_ppm;
  // Opcional: agregar ubicación GPS si tienes módulo GPS
  // doc["latitud"] = gps.latitude;
  // doc["longitud"] = gps.longitude;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("\n📤 Enviando lectura:");
  Serial.println(jsonString);

  // Enviar POST a API
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  int httpCode = http.POST(jsonString);

  if (httpCode > 0) {
    Serial.printf("✅ Respuesta HTTP: %d\n", httpCode);

    if (httpCode == 201) {
      String payload = http.getString();
      Serial.println("✅ Lectura guardada exitosamente");
      Serial.println(payload);
    } else {
      Serial.printf("⚠️ Código inesperado: %d\n", httpCode);
    }
  } else {
    Serial.printf("❌ Error de conexión: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
```

---

## 📱 Configuración ESP32 + GPRS (SIM800L)

### Conexiones de Hardware

```
ESP32          SIM800L
------         -------
GPIO17  ----   TX
GPIO16  ----   RX
5V      ----   VCC (requiere mínimo 2A!)
GND     ----   GND

⚠️ IMPORTANTE: El SIM800L consume hasta 2A en picos de transmisión.
   Usar fuente externa de 5V/2A, NO alimentar desde ESP32.
```

### Código Arduino (GPRS)

```cpp
#include <TinyGsmClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ========== CONFIGURACIÓN ==========
#define TINY_GSM_MODEM_SIM800
#define SerialAT Serial1  // ESP32: Serial1 para comunicación con SIM800L

const char* APN = "movistar.pe";  // ← Cambiar según operador
const char* API_URL = "api.monitoreo.iiap.org.pe";
const char* API_PATH = "/api/lecturas";
const int API_PORT = 443;  // HTTPS
const char* API_KEY = "TU_API_KEY_AQUI";

// Pines
#define SIM800_RX 16
#define SIM800_TX 17
#define DHT_PIN 4
#define DHT_TYPE DHT22

TinyGsm modem(SerialAT);
TinyGsmClient client(modem);
DHT dht(DHT_PIN, DHT_TYPE);

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  SerialAT.begin(9600, SERIAL_8N1, SIM800_RX, SIM800_TX);
  dht.begin();

  delay(3000);

  Serial.println("Inicializando SIM800L...");

  // Reiniciar modem
  modem.restart();

  String modemInfo = modem.getModemInfo();
  Serial.print("Modem: ");
  Serial.println(modemInfo);

  // Conectar a red GPRS
  Serial.println("Conectando a red GPRS...");
  if (!modem.gprsConnect(APN, "", "")) {
    Serial.println("❌ Fallo al conectar GPRS");
    return;
  }

  Serial.println("✅ GPRS conectado");
  Serial.print("IP: ");
  Serial.println(modem.getLocalIP());
}

// ========== LOOP ==========
void loop() {
  enviarLectura();
  delay(60000); // Enviar cada 1 minuto
}

// ========== ENVIAR LECTURA ==========
void enviarLectura() {
  // Verificar conexión
  if (!modem.isGprsConnected()) {
    Serial.println("❌ GPRS desconectado, reconectando...");
    modem.gprsConnect(APN, "", "");
    return;
  }

  // Leer sensores
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();

  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("❌ Error al leer DHT22");
    return;
  }

  // Crear JSON
  StaticJsonDocument<256> doc;
  doc["temperatura"] = temperatura;
  doc["humedad"] = humedad;

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("\n📤 Enviando lectura:");
  Serial.println(jsonString);

  // Conectar a servidor
  if (!client.connect(API_URL, API_PORT)) {
    Serial.println("❌ Error al conectar al servidor");
    return;
  }

  // Enviar petición HTTP POST
  client.print("POST ");
  client.print(API_PATH);
  client.println(" HTTP/1.1");
  client.print("Host: ");
  client.println(API_URL);
  client.print("X-API-Key: ");
  client.println(API_KEY);
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(jsonString.length());
  client.println();
  client.println(jsonString);

  // Leer respuesta
  unsigned long timeout = millis();
  while (client.connected() && millis() - timeout < 10000L) {
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
      timeout = millis();
    }
  }

  client.stop();
  Serial.println("\n✅ Petición completada");
}
```

### Librerías Necesarias

Instalar desde Arduino IDE → Manage Libraries:
- **TinyGSM** (para SIM800L)
- **DHT sensor library** (Adafruit)
- **ArduinoJson** (by Benoit Blanchon)

---

## 🧪 Pruebas y Debugging

### Monitor Serial

```
Inicializando SIM800L...
Modem: SIM800L R14.18
Conectando a red GPRS...
✅ GPRS conectado
IP: 10.123.45.67

📤 Enviando lectura:
{"temperatura":25.5,"humedad":65.0}

HTTP/1.1 201 Created
Content-Type: application/json

{"success":true,"message":"Lectura guardada exitosamente",...}

✅ Petición completada
```

### Test de Conectividad (WiFi)

```cpp
void testConexion() {
  HTTPClient http;
  http.begin("https://api.monitoreo.iiap.org.pe/api/health");

  int httpCode = http.GET();
  Serial.printf("Health check: %d\n", httpCode);

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println(payload);
  }

  http.end();
}
```

### Test de Conectividad (GPRS)

```cpp
void testModem() {
  Serial.println("Testing modem...");

  // Test AT
  modem.sendAT("+CSQ");  // Signal quality
  modem.waitResponse();

  modem.sendAT("+COPS?");  // Operator
  modem.waitResponse();

  modem.sendAT("+CIFSR");  // Get IP
  modem.waitResponse();
}
```

---

## ⚠️ Troubleshooting

### WiFi no conecta

```cpp
// Agregar retry con timeout
int intentos = 0;
while (WiFi.status() != WL_CONNECTED && intentos < 20) {
  delay(500);
  Serial.print(".");
  intentos++;
}

if (WiFi.status() != WL_CONNECTED) {
  Serial.println("\n❌ No se pudo conectar a WiFi");
  ESP.restart();  // Reiniciar ESP32
}
```

### SIM800L no responde

**Verificar**:
1. ✅ Alimentación: Mínimo 5V/2A
2. ✅ Tarjeta SIM insertada correctamente
3. ✅ PIN de SIM deshabilitado
4. ✅ Conexiones TX/RX correctas (cruzadas)
5. ✅ Antena GSM conectada

**Test manual**:
```cpp
void setup() {
  SerialAT.begin(9600);
  SerialAT.println("AT");       // ¿Responde OK?
  delay(1000);
  SerialAT.println("AT+CSQ");   // Señal (debería ser >10)
  delay(1000);
  SerialAT.println("AT+CREG?"); // Registrado en red?
}
```

### Error 401: API Key inválida

- ✅ Verificar que la API Key esté correctamente copiada
- ✅ Verificar que no tenga espacios al inicio/final
- ✅ Comprobar en panel web que la key esté activa
- ✅ Verificar que no haya expirado

### Error 403: Sensor mismatch

Si recibes este error, significa que:
- La API Key está asociada a un `id_sensor` diferente
- El código está enviando `id_sensor` en el body (NO debe hacerlo)

**Solución**: Eliminar cualquier referencia a `id_sensor` en el JSON:

```cpp
// ❌ MAL
doc["id_sensor"] = "SENSOR_001";  // NO incluir esto

// ✅ BIEN
doc["temperatura"] = temp;
doc["humedad"] = hum;
// La API Key identifica automáticamente el sensor
```

### Error 429: Too Many Requests

La API tiene límite de 100 peticiones/15min. Reducir frecuencia de envío:

```cpp
const unsigned long INTERVALO_ENVIO = 120000; // 2 minutos en vez de 1
```

---

## 📞 Soporte

**Documentación adicional**:
- [Integración App Móvil](INTEGRACION_APP_MOVIL.md)
- [Seguridad y API Keys](SEGURIDAD_API_KEYS.md)

**Proveedores de SIM recomendados (Perú)**:
- **Movistar**: APN `movistar.pe`
- **Claro**: APN `claro.pe`
- **Entel**: APN `entel.pe`
- **Bitel**: APN `bitel.pe`

---

**Última revisión**: Noviembre 2024
**Estado**: 🚧 Funcionalidad futura
