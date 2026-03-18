# Guia de Configuracion - Sensores IoT ESP32

> **Version**: 2.0
> **Ultima actualizacion**: Marzo 2026
> **Flujo**: Sensor IoT (WiFi/GPRS) → `POST /api/datos` (CSV) → Base de Datos
> **Estado**: Activo

---

## Tabla de Contenidos

1. [Introduccion](#introduccion)
2. [Requisitos de Hardware](#requisitos-de-hardware)
3. [Obtener API Key](#obtener-api-key)
4. [Endpoint de Envio de Datos](#endpoint-de-envio-de-datos)
5. [Configuracion ESP32 + WiFi](#configuracion-esp32--wifi)
6. [Configuracion ESP32 + GPRS](#configuracion-esp32--gprs)
7. [Pruebas y Debugging](#pruebas-y-debugging)
8. [Troubleshooting](#troubleshooting)

---

## Introduccion

Los sensores ESP32 envian datos al servidor mediante el endpoint **`POST /api/datos`** en formato **CSV** (texto plano con separador `;`). Este es el unico endpoint que los ESP32 deben usar para ingesta de datos.

### Flujo de Datos

```
┌─────────────────┐   POST /api/datos   ┌─────────────┐
│  Sensor ESP32   │ ──────────────────> │   API Web   │
│ (WiFi o GPRS)   │   CSV + API Key     │  (Backend)  │
└─────────────────┘                     └─────────────┘
                                              │
                                              v
                                       ┌─────────────┐
                                       │  PostgreSQL  │
                                       └─────────────┘
```

### Resumen del Endpoint

| Propiedad | Valor |
|-----------|-------|
| **URL** | `http://tu-servidor:3000/api/datos` |
| **Metodo** | `POST` |
| **Content-Type** | `text/csv` |
| **Autenticacion** | `X-API-Key: <api_key_del_sensor>` |
| **Header adicional** | `X-Fecha: YYYYMMDD` (fecha del lote) |
| **Rate Limit** | 30 peticiones por minuto por IP |
| **Tamano maximo** | 5 MB |

### Ventajas del formato CSV

| Caracteristica | JSON (POST /api/lecturas) | CSV (POST /api/datos) |
|----------------|---------------------------|------------------------|
| **Uso principal** | App movil | ESP32 |
| **Peso por lectura** | ~200 bytes | ~50 bytes |
| **Envio por lotes** | 1 lectura por peticion | Multiples filas por peticion |
| **Librerias** | Requiere ArduinoJson | Ninguna (String nativo) |
| **Deduplicacion** | Manual | Automatica por Fecha+Hora |

---

## Requisitos de Hardware

### Opcion A: ESP32 + WiFi

**Componentes**:
- ESP32 DevKit v1 (o similar)
- Sensor DHT22 (temperatura/humedad)
- Sensor MQ-135 (CO2)
- GPS Module NEO-6M (opcional)
- Fuente de alimentacion 5V

**Ventajas**: Bajo costo, facil configuracion, bajo consumo
**Desventajas**: Requiere red WiFi cercana

### Opcion B: ESP32 + GPRS (SIM800L)

**Componentes**:
- ESP32 DevKit v1
- Modulo GPRS SIM800L
- Tarjeta SIM con plan de datos
- Sensor DHT22 + MQ-135
- Bateria LiPo 3.7V 2000mAh + cargador
- Panel solar 5V (opcional)

**Ventajas**: Funciona en areas remotas, totalmente autonomo
**Desventajas**: Mayor costo (SIM + plan), mayor consumo

### Conexiones de Hardware

```
ESP32          DHT22          MQ-135
------         -----          ------
3.3V    ----   VCC
GND     ----   GND
GPIO4   ----   DATA
3.3V    ----                  VCC
GND     ----                  GND
GPIO34  ----                  AOUT
```

---

## Obtener API Key

### Paso 1: Crear el sensor desde el panel de administracion

1. Iniciar sesion como **admin** en el panel web
2. Ir a **Sensores** → **Nuevo Sensor**
3. Completar:
   - **ID Sensor**: `SENSOR_001` (unico)
   - **Nombre**: `Sensor Plaza de Armas`
   - **Zona**: `Urbana`
   - **Tipo**: `Fijo` o `Movil`

### Paso 2: Copiar la API Key generada

Al crear el sensor, el sistema **genera automaticamente una API Key** y la muestra en la respuesta. **Esta clave se muestra una sola vez**, copiala inmediatamente.

Ejemplo de respuesta:
```json
{
  "success": true,
  "message": "Sensor creado exitosamente con API Key",
  "data": { "id_sensor": "SENSOR_001", "nombre_sensor": "Sensor Plaza de Armas" },
  "api_key": {
    "api_key_plain": "a1b2c3d4e5f6...tu_api_key_aqui",
    "mensaje": "Guarda esta API Key, no se mostrara de nuevo."
  }
}
```

### Regenerar API Key (si se pierde)

Un admin puede generar una nueva API Key (la anterior se desactiva automaticamente):

```
POST /api/sensores/SENSOR_001/regenerar-apikey
Authorization: Bearer <jwt_token_admin>
```

---

## Endpoint de Envio de Datos

### `POST /api/datos`

**Headers obligatorios:**

```
Content-Type: text/csv
X-API-Key: tu_api_key_del_sensor
X-Fecha: 20260317
```

**Body (texto CSV):**

```
17/03/2026;08:00:00 AM;25.3;65.1;410
17/03/2026;08:03:00 AM;25.5;64.8;415
17/03/2026;08:06:00 AM;25.7;64.5;420
```

> **Sin fila de cabecera.** Solo filas de datos. No enviar "Fecha;Hora;Temperatura..." como primera linea.

**Campos por fila (separados por `;`):**

| Posicion | Campo | Formato | Ejemplo |
|----------|-------|---------|---------|
| 1 | Fecha | `DD/MM/YYYY` | `17/03/2026` |
| 2 | Hora | `HH:MM:SS AM/PM` o `HH:MM:SS` | `08:30:00 AM` |
| 3 | Temperatura | Decimal (°C) | `25.5` |
| 4 | Humedad | Decimal (%) | `68.2` |
| 5 | CO2 | Entero (ppm) | `420` |

**Respuesta exitosa (HTTP 200):**

```json
{
  "status": "ok",
  "mensaje": "3 registros guardados",
  "fecha": "20260317",
  "filas_procesadas": 3,
  "duplicadas": 0,
  "archivo": "20260317.csv"
}
```

**Codigos de respuesta:**

| HTTP | Significado | Accion |
|------|-------------|--------|
| 200 | Datos procesados | Continuar normalmente |
| 400 | CSV invalido | Revisar formato |
| 401 | API Key faltante o invalida | Verificar header X-API-Key |
| 403 | API Key deshabilitada/expirada | Contactar admin |
| 429 | Rate limit (>30 req/min) | Esperar 1 minuto |
| 500 | Error del servidor | Reintentar en 5 minutos |

---

## Configuracion ESP32 + WiFi

### Codigo Arduino Completo

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ============ CONFIGURACION ============
const char* WIFI_SSID     = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";
const char* API_URL       = "http://tu-servidor:3000/api/datos";
const char* API_KEY       = "TU_API_KEY_AQUI";  // Obtenida al crear el sensor
// ========================================

// Sensores
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MQ135_PIN 34

DHT dht(DHT_PIN, DHT_TYPE);

// Buffer para acumular lecturas CSV
String csvBuffer = "";
int lecturasEnBuffer = 0;
const int MAX_LECTURAS_BUFFER = 10;  // Enviar cada 10 lecturas

// Intervalo de lectura (3 minutos)
const unsigned long INTERVALO_LECTURA = 180000;
unsigned long ultimaLectura = 0;

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  dht.begin();
  conectarWiFi();
}

void conectarWiFi() {
  Serial.println("Conectando a WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado - IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nFallo WiFi, reiniciando...");
    ESP.restart();
  }
}

// ============ LOOP ============
void loop() {
  unsigned long ahora = millis();

  if (ahora - ultimaLectura >= INTERVALO_LECTURA) {
    leerYAcumular();
    ultimaLectura = ahora;
  }

  // Enviar cuando el buffer tenga suficientes lecturas
  if (lecturasEnBuffer >= MAX_LECTURAS_BUFFER) {
    enviarDatosCSV();
  }

  delay(1000);
}

// ============ LEER SENSORES Y ACUMULAR CSV ============
void leerYAcumular() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  int co2_raw = analogRead(MQ135_PIN);
  int co2_ppm = map(co2_raw, 0, 4095, 400, 2000);  // Calibracion aproximada

  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("Error al leer DHT22");
    return;
  }

  // Obtener fecha y hora actual (requiere NTP o RTC)
  // Ejemplo con formato esperado: DD/MM/YYYY;HH:MM:SS AM
  String fechaHora = obtenerFechaHora();  // Implementar segun tu fuente de tiempo

  // Agregar fila CSV al buffer
  // Formato: Fecha;Hora;Temperatura;Humedad;CO2
  csvBuffer += fechaHora + ";";
  csvBuffer += String(temperatura, 1) + ";";
  csvBuffer += String(humedad, 1) + ";";
  csvBuffer += String(co2_ppm) + "\n";
  lecturasEnBuffer++;

  Serial.printf("Lectura #%d: T=%.1f H=%.1f CO2=%d\n",
    lecturasEnBuffer, temperatura, humedad, co2_ppm);
}

// ============ ENVIAR CSV AL SERVIDOR ============
void enviarDatosCSV() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, reconectando...");
    conectarWiFi();
    return;
  }

  if (csvBuffer.length() == 0) {
    return;
  }

  // Obtener fecha actual en formato YYYYMMDD para header X-Fecha
  String xFecha = obtenerFechaYYYYMMDD();  // Implementar segun tu fuente de tiempo

  HTTPClient http;
  http.begin(API_URL);

  // === HEADERS OBLIGATORIOS ===
  http.addHeader("Content-Type", "text/csv");
  http.addHeader("X-API-Key", API_KEY);
  http.addHeader("X-Fecha", xFecha);

  Serial.println("\nEnviando " + String(lecturasEnBuffer) + " lecturas CSV...");

  int httpCode = http.POST(csvBuffer);
  String response = http.getString();

  if (httpCode == 200) {
    Serial.println("OK: Datos enviados correctamente");
    Serial.println(response);
    // Limpiar buffer solo si el envio fue exitoso
    csvBuffer = "";
    lecturasEnBuffer = 0;
  } else if (httpCode == 401) {
    Serial.println("ERROR 401: API Key invalida o faltante");
  } else if (httpCode == 403) {
    Serial.println("ERROR 403: API Key deshabilitada o expirada");
  } else if (httpCode == 429) {
    Serial.println("ERROR 429: Rate limit, esperar 1 minuto");
    delay(60000);
  } else {
    Serial.printf("ERROR: HTTP %d\n", httpCode);
    Serial.println(response);
    // No limpiar buffer para reintentar en el proximo ciclo
  }

  http.end();
}

// ============ FUNCIONES DE TIEMPO ============
// Implementar segun tu fuente de tiempo (NTP o RTC DS3231)

String obtenerFechaHora() {
  // Ejemplo con NTP (requiere configTime previamente):
  // struct tm timeinfo;
  // getLocalTime(&timeinfo);
  // char buf[30];
  // strftime(buf, sizeof(buf), "%d/%m/%Y;%I:%M:%S %p", &timeinfo);
  // return String(buf);

  // Placeholder - reemplazar con implementacion real
  return "17/03/2026;08:00:00 AM";
}

String obtenerFechaYYYYMMDD() {
  // Ejemplo con NTP:
  // struct tm timeinfo;
  // getLocalTime(&timeinfo);
  // char buf[9];
  // strftime(buf, sizeof(buf), "%Y%m%d", &timeinfo);
  // return String(buf);

  // Placeholder - reemplazar con implementacion real
  return "20260317";
}
```

### Librerias Necesarias (Arduino IDE)

Instalar desde **Sketch → Include Library → Manage Libraries**:
- **DHT sensor library** (Adafruit)
- **Adafruit Unified Sensor**

> No se necesita ArduinoJson. El CSV se construye con String nativo.

---

## Configuracion ESP32 + GPRS (SIM800L)

### Conexiones de Hardware

```
ESP32          SIM800L
------         -------
GPIO17  ----   TX
GPIO16  ----   RX
5V      ----   VCC (requiere minimo 2A!)
GND     ----   GND

IMPORTANTE: El SIM800L consume hasta 2A en picos de transmision.
Usar fuente externa de 5V/2A, NO alimentar desde ESP32.
```

### Codigo Arduino (GPRS)

```cpp
#include <TinyGsmClient.h>
#include <DHT.h>

// ============ CONFIGURACION ============
#define TINY_GSM_MODEM_SIM800
#define SerialAT Serial1

const char* APN      = "movistar.pe";  // Cambiar segun operador
const char* API_HOST = "tu-servidor";
const int   API_PORT = 3000;
const char* API_PATH = "/api/datos";
const char* API_KEY  = "TU_API_KEY_AQUI";

#define SIM800_RX 16
#define SIM800_TX 17
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MQ135_PIN 34

TinyGsm modem(SerialAT);
TinyGsmClient client(modem);
DHT dht(DHT_PIN, DHT_TYPE);

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  SerialAT.begin(9600, SERIAL_8N1, SIM800_RX, SIM800_TX);
  dht.begin();

  delay(3000);
  Serial.println("Inicializando SIM800L...");
  modem.restart();

  Serial.println("Conectando a GPRS...");
  if (!modem.gprsConnect(APN, "", "")) {
    Serial.println("Fallo GPRS, reiniciando...");
    ESP.restart();
  }
  Serial.println("GPRS conectado - IP: " + String(modem.getLocalIP()));
}

// ============ LOOP ============
void loop() {
  enviarCSV();
  delay(180000);  // Cada 3 minutos
}

// ============ ENVIAR CSV ============
void enviarCSV() {
  if (!modem.isGprsConnected()) {
    Serial.println("GPRS desconectado, reconectando...");
    modem.gprsConnect(APN, "", "");
    return;
  }

  // Leer sensores
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int co2 = map(analogRead(MQ135_PIN), 0, 4095, 400, 2000);

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Error DHT22");
    return;
  }

  // Construir CSV (sin cabecera)
  // Formato: Fecha;Hora;Temperatura;Humedad;CO2
  String csv = "17/03/2026;08:00:00 AM;" + String(temp, 1) + ";" + String(hum, 1) + ";" + String(co2);
  String xFecha = "20260317";  // Reemplazar con fecha real de RTC

  Serial.println("Enviando: " + csv);

  // Conectar al servidor
  if (!client.connect(API_HOST, API_PORT)) {
    Serial.println("Error de conexion al servidor");
    return;
  }

  // Enviar peticion HTTP POST con CSV
  client.print("POST " + String(API_PATH) + " HTTP/1.1\r\n");
  client.print("Host: " + String(API_HOST) + "\r\n");
  client.print("Content-Type: text/csv\r\n");
  client.print("X-API-Key: " + String(API_KEY) + "\r\n");
  client.print("X-Fecha: " + xFecha + "\r\n");
  client.print("Content-Length: " + String(csv.length()) + "\r\n");
  client.print("\r\n");
  client.print(csv);

  // Leer respuesta
  unsigned long timeout = millis();
  while (client.connected() && millis() - timeout < 10000L) {
    while (client.available()) {
      Serial.print((char)client.read());
      timeout = millis();
    }
  }

  client.stop();
  Serial.println("\nEnvio completado");
}
```

### Librerias Necesarias

- **TinyGSM** (para SIM800L)
- **DHT sensor library** (Adafruit)

### Proveedores de SIM recomendados (Peru)

| Operador | APN |
|----------|-----|
| Movistar | `movistar.pe` |
| Claro | `claro.pe` |
| Entel | `entel.pe` |
| Bitel | `bitel.pe` |

---

## Pruebas y Debugging

### Test con cURL (desde PC)

Antes de programar el ESP32, prueba el endpoint con cURL:

```bash
# Enviar una lectura CSV de prueba
curl -X POST http://localhost:3000/api/datos \
  -H "Content-Type: text/csv" \
  -H "X-API-Key: tu_api_key_aqui" \
  -H "X-Fecha: 20260317" \
  -d "17/03/2026;08:00:00 AM;25.3;65.1;410"
