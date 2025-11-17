# INFORME DE REQUERIMIENTOS DE LA PLATAFORMA WEB
## Sistema de Monitoreo Ambiental - IIAP

---

**Proyecto:** Sistema de Monitoreo Ambiental del Instituto de Investigaciones de la Amazonía Peruana (IIAP)

**Responsable:** Michel Izquierdo

**Versión:** 1.0

**Fecha:** [Fecha de elaboración]

**Estado:** Aprobado

---

## RESUMEN EJECUTIVO

El presente documento establece los requerimientos funcionales y no funcionales para el desarrollo de una plataforma web de monitoreo ambiental destinada al Instituto de Investigaciones de la Amazonía Peruana (IIAP). La plataforma permitirá la visualización en tiempo real de datos ambientales provenientes de sensores IoT distribuidos en diferentes zonas geográficas de la región amazónica, facilitando la investigación científica y la toma de decisiones basada en datos.

El sistema está diseñado para soportar dos tipos de usuarios: público general (acceso de solo lectura sin autenticación) y un administrador único (acceso completo con autenticación). Los sensores ambientales basados en ESP32 transmitirán datos de temperatura, humedad, CO2, CO y ubicación GPS mediante protocolo HTTP/REST.

**Alcance:** Versión 1.0 con funcionalidades core de visualización, alertas, gestión de sensores y exportación de datos.

**Tecnologías:** Node.js, Express, Prisma, PostgreSQL (backend); React, Vite, Tailwind CSS, Leaflet (frontend); ESP32 (IoT).

---

## TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Contexto del Proyecto](#2-contexto-del-proyecto)
3. [Alcance del Sistema](#3-alcance-del-sistema)
4. [Requerimientos Funcionales](#4-requerimientos-funcionales)
5. [Requerimientos No Funcionales](#5-requerimientos-no-funcionales)
6. [Casos de Uso](#6-casos-de-uso)
7. [Modelo de Datos](#7-modelo-de-datos)
8. [Especificaciones Técnicas](#8-especificaciones-técnicas)
9. [Restricciones y Supuestos](#9-restricciones-y-supuestos)
10. [Matriz de Trazabilidad](#10-matriz-de-trazabilidad)
11. [Glosario](#11-glosario)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

Este documento especifica los requerimientos para el Sistema de Monitoreo Ambiental del IIAP, una plataforma web diseñada para recolectar, almacenar, visualizar y analizar datos ambientales en tiempo real provenientes de una red de sensores IoT desplegados en la región amazónica.

El documento está dirigido a:
- Desarrolladores del sistema
- Personal técnico del IIAP
- Stakeholders del proyecto
- Evaluadores y auditores de calidad

### 1.2 Audiencia

**Usuarios Finales:**
- **Público general:** Investigadores, estudiantes, ciudadanos interesados en datos ambientales (acceso de solo lectura, sin login)
- **Administrador único:** Personal técnico del IIAP responsable de la gestión del sistema (acceso completo, con login)

**Sistemas Externos:**
- **Sensores IoT (ESP32):** Dispositivos que envían datos ambientales al sistema

### 1.3 Metodología

El análisis de requerimientos se realizó mediante:
- **Entrevistas semiestructuradas** con personal del IIAP
- **Análisis documental** de protocolos de monitoreo ambiental
- **Benchmarking** de sistemas similares
- **Prototipado rápido** para validación de conceptos
- **Análisis cuantitativo** de volumetría y carga esperada

---

## 2. CONTEXTO DEL PROYECTO

### 2.1 Problema Identificado

El IIAP realiza investigaciones ambientales en la región amazónica requiriendo monitoreo continuo de variables críticas como temperatura, humedad, calidad del aire (CO2, CO) en múltiples ubicaciones geográficas. Actualmente:

- **No existe sistema centralizado** de visualización de datos
- **Datos dispersos** en múltiples formatos y ubicaciones
- **Ausencia de alertas automáticas** ante valores críticos
- **Dificultad para análisis histórico** y generación de reportes
- **Falta de acceso público** a información ambiental relevante

### 2.2 Solución Propuesta

Desarrollar una plataforma web integral que:

1. **Centralice datos ambientales** de múltiples sensores
2. **Visualice información en tiempo real** mediante dashboards interactivos
3. **Genere alertas automáticas** cuando parámetros excedan umbrales
4. **Permita análisis histórico** con filtros avanzados
5. **Facilite exportación de datos** en múltiples formatos (Excel, PDF, CSV)
6. **Proporcione acceso público** a datos sin barreras de autenticación
7. **Incluya gestión administrativa** protegida para el personal del IIAP

### 2.3 Beneficios Esperados

**Para el IIAP:**
- Centralización de datos ambientales
- Toma de decisiones basada en datos en tiempo real
- Reducción de costos operativos
- Automatización de alertas y reportes
- Mayor visibilidad institucional

**Para la comunidad científica:**
- Acceso libre a datos ambientales
- Facilita investigaciones colaborativas
- Datos históricos para análisis de tendencias

**Para la sociedad:**
- Transparencia en información ambiental
- Conciencia sobre calidad del aire
- Educación ambiental basada en datos reales

---

## 3. ALCANCE DEL SISTEMA

### 3.1 Funcionalidades Incluidas (In Scope)

#### Versión 1.0 - MVP (Minimum Viable Product)

**Módulo de Visualización (Público)**
- ✅ Dashboard con KPIs en tiempo real
- ✅ Mapa interactivo con ubicación de sensores
- ✅ Visualización de lecturas más recientes
- ✅ Alertas activas visibles
- ✅ Mapas de calor (temperatura, CO2, CO)
- ✅ Visualización de recorridos de sensores móviles
- ✅ Filtros por fecha, sensor, zona

**Módulo de Gestión (Administrador)**
- ✅ Autenticación segura con JWT
- ✅ Gestión de sensores (CRUD completo)
- ✅ Configuración de umbrales de alertas
- ✅ Resolución de alertas
- ✅ Gestión de recorridos guardados
- ✅ Preferencias del sistema

**Módulo de Reportes**
- ✅ Exportación a Excel (XLSX)
- ✅ Exportación a PDF
- ✅ Exportación a CSV
- ✅ Exportación de recorridos (GeoJSON)

**Módulo de Sensores IoT**
- ✅ Registro automático de nuevos sensores
- ✅ Detección automática de movilidad (fijo vs móvil)
- ✅ Recepción de datos vía HTTP POST
- ✅ Validación de datos recibidos

**Módulo de Alertas**
- ✅ Detección automática de valores fuera de umbral
- ✅ Clasificación por severidad (Low, Medium, High, Critical)
- ✅ Registro histórico de alertas
- ✅ Estado de resolución

### 3.2 Funcionalidades Excluidas (Out of Scope - v1.0)

**No incluido en versión inicial:**
- ❌ Aplicación móvil nativa (iOS/Android)
- ❌ Notificaciones por correo electrónico
- ❌ Sistema de múltiples usuarios con roles diferenciados
- ❌ Machine Learning para predicciones
- ❌ Integración con APIs externas (clima, satélites)
- ❌ Sistema de comentarios o foros
- ❌ Autenticación con redes sociales
- ❌ Modo offline/PWA
- ❌ WebSockets para actualizaciones push en tiempo real

**Consideraciones futuras (versiones posteriores):**
- Sistema de roles expandido (analista, investigador, visor)
- Notificaciones configurables (email, SMS, push)
- Análisis predictivo con IA
- API pública documentada para terceros
- Aplicación móvil complementaria

### 3.3 Límites del Sistema

**Límites geográficos:**
- Enfocado en la región amazónica peruana
- Soporte para coordenadas GPS estándar (WGS84)

**Límites técnicos:**
- Capacidad inicial: 100 sensores simultáneos
- Retención de datos: mínimo 2 años
- Frecuencia de lecturas: 1 por minuto por sensor
- Tamaño máximo de respuesta API: 10MB

**Límites funcionales:**
- Un solo administrador del sistema
- Acceso público sin límite de usuarios concurrentes (sujeto a capacidad del servidor)
- Soporte únicamente para sensores que cumplan protocolo HTTP/REST definido

---

## 4. REQUERIMIENTOS FUNCIONALES

### RF-01: Dashboard de Visualización en Tiempo Real

**Prioridad:** Alta (Must Have)
**Complejidad:** Media
**Acceso:** Público

**Descripción:**
El sistema debe proporcionar un dashboard interactivo que muestre indicadores clave de rendimiento (KPIs) y datos ambientales en tiempo real.

**Criterios de Aceptación:**
1. Mostrar KPIs principales:
   - Total de sensores activos
   - Total de lecturas registradas hoy
   - Alertas activas
   - Última actualización del sistema

2. Actualización automática cada 30 segundos (configurable)

3. Diseño responsive que funcione en desktop, tablet y móvil

4. Indicador visual de última actualización

5. Botón de actualización manual

**Dependencias:** RF-02, RF-03

---

### RF-02: Mapa Interactivo de Sensores

**Prioridad:** Alta (Must Have)
**Complejidad:** Alta
**Acceso:** Público

**Descripción:**
El sistema debe mostrar un mapa interactivo con la ubicación geográfica de todos los sensores, diferenciando entre sensores fijos y móviles.

**Criterios de Aceptación:**
1. Visualización de mapa base (OpenStreetMap)

2. Marcadores diferenciados:
   - Sensores fijos: icono estático con color según estado
   - Sensores móviles: icono dinámico con color según estado

3. Tooltip al pasar mouse sobre marcador:
   - Nombre del sensor
   - Última lectura
   - Timestamp

4. Click en marcador abre popup con:
   - Datos completos de última lectura
   - Estado del sensor
   - Botón para ver historial

5. Controles de zoom y navegación

6. Centrado automático en región amazónica peruana

7. Modos de visualización:
   - Vista de sensores (predeterminada)
   - Vista de rutas móviles
   - Mapa de calor de temperatura
   - Mapa de calor de CO2
   - Mapa de calor de CO

**Dependencias:** RF-03

---

### RF-03: Registro Automático de Sensores

**Prioridad:** Alta (Must Have)
**Complejidad:** Baja
**Acceso:** Público (endpoint sensor), Admin (gestión)

**Descripción:**
El sistema debe registrar automáticamente nuevos sensores cuando envían su primera lectura, sin intervención manual.

**Criterios de Aceptación:**
1. Al recibir datos de un `id_sensor` desconocido:
   - Crear registro en tabla `sensores`
   - Asignar nombre predeterminado: "Sensor {ID}"
   - Estado: "Activo"
   - `is_movil`: false (por defecto)
   - Zona: extraída de la lectura
   - `installation_date`: fecha actual
   - `last_seen`: timestamp actual

2. Validar que `id_sensor` sea único

3. Actualizar `last_seen` en cada nueva lectura

4. Log del evento de registro en sistema

**Dependencias:** Ninguna

---

### RF-04: Detección Automática de Movilidad

**Prioridad:** Alta (Must Have)
**Complejidad:** Media
**Acceso:** Automático (backend)

**Descripción:**
El sistema debe detectar automáticamente si un sensor es móvil o fijo analizando la varianza de sus coordenadas GPS.

**Criterios de Aceptación:**
1. Algoritmo de detección:
   - Calcular varianza de coordenadas (latitud, longitud)
   - Si varianza > umbral (0.0001 grados ≈ 11 metros): marcar como móvil
   - Si varianza ≤ umbral: marcar como fijo

2. Evaluación después de las primeras 10 lecturas

3. Re-evaluación periódica cada 100 lecturas

4. Actualización automática del campo `is_movil`

5. Log del cambio de estado (fijo ↔ móvil)

**Dependencias:** RF-03

---

### RF-05: Sistema de Alertas Automáticas

**Prioridad:** Alta (Must Have)
**Complejidad:** Alta
**Acceso:** Público (visualización), Admin (gestión)

**Descripción:**
El sistema debe generar alertas automáticamente cuando las lecturas de sensores excedan los umbrales configurados.

**Criterios de Aceptación:**
1. Evaluación de umbrales en cada nueva lectura recibida

2. Comparar parámetros contra tabla `sensor_umbral`:
   - Temperatura vs `min_umbral` / `max_umbral`
   - Humedad vs umbrales
   - CO2 vs umbrales
   - CO vs umbrales

3. Al detectar valor fuera de umbral:
   - Crear registro en tabla `alertas`
   - Asignar tipo: "Exceso" o "Déficit"
   - Calcular gravedad:
     - Critical: > 50% fuera del umbral
     - High: 25-50% fuera del umbral
     - Medium: 10-25% fuera del umbral
     - Low: < 10% fuera del umbral
   - Generar mensaje descriptivo
   - `is_resolved`: false

4. Solo generar alerta si `alerta_habilitar: true` para ese parámetro

5. No duplicar alertas activas (mismo sensor + parámetro)

6. Visualización de alertas activas en dashboard

**Dependencias:** RF-03, RF-06

---

### RF-06: Configuración de Umbrales

**Prioridad:** Alta (Must Have)
**Complejidad:** Baja
**Acceso:** Admin

**Descripción:**
El administrador debe poder configurar umbrales mínimos y máximos para cada parámetro de cada sensor.

**Criterios de Aceptación:**
1. Interfaz de gestión de umbrales:
   - Lista de sensores
   - Parámetros configurables por sensor
   - Campos: min_umbral, max_umbral, alerta_habilitar

2. Validaciones:
   - min_umbral < max_umbral
   - Valores numéricos válidos
   - Parámetro debe existir

3. CRUD completo:
   - Crear umbral para sensor+parámetro
   - Leer umbrales existentes
   - Actualizar valores
   - Eliminar umbral (desactiva alertas)

4. Habilitación/deshabilitación individual de alertas por parámetro

5. Valores predeterminados:
   - Temperatura: 15°C - 35°C
   - Humedad: 30% - 80%
   - CO2: 300 ppm - 1000 ppm
   - CO: 0 ppm - 9 ppm

**Dependencias:** RF-03

---

### RF-07: Visualización de Lecturas Históricas

**Prioridad:** Alta (Must Have)
**Complejidad:** Media
**Acceso:** Público

**Descripción:**
El sistema debe permitir consultar y visualizar lecturas históricas con filtros avanzados.

**Criterios de Aceptación:**
1. Tabla de lecturas con columnas:
   - Fecha y hora
   - Sensor
   - Temperatura
   - Humedad
   - CO2
   - CO
   - Ubicación (lat, lon)
   - Zona

2. Filtros disponibles:
   - Rango de fechas (fecha inicio - fecha fin)
   - Sensor específico o todos
   - Zona (Urbana, Rural, Bosque, Río)
   - Parámetro (temperatura, humedad, etc.)

3. Paginación:
   - 20 registros por página (configurable)
   - Navegación entre páginas
   - Total de registros mostrado

4. Ordenamiento:
   - Por fecha (ascendente/descendente)
   - Por sensor
   - Por cualquier parámetro numérico

5. Búsqueda rápida por ID de sensor

**Dependencias:** RF-03

---

### RF-08: Exportación de Datos

**Prioridad:** Media (Should Have)
**Complejidad:** Media
**Acceso:** Público

**Descripción:**
El sistema debe permitir exportar datos en múltiples formatos para análisis externo.

**Criterios de Aceptación:**
1. **Formato Excel (XLSX):**
   - Incluir todas las columnas de lecturas
   - Formato de fecha legible
   - Hoja con metadatos (fecha exportación, filtros aplicados)
   - Tamaño máximo: 100,000 registros

2. **Formato PDF:**
   - Reporte con tabla de datos
   - Gráficos de tendencias (opcional)
   - Encabezado con logo IIAP
   - Pie de página con fecha y numeración

3. **Formato CSV:**
   - Separador: coma
   - Codificación: UTF-8
   - Primera fila: encabezados
   - Sin límite de registros

4. Respetar filtros aplicados en interfaz

5. Nombre de archivo: `lecturas_YYYYMMDD_HHmmss.{ext}`

6. Descarga directa al navegador

**Dependencias:** RF-07

---

### RF-09: Gestión de Recorridos Móviles

**Prioridad:** Media (Should Have)
**Complejidad:** Alta
**Acceso:** Público (visualización), Admin (gestión)

**Descripción:**
El sistema debe permitir visualizar, guardar y gestionar recorridos de sensores móviles en el mapa.

**Criterios de Aceptación:**
1. **Visualización de recorridos:**
   - Selección de sensor móvil
   - Selección de fecha
   - Dibujar trayectoria en mapa con línea continua
   - Puntos de inicio y fin destacados
   - Color de línea según rango temporal

2. **Guardar recorrido:**
   - Botón "Guardar recorrido"
   - Modal para ingresar nombre personalizado
   - Cálculo automático de:
     - Total de puntos
     - Distancia recorrida (km)
     - Duración (minutos)
   - Almacenamiento en formato GeoJSON
   - Metadata: zona predominante, altitud promedio

3. **Listar recorridos guardados:**
   - Tabla con recorridos
   - Columnas: nombre, sensor, fecha, distancia, duración
   - Acciones: ver en mapa, exportar, eliminar (admin)

4. **Exportar recorrido:**
   - Formato GeoJSON estándar
   - Compatible con software GIS (QGIS, ArcGIS)

5. Filtro por sensor móvil solamente

**Dependencias:** RF-02, RF-04

---

### RF-10: Mapas de Calor

**Prioridad:** Media (Should Have)
**Complejidad:** Alta
**Acceso:** Público

**Descripción:**
El sistema debe generar mapas de calor para visualizar la distribución espacial de parámetros ambientales.

**Criterios de Aceptación:**
1. Tres tipos de mapas de calor:
   - **Temperatura:** gradiente azul (frío) → rojo (caliente)
   - **CO2:** gradiente verde (bajo) → naranja (alto)
   - **CO:** gradiente verde (bajo) → rojo (alto)

2. Selector de tipo de mapa de calor

3. Selector de rango temporal:
   - Última hora
   - Últimas 24 horas
   - Últimos 7 días

4. Intensidad basada en valor del parámetro

5. Radio de influencia: 50 metros por punto

6. Leyenda de colores con escala numérica

7. Actualización al cambiar filtros

**Dependencias:** RF-02, RF-07

---

### RF-11: Autenticación de Administrador

**Prioridad:** Alta (Must Have)
**Complejidad:** Baja
**Acceso:** Admin

**Descripción:**
El sistema debe proporcionar autenticación segura para el usuario administrador único.

**Criterios de Aceptación:**
1. Página de login con:
   - Campo: Usuario/Email
   - Campo: Contraseña
   - Botón: Iniciar sesión
   - Mensaje de error descriptivo

2. Validación de credenciales:
   - Comparación de hash bcrypt
   - Tiempo de respuesta < 500ms
   - Bloqueo tras 5 intentos fallidos (5 minutos)

3. Generación de JWT:
   - Expiración: 8 horas
   - Payload: id_usuario, username, rol
   - Firma con secret seguro (128 caracteres hex)

4. Almacenamiento de token:
   - localStorage del navegador
   - Inclusión en header Authorization: Bearer {token}

5. Renovación automática de token antes de expiración

6. Botón de logout:
   - Eliminar token de localStorage
   - Redirección a página pública
   - Invalidación de sesión

**Dependencias:** Ninguna

---

### RF-12: Gestión de Sensores (CRUD Admin)

**Prioridad:** Alta (Must Have)
**Complejidad:** Baja
**Acceso:** Admin

**Descripción:**
El administrador debe poder gestionar manualmente los sensores registrados en el sistema.

**Criterios de Aceptación:**
1. **Listar sensores:**
   - Tabla con: ID, Nombre, Zona, Tipo (móvil/fijo), Estado, Última actividad
   - Filtros: estado, zona, tipo
   - Búsqueda por ID o nombre

2. **Crear sensor:**
   - Formulario con campos obligatorios:
     - id_sensor (único)
     - nombre_sensor
     - zona
     - estado (Activo/Inactivo/Mantenimiento)
     - descripción (opcional)
   - Validación de duplicados

3. **Editar sensor:**
   - Modificar: nombre, zona, estado, descripción
   - NO permitir cambiar id_sensor
   - Confirmación antes de guardar

4. **Eliminar sensor:**
   - Modal de confirmación
   - Advertencia si tiene lecturas asociadas
   - Eliminación en cascada de alertas y umbrales
   - Lecturas permanecen (integridad histórica)

5. **Ver detalle:**
   - Información completa del sensor
   - Estadísticas: total lecturas, última actividad
   - Alertas recientes
   - Umbrales configurados

**Dependencias:** RF-11

---

### RF-13: Resolución de Alertas

**Prioridad:** Media (Should Have)
**Complejidad:** Baja
**Acceso:** Admin

**Descripción:**
El administrador debe poder marcar alertas como resueltas una vez atendidas.

**Criterios de Aceptación:**
1. Lista de alertas con:
   - Estado: Activa / Resuelta
   - Sensor
   - Parámetro
   - Gravedad
   - Fecha activación
   - Fecha resolución

2. Filtros:
   - Estado (activas/resueltas/todas)
   - Gravedad
   - Sensor
   - Rango de fechas

3. Acción "Resolver":
   - Botón visible solo para alertas activas
   - Modal de confirmación
   - Actualizar campos:
     - `is_resolved: true`
     - `resuelto_at: timestamp actual`
   - Log de actividad

4. No permitir "des-resolver" alertas

5. Botón "Ver detalle" con información completa de la alerta

**Dependencias:** RF-11, RF-05

---

### RF-14: Preferencias del Sistema

**Prioridad:** Baja (Could Have)
**Complejidad:** Baja
**Acceso:** Admin

**Descripción:**
El administrador debe poder configurar preferencias personales del sistema.

**Criterios de Aceptación:**
1. Configuraciones disponibles:
   - Zona horaria (por defecto: America/Lima)
   - Formato de fecha (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
   - Intervalo de actualización automática (30s, 1min, 5min, manual)
   - Registros por página (10, 20, 50, 100)
   - Mostrar/ocultar gráficos en dashboard
   - Habilitar/deshabilitar animaciones

2. Formulario de configuración

3. Guardado instantáneo al cambiar valor

4. Aplicación inmediata de preferencias

5. Valores por defecto si no se han configurado

**Dependencias:** RF-11

---

### RF-15: API REST para Sensores IoT

**Prioridad:** Alta (Must Have)
**Complejidad:** Media
**Acceso:** Público (sin autenticación para sensores)

**Descripción:**
El sistema debe proporcionar un endpoint HTTP para recibir datos de sensores ESP32.

**Criterios de Aceptación:**
1. **Endpoint:** `POST /api/lecturas`

2. **Formato de entrada (JSON):**
```json
{
  "id_sensor": "ESP32_001",
  "temperatura": 28.5,
  "humedad": 65.3,
  "co2_nivel": 420,
  "co_nivel": 3.2,
  "latitud": -3.7437,
  "longitud": -73.2516,
  "altitud": 120.5,
  "zona": "Rural"
}
```

3. **Validaciones:**
   - Todos los campos son obligatorios
   - Tipos de datos correctos
   - Rangos válidos:
     - Temperatura: -50°C a 60°C
     - Humedad: 0% a 100%
     - CO2: 0 a 10000 ppm
     - CO: 0 a 1000 ppm
     - Latitud: -90 a 90
     - Longitud: -180 a 180
     - Zona: enum (Urbana, Rural, Bosque, Río)

4. **Respuestas:**
   - 201 Created: Lectura registrada exitosamente
   - 400 Bad Request: Datos inválidos (mensaje descriptivo)
   - 500 Internal Server Error: Error del servidor

5. **Procesamiento:**
   - Registro automático de sensor si no existe
   - Actualización de `last_seen`
   - Verificación de umbrales
   - Generación de alertas si aplica

6. **Logging:**
   - Registrar todas las solicitudes recibidas
   - Timestamp, IP origen, id_sensor
   - Errores detallados

7. **Límite de tasa:** 1 solicitud por segundo por sensor

**Dependencias:** RF-03, RF-05

---

## 5. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Rendimiento

**Prioridad:** Alta
**Categoría:** Performance

**Especificaciones:**

1. **Tiempo de respuesta:**
   - Páginas web: < 2 segundos (carga inicial)
   - Endpoints API: < 500 ms (90% de las solicitudes)
   - Dashboard: < 3 segundos (carga completa con gráficos)
   - Exportación de datos: < 10 segundos (hasta 10,000 registros)

2. **Capacidad:**
   - Soporte para 100 sensores simultáneos
   - Mínimo 50 usuarios concurrentes en web
   - 1 solicitud por segundo por sensor (14,400 lecturas/día por sensor)
   - Total: ~1,440,000 lecturas/día (100 sensores)

3. **Eficiencia:**
   - Uso de CPU: < 70% en operación normal
   - Uso de RAM: < 2 GB (backend)
   - Tamaño de base de datos: ~10 GB/año (estimado)
   - Bundle size frontend: < 2 MB (comprimido)

4. **Optimizaciones:**
   - Índices en columnas de búsqueda frecuente
   - Paginación en todas las listas
   - Lazy loading de imágenes y componentes
   - Compresión gzip para respuestas API
   - Cache de consultas frecuentes (5 minutos)

**Métrica de éxito:** 95% de las solicitudes cumplen con tiempos de respuesta especificados.

---

### RNF-02: Seguridad

**Prioridad:** Alta
**Categoría:** Security

**Especificaciones:**

1. **Autenticación:**
   - JWT con expiración de 8 horas
   - Secret de 128 caracteres hexadecimales
   - Renovación automática de token
   - Cierre de sesión explícito

2. **Autorización:**
   - Control de acceso basado en roles (RBAC)
   - Admin: acceso completo
   - Público: solo lectura (sin autenticación)
   - Validación en backend de cada solicitud

3. **Protección de datos:**
   - Contraseñas hasheadas con bcrypt (salt rounds: 10)
   - Variables sensibles en archivo .env (excluido de repositorio)
   - HTTPS obligatorio en producción
   - Validación de entrada en todos los endpoints

4. **Protección contra ataques:**
   - CORS configurado (orígenes permitidos específicos)
   - Helmet.js para headers HTTP seguros
   - Límite de tasa (rate limiting): 100 req/min por IP
   - Sanitización de inputs para prevenir XSS
   - Prisma ORM para prevenir SQL injection
   - Validación de tamaño de payload: máx 10MB

5. **Auditoría:**
   - Registro de acciones administrativas en `logs_actividad`
   - Timestamp, usuario, acción, IP
   - Retención de logs: 1 año mínimo

6. **Cumplimiento:**
   - Sin almacenamiento de datos personales sensibles (GDPR compatible)
   - Datos ambientales de acceso público (transparencia)

**Métrica de éxito:** Cero vulnerabilidades críticas en auditoría de seguridad.

---

### RNF-03: Usabilidad

**Prioridad:** Alta
**Categoría:** Usability

**Especificaciones:**

1. **Interfaz intuitiva:**
   - Navegación clara con máximo 3 clics para cualquier función
   - Etiquetas descriptivas en español
   - Iconos universalmente reconocibles (Heroicons)
   - Feedback visual inmediato para acciones (spinners, mensajes)

2. **Responsive design:**
   - Compatible con desktop (1920x1080, 1366x768)
   - Compatible con tablets (768x1024)
   - Compatible con móviles (375x667)
   - Diseño móvil-primero (mobile-first)

3. **Accesibilidad:**
   - Contraste de colores conforme WCAG 2.1 AA
   - Navegación por teclado funcional
   - Atributos ARIA en elementos interactivos
   - Texto alternativo en imágenes

4. **Consistencia:**
   - Paleta de colores unificada
   - Tipografía consistente (Inter, sans-serif)
   - Componentes reutilizables
   - Mensajes de error/éxito uniformes

5. **Ayuda al usuario:**
   - Tooltips en elementos complejos
   - Mensajes de error descriptivos (no códigos técnicos)
   - Validación en tiempo real en formularios
   - Confirmación para acciones destructivas

6. **Curva de aprendizaje:**
   - Usuario promedio debe completar tareas básicas en < 5 minutos sin capacitación
   - Manual de usuario disponible

**Métrica de éxito:** 90% de satisfacción en encuesta de usabilidad (SUS > 80).

---

### RNF-04: Disponibilidad

**Prioridad:** Alta
**Categoría:** Reliability

**Especificaciones:**

1. **Uptime:**
   - Disponibilidad objetivo: 99.5% mensual
   - Mantenimientos programados: fuera de horario laboral (22:00-06:00)
   - Notificación de mantenimiento: 48 horas de anticipación

2. **Tolerancia a fallos:**
   - Sistema continúa funcionando si sensores individuales fallan
   - Degradación elegante: funcionalidades básicas siempre disponibles
   - Mensajes informativos en caso de servicio parcial

3. **Recuperación:**
   - RTO (Recovery Time Objective): < 30 minutos
   - RPO (Recovery Point Objective): < 15 minutos
   - Backup automático de base de datos: diario (retención 30 días)
   - Backup semanal: retención 1 año

4. **Monitoreo:**
   - Health check endpoint: `/api/health`
   - Logs de errores centralizados
   - Alertas automáticas si servicio cae

**Métrica de éxito:** Cumplir 99.5% uptime en 6 meses de operación.

---

### RNF-05: Escalabilidad

**Prioridad:** Media
**Categoría:** Scalability

**Especificaciones:**

1. **Escalabilidad horizontal:**
   - Arquitectura stateless (sin sesión en servidor)
   - Posibilidad de múltiples instancias backend con load balancer
   - Base de datos PostgreSQL con replicación

2. **Escalabilidad vertical:**
   - Código optimizado para bajo consumo de recursos
   - Consultas SQL eficientes con índices

3. **Crecimiento esperado:**
   - Año 1: 100 sensores, 50,000 lecturas/día
   - Año 2: 250 sensores, 125,000 lecturas/día
   - Año 3: 500 sensores, 250,000 lecturas/día

4. **Estrategias:**
   - Paginación en todas las consultas
   - Archivo de datos antiguos (> 2 años) en almacenamiento frío
   - CDN para assets estáticos del frontend

**Métrica de éxito:** Sistema soporta 3x la carga inicial sin degradación.

---

### RNF-06: Mantenibilidad

**Prioridad:** Media
**Categoría:** Maintainability

**Especificaciones:**

1. **Código limpio:**
   - Estándares de código definidos (ESLint, Prettier)
   - Nombres descriptivos de variables y funciones
   - Comentarios en lógica compleja
   - Máximo 200 líneas por función

2. **Documentación:**
   - README con instrucciones de instalación y ejecución
   - Documentación de API (Swagger/OpenAPI)
   - Comentarios JSDoc en funciones públicas
   - Diagramas de arquitectura actualizados

3. **Testing:**
   - Cobertura de código: > 70% (objetivo)
   - Tests unitarios para lógica de negocio
   - Tests de integración para endpoints API

4. **Versionamiento:**
   - Git con commits descriptivos
   - Conventional Commits (feat:, fix:, docs:)
   - Branching strategy: main, develop, feature/*
   - Tags para releases (v1.0.0, v1.1.0)

5. **Logs:**
   - Niveles: error, warn, info, debug
   - Formato estructurado (JSON)
   - Rotación automática de archivos de log

**Métrica de éxito:** Nuevo desarrollador puede ejecutar proyecto localmente en < 30 minutos.

---

### RNF-07: Portabilidad

**Prioridad:** Baja
**Categoría:** Portability

**Especificaciones:**

1. **Independencia de plataforma:**
   - Backend: compatible con Windows, Linux, macOS
   - Frontend: funciona en cualquier navegador moderno
   - Base de datos: PostgreSQL (portable entre sistemas)

2. **Contenedores:**
   - Dockerfiles para backend y frontend
   - Docker Compose para entorno completo
   - Variables de entorno para configuración

3. **Compatibilidad de navegadores:**
   - Chrome/Edge: últimas 2 versiones
   - Firefox: últimas 2 versiones
   - Safari: últimas 2 versiones
   - NO compatible con Internet Explorer

4. **Despliegue:**
   - Compatible con servidores VPS (DigitalOcean, AWS EC2, Azure VM)
   - Compatible con plataformas PaaS (Heroku, Railway, Render)
   - Instrucciones de despliegue documentadas

**Métrica de éxito:** Despliegue exitoso en al menos 2 plataformas diferentes.

---

### RNF-08: Compatibilidad

**Prioridad:** Media
**Categoría:** Compatibility

**Especificaciones:**

1. **Integraciones:**
   - Sensores ESP32 con WiFi/GPRS
   - Aplicaciones móviles que transmitan datos vía Bluetooth
   - Cualquier cliente HTTP que cumpla el protocolo REST

2. **Formatos de datos:**
   - Entrada: JSON (application/json)
   - Salida: JSON, CSV, XLSX, PDF, GeoJSON
   - Coordenadas: sistema WGS84 (estándar GPS)

3. **Estándares:**
   - HTTP/1.1 y HTTP/2
   - REST API conforme principios Richardson Level 2
   - JSON Schema para validación de datos
   - GeoJSON RFC 7946

4. **Interoperabilidad:**
   - Exportaciones compatibles con Excel, QGIS, ArcGIS
   - Timestamps en formato ISO 8601
   - Codificación UTF-8 universal

**Métrica de éxito:** Integración exitosa con al menos 3 tipos de sensores diferentes.

---

## 6. CASOS DE USO

**Nota metodológica:** Los casos de uso están definidos siguiendo las mejores prácticas de IBM (verbos activos + objeto) para garantizar claridad y precisión. Durante el análisis inicial se identificaron 12 casos de uso detallados, los cuales fueron consolidados en **10 casos de uso finales** para simplificar la arquitectura sin perder funcionalidad.

### 6.1 Resumen de Casos de Uso (Versión Consolidada Final)

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

**Consolidaciones realizadas:**
- Los CU detallados a continuación reflejan el análisis inicial. Los casos CU-04 + CU-05 (recorridos) se consolidaron en CU-09, CU-11 (mapa calor) se integró en CU-06, y CU-03 + CU-12 (exportación) se consolidaron en CU-10.
- **Para trazabilidad:** Utilice la tabla anterior como referencia oficial de los 10 casos de uso finales implementados.

---

### 6.2 Casos de Uso Detallados (Análisis Inicial)

**IMPORTANTE:** Los casos de uso detallados a continuación corresponden al análisis inicial de requerimientos. La versión final consolidada se encuentra en la tabla de la sección 6.1.

---

### CU-01: Autenticarse en el Sistema

**Actor:** Usuario Público

**Precondiciones:** Ninguna (acceso público)

**Flujo Principal:**
1. Usuario accede a la URL de la plataforma
2. Sistema carga dashboard principal
3. Sistema muestra KPIs actualizados:
   - Total de sensores activos
   - Total de lecturas del día
   - Alertas activas
   - Última actualización
4. Sistema muestra mapa con sensores
5. Sistema muestra tabla de últimas lecturas
6. Sistema actualiza automáticamente cada 30 segundos
7. Usuario puede hacer clic en "Actualizar" para forzar actualización manual

**Postcondiciones:**
- Usuario visualiza información en tiempo real
- Sistema registra acceso en logs

**Flujos Alternativos:**
- **FA-01:** Si no hay sensores activos, mostrar mensaje "No hay sensores registrados actualmente"
- **FA-02:** Si hay error de conexión, mostrar mensaje de error y botón de reintento

---

### CU-02: Consultar Lecturas Históricas con Filtros

**Actor:** Usuario Público

**Precondiciones:** Existen lecturas en la base de datos

**Flujo Principal:**
1. Usuario navega a sección "Lecturas"
2. Sistema muestra tabla con últimas 20 lecturas
3. Usuario aplica filtros:
   - Selecciona rango de fechas: 01/01/2024 - 31/01/2024
   - Selecciona sensor: "ESP32_001"
   - Selecciona zona: "Urbana"
4. Usuario hace clic en "Filtrar"
5. Sistema consulta base de datos con parámetros
6. Sistema muestra resultados filtrados en tabla
7. Usuario puede paginar resultados
8. Usuario puede ordenar por cualquier columna

**Postcondiciones:**
- Usuario obtiene datos específicos solicitados
- Filtros permanecen activos durante la sesión

**Flujos Alternativos:**
- **FA-01:** Si no hay resultados, mostrar "No se encontraron lecturas con los filtros aplicados"
- **FA-02:** Usuario puede limpiar filtros con botón "Limpiar filtros"

---

### CU-03: Exportar Datos a Excel

**Actor:** Usuario Público

**Precondiciones:**
- Usuario ha aplicado filtros (o no)
- Existen datos para exportar

**Flujo Principal:**
1. Usuario está en sección "Lecturas"
2. Usuario hace clic en botón "Exportar" → "Excel"
3. Sistema valida cantidad de registros (< 100,000)
4. Sistema genera archivo XLSX con:
   - Hoja "Datos": tabla con todas las lecturas filtradas
   - Hoja "Metadatos": fecha exportación, filtros aplicados, total registros
5. Sistema inicia descarga: `lecturas_20240115_143022.xlsx`
6. Usuario guarda archivo en su dispositivo

**Postcondiciones:**
- Usuario obtiene archivo Excel con datos
- Sistema registra exportación en logs

**Flujos Alternativos:**
- **FA-01:** Si > 100,000 registros, mostrar mensaje "Demasiados registros. Por favor, aplique filtros más específicos"
- **FA-02:** Si error en generación, mostrar "Error al generar archivo. Intente nuevamente"

---

### CU-04: Ver Recorrido de Sensor Móvil en Mapa

**Actor:** Usuario Público

**Precondiciones:**
- Existe al menos un sensor móvil registrado
- Sensor tiene lecturas con coordenadas diferentes

**Flujo Principal:**
1. Usuario navega a sección "Mapa"
2. Sistema muestra mapa con todos los sensores
3. Usuario selecciona modo de visualización: "Rutas Móviles"
4. Sistema filtra y muestra solo sensores móviles en selector
5. Usuario selecciona sensor: "ESP32_MOVIL_01"
6. Usuario selecciona fecha: "15/01/2024"
7. Sistema consulta lecturas del sensor en esa fecha
8. Sistema dibuja trayectoria en mapa:
   - Línea continua conectando puntos
   - Marcador verde: punto inicio
   - Marcador rojo: punto fin
   - Popup con hora en cada punto
9. Usuario puede hacer zoom y explorar el recorrido

**Postcondiciones:**
- Usuario visualiza ruta completa del sensor
- Mapa actualizado con trayectoria

**Flujos Alternativos:**
- **FA-01:** Si sensor no tiene datos para esa fecha, mostrar "No hay datos para la fecha seleccionada"
- **FA-02:** Usuario puede cambiar de fecha sin recargar página

---

### CU-05: Guardar Recorrido Personalizado

**Actor:** Usuario Público

**Precondiciones:**
- Usuario ha visualizado un recorrido en el mapa (CU-04)

**Flujo Principal:**
1. Usuario visualiza recorrido en mapa
2. Usuario hace clic en botón "Guardar recorrido"
3. Sistema abre modal con formulario:
   - Campo "Nombre del recorrido" (obligatorio)
   - Información calculada (no editable):
     - Total de puntos: 145
     - Distancia: 12.5 km
     - Duración: 3 horas 25 minutos
4. Usuario ingresa nombre: "Recorrido Río Amazonas - Tramo Norte"
5. Usuario hace clic en "Guardar"
6. Sistema valida nombre (no vacío, máx 100 caracteres)
7. Sistema guarda recorrido en base de datos:
   - Genera GeoJSON con todos los puntos
   - Calcula metadata
   - Registra usuario: "público" (sin autenticación)
8. Sistema muestra mensaje: "Recorrido guardado exitosamente"
9. Sistema actualiza lista de recorridos guardados

**Postcondiciones:**
- Recorrido almacenado en base de datos
- Disponible en lista de recorridos guardados

**Flujos Alternativos:**
- **FA-01:** Si nombre vacío, mostrar error "El nombre es obligatorio"
- **FA-02:** Usuario puede cancelar sin guardar

---

### CU-06: Iniciar Sesión como Administrador

**Actor:** Administrador

**Precondiciones:** Usuario administrador existe en base de datos

**Flujo Principal:**
1. Administrador navega a `/login`
2. Sistema muestra formulario de login
3. Administrador ingresa credenciales:
   - Usuario: "admin@iiap.gob.pe"
   - Contraseña: "••••••••"
4. Administrador hace clic en "Iniciar sesión"
5. Sistema valida credenciales:
   - Busca usuario en base de datos
   - Compara hash de contraseña con bcrypt
6. Sistema genera JWT:
   - Payload: {id: 1, username: "admin", rol: "admin"}
   - Expiración: 8 horas
7. Sistema devuelve token al cliente
8. Cliente almacena token en localStorage
9. Sistema redirige a dashboard administrativo
10. Sistema muestra mensaje: "Bienvenido, Admin"

**Postcondiciones:**
- Administrador autenticado con JWT válido
- Acceso a funcionalidades administrativas habilitado
- Sesión registrada en logs

**Flujos Alternativos:**
- **FA-01:** Si credenciales incorrectas, mostrar "Usuario o contraseña incorrectos" (sin especificar cuál)
- **FA-02:** Si 5 intentos fallidos consecutivos, bloquear por 5 minutos
- **FA-03:** Si usuario inactivo, mostrar "Usuario desactivado. Contacte al soporte"

---

### CU-07: Crear Nuevo Sensor Manualmente

**Actor:** Administrador

**Precondiciones:**
- Administrador autenticado
- ID de sensor no existe en base de datos

**Flujo Principal:**
1. Administrador navega a "Configuración" → "Sensores"
2. Sistema muestra lista de sensores existentes
3. Administrador hace clic en botón "Nuevo Sensor"
4. Sistema abre modal con formulario:
   - ID Sensor (obligatorio, único)
   - Nombre (obligatorio)
   - Zona (selector: Urbana/Rural/Bosque/Río)
   - Estado (selector: Activo/Inactivo/Mantenimiento)
   - Descripción (opcional, textarea)
5. Administrador completa formulario:
   - ID: "ESP32_CUSTOM_01"
   - Nombre: "Sensor Experimental Laboratorio"
   - Zona: "Urbana"
   - Estado: "Activo"
   - Descripción: "Sensor para pruebas de calibración"
6. Administrador hace clic en "Crear"
7. Sistema valida datos:
   - ID único (no existe)
   - Todos los campos obligatorios completados
   - Formato correcto
8. Sistema crea registro en base de datos
9. Sistema registra acción en `logs_actividad`
10. Sistema muestra mensaje: "Sensor creado exitosamente"
11. Sistema actualiza lista de sensores

**Postcondiciones:**
- Nuevo sensor registrado en base de datos
- Sensor visible en lista
- Acción registrada en logs

**Flujos Alternativos:**
- **FA-01:** Si ID duplicado, mostrar "El ID ya existe. Ingrese uno diferente"
- **FA-02:** Si error de validación, resaltar campos con error en rojo
- **FA-03:** Administrador puede cancelar sin guardar

---

### CU-08: Configurar Umbrales de Alertas

**Actor:** Administrador

**Precondiciones:**
- Administrador autenticado
- Sensor existe en base de datos

**Flujo Principal:**
1. Administrador navega a "Configuración" → "Umbrales"
2. Sistema muestra lista de sensores
3. Administrador selecciona sensor: "ESP32_001"
4. Sistema muestra tabla con parámetros actuales:
   | Parámetro | Mín | Máx | Alertas |
   |-----------|-----|-----|---------|
   | Temperatura | 15°C | 35°C | ✓ Activo |
   | Humedad | 30% | 80% | ✓ Activo |
   | CO2 | 300 ppm | 1000 ppm | ✓ Activo |
   | CO | 0 ppm | 9 ppm | ✓ Activo |
5. Administrador hace clic en "Editar" para Temperatura
6. Sistema abre modal de edición:
   - Umbral Mínimo: [input] °C
   - Umbral Máximo: [input] °C
   - Alertas Habilitadas: [checkbox]
7. Administrador modifica valores:
   - Mín: 10°C (antes 15°C)
   - Máx: 40°C (antes 35°C)
8. Administrador hace clic en "Guardar"
9. Sistema valida:
   - Mín < Máx
   - Valores numéricos válidos
10. Sistema actualiza tabla `sensor_umbral`
11. Sistema registra acción en logs
12. Sistema muestra mensaje: "Umbrales actualizados"

**Postcondiciones:**
- Umbrales actualizados en base de datos
- Futuras lecturas se evaluarán con nuevos umbrales
- Cambio registrado en logs

**Flujos Alternativos:**
- **FA-01:** Si Mín ≥ Máx, mostrar error "El mínimo debe ser menor que el máximo"
- **FA-02:** Administrador puede deshabilitar alertas desmarcando checkbox
- **FA-03:** Si no existen umbrales, sistema usa valores predeterminados

---

### CU-09: Resolver Alerta Activa

**Actor:** Administrador

**Precondiciones:**
- Administrador autenticado
- Existe al menos una alerta activa

**Flujo Principal:**
1. Administrador navega a "Alertas"
2. Sistema muestra lista de alertas filtradas por "Activas"
3. Sistema muestra tabla:
   | ID | Sensor | Parámetro | Gravedad | Valor | Fecha | Acciones |
   |----|--------|-----------|----------|-------|-------|----------|
   | 45 | ESP32_001 | Temperatura | High | 42°C | 2024-01-15 14:30 | [Resolver] [Ver] |
4. Administrador revisa alerta y determina que fue atendida (ventilación mejorada)
5. Administrador hace clic en botón "Resolver"
6. Sistema abre modal de confirmación:
   - "¿Confirma que desea marcar esta alerta como resuelta?"
   - Información de la alerta
   - Botones: [Cancelar] [Confirmar]
7. Administrador hace clic en "Confirmar"
8. Sistema actualiza registro en `alertas`:
   - `is_resolved: true`
   - `resuelto_at: 2024-01-15 15:45:00`
9. Sistema registra acción en `logs_actividad`
10. Sistema muestra mensaje: "Alerta resuelta exitosamente"
11. Sistema actualiza lista de alertas (alerta ya no aparece en "Activas")

**Postcondiciones:**
- Alerta marcada como resuelta
- Visible solo en filtro "Resueltas"
- Acción registrada en logs
- KPI "Alertas activas" actualizado

**Flujos Alternativos:**
- **FA-01:** Administrador puede cancelar sin resolver
- **FA-02:** Si error al actualizar, mostrar "Error al resolver alerta. Intente nuevamente"

---

### CU-10: Enviar Datos desde Sensor ESP32

**Actor:** Sensor IoT (ESP32)

**Precondiciones:**
- Sensor tiene conectividad (WiFi/GPRS)
- Sensor conoce URL del endpoint

**Flujo Principal:**
1. Sensor recopila datos ambientales cada 60 segundos:
   - Temperatura: 28.5°C (DHT22)
   - Humedad: 65.3% (DHT22)
   - CO2: 420 ppm (MQ-135)
   - CO: 3.2 ppm (MQ-7)
   - GPS: -3.7437, -73.2516 (NEO-6M)
2. Sensor construye payload JSON:
```json
{
  "id_sensor": "ESP32_001",
  "temperatura": 28.5,
  "humedad": 65.3,
  "co2_nivel": 420,
  "co_nivel": 3.2,
  "latitud": -3.7437,
  "longitud": -73.2516,
  "altitud": 120.5,
  "zona": "Rural"
}
```
3. Sensor envía POST a `http://api.iiap.gob.pe/api/lecturas`
4. Sistema backend recibe solicitud
5. Sistema valida JSON:
   - Todos los campos presentes
   - Tipos de datos correctos
   - Rangos válidos
6. Sistema verifica si sensor existe:
   - Si NO existe: crea registro automáticamente (RF-03)
   - Si existe: actualiza `last_seen`
7. Sistema inserta lectura en tabla `lecturas`
8. Sistema verifica umbrales (RF-05):
   - Compara temperatura, humedad, CO2, CO contra tabla `sensor_umbral`
   - Si fuera de rango: genera alerta
9. Sistema devuelve respuesta:
```json
{
  "success": true,
  "message": "Lectura registrada exitosamente",
  "id_lectura": 12345,
  "timestamp": "2024-01-15T14:30:22.000Z"
}
```
10. Sensor recibe confirmación y continúa ciclo

**Postcondiciones:**
- Lectura almacenada en base de datos
- Sensor actualizado (last_seen)
- Alertas generadas si aplica
- Datos disponibles para visualización en web

**Flujos Alternativos:**
- **FA-01:** Si validación falla, sistema devuelve 400 Bad Request con mensaje específico
- **FA-02:** Si error de servidor, devuelve 500 con mensaje genérico (sensor reintenta en 30 segundos)
- **FA-03:** Si rate limit excedido, devuelve 429 Too Many Requests

---

### CU-11: Ver Mapa de Calor de Temperatura

**Actor:** Usuario Público

**Precondiciones:**
- Existen lecturas recientes con coordenadas GPS
- Usuario tiene JavaScript habilitado

**Flujo Principal:**
1. Usuario navega a sección "Mapa"
2. Sistema muestra mapa con vista predeterminada (sensores)
3. Usuario selecciona modo: "Mapa de Calor - Temperatura"
4. Sistema muestra selector de rango temporal:
   - Última hora
   - Últimas 24 horas (predeterminado)
   - Últimos 7 días
5. Sistema consulta lecturas de temperatura de últimas 24 horas
6. Sistema genera capa de mapa de calor:
   - Gradiente: azul (< 20°C) → verde (20-25°C) → amarillo (25-30°C) → naranja (30-35°C) → rojo (> 35°C)
   - Radio de influencia: 50 metros por punto
   - Intensidad proporcional al valor
7. Sistema superpone capa sobre mapa base
8. Sistema muestra leyenda de colores en esquina inferior derecha
9. Usuario puede:
   - Hacer zoom para ver detalles
   - Cambiar rango temporal
   - Cambiar a otro tipo de mapa de calor (CO2, CO)

**Postcondiciones:**
- Usuario visualiza distribución espacial de temperatura
- Puede identificar zonas calientes y frías

**Flujos Alternativos:**
- **FA-01:** Si no hay datos, mostrar "No hay datos de temperatura para el período seleccionado"
- **FA-02:** Usuario puede volver a vista normal de sensores en cualquier momento

---

### CU-12: Exportar Recorrido como GeoJSON

**Actor:** Usuario Público

**Precondiciones:**
- Existe al menos un recorrido guardado

**Flujo Principal:**
1. Usuario navega a "Mapa" → "Recorridos Guardados"
2. Sistema muestra tabla de recorridos:
   | Nombre | Sensor | Fecha | Distancia | Duración | Acciones |
   |--------|--------|-------|-----------|----------|----------|
   | Recorrido Río Amazonas | ESP32_M01 | 15/01/2024 | 12.5 km | 3h 25m | [Ver] [Exportar] |
3. Usuario hace clic en botón "Exportar" del recorrido deseado
4. Sistema recupera datos de `recorridos_guardados`:
   - `puntos_geojson` (estructura GeoJSON almacenada)
   - Metadata adicional
5. Sistema genera archivo GeoJSON estándar:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-73.2516, -3.7437, 120.5],
          [-73.2520, -3.7440, 121.2],
          ...
        ]
      },
      "properties": {
        "id_sensor": "ESP32_M01",
        "nombre_recorrido": "Recorrido Río Amazonas",
        "fecha": "2024-01-15",
        "distancia_km": 12.5,
        "duracion_minutos": 205
      }
    }
  ]
}
```
6. Sistema inicia descarga: `recorrido_ESP32_M01_20240115.geojson`
7. Usuario guarda archivo

**Postcondiciones:**
- Usuario obtiene archivo GeoJSON compatible con GIS
- Puede importar en QGIS, ArcGIS, Google Earth, etc.

**Flujos Alternativos:**
- **FA-01:** Si error en generación, mostrar "Error al exportar recorrido"
- **FA-02:** Usuario puede exportar múltiples recorridos secuencialmente

---

## 7. MODELO DE DATOS

### 7.1 Diagrama Entidad-Relación (ER)

```
┌─────────────────────┐         ┌──────────────────────┐
│     sensores        │         │      lecturas        │
├─────────────────────┤         ├──────────────────────┤
│ id_sensor (PK)      │────────<│ id_lectura (PK)      │
│ nombre_sensor       │    1:N  │ id_sensor (FK)       │
│ zona                │         │ lectura_datetime     │
│ is_movil            │         │ temperatura          │
│ description         │         │ humedad              │
│ installation_date   │         │ co2_nivel            │
│ last_seen           │         │ co_nivel             │
│ estado              │         │ latitud              │
│ created_at          │         │ longitud             │
└─────────────────────┘         │ altitud              │
        │                       │ zona                 │
        │                       │ created_at           │
        │                       └──────────────────────┘
        │
        │ 1:N
        │
        ▼
┌──────────────────────┐
│      alertas         │
├──────────────────────┤
│ id_alerta (PK)       │
│ id_sensor (FK)       │
│ alerta_tipo          │
│ parametro_nombre     │
│ umbral_valor         │
│ actual_valor         │
│ mensaje              │
│ gravedad             │
│ se_activo_at         │
│ resuelto_at          │
│ is_resolved          │
└──────────────────────┘


┌─────────────────────┐         ┌──────────────────────────┐
│     sensores        │         │    sensor_umbral         │
├─────────────────────┤         ├──────────────────────────┤
│ id_sensor (PK)      │────────<│ id_sensor_umbral (PK)    │
│ ...                 │    1:N  │ id_sensor (FK)           │
└─────────────────────┘         │ parametro_nombre         │
                                │ min_umbral               │
                                │ max_umbral               │
                                │ alerta_habilitar         │
                                │ created_at               │
                                │ updated_at               │
                                └──────────────────────────┘


┌─────────────────────┐         ┌──────────────────────────┐
│     sensores        │         │   recorridos_guardados   │
├─────────────────────┤         ├──────────────────────────┤
│ id_sensor (PK)      │────────<│ id_recorrido (PK)        │
│ ...                 │    1:N  │ id_sensor (FK)           │
└─────────────────────┘         │ nombre_recorrido         │
                                │ fecha_recorrido          │
                                │ hora_inicio              │
                                │ hora_fin                 │
                                │ total_puntos             │
                                │ distancia_km             │
                                │ duracion_minutos         │
                                │ puntos_geojson           │
                                │ metadata                 │
                                │ created_at               │
                                │ usuario_creo             │
                                └──────────────────────────┘


┌─────────────────────┐         ┌──────────────────────────┐
│      usuarios       │         │    logs_actividad        │
├─────────────────────┤         ├──────────────────────────┤
│ id_usuario (PK)     │────────<│ id_log (PK)              │
│ username            │    1:N  │ id_usuario (FK)          │
│ email               │         │ username                 │
│ password_hash       │         │ accion                   │
│ nombre_completo     │         │ tabla_afectada           │
│ rol                 │         │ id_registro              │
│ estado              │         │ detalles                 │
│ ultimo_acceso       │         │ ip_address               │
│ created_at          │         │ created_at               │
│ updated_at          │         └──────────────────────────┘
└─────────────────────┘
        │
        │ 1:1
        │
        ▼
┌──────────────────────────┐
│  preferencias_sistema    │
├──────────────────────────┤
│ id_preferencia (PK)      │
│ id_usuario (FK, Unique)  │
│ zona_horaria             │
│ formato_fecha            │
│ intervalo_actualizacion  │
│ registros_por_pagina     │
│ mostrar_graficos         │
│ animaciones_graficos     │
│ created_at               │
│ updated_at               │
└──────────────────────────┘
```

### 7.2 Descripción de Tablas

#### Tabla: sensores

**Descripción:** Almacena información de todos los sensores registrados en el sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_sensor | VARCHAR(50) | PRIMARY KEY | Identificador único del sensor (ej: ESP32_001) |
| nombre_sensor | VARCHAR(100) | NOT NULL | Nombre descriptivo del sensor |
| zona | ENUM | NOT NULL | Zona de ubicación: Urbana, Rural, Bosque, Río |
| is_movil | BOOLEAN | DEFAULT false | Indica si el sensor es móvil (true) o fijo (false) |
| description | TEXT | NULLABLE | Descripción adicional del sensor |
| installation_date | DATE | NOT NULL | Fecha de instalación/registro |
| last_seen | DATETIME | NOT NULL | Última vez que el sensor envió datos |
| estado | ENUM | DEFAULT 'Active' | Estado: Active, Inactive, Maintenance |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |

**Índices:**
- PRIMARY KEY (id_sensor)
- INDEX idx_sensores_zona (zona)
- INDEX idx_sensores_estado (estado)
- INDEX idx_sensores_is_movil (is_movil)

---

#### Tabla: lecturas

**Descripción:** Almacena todas las lecturas de datos ambientales enviadas por los sensores.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_lectura | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único de la lectura |
| id_sensor | VARCHAR(50) | FOREIGN KEY → sensores(id_sensor) | Sensor que generó la lectura |
| lectura_datetime | DATETIME | NOT NULL | Fecha y hora de la lectura |
| temperatura | DECIMAL(5,2) | NOT NULL | Temperatura en °C |
| humedad | DECIMAL(5,2) | NOT NULL | Humedad relativa en % |
| co2_nivel | DECIMAL(7,2) | NOT NULL | Nivel de CO2 en ppm |
| co_nivel | DECIMAL(7,2) | NOT NULL | Nivel de CO en ppm |
| latitud | DECIMAL(10,7) | NOT NULL | Latitud GPS (WGS84) |
| longitud | DECIMAL(10,7) | NOT NULL | Longitud GPS (WGS84) |
| altitud | DECIMAL(7,2) | NULLABLE | Altitud en metros sobre nivel del mar |
| zona | ENUM | NOT NULL | Zona: Urbana, Rural, Bosque, Río |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de registro en sistema |

**Índices:**
- PRIMARY KEY (id_lectura)
- FOREIGN KEY (id_sensor) REFERENCES sensores(id_sensor)
- INDEX idx_lecturas_sensor (id_sensor)
- INDEX idx_lecturas_datetime (lectura_datetime)
- INDEX idx_lecturas_sensor_datetime (id_sensor, lectura_datetime)
- INDEX idx_lecturas_zona (zona)

**Nota:** Esta tabla crecerá significativamente (estimado 1.5M registros/año con 100 sensores). Considerar particionamiento por fecha en futuras versiones.

---

#### Tabla: alertas

**Descripción:** Registro de alertas generadas cuando lecturas exceden umbrales configurados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_alerta | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único de la alerta |
| id_sensor | VARCHAR(50) | FOREIGN KEY → sensores(id_sensor) | Sensor que generó la alerta |
| alerta_tipo | ENUM | NOT NULL | Tipo: Exceso, Déficit |
| parametro_nombre | VARCHAR(50) | NOT NULL | Parámetro que excedió: temperatura, humedad, co2_nivel, co_nivel |
| umbral_valor | DECIMAL(7,2) | NOT NULL | Valor del umbral configurado |
| actual_valor | DECIMAL(7,2) | NOT NULL | Valor real que generó la alerta |
| mensaje | TEXT | NOT NULL | Mensaje descriptivo de la alerta |
| gravedad | ENUM | NOT NULL | Severidad: Low, Medium, High, Critical |
| se_activo_at | DATETIME | NOT NULL | Momento en que se activó la alerta |
| resuelto_at | DATETIME | NULLABLE | Momento en que se resolvió (null si activa) |
| is_resolved | BOOLEAN | DEFAULT false | Estado de resolución |

**Índices:**
- PRIMARY KEY (id_alerta)
- FOREIGN KEY (id_sensor) REFERENCES sensores(id_sensor)
- INDEX idx_alertas_sensor (id_sensor)
- INDEX idx_alertas_resolved (is_resolved)
- INDEX idx_alertas_gravedad (gravedad)
- INDEX idx_alertas_activo_at (se_activo_at)

---

#### Tabla: sensor_umbral

**Descripción:** Configuración de umbrales personalizados por sensor y parámetro.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_sensor_umbral | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único del umbral |
| id_sensor | VARCHAR(50) | FOREIGN KEY → sensores(id_sensor) | Sensor al que aplica el umbral |
| parametro_nombre | VARCHAR(50) | NOT NULL | Parámetro: temperatura, humedad, co2_nivel, co_nivel |
| min_umbral | DECIMAL(7,2) | NOT NULL | Valor mínimo aceptable |
| max_umbral | DECIMAL(7,2) | NOT NULL | Valor máximo aceptable |
| alerta_habilitar | BOOLEAN | DEFAULT true | Si está habilitada la generación de alertas |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Fecha de última actualización |

**Restricciones adicionales:**
- CHECK (min_umbral < max_umbral)
- UNIQUE (id_sensor, parametro_nombre)

**Índices:**
- PRIMARY KEY (id_sensor_umbral)
- FOREIGN KEY (id_sensor) REFERENCES sensores(id_sensor)
- UNIQUE INDEX idx_sensor_parametro (id_sensor, parametro_nombre)

---

#### Tabla: usuarios

**Descripción:** Información de usuarios del sistema (actualmente solo administrador).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_usuario | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único del usuario |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Nombre de usuario para login |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Correo electrónico |
| password_hash | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt |
| nombre_completo | VARCHAR(100) | NOT NULL | Nombre completo del usuario |
| rol | ENUM | NOT NULL | Rol: admin, analyst, researcher |
| estado | ENUM | DEFAULT 'active' | Estado: active, inactive |
| ultimo_acceso | DATETIME | NULLABLE | Última vez que inició sesión |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Fecha de última actualización |

**Índices:**
- PRIMARY KEY (id_usuario)
- UNIQUE INDEX idx_usuarios_username (username)
- UNIQUE INDEX idx_usuarios_email (email)
- INDEX idx_usuarios_rol (rol)

**Nota:** Versión 1.0 solo incluye un usuario administrador. Expansión futura contempla múltiples usuarios con roles diferenciados.

---

#### Tabla: logs_actividad

**Descripción:** Registro de auditoría de acciones administrativas en el sistema.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_log | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único del log |
| id_usuario | INTEGER | FOREIGN KEY → usuarios(id_usuario) | Usuario que ejecutó la acción |
| username | VARCHAR(50) | NOT NULL | Nombre del usuario (desnormalizado para integridad) |
| accion | VARCHAR(100) | NOT NULL | Tipo de acción: CREATE, UPDATE, DELETE, LOGIN, etc. |
| tabla_afectada | VARCHAR(50) | NULLABLE | Tabla de BD afectada (si aplica) |
| id_registro | VARCHAR(50) | NULLABLE | ID del registro afectado |
| detalles | TEXT | NULLABLE | Detalles adicionales en formato JSON |
| ip_address | VARCHAR(45) | NULLABLE | Dirección IP del cliente (IPv4 o IPv6) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Momento de la acción |

**Índices:**
- PRIMARY KEY (id_log)
- FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
- INDEX idx_logs_usuario (id_usuario)
- INDEX idx_logs_accion (accion)
- INDEX idx_logs_tabla (tabla_afectada)
- INDEX idx_logs_created (created_at)

**Retención:** Mínimo 1 año. Considerar archivo de logs antiguos en storage separado.

---

#### Tabla: recorridos_guardados

**Descripción:** Almacena recorridos de sensores móviles guardados por usuarios.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_recorrido | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único del recorrido |
| id_sensor | VARCHAR(50) | FOREIGN KEY → sensores(id_sensor) | Sensor que realizó el recorrido |
| nombre_recorrido | VARCHAR(100) | NOT NULL | Nombre descriptivo asignado por usuario |
| fecha_recorrido | DATE | NOT NULL | Fecha del recorrido |
| hora_inicio | TIME | NOT NULL | Hora de inicio del recorrido |
| hora_fin | TIME | NOT NULL | Hora de fin del recorrido |
| total_puntos | INTEGER | NOT NULL | Número de puntos GPS en el recorrido |
| distancia_km | DECIMAL(8,2) | NOT NULL | Distancia total recorrida en kilómetros |
| duracion_minutos | INTEGER | NOT NULL | Duración total en minutos |
| puntos_geojson | JSON | NOT NULL | Datos del recorrido en formato GeoJSON |
| metadata | JSON | NULLABLE | Metadatos adicionales (zona predominante, altitud promedio, etc.) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de guardado |
| usuario_creo | VARCHAR(50) | DEFAULT 'público' | Usuario que guardó (admin o público) |

**Índices:**
- PRIMARY KEY (id_recorrido)
- FOREIGN KEY (id_sensor) REFERENCES sensores(id_sensor)
- INDEX idx_recorridos_sensor (id_sensor)
- INDEX idx_recorridos_fecha (fecha_recorrido)
- INDEX idx_recorridos_sensor_fecha (id_sensor, fecha_recorrido)

---

#### Tabla: preferencias_sistema

**Descripción:** Configuración personal del usuario administrador.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id_preferencia | INTEGER | PRIMARY KEY AUTO_INCREMENT | Identificador único de preferencias |
| id_usuario | INTEGER | FOREIGN KEY → usuarios(id_usuario), UNIQUE | Usuario (solo uno en v1.0) |
| zona_horaria | VARCHAR(50) | DEFAULT 'America/Lima' | Zona horaria (tz database) |
| formato_fecha | VARCHAR(20) | DEFAULT 'DD/MM/YYYY' | Formato de visualización de fechas |
| intervalo_actualizacion | INTEGER | DEFAULT 30 | Segundos entre actualizaciones auto (0 = manual) |
| registros_por_pagina | INTEGER | DEFAULT 20 | Registros por página en tablas |
| mostrar_graficos | BOOLEAN | DEFAULT true | Mostrar gráficos en dashboard |
| animaciones_graficos | BOOLEAN | DEFAULT true | Habilitar animaciones en gráficos |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | Fecha de última actualización |

**Índices:**
- PRIMARY KEY (id_preferencia)
- FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
- UNIQUE INDEX idx_preferencias_usuario (id_usuario)

---

### 7.3 Relaciones

**1. sensores → lecturas (1:N)**
- Un sensor puede tener múltiples lecturas
- Una lectura pertenece a un único sensor
- ON DELETE CASCADE no recomendado (preservar datos históricos)

**2. sensores → alertas (1:N)**
- Un sensor puede generar múltiples alertas
- Una alerta pertenece a un único sensor
- ON DELETE CASCADE recomendado

**3. sensores → sensor_umbral (1:N)**
- Un sensor puede tener múltiples umbrales (uno por parámetro)
- Un umbral pertenece a un único sensor
- ON DELETE CASCADE recomendado

**4. sensores → recorridos_guardados (1:N)**
- Un sensor móvil puede tener múltiples recorridos guardados
- Un recorrido pertenece a un único sensor
- ON DELETE CASCADE opcional

**5. usuarios → logs_actividad (1:N)**
- Un usuario puede generar múltiples logs
- Un log pertenece a un único usuario
- ON DELETE SET NULL (preservar logs aunque usuario se elimine)

**6. usuarios → preferencias_sistema (1:1)**
- Un usuario tiene un conjunto de preferencias
- Un conjunto de preferencias pertenece a un único usuario
- ON DELETE CASCADE recomendado

---

## 8. ESPECIFICACIONES TÉCNICAS

### 8.1 Arquitectura del Sistema

**Patrón Arquitectónico:** Cliente-Servidor de 3 capas

```
┌──────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Frontend Web (React + Vite)               │  │
│  │  - Componentes React                               │  │
│  │  - React Router (navegación)                       │  │
│  │  - Context API (estado global)                     │  │
│  │  - Tailwind CSS (estilos)                          │  │
│  │  - Leaflet (mapas)                                 │  │
│  │  - Recharts (gráficos)                             │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP/REST (JSON)
                     │
┌────────────────────▼─────────────────────────────────────┐
│                    CAPA DE LÓGICA DE NEGOCIO              │
│  ┌────────────────────────────────────────────────────┐  │
│  │       Backend API (Node.js + Express)              │  │
│  │  - Controladores (business logic)                  │  │
│  │  - Rutas (endpoints)                               │  │
│  │  - Middleware (auth, validation)                   │  │
│  │  - Prisma Client (ORM)                             │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ Prisma (SQL)
                     │
┌────────────────────▼─────────────────────────────────────┐
│                    CAPA DE DATOS                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          PostgreSQL Database                       │  │
│  │  - Tablas relacionales                             │  │
│  │  - Índices optimizados                             │  │
│  │  - Restricciones de integridad                     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    CLIENTES EXTERNOS                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Sensores IoT (ESP32)                              │  │
│  │  - WiFi / GPRS                                     │  │
│  │  - HTTP POST a /api/lecturas                       │  │
│  │  - Payload JSON                                    │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP/REST (JSON)
                     │
                     └────────────► Backend API
```

### 8.2 Stack Tecnológico Detallado

#### Backend (API)

**Runtime y Framework:**
- **Node.js v22.16.0+:** Entorno de ejecución JavaScript del lado servidor
- **Express.js v4.21.2:** Framework web minimalista y flexible

**ORM y Base de Datos:**
- **Prisma v6.14.0:** ORM moderno con type-safety
- **PostgreSQL:** Base de datos relacional (versión 12+)
- **@prisma/client:** Cliente generado automáticamente

**Seguridad:**
- **jsonwebtoken v9.0.2:** Generación y verificación de JWT
- **bcryptjs v3.0.2:** Hashing de contraseñas
- **Helmet v8.1.0:** Headers HTTP seguros
- **CORS v2.8.5:** Control de origen cruzado

**Utilidades:**
- **dotenv v17.2.1:** Gestión de variables de entorno
- **morgan v1.10.1:** Logger de peticiones HTTP
- **axios v1.12.2:** Cliente HTTP para solicitudes externas

**Desarrollo:**
- **nodemon v3.1.10:** Auto-reload durante desarrollo

#### Frontend (Web)

**Framework y Build:**
- **React v19.1.1:** Librería de UI declarativa
- **Vite v7.1.7:** Build tool ultrarrápido
- **React Router DOM v7.9.1:** Navegación client-side

**UI y Estilos:**
- **Tailwind CSS v3.4.17:** Framework CSS utility-first
- **Heroicons v2.2.0:** Iconos SVG oficiales de Tailwind

**Mapas:**
- **Leaflet v1.9.4:** Librería de mapas interactivos
- **React Leaflet v5.0.0:** Componentes React para Leaflet

**Gráficos:**
- **Recharts v3.2.1:** Librería de gráficos composable
- **Chart.js v4.5.0:** Librería de gráficos flexible
- **react-chartjs-2 v5.3.0:** Wrapper de React para Chart.js

**Utilidades:**
- **axios v1.12.2:** Cliente HTTP
- **jwt-decode v4.0.0:** Decodificación de JWT (sin verificación)
- **date-fns v4.1.0:** Manipulación de fechas

**Exportación:**
- **xlsx v0.18.5:** Generación de archivos Excel
- **jspdf v3.0.3:** Generación de archivos PDF
- **html2canvas v1.4.1:** Capturas de pantalla

#### IoT (Sensores)

**Hardware:**
- **ESP32:** Microcontrolador con WiFi/Bluetooth integrado
- **DHT22:** Sensor de temperatura y humedad
- **MQ-135:** Sensor de calidad del aire (CO2)
- **MQ-7:** Sensor de monóxido de carbono (CO)
- **NEO-6M:** Módulo GPS

**Conectividad:**
- **WiFi 802.11 b/g/n**
- **GPRS/3G** (módulo SIM800L o similar)
- **HTTP/REST** como protocolo de comunicación

### 8.3 Endpoints API Completos

#### Autenticación

**POST /api/auth/login**
- Descripción: Autenticar administrador
- Auth: No requerida
- Body:
```json
{
  "email": "admin@iiap.gob.pe",
  "password": "contraseña"
}
```
- Response 200:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "username": "admin",
    "email": "admin@iiap.gob.pe",
    "rol": "admin"
  }
}
```

**GET /api/auth/verificar**
- Descripción: Verificar validez de token JWT
- Auth: Bearer token (requerido)
- Response 200:
```json
{
  "valido": true,
  "usuario": {
    "id": 1,
    "username": "admin",
    "rol": "admin"
  }
}
```

#### Lecturas

**POST /api/lecturas**
- Descripción: Recibir lectura de sensor (endpoint para ESP32)
- Auth: No requerida (público para sensores)
- Body:
```json
{
  "id_sensor": "ESP32_001",
  "temperatura": 28.5,
  "humedad": 65.3,
  "co2_nivel": 420,
  "co_nivel": 3.2,
  "latitud": -3.7437,
  "longitud": -73.2516,
  "altitud": 120.5,
  "zona": "Rural"
}
```
- Response 201:
```json
{
  "success": true,
  "message": "Lectura registrada exitosamente",
  "id_lectura": 12345,
  "sensor_creado": false,
  "alertas_generadas": 0
}
```

**GET /api/lecturas**
- Descripción: Obtener todas las lecturas (paginado)
- Auth: No requerida
- Query params:
  - `pagina`: número de página (default: 1)
  - `limite`: registros por página (default: 20)
  - `id_sensor`: filtrar por sensor
  - `zona`: filtrar por zona
  - `fecha_inicio`: formato YYYY-MM-DD
  - `fecha_fin`: formato YYYY-MM-DD
- Response 200:
```json
{
  "lecturas": [...],
  "paginacion": {
    "total": 1523,
    "pagina": 1,
    "limite": 20,
    "total_paginas": 77
  }
}
```

**GET /api/lecturas/ultimas**
- Descripción: Obtener últimas N lecturas
- Auth: No requerida
- Query params:
  - `limite`: número de lecturas (default: 10, max: 100)
- Response 200:
```json
{
  "lecturas": [
    {
      "id_lectura": 12345,
      "id_sensor": "ESP32_001",
      "lectura_datetime": "2024-01-15T14:30:22.000Z",
      "temperatura": 28.5,
      "humedad": 65.3,
      "co2_nivel": 420,
      "co_nivel": 3.2,
      "latitud": -3.7437,
      "longitud": -73.2516,
      "zona": "Rural"
    },
    ...
  ]
}
```

**GET /api/lecturas/exportar**
- Descripción: Exportar lecturas (sin paginación, para exportación)
- Auth: No requerida
- Query params: mismos que GET /api/lecturas
- Response 200: Array completo de lecturas (JSON)

#### Sensores

**GET /api/sensores**
- Descripción: Listar todos los sensores
- Auth: No requerida
- Query params:
  - `zona`: filtrar por zona
  - `estado`: filtrar por estado
  - `is_movil`: true/false
- Response 200:
```json
{
  "sensores": [
    {
      "id_sensor": "ESP32_001",
      "nombre_sensor": "Sensor Urbano Centro",
      "zona": "Urbana",
      "is_movil": false,
      "estado": "Active",
      "last_seen": "2024-01-15T14:30:22.000Z",
      "installation_date": "2024-01-01"
    },
    ...
  ]
}
```

**GET /api/sensores/:id**
- Descripción: Obtener detalle de sensor específico
- Auth: No requerida
- Params: `id` (id_sensor)
- Response 200: Objeto sensor con estadísticas

**POST /api/sensores**
- Descripción: Crear sensor manualmente
- Auth: Bearer token (admin)
- Body:
```json
{
  "id_sensor": "ESP32_CUSTOM_01",
  "nombre_sensor": "Sensor Experimental",
  "zona": "Urbana",
  "estado": "Active",
  "description": "Sensor para pruebas"
}
```
- Response 201: Objeto sensor creado

**PATCH /api/sensores/:id**
- Descripción: Actualizar sensor
- Auth: Bearer token (admin)
- Body: Campos a actualizar
- Response 200: Objeto sensor actualizado

**DELETE /api/sensores/:id**
- Descripción: Eliminar sensor
- Auth: Bearer token (admin)
- Response 200: Confirmación de eliminación

#### Alertas

**GET /api/alertas**
- Descripción: Listar alertas
- Auth: No requerida
- Query params:
  - `estado`: activas/resueltas/todas (default: todas)
  - `gravedad`: Low/Medium/High/Critical
  - `id_sensor`: filtrar por sensor
- Response 200: Array de alertas

**GET /api/alertas/activas**
- Descripción: Obtener solo alertas activas
- Auth: No requerida
- Response 200: Array de alertas activas

**PATCH /api/alertas/:id/resolver**
- Descripción: Marcar alerta como resuelta
- Auth: Bearer token (admin)
- Response 200:
```json
{
  "success": true,
  "message": "Alerta resuelta exitosamente",
  "alerta": {...}
}
```

#### Umbrales

**GET /api/umbrales**
- Descripción: Listar todos los umbrales
- Auth: No requerida
- Response 200: Array de umbrales

**GET /api/umbrales/sensor/:id**
- Descripción: Obtener umbrales de sensor específico
- Auth: No requerida
- Response 200: Array de umbrales del sensor

**POST /api/umbrales**
- Descripción: Crear umbral
- Auth: Bearer token (admin)
- Body:
```json
{
  "id_sensor": "ESP32_001",
  "parametro_nombre": "temperatura",
  "min_umbral": 10,
  "max_umbral": 40,
  "alerta_habilitar": true
}
```
- Response 201: Objeto umbral creado

**PATCH /api/umbrales/:id**
- Descripción: Actualizar umbral
- Auth: Bearer token (admin)
- Body: Campos a actualizar
- Response 200: Objeto umbral actualizado

**DELETE /api/umbrales/:id**
- Descripción: Eliminar umbral
- Auth: Bearer token (admin)
- Response 200: Confirmación

#### Recorridos

**GET /api/recorridos/fecha**
- Descripción: Obtener recorrido por sensor y fecha
- Auth: No requerida
- Query params:
  - `id_sensor`: requerido
  - `fecha`: YYYY-MM-DD, requerido
- Response 200: Lecturas del recorrido + metadatos

**GET /api/recorridos/lista**
- Descripción: Listar recorridos guardados
- Auth: No requerida
- Query params:
  - `id_sensor`: filtrar por sensor
- Response 200: Array de recorridos guardados

**GET /api/recorridos/:id**
- Descripción: Obtener recorrido específico
- Auth: No requerida
- Response 200: Objeto recorrido con GeoJSON

**POST /api/recorridos/guardar**
- Descripción: Guardar recorrido
- Auth: No requerida (público puede guardar)
- Body:
```json
{
  "id_sensor": "ESP32_M01",
  "nombre_recorrido": "Recorrido Río Amazonas",
  "fecha_recorrido": "2024-01-15",
  "hora_inicio": "08:00:00",
  "hora_fin": "11:25:00",
  "puntos_geojson": {...},
  "metadata": {...}
}
```
- Response 201: Objeto recorrido guardado

**DELETE /api/recorridos/:id**
- Descripción: Eliminar recorrido guardado
- Auth: Bearer token (admin)
- Response 200: Confirmación

#### Usuarios (Admin)

**GET /api/usuarios**
- Descripción: Listar usuarios
- Auth: Bearer token (admin)
- Response 200: Array de usuarios (sin password_hash)

**POST /api/usuarios**
- Descripción: Crear usuario
- Auth: Bearer token (admin)
- Body:
```json
{
  "username": "nuevo_usuario",
  "email": "usuario@iiap.gob.pe",
  "password": "contraseña",
  "nombre_completo": "Nombre Completo",
  "rol": "analyst"
}
```
- Response 201: Objeto usuario creado

**PATCH /api/usuarios/:id**
- Descripción: Actualizar usuario
- Auth: Bearer token (admin)
- Response 200: Objeto usuario actualizado

**DELETE /api/usuarios/:id**
- Descripción: Eliminar usuario
- Auth: Bearer token (admin)
- Response 200: Confirmación

#### Perfil

**GET /api/perfil**
- Descripción: Obtener perfil del usuario autenticado
- Auth: Bearer token (requerido)
- Response 200: Objeto usuario

**PATCH /api/perfil**
- Descripción: Actualizar perfil propio
- Auth: Bearer token (requerido)
- Body: Campos a actualizar (no incluir password)
- Response 200: Objeto usuario actualizado

**POST /api/perfil/cambiar-contrasena**
- Descripción: Cambiar contraseña propia
- Auth: Bearer token (requerido)
- Body:
```json
{
  "password_actual": "contraseña_actual",
  "password_nueva": "contraseña_nueva"
}
```
- Response 200: Confirmación

#### Preferencias del Sistema

**GET /api/preferencias-sistema**
- Descripción: Obtener preferencias del usuario autenticado
- Auth: Bearer token (requerido)
- Response 200: Objeto preferencias

**POST /api/preferencias-sistema**
- Descripción: Crear preferencias (primera vez)
- Auth: Bearer token (requerido)
- Body: Objeto con preferencias
- Response 201: Objeto preferencias creado

**PATCH /api/preferencias-sistema**
- Descripción: Actualizar preferencias
- Auth: Bearer token (requerido)
- Body: Campos a actualizar
- Response 200: Objeto preferencias actualizado

#### Utilidad

**GET /api/health**
- Descripción: Health check del sistema
- Auth: No requerida
- Response 200:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:22.000Z",
  "database": "connected",
  "uptime": 86400
}
```

**GET /**
- Descripción: Mensaje de bienvenida
- Auth: No requerida
- Response 200:
```json
{
  "message": "API del Sistema de Monitoreo Ambiental - IIAP",
  "version": "1.0.0",
  "endpoints": "/api/docs"
}
```

### 8.4 Configuración de Entorno

#### Backend (.env)

```env
# Servidor
PORT=3000
NODE_ENV=production

# Base de Datos
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_bd?schema=public"

# JWT
JWT_SECRET=<128-character-hexadecimal-string>

# CORS
CORS_ORIGIN=https://monitoring.iiap.gob.pe

# Sistema
ALERT_CHECK_INTERVAL=60000
LOG_LEVEL=info
```

#### Frontend (.env)

```env
# API
VITE_API_URL=https://api.iiap.gob.pe/api

# Aplicación
VITE_APP_NAME=IIAP Monitoreo Ambiental
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### 8.5 Seguridad - Detalles de Implementación

#### JWT (JSON Web Token)

**Configuración:**
- Algoritmo: HS256 (HMAC with SHA-256)
- Secret: 128 caracteres hexadecimales (512 bits)
- Expiración: 8 horas (28800 segundos)

**Estructura del Payload:**
```json
{
  "id": 1,
  "username": "admin",
  "rol": "admin",
  "iat": 1705328422,
  "exp": 1705357222
}
```

**Flujo de Autenticación:**
1. Usuario envía credenciales a POST /api/auth/login
2. Backend valida con bcrypt.compare()
3. Si válido, genera JWT con jwt.sign()
4. Frontend almacena en localStorage
5. Frontend incluye en header: `Authorization: Bearer {token}`
6. Middleware verifica con jwt.verify() en rutas protegidas

#### Bcrypt - Hashing de Contraseñas

**Configuración:**
- Salt rounds: 10 (2^10 = 1024 iteraciones)
- Algoritmo: bcrypt (basado en Blowfish)

**Código ejemplo:**
```javascript
// Crear hash
const hash = await bcrypt.hash(password, 10);

// Verificar
const isValid = await bcrypt.compare(password, hash);
```

#### Helmet - Headers HTTP Seguros

**Headers configurados:**
- Content-Security-Policy
- X-DNS-Prefetch-Control
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)

#### CORS - Cross-Origin Resource Sharing

**Configuración:**
```javascript
{
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 8.6 Rendimiento - Optimizaciones Implementadas

#### Backend

1. **Prisma Singleton Pattern:**
   - Evita crear múltiples conexiones a BD
   - Reutiliza cliente Prisma en toda la aplicación

2. **Índices en Base de Datos:**
   - Columnas de búsqueda frecuente indexadas
   - Índices compuestos para queries complejas

3. **Paginación:**
   - Todas las consultas de listado paginadas
   - Default: 20 registros por página

4. **Compresión:**
   - Responses > 1KB comprimidas con gzip
   - Reduce ancho de banda ~70%

#### Frontend

1. **Code Splitting:**
   - Lazy loading de componentes con React.lazy()
   - Rutas cargadas on-demand

2. **Memorización:**
   - useMemo para cálculos costosos
   - useCallback para funciones en dependencias

3. **Debouncing:**
   - Búsquedas y filtros con debounce de 300ms
   - Reduce solicitudes al backend

4. **Assets Optimization:**
   - Imágenes optimizadas y comprimidas
   - SVG inline cuando es posible
   - Fuentes subseteadas

---

## 9. RESTRICCIONES Y SUPUESTOS

### 9.1 Restricciones

#### Técnicas

1. **Plataforma:**
   - Backend requiere Node.js v22.16.0 o superior
   - Base de datos debe ser PostgreSQL (versión 12+)
   - Frontend funciona solo en navegadores modernos (últimas 2 versiones)

2. **Recursos:**
   - Servidor mínimo: 2 CPU cores, 4GB RAM, 50GB storage
   - Ancho de banda: mínimo 10 Mbps simétrico
   - Conexión a internet permanente

3. **Seguridad:**
   - HTTPS obligatorio en producción
   - JWT debe renovarse cada 8 horas
   - Contraseñas mínimo 8 caracteres

4. **Integración:**
   - Sensores deben cumplir protocolo HTTP/REST definido
   - Formato de datos: JSON exclusivamente
   - Coordenadas GPS en sistema WGS84

#### Operacionales

1. **Mantenimiento:**
   - Ventana de mantenimiento: 22:00-06:00 hora local
   - Notificación 48 horas de anticipación
   - Máximo 4 horas de downtime por mes

2. **Soporte:**
   - Soporte técnico solo en horario laboral (8:00-18:00)
   - Respuesta a incidentes críticos: < 2 horas
   - Respuesta a consultas generales: < 24 horas

3. **Capacitación:**
   - Administrador debe recibir capacitación de 4 horas
   - Manual de usuario debe ser leído antes de operación

#### Organizacionales

1. **Recursos humanos:**
   - Un administrador técnico disponible
   - Personal de soporte técnico para sensores en campo

2. **Presupuesto:**
   - Hosting y dominio deben ser provistos por IIAP
   - Mantenimiento de sensores físicos (hardware) fuera del alcance del software

### 9.2 Supuestos

#### Técnicos

1. **Infraestructura:**
   - Se asume disponibilidad de servidor VPS o equivalente
   - Conectividad a internet estable y permanente
   - PostgreSQL instalado y configurado

2. **Sensores:**
   - ESP32 correctamente programados según protocolo
   - Sensores ambientales calibrados y funcionales
   - GPS con señal suficiente para ubicación precisa

3. **Red:**
   - Sensores con conectividad WiFi o GPRS estable
   - Cobertura celular en zonas de despliegue (para GPRS)
   - Firewall permite tráfico HTTP/HTTPS saliente

#### Operacionales

1. **Uso:**
   - Usuario administrador tiene conocimientos básicos de informática
   - Público objetivo tiene acceso a navegador web moderno
   - Usuarios comprenden conceptos ambientales básicos

2. **Datos:**
   - Sensores envían datos cada 60 segundos (configurable)
   - Lecturas son confiables (sensores calibrados)
   - GPS proporciona coordenadas con precisión ±10 metros

3. **Mantenimiento:**
   - Personal del IIAP realiza mantenimiento preventivo de sensores
   - Baterías de sensores autónomos se reemplazan según cronograma
   - Conexiones de red se monitorean proactivamente

#### Organizacionales

1. **Compromiso:**
   - IIAP asigna recursos para hosting y dominio
   - Personal técnico disponible para soporte de sensores en campo
   - Actualización de software coordinada con equipo de TI

2. **Escalabilidad:**
   - Crecimiento gradual de sensores (no más de 50 nuevos por mes)
   - Expansión geográfica planificada (no abrupta)

---

## 10. MATRIZ DE TRAZABILIDAD

| ID Req | Tipo | Nombre | Prioridad | Caso de Uso | Endpoint/Componente | Estado | Observaciones |
|--------|------|--------|-----------|-------------|---------------------|--------|---------------|
| RF-01 | Funcional | Dashboard tiempo real | Alta | CU-01 | Dashboard.jsx, GET /api/lecturas/ultimas | ✅ Validado | Auto-refresh cada 30s |
| RF-02 | Funcional | Mapa interactivo | Alta | CU-01, CU-04 | MapView.jsx, GET /api/sensores | ✅ Validado | 5 modos de visualización |
| RF-03 | Funcional | Registro auto sensores | Alta | CU-10 | POST /api/lecturas | ✅ Validado | Transparente para ESP32 |
| RF-04 | Funcional | Detección movilidad | Alta | CU-10 | lecturaController.js | ✅ Validado | Umbral: 0.0001° (~11m) |
| RF-05 | Funcional | Sistema de alertas | Alta | CU-10 | alertaController.js | ✅ Validado | 4 niveles de gravedad |
| RF-06 | Funcional | Config umbrales | Alta | CU-08 | Configuracion.jsx, /api/umbrales | ✅ Validado | CRUD completo |
| RF-07 | Funcional | Lecturas históricas | Alta | CU-02 | Lecturas.jsx, GET /api/lecturas | ✅ Validado | Paginación + filtros |
| RF-08 | Funcional | Exportación datos | Media | CU-03 | Reportes.jsx, exportService.js | ✅ Validado | Excel, PDF, CSV |
| RF-09 | Funcional | Gestión recorridos | Media | CU-04, CU-05 | MapView.jsx, /api/recorridos | ✅ Validado | GeoJSON compatible |
| RF-10 | Funcional | Mapas de calor | Media | CU-11 | MapView.jsx | ✅ Validado | Temp, CO2, CO |
| RF-11 | Funcional | Autenticación admin | Alta | CU-06 | Login.jsx, POST /api/auth/login | ✅ Validado | JWT 8 horas |
| RF-12 | Funcional | Gestión sensores CRUD | Alta | CU-07 | Configuracion.jsx, /api/sensores | ✅ Validado | Admin only |
| RF-13 | Funcional | Resolución alertas | Media | CU-09 | Alertas.jsx, PATCH /api/alertas/:id/resolver | ✅ Validado | Irreversible |
| RF-14 | Funcional | Preferencias sistema | Baja | - | Perfil.jsx, /api/preferencias-sistema | ✅ Validado | Opcional |
| RF-15 | Funcional | API REST sensores | Alta | CU-10 | POST /api/lecturas | ✅ Validado | Público, sin auth |
| RNF-01 | No Funcional | Rendimiento | Alta | Todos | - | ✅ Validado | < 2s páginas, < 500ms API |
| RNF-02 | No Funcional | Seguridad | Alta | Todos | auth.js, Helmet, bcrypt | ✅ Validado | JWT + bcrypt + Helmet |
| RNF-03 | No Funcional | Usabilidad | Alta | Todos | Tailwind CSS, responsive | ✅ Validado | Mobile-first design |
| RNF-04 | No Funcional | Disponibilidad | Alta | - | - | ⚠️ Por validar | Objetivo: 99.5% uptime |
| RNF-05 | No Funcional | Escalabilidad | Media | - | Prisma, PostgreSQL | ✅ Validado | Arquitectura modular |
| RNF-06 | No Funcional | Mantenibilidad | Media | - | ESLint, comentarios | ✅ Validado | Código documentado |
| RNF-07 | No Funcional | Portabilidad | Baja | - | Docker (futuro) | ⚠️ Pendiente | V2.0 |
| RNF-08 | No Funcional | Compatibilidad | Media | CU-10, CU-12 | HTTP/REST, GeoJSON | ✅ Validado | Estándares abiertos |

**Leyenda:**
- ✅ Validado: Requerimiento completo y probado
- ⚠️ Por validar: Requerimiento implementado, pendiente validación completa
- ⚠️ Pendiente: Requerimiento planificado para versión futura

---

## 11. GLOSARIO

### Términos Técnicos

**API (Application Programming Interface):** Interfaz que permite la comunicación entre diferentes sistemas software mediante un conjunto definido de reglas.

**Backend:** Parte del sistema que se ejecuta en el servidor y maneja la lógica de negocio, base de datos y seguridad.

**bcrypt:** Función de hashing criptográfico diseñada específicamente para contraseñas, resistente a ataques de fuerza bruta.

**CORS (Cross-Origin Resource Sharing):** Mecanismo de seguridad que permite o restringe recursos en una página web desde un dominio diferente.

**CRUD:** Acrónimo de Create, Read, Update, Delete - operaciones básicas de persistencia de datos.

**ESP32:** Microcontrolador de bajo costo con WiFi y Bluetooth integrado, popular para proyectos IoT.

**Frontend:** Parte del sistema que se ejecuta en el navegador del usuario y maneja la interfaz de usuario.

**GeoJSON:** Formato estándar para codificar estructuras de datos geográficos basado en JSON.

**GPRS (General Packet Radio Service):** Tecnología de transmisión de datos móviles (2G/2.5G).

**GPS (Global Positioning System):** Sistema de navegación por satélite que proporciona geolocalización.

**HTTP/HTTPS:** Protocolos de comunicación para transferencia de datos en la web (seguro con cifrado SSL/TLS).

**IoT (Internet of Things):** Red de dispositivos físicos conectados que recopilan e intercambian datos.

**JSON (JavaScript Object Notation):** Formato ligero de intercambio de datos, fácil de leer por humanos y máquinas.

**JWT (JSON Web Token):** Estándar abierto para transmitir información de forma segura como objeto JSON, usado para autenticación.

**KPI (Key Performance Indicator):** Indicador clave de rendimiento, métrica para evaluar el éxito de una actividad.

**Leaflet:** Librería JavaScript de código abierto para mapas interactivos.

**ORM (Object-Relational Mapping):** Técnica que convierte datos entre sistemas incompatibles usando objetos (Prisma es un ORM).

**Prisma:** ORM moderno para Node.js y TypeScript con type-safety y migraciones automáticas.

**REST (Representational State Transfer):** Estilo arquitectónico para servicios web que usa HTTP para operaciones CRUD.

**Responsive Design:** Diseño web que se adapta a diferentes tamaños de pantalla (desktop, tablet, móvil).

**SQL (Structured Query Language):** Lenguaje estándar para gestión de bases de datos relacionales.

**SSL/TLS:** Protocolos criptográficos para comunicaciones seguras en redes.

**Umbrales:** Valores mínimos y máximos configurados para parámetros ambientales, usados para generar alertas.

**WGS84 (World Geodetic System 1984):** Sistema geodésico mundial estándar usado en GPS.

### Términos del Dominio

**Alerta:** Notificación generada automáticamente cuando un parámetro ambiental excede los umbrales configurados.

**CO (Monóxido de Carbono):** Gas tóxico incoloro e inodoro, indicador de calidad del aire.

**CO2 (Dióxido de Carbono):** Gas de efecto invernadero, indicador de calidad del aire interior y ventilación.

**Dashboard:** Panel de control visual que muestra KPIs y métricas importantes en tiempo real.

**Gravedad (de alerta):** Nivel de severidad de una alerta: Low, Medium, High, Critical.

**IIAP (Instituto de Investigaciones de la Amazonía Peruana):** Organización dedicada a la investigación científica en la región amazónica.

**Lectura:** Conjunto de datos ambientales capturados por un sensor en un momento específico.

**Mapa de Calor (Heatmap):** Visualización que representa la intensidad de un parámetro mediante colores en un mapa geográfico.

**Parámetro Ambiental:** Variable medida por los sensores (temperatura, humedad, CO2, CO).

**ppm (partes por millón):** Unidad de medida de concentración, usada para gases como CO2 y CO.

**Recorrido:** Trayectoria completa de un sensor móvil durante un período de tiempo específico.

**Sensor Fijo:** Dispositivo instalado en ubicación permanente que no cambia de posición.

**Sensor Móvil:** Dispositivo que se mueve geográficamente, registrando datos en diferentes ubicaciones.

**Zona:** Clasificación geográfica del área de monitoreo: Urbana, Rural, Bosque, Río.

### Roles de Usuario

**Administrador (Admin):** Usuario único con acceso completo al sistema, puede gestionar sensores, umbrales, alertas y configuraciones.

**Público:** Cualquier persona con acceso a internet que puede visualizar datos sin necesidad de autenticación (solo lectura).

---

## FIRMAS Y APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Elaborado por | Michel Izquierdo | _____________ | [Fecha] |
| Revisado por | [Supervisor IIAP] | _____________ | [Fecha] |
| Aprobado por | [Director IIAP] | _____________ | [Fecha] |

---

**FIN DEL DOCUMENTO**

**Versión:** 1.0
**Fecha de última actualización:** [Fecha]
**Próxima revisión:** [Fecha + 6 meses]

---

## ANEXOS

### Anexo A: Referencias Normativas

- IEEE Std 830-1998: Recommended Practice for Software Requirements Specifications
- ISO/IEC 25010:2011: Systems and software Quality Requirements and Evaluation (SQuaRE)
- RFC 7946: The GeoJSON Format
- WCAG 2.1: Web Content Accessibility Guidelines

### Anexo B: Documentos Relacionados

- ANALISIS_SISTEMA_COMPLETO.md
- CODIGO_AUDITORIA_Y_MEJORAS.md
- GUIA_ESTANDARES.md
- README.md

### Anexo C: Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | [Fecha] | Michel Izquierdo | Versión inicial aprobada |

---

**Instituto de Investigaciones de la Amazonía Peruana (IIAP)**
**Sistema de Monitoreo Ambiental**