```

Respuesta esperada:
```json
{
  "status": "ok",
  "mensaje": "1 registros guardados",
  "fecha": "20260317",
  "filas_procesadas": 1,
  "duplicadas": 0,
  "archivo": "20260317.csv"
}
```

### Test de conectividad (Health Check)

```bash
curl http://localhost:3000/api/health
```

### Monitor Serial esperado

```
WiFi conectado - IP: 192.168.1.50
Lectura #1: T=25.3 H=65.1 CO2=410
Lectura #2: T=25.5 H=64.8 CO2=415
...
Lectura #10: T=25.7 H=64.5 CO2=420

Enviando 10 lecturas CSV...
OK: Datos enviados correctamente
{"status":"ok","mensaje":"10 registros guardados","fecha":"20260317","filas_procesadas":10,"duplicadas":0}
```

---

## Troubleshooting

### WiFi no conecta

```cpp
// Retry con reinicio automatico
int intentos = 0;
while (WiFi.status() != WL_CONNECTED && intentos < 20) {
  delay(500);
  intentos++;
}
if (WiFi.status() != WL_CONNECTED) {
  ESP.restart();
}
```

### SIM800L no responde

1. Alimentacion: Minimo 5V/2A (fuente externa, NO desde ESP32)
2. Tarjeta SIM insertada correctamente
3. PIN de SIM deshabilitado
4. Conexiones TX/RX cruzadas
5. Antena GSM conectada

### Error 400: CSV invalido

- Verificar que el separador sea `;` (punto y coma)
- Verificar formato de fecha: `DD/MM/YYYY`
- Verificar formato de hora: `HH:MM:SS AM/PM` o `HH:MM:SS`
- No enviar fila de cabecera
- Verificar que temperatura, humedad y CO2 sean numericos

### Error 401: API Key invalida

- Verificar que la API Key este correctamente copiada (sin espacios)
- Verificar que el header sea `X-API-Key` (con guion, case-sensitive)
- Comprobar en panel web que la key este activa

### Error 403: API Key deshabilitada o expirada

- Contactar al administrador para reactivar o regenerar la API Key
- Regenerar desde: `POST /api/sensores/:id/regenerar-apikey`

### Error 429: Rate limit excedido

- Maximo 30 peticiones por minuto por IP
- Recomendacion: enviar lotes cada 3 minutos (no cada lectura individual)
- Si se excede, esperar 1 minuto antes de reintentar

```cpp
if (httpCode == 429) {
  delay(60000);  // Esperar 1 minuto
}
```

### Datos duplicados

El servidor descarta automaticamente filas con la misma combinacion Fecha+Hora del mismo dia. No es necesario controlar duplicados desde el ESP32.

---

## Documentacion adicional

- [Integracion App Movil](INTEGRACION_APP_MOVIL.md) (usa `POST /api/lecturas` con JSON)
- [Seguridad y API Keys](SEGURIDAD_API_KEYS.md)
- [Autenticacion API Keys](AUTENTICACION_API_KEYS.md)

---

**Ultima revision**: Marzo 2026
**Estado**: Activo
