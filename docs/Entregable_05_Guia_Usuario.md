# Guía de Usuario
## Sistema de Monitoreo Ambiental IIAP

**Versión:** 1.0.0
**Fecha:** 05/11/2025
**Audiencia:** Usuarios públicos y Administrador del sistema

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Guía para Usuario Público](#4-guía-para-usuario-público)
5. [Guía para Administrador](#5-guía-para-administrador)
6. [Exportación de Reportes](#6-exportación-de-reportes)
7. [Solución de Problemas](#7-solución-de-problemas)
8. [Preguntas Frecuentes](#8-preguntas-frecuentes)

---

## 1. Introducción

### 1.1 ¿Qué es el Sistema de Monitoreo Ambiental IIAP?

El Sistema de Monitoreo Ambiental IIAP es una plataforma web que permite visualizar en tiempo real datos ambientales recolectados por sensores IoT distribuidos en diferentes zonas de monitoreo. El sistema proporciona información sobre temperatura, humedad, niveles de CO2 y CO, permitiendo el análisis histórico y la generación de alertas cuando se exceden umbrales configurados.

### 1.2 Usuarios del Sistema

El sistema cuenta con dos tipos de usuarios:

- **Usuario Público:** Puede visualizar datos en tiempo real, consultar lecturas históricas y ver gráficos de tendencias. No requiere autenticación.
- **Administrador:** Tiene acceso completo al sistema, puede gestionar sensores, configurar alertas, generar reportes y administrar el sistema. Requiere autenticación.

### 1.3 Características Principales

✅ Dashboard en tiempo real con indicadores clave
✅ Mapa interactivo con ubicación de sensores
✅ Filtrado avanzado de lecturas históricas
✅ Gráficos de tendencias temporales
✅ Sistema de alertas automático
✅ Gestión completa de sensores
✅ Exportación de reportes (PDF y Excel)
✅ Diseño responsivo (móvil y escritorio)

---

## 2. Requisitos del Sistema

### 2.1 Requisitos de Hardware

**Mínimos:**
- Procesador: Dual Core 1.5 GHz o superior
- RAM: 4 GB
- Pantalla: Resolución mínima 1280x720 (HD)
- Conexión a Internet: 5 Mbps

**Recomendados:**
- Procesador: Quad Core 2.0 GHz o superior
- RAM: 8 GB o más
- Pantalla: Resolución 1920x1080 (Full HD) o superior
- Conexión a Internet: 10 Mbps o más

### 2.2 Navegadores Compatibles

| Navegador | Versión Mínima |
|-----------|----------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |
| Opera | 76+ |

**Nota:** Se recomienda mantener el navegador actualizado para garantizar la mejor experiencia.

### 2.3 Dispositivos Compatibles

- ✅ Computadoras de escritorio (Windows, macOS, Linux)
- ✅ Laptops
- ✅ Tablets (10" o más recomendado para administración)
- ✅ Smartphones (solo visualización pública)

---

## 3. Acceso al Sistema

### 3.1 URL de Acceso

**Producción:** `https://monitoreo-iiap.com`
**Desarrollo:** `http://localhost:5173`

### 3.2 Página de Inicio

Al acceder al sistema, se muestra automáticamente el **Dashboard Público** con los datos más recientes.

**[INSERTAR CAPTURA: Pantalla de inicio - Dashboard Público]**

---

## 4. Guía para Usuario Público

### 4.1 Dashboard Principal

El dashboard es la página de inicio del sistema y muestra un resumen general del estado actual del monitoreo ambiental.

**[INSERTAR CAPTURA: Dashboard completo - Vista general]**

#### 4.1.1 Indicadores Clave (KPIs)

En la parte superior del dashboard se muestran 4 tarjetas con indicadores en tiempo real:

**[INSERTAR CAPTURA: Tarjetas de KPIs]**

| Indicador | Descripción |
|-----------|-------------|
| **Temperatura Promedio** | Promedio actual de temperatura de todos los sensores activos |
| **Humedad Promedio** | Promedio actual de humedad relativa |
| **CO2 Promedio** | Nivel promedio de CO2 en ppm |
| **Total de Sensores** | Cantidad de sensores activos en el sistema |

**Iconografía:**
- 🌡️ Temperatura (ícono termómetro)
- 💧 Humedad (ícono gota)
- 🌫️ CO2 (ícono nube)
- 📡 Sensores (ícono antena)

#### 4.1.2 Mapa Interactivo

El mapa muestra la ubicación geográfica de todos los sensores del sistema.

**[INSERTAR CAPTURA: Mapa interactivo con marcadores]**

**Cómo usar el mapa:**

1. **Zoom:** Use los botones + y - en la esquina superior izquierda, o la rueda del mouse
2. **Desplazamiento:** Haga clic y arrastre para mover el mapa
3. **Ver detalles de sensor:** Haga clic en cualquier marcador (📍) para ver:
   - Nombre del sensor
   - Tipo de sensor (fijo o móvil)
   - Última lectura registrada
   - Estado (Activo/Inactivo)

**[INSERTAR CAPTURA: Popup de información de sensor en el mapa]**

**Tipos de marcadores:**
- 🟢 Verde: Sensor activo con lecturas recientes
- 🟡 Amarillo: Sensor activo sin lecturas recientes (>1 hora)
- 🔴 Rojo: Sensor inactivo o con alertas activas
- 🔵 Azul: Sensor móvil (cambia de ubicación)

#### 4.1.3 Últimas Lecturas

Tabla que muestra las 10 lecturas más recientes del sistema.

**[INSERTAR CAPTURA: Tabla de últimas lecturas]**

**Columnas de la tabla:**
- **Sensor:** Nombre del sensor
- **Fecha/Hora:** Timestamp de la lectura
- **Temperatura:** Valor en °C
- **Humedad:** Porcentaje %
- **CO2:** Nivel en ppm
- **Zona:** Ubicación del sensor

**Actualización automática:**
La tabla se actualiza automáticamente cada 30 segundos sin necesidad de recargar la página.

---

### 4.2 Página de Lecturas

Esta página permite consultar el historial completo de lecturas con filtros avanzados.

**[INSERTAR CAPTURA: Página de Lecturas - Vista completa]**

#### 4.2.1 Filtros de Búsqueda

**[INSERTAR CAPTURA: Panel de filtros]**

**Filtros disponibles:**

1. **Rango de Fechas**
   - Seleccione fecha de inicio y fecha de fin
   - Atajos: Hoy, Última semana, Último mes, Últimos 3 meses

   **[INSERTAR CAPTURA: Selector de fechas]**

2. **Sensor**
   - Filtre por un sensor específico
   - Opción "Todos los sensores" para ver datos globales

3. **Zona**
   - Filtre por zona geográfica
   - Opciones: Urbana, Rural, Suburbana, Todas

4. **Parámetros a Visualizar**
   - Seleccione qué parámetros desea ver:
     - ☑️ Temperatura
     - ☑️ Humedad
     - ☑️ CO2
     - ☑️ CO

5. **Ordenamiento**
   - Más recientes primero (por defecto)
   - Más antiguas primero

**Cómo aplicar filtros:**

1. Seleccione los criterios deseados
2. Haga clic en el botón "Aplicar Filtros"
3. El sistema mostrará los resultados filtrados
4. Use "Limpiar Filtros" para resetear

**[INSERTAR CAPTURA: Filtros aplicados con resultados]**

#### 4.2.2 Tabla de Resultados

La tabla muestra las lecturas que cumplen con los criterios seleccionados.

**[INSERTAR CAPTURA: Tabla de lecturas con datos]**

**Características:**
- Paginación: 20, 50 o 100 registros por página
- Scroll horizontal en dispositivos móviles
- Formato de fecha: DD/MM/YYYY HH:mm:ss
- Indicadores visuales de valores anormales (texto rojo)

#### 4.2.3 Gráficos de Tendencias

Debajo de la tabla se muestran gráficos interactivos de los datos filtrados.

**[INSERTAR CAPTURA: Gráficos de líneas - Tendencias temporales]**

**Tipos de gráficos:**

1. **Gráfico de Líneas Temporal**
   - Muestra la evolución de los parámetros en el tiempo
   - Permite activar/desactivar series haciendo clic en la leyenda
   - Tooltip al pasar el mouse con valores exactos

   **[INSERTAR CAPTURA: Gráfico de líneas con tooltip]**

2. **Gráfico de Barras por Sensor**
   - Compara promedios entre sensores
   - Útil para identificar sensores con valores atípicos

   **[INSERTAR CAPTURA: Gráfico de barras comparativo]**

**Interacción con gráficos:**
- Pase el mouse sobre los puntos para ver valores exactos
- Haga clic en la leyenda para ocultar/mostrar series
- Use los botones de zoom (si disponibles)

---

### 4.3 Navegación del Sistema (Público)

#### 4.3.1 Menú de Navegación

**[INSERTAR CAPTURA: Navbar - Vista pública]**

El menú superior contiene:
- 🏠 **Dashboard:** Página principal
- 📊 **Lecturas:** Consultar historial de lecturas
- 🔑 **Iniciar Sesión:** Acceso para administrador

#### 4.3.2 Versión Móvil

En dispositivos móviles, el menú se contrae en un botón de hamburguesa (☰).

**[INSERTAR CAPTURA: Menú móvil desplegado]**

**Navegación móvil:**
1. Toque el ícono ☰ en la esquina superior
2. Seleccione la página deseada
3. El menú se cierra automáticamente

---

## 5. Guía para Administrador

### 5.1 Inicio de Sesión

Para acceder a las funciones administrativas, debe iniciar sesión.

#### 5.1.1 Acceder al Login

1. Haga clic en "Iniciar Sesión" en el menú superior
2. Será redirigido a la página de login

**[INSERTAR CAPTURA: Página de Login]**

#### 5.1.2 Ingresar Credenciales

**Campos del formulario:**
- **Usuario:** Nombre de usuario del administrador
- **Contraseña:** Contraseña del administrador

**[INSERTAR CAPTURA: Formulario de login completo]**

**Pasos:**
1. Ingrese su nombre de usuario
2. Ingrese su contraseña
3. Haga clic en "Iniciar Sesión"

**Credenciales de ejemplo (desarrollo):**
- Usuario: `admin`
- Contraseña: `admin123`

**⚠️ Importante:** Las credenciales reales se proporcionan por el equipo de TI del IIAP.

#### 5.1.3 Sesión Iniciada

Una vez autenticado, será redirigido al Dashboard y verá:
- Menú administrativo completo
- Ícono de perfil en la esquina superior derecha
- Sidebar con todas las opciones

**[INSERTAR CAPTURA: Dashboard - Vista administrativa]**

---

### 5.2 Panel de Control Administrativo

#### 5.2.1 Menú Lateral (Sidebar)

El sidebar contiene todas las opciones administrativas:

**[INSERTAR CAPTURA: Sidebar completo]**

| Opción | Ícono | Descripción |
|--------|-------|-------------|
| **Dashboard** | 🏠 | Vista general del sistema |
| **Lecturas** | 📊 | Consultar lecturas históricas |
| **Sensores** | 📡 | Gestión de sensores (CRUD) |
| **Alertas** | 🚨 | Gestión de alertas y umbrales |
| **Reportes** | 📄 | Generación y exportación de reportes |
| **Perfil** | 👤 | Gestión de perfil personal |
| **Configuración** | ⚙️ | Preferencias del sistema |

---

### 5.3 Gestión de Sensores

La página de Sensores permite crear, editar, visualizar y eliminar sensores del sistema.

**[INSERTAR CAPTURA: Página de Sensores - Vista completa]**

#### 5.3.1 Lista de Sensores

La vista principal muestra todos los sensores registrados en el sistema.

**[INSERTAR CAPTURA: Tabla de sensores]**

**Información mostrada:**
- **ID del Sensor:** Identificador único
- **Nombre:** Nombre descriptivo
- **Zona:** Ubicación (Urbana, Rural, Suburbana)
- **Tipo:** Fijo o Móvil
- **Estado:** Activo o Inactivo
- **Última Conexión:** Fecha/hora de última lectura
- **Acciones:** Botones de editar y eliminar

**Indicadores de estado:**
- 🟢 **Activo:** Sensor funcionando correctamente
- 🔴 **Inactivo:** Sensor sin comunicación
- 🟡 **Sin conexión reciente:** >1 hora sin lecturas

#### 5.3.2 Crear Nuevo Sensor

**Pasos para crear un sensor:**

1. Haga clic en el botón "+ Nuevo Sensor" en la esquina superior derecha

   **[INSERTAR CAPTURA: Botón Nuevo Sensor]**

2. Se abrirá un modal con el formulario de creación

   **[INSERTAR CAPTURA: Modal - Crear Sensor]**

3. Complete los campos requeridos:

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **ID del Sensor** | Identificador único (generado por ESP32) | `SENSOR_001` |
   | **Nombre** | Nombre descriptivo | `Sensor Temperatura Lab 1` |
   | **Zona** | Ubicación geográfica | Urbana, Rural, Suburbana |
   | **Tipo** | Si el sensor es fijo o móvil | Fijo / Móvil |
   | **Descripción** (opcional) | Información adicional | `Sensor en laboratorio de investigación` |

4. Haga clic en "Guardar"

**[INSERTAR CAPTURA: Formulario completo de crear sensor]**

**Validaciones:**
- ✅ ID del sensor debe ser único
- ✅ Nombre es obligatorio
- ✅ Zona debe seleccionarse
- ⚠️ Si el ID ya existe, se mostrará un error

**[INSERTAR CAPTURA: Mensaje de error - Sensor duplicado]**

**Éxito:**
Una vez creado, verá una notificación de éxito y el nuevo sensor aparecerá en la lista.

**[INSERTAR CAPTURA: Notificación - Sensor creado exitosamente]**

#### 5.3.3 Editar Sensor

**Pasos para editar un sensor:**

1. En la tabla de sensores, haga clic en el botón "Editar" (✏️) del sensor deseado

   **[INSERTAR CAPTURA: Botón editar en tabla]**

2. Se abrirá un modal con los datos actuales del sensor

   **[INSERTAR CAPTURA: Modal - Editar Sensor]**

3. Modifique los campos que desee actualizar:
   - Nombre
   - Zona
   - Tipo (Fijo/Móvil)
   - Descripción
   - Estado (Activo/Inactivo)

4. Haga clic en "Actualizar"

**[INSERTAR CAPTURA: Formulario de edición con datos]**

**Nota:** El ID del sensor no puede modificarse una vez creado.

#### 5.3.4 Eliminar Sensor

**Pasos para eliminar un sensor:**

1. Haga clic en el botón "Eliminar" (🗑️) en la tabla

   **[INSERTAR CAPTURA: Botón eliminar]**

2. Aparecerá un modal de confirmación

   **[INSERTAR CAPTURA: Modal de confirmación - Eliminar sensor]**

3. Confirme la acción haciendo clic en "Eliminar"

**⚠️ Advertencia:**
- Al eliminar un sensor se eliminan TODAS las lecturas asociadas
- Esta acción NO se puede deshacer
- Si solo desea desactivar el sensor temporalmente, edite el estado a "Inactivo"

**[INSERTAR CAPTURA: Mensaje de confirmación final]**

#### 5.3.5 Mapa de Sensores (Administrador)

En la vista de sensores también se muestra un mapa con la ubicación de todos los sensores.

**[INSERTAR CAPTURA: Mapa de sensores - Vista admin]**

**Características adicionales del mapa admin:**
- Marcadores diferenciados por tipo (fijo/móvil)
- Información detallada al hacer clic
- Posibilidad de ver recorridos de sensores móviles

---

### 5.4 Gestión de Alertas

La página de Alertas permite configurar umbrales y gestionar las alertas generadas.

**[INSERTAR CAPTURA: Página de Alertas - Vista completa]**

#### 5.4.1 Lista de Alertas Activas

Muestra todas las alertas que aún no han sido resueltas.

**[INSERTAR CAPTURA: Tabla de alertas activas]**

**Información mostrada:**
- **Sensor:** Nombre del sensor que generó la alerta
- **Parámetro:** Tipo de medición (Temperatura, Humedad, CO2, CO)
- **Valor Actual:** Valor que excedió el umbral
- **Umbral:** Límite configurado
- **Gravedad:** Bajo, Medio, Alto, Crítico
- **Fecha/Hora:** Cuándo se activó la alerta
- **Acciones:** Resolver o Eliminar

**Indicadores de gravedad:**
- 🟢 **Bajo:** Desviación menor al umbral
- 🟡 **Medio:** Desviación moderada
- 🟠 **Alto:** Desviación significativa
- 🔴 **Crítico:** Desviación extrema

#### 5.4.2 Resolver Alerta

**Pasos:**
1. Localice la alerta en la tabla
2. Haga clic en "Resolver" (✓)
3. Confirme la acción

**[INSERTAR CAPTURA: Botón resolver alerta]**

Una vez resuelta, la alerta pasa al historial de alertas resueltas.

**[INSERTAR CAPTURA: Alerta resuelta - Notificación]**

#### 5.4.3 Configurar Umbrales

Los umbrales definen los límites normales para cada parámetro de cada sensor.

**Acceder a la configuración:**
1. Haga clic en la pestaña "Configurar Umbrales"

   **[INSERTAR CAPTURA: Pestaña de umbrales]**

2. Seleccione un sensor

   **[INSERTAR CAPTURA: Selector de sensor para umbrales]**

3. Configure los límites para cada parámetro

   **[INSERTAR CAPTURA: Formulario de configuración de umbrales]**

**Parámetros configurables:**

| Parámetro | Unidad | Rango Típico | Ejemplo |
|-----------|--------|--------------|---------|
| **Temperatura** | °C | 15 - 35 | Mín: 18°C, Máx: 30°C |
| **Humedad** | % | 30 - 80 | Mín: 40%, Máx: 70% |
| **CO2** | ppm | 300 - 1000 | Mín: 400, Máx: 800 |
| **CO** | ppm | 0 - 50 | Mín: 0, Máx: 10 |

**Pasos para configurar:**
1. Ingrese el valor mínimo aceptable
2. Ingrese el valor máximo aceptable
3. Active/desactive la generación de alertas con el switch
4. Haga clic en "Guardar Umbrales"

**[INSERTAR CAPTURA: Umbrales configurados y guardados]**

**Funcionamiento:**
- Si una lectura está **DEBAJO del mínimo** → Se genera alerta
- Si una lectura está **ENCIMA del máximo** → Se genera alerta
- Si está dentro del rango → No se genera alerta

---

### 5.5 Reportes

La página de Reportes permite generar informes detallados y exportarlos en diferentes formatos.

**[INSERTAR CAPTURA: Página de Reportes - Vista completa]**

#### 5.5.1 Configurar Reporte

**Filtros disponibles:**

**[INSERTAR CAPTURA: Panel de configuración de reporte]**

1. **Tipo de Reporte**
   - Reporte de Lecturas
   - Reporte de Alertas
   - Reporte de Sensores
   - Reporte Estadístico

2. **Rango de Fechas**
   - Fecha de inicio
   - Fecha de fin
   - Atajos rápidos (última semana, mes, trimestre)

3. **Filtros Adicionales**
   - Sensor específico o todos
   - Zona geográfica
   - Parámetros a incluir

4. **Formato de Exportación**
   - 📄 PDF
   - 📊 Excel (XLSX)

**Pasos:**
1. Seleccione el tipo de reporte
2. Configure las fechas
3. Aplique filtros adicionales
4. Elija el formato de exportación
5. Haga clic en "Generar Reporte"

**[INSERTAR CAPTURA: Configuración completa de reporte]**

#### 5.5.2 Previsualización

Antes de exportar, puede previsualizar el reporte en pantalla.

**[INSERTAR CAPTURA: Previsualización de reporte]**

**Elementos de la previsualización:**
- Encabezado con logo del IIAP
- Título del reporte y período
- Resumen ejecutivo con estadísticas
- Tabla de datos detallados
- Gráficos visuales
- Pie de página con fecha de generación

#### 5.5.3 Exportar a PDF

**Pasos:**
1. Configure el reporte
2. Seleccione formato "PDF"
3. Haga clic en "Exportar a PDF"

**[INSERTAR CAPTURA: Botón exportar a PDF]**

4. Se descargará automáticamente un archivo PDF

**[INSERTAR CAPTURA: Archivo PDF descargado]**

**Contenido del PDF:**
- ✅ Encabezado con logo y título
- ✅ Metadatos (fecha de generación, período, filtros)
- ✅ Resumen ejecutivo con KPIs
- ✅ Tabla de datos con formato
- ✅ Gráficos integrados
- ✅ Paginación automática
- ✅ Numeración de páginas

**Ejemplo de PDF generado:**

**[INSERTAR CAPTURA: Vista previa de PDF - Página 1]**

**[INSERTAR CAPTURA: Vista previa de PDF - Página 2 con gráficos]**

#### 5.5.4 Exportar a Excel

**Pasos:**
1. Configure el reporte
2. Seleccione formato "Excel"
3. Haga clic en "Exportar a Excel"

**[INSERTAR CAPTURA: Botón exportar a Excel]**

4. Se descargará un archivo XLSX

**Contenido del Excel:**
- ✅ Hoja 1: Resumen con estadísticas
- ✅ Hoja 2: Datos completos
- ✅ Formato de tabla con filtros automáticos
- ✅ Colores según gravedad (para alertas)
- ✅ Formato de fecha y números

**[INSERTAR CAPTURA: Archivo Excel abierto - Vista de datos]**

**Ventajas del formato Excel:**
- Permite análisis adicional con fórmulas
- Fácil de importar a otros sistemas
- Se pueden aplicar filtros y ordenamientos personalizados
- Compatible con herramientas de análisis de datos

---

### 5.6 Perfil de Usuario

La página de Perfil permite al administrador gestionar su información personal.

**[INSERTAR CAPTURA: Página de Perfil]**

#### 5.6.1 Información Personal

Muestra los datos del usuario actual:

**[INSERTAR CAPTURA: Sección de información personal]**

- Nombre completo
- Usuario (username)
- Email
- Rol (Administrador)
- Fecha de registro
- Último acceso

#### 5.6.2 Cambiar Contraseña

**Pasos:**
1. Haga clic en la pestaña "Cambiar Contraseña"

   **[INSERTAR CAPTURA: Pestaña cambiar contraseña]**

2. Complete el formulario:

   **[INSERTAR CAPTURA: Formulario de cambio de contraseña]**

   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña

3. Haga clic en "Actualizar Contraseña"

**Requisitos de contraseña:**
- ✅ Mínimo 8 caracteres
- ✅ Al menos una letra mayúscula
- ✅ Al menos una letra minúscula
- ✅ Al menos un número
- ✅ Contraseñas deben coincidir

**[INSERTAR CAPTURA: Contraseña actualizada exitosamente]**

#### 5.6.3 Historial de Actividad

Muestra las últimas acciones realizadas por el usuario.

**[INSERTAR CAPTURA: Historial de actividad]**

**Información mostrada:**
- Fecha/Hora de la acción
- Tipo de acción (Login, Crear Sensor, Editar Umbral, etc.)
- Detalles de la acción
- IP desde donde se realizó

---

### 5.7 Configuración del Sistema

Opciones de preferencias generales del sistema.

**[INSERTAR CAPTURA: Página de Configuración]**

#### 5.7.1 Preferencias de Visualización

**Opciones:**
- Intervalo de actualización automática (15s, 30s, 1min, 5min)
- Registros por página (20, 50, 100)
- Zona horaria (America/Lima)
- Formato de fecha (DD/MM/YYYY o MM/DD/YYYY)

**[INSERTAR CAPTURA: Preferencias de visualización]**

#### 5.7.2 Preferencias de Gráficos

**Opciones:**
- Mostrar gráficos (Sí/No)
- Animaciones en gráficos (Sí/No)
- Tipo de gráfico por defecto (Líneas, Barras, Área)

**[INSERTAR CAPTURA: Preferencias de gráficos]**

#### 5.7.3 Guardar Cambios

Después de modificar las preferencias, haga clic en "Guardar Configuración".

**[INSERTAR CAPTURA: Botón guardar configuración]**

Los cambios se aplicarán inmediatamente.

---

### 5.8 Cerrar Sesión

Para cerrar sesión de forma segura:

1. Haga clic en el ícono de perfil en la esquina superior derecha

   **[INSERTAR CAPTURA: Menú de usuario desplegado]**

2. Seleccione "Cerrar Sesión"

3. Será redirigido a la página de login

**[INSERTAR CAPTURA: Sesión cerrada exitosamente]**

**⚠️ Importante:** Por seguridad, cierre siempre la sesión cuando termine de usar el sistema, especialmente en equipos compartidos.

---

## 6. Exportación de Reportes

### 6.1 Tipos de Reportes Disponibles

#### 6.1.1 Reporte de Lecturas

Incluye todas las lecturas del período seleccionado.

**Contenido:**
- Tabla completa de lecturas
- Sensor, fecha/hora, valores de parámetros
- Gráfico de tendencias temporales
- Estadísticas: Promedio, Mínimo, Máximo

**Formatos:** PDF, Excel

**[INSERTAR CAPTURA: Reporte de Lecturas en PDF]**

#### 6.1.2 Reporte de Alertas

Incluye todas las alertas del período.

**Contenido:**
- Tabla de alertas con gravedad
- Parámetro, valor, umbral excedido
- Estado (Activa/Resuelta)
- Gráfico de alertas por tipo
- Estadísticas por gravedad

**Formatos:** PDF, Excel

**[INSERTAR CAPTURA: Reporte de Alertas en PDF]**

#### 6.1.3 Reporte de Sensores

Resumen del estado de todos los sensores.

**Contenido:**
- Lista de sensores con estado
- Última conexión
- Total de lecturas registradas
- Alertas generadas por sensor
- Mapa con ubicaciones

**Formatos:** PDF, Excel

**[INSERTAR CAPTURA: Reporte de Sensores en PDF]**

#### 6.1.4 Reporte Estadístico

Análisis estadístico avanzado del período.

**Contenido:**
- Promedios, máximos, mínimos por parámetro
- Desviaciones estándar
- Comparativas entre sensores
- Gráficos de distribución
- Conclusiones automáticas

**Formatos:** PDF, Excel

**[INSERTAR CAPTURA: Reporte Estadístico en PDF]**

---

### 6.2 Buenas Prácticas para Reportes

✅ **Seleccione períodos apropiados:** No genere reportes de más de 6 meses en Excel (rendimiento)
✅ **Use filtros:** Reporte solo los datos necesarios
✅ **PDF para impresión:** Use PDF para reportes formales
✅ **Excel para análisis:** Use Excel cuando necesite procesar los datos
✅ **Nombre descriptivo:** Los archivos se generan con nombres como `Reporte_Lecturas_01-11-2025_05-11-2025.pdf`

---

## 7. Solución de Problemas

### 7.1 Problemas Comunes

#### 7.1.1 No puedo iniciar sesión

**Síntomas:**
- Mensaje "Credenciales inválidas"
- No se carga la página de login

**Soluciones:**

1. **Verifique las credenciales:**
   - Asegúrese de escribir usuario y contraseña correctamente
   - Revise que no esté activado el Bloq Mayús

2. **Limpie caché del navegador:**
   - Chrome: Ctrl + Shift + Delete
   - Firefox: Ctrl + Shift + Delete
   - Seleccione "Cookies y caché"

3. **Contacte al administrador:**
   - Si olvidó su contraseña
   - Si su cuenta está bloqueada

#### 7.1.2 El mapa no se muestra

**Síntomas:**
- Área en blanco donde debería estar el mapa
- Error "Cannot load map"

**Soluciones:**

1. **Verifique la conexión a Internet:**
   - El mapa requiere conexión para cargar los tiles

2. **Recargue la página:**
   - Presione F5 o Ctrl + R

3. **Limpie caché:**
   - Los archivos del mapa pueden estar corruptos

4. **Desactive extensiones del navegador:**
   - Ad-blockers pueden bloquear recursos del mapa

#### 7.1.3 Los gráficos no se cargan

**Síntomas:**
- Espacio vacío en lugar de gráficos
- Error en consola del navegador

**Soluciones:**

1. **Espere unos segundos:**
   - Gráficos complejos tardan en renderizarse

2. **Reduzca el rango de datos:**
   - Muchos datos pueden causar lentitud

3. **Actualice el navegador:**
   - Versiones antiguas pueden tener problemas de compatibilidad

#### 7.1.4 La exportación a PDF/Excel falla

**Síntomas:**
- No se descarga el archivo
- Error "Failed to generate report"

**Soluciones:**

1. **Reduzca el período del reporte:**
   - Períodos muy largos pueden exceder límites

2. **Verifique permisos de descarga:**
   - El navegador puede bloquear descargas automáticas

3. **Libere espacio en disco:**
   - Asegúrese de tener espacio suficiente

4. **Intente otro formato:**
   - Si PDF falla, pruebe Excel y viceversa

#### 7.1.5 Los datos no se actualizan

**Síntomas:**
- Dashboard muestra datos antiguos
- No aparecen lecturas nuevas

**Soluciones:**

1. **Recargue la página:**
   - Presione F5

2. **Verifique la conexión del sensor:**
   - Puede que el sensor no esté enviando datos

3. **Revise el estado del sensor:**
   - Vaya a Sensores y verifique el estado

4. **Contacte soporte técnico:**
   - Si el problema persiste

---

### 7.2 Mensajes de Error

| Código | Mensaje | Causa | Solución |
|--------|---------|-------|----------|
| **401** | No autorizado | Token expirado o inválido | Vuelva a iniciar sesión |
| **403** | Acceso denegado | Intentando acceder a área privada sin autenticación | Inicie sesión como administrador |
| **404** | No encontrado | Recurso no existe | Verifique la URL o ID del recurso |
| **409** | Conflicto | Recurso duplicado | Use un ID diferente |
| **500** | Error del servidor | Problema en el backend | Contacte al administrador |

---

### 7.3 Optimización del Rendimiento

**Para mejorar la velocidad del sistema:**

1. **Use filtros de fecha:**
   - No cargue todo el historial a la vez
   - Límite a períodos razonables (30-90 días)

2. **Cierre pestañas innecesarias:**
   - Libera memoria del navegador

3. **Actualice el navegador:**
   - Versiones nuevas son más rápidas

4. **Conexión estable:**
   - Use conexión cableada si es posible
   - Evite WiFi saturado

5. **Desactive extensiones:**
   - Ad-blockers, VPNs pueden ralentizar

---

## 8. Preguntas Frecuentes

### 8.1 Generales

**¿Necesito crear una cuenta para ver los datos?**
No. Los datos públicos (Dashboard y Lecturas) están disponibles sin registro. Solo el administrador requiere autenticación.

**¿El sistema funciona en móviles?**
Sí. El sistema es completamente responsivo y funciona en smartphones y tablets. Sin embargo, la administración es más cómoda en pantallas grandes.

**¿Con qué frecuencia se actualizan los datos?**
El sistema recibe datos de los sensores cada 5 minutos (configurable). El dashboard se actualiza automáticamente cada 30 segundos.

**¿Cuánto tiempo se guardan los datos históricos?**
Por defecto, los datos se conservan durante 12 meses. Datos más antiguos se archivan pero siguen disponibles bajo petición.

### 8.2 Sensores

**¿Qué diferencia hay entre sensor fijo y móvil?**
- **Fijo:** Permanece en una ubicación estática (ej: estación meteorológica)
- **Móvil:** Cambia de ubicación (ej: sensor portátil, vehículo de monitoreo)

**¿Puedo agregar sensores desde el panel web?**
Sí, el administrador puede pre-registrar sensores. Sin embargo, el sensor físico (ESP32) debe configurarse con el mismo ID.

**¿Qué pasa si un sensor deja de enviar datos?**
El sistema lo marca automáticamente como "Sin conexión" después de 1 hora sin lecturas. No se elimina, solo cambia su estado.

### 8.3 Alertas

**¿Cómo funcionan las alertas automáticas?**
Cuando una lectura excede los umbrales configurados, el sistema genera automáticamente una alerta clasificada por gravedad.

**¿Las alertas se envían por email?**
En la versión actual, las alertas solo se muestran en el panel web. Notificaciones por email están en desarrollo futuro.

**¿Puedo configurar diferentes umbrales para cada sensor?**
Sí. Cada sensor puede tener sus propios umbrales personalizados para cada parámetro.

### 8.4 Reportes

**¿Hay límite en el tamaño de los reportes?**
Sí. Se recomienda no exceder 10,000 registros por reporte para garantizar un rendimiento óptimo.

**¿Puedo programar reportes automáticos?**
No en la versión actual. Los reportes deben generarse manualmente. Esta función está planificada para futuras versiones.

**¿Los reportes incluyen gráficos?**
Sí. Los reportes en PDF incluyen gráficos visuales. Los reportes en Excel incluyen los datos tabulados que pueden graficarse.

### 8.5 Seguridad

**¿Es seguro el sistema?**
Sí. El sistema utiliza:
- Autenticación JWT
- Contraseñas hasheadas con bcrypt
- HTTPS en producción
- Validación de datos en frontend y backend

**¿Qué hago si olvido mi contraseña?**
Contacte al equipo de TI del IIAP para restablecer su contraseña. Solo existe un usuario administrador.

**¿El sistema registra las acciones del administrador?**
Sí. Todas las acciones administrativas se registran en logs de actividad con timestamp e IP.

---

## 9. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Dashboard** | Tablero principal con resumen visual de datos |
| **ESP32** | Microcontrolador usado en los sensores IoT |
| **IoT** | Internet of Things - Dispositivos conectados a internet |
| **JWT** | JSON Web Token - Método de autenticación |
| **KPI** | Key Performance Indicator - Indicador clave de rendimiento |
| **Lectura** | Conjunto de valores medidos por un sensor en un momento |
| **ppm** | Partes por millón - Unidad de concentración de gases |
| **Sensor Fijo** | Sensor en ubicación estática |
| **Sensor Móvil** | Sensor que cambia de ubicación |
| **Threshold (Umbral)** | Límite que al excederse genera una alerta |
| **Timestamp** | Marca de tiempo (fecha y hora exacta) |
| **Zona** | Área geográfica de monitoreo (Urbana, Rural, Suburbana) |

---

## 10. Contacto y Soporte

### 10.1 Soporte Técnico

**Email:** soporte@iiap.gob.pe
**Teléfono:** +51 XXX XXX XXX
**Horario:** Lunes a Viernes, 8:00 AM - 5:00 PM

### 10.2 Reportar Problemas

Para reportar problemas técnicos, por favor incluya:
- Descripción detallada del problema
- Pasos para reproducir el error
- Navegador y versión utilizada
- Capturas de pantalla (si es posible)
- Mensaje de error exacto

### 10.3 Sugerencias de Mejora

Sus comentarios son valiosos para mejorar el sistema. Puede enviar sugerencias a:
**Email:** feedback@iiap.gob.pe

---

## Apéndices

### Apéndice A: Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `F5` o `Ctrl + R` | Recargar página |
| `Ctrl + F` | Buscar en página |
| `Esc` | Cerrar modal abierto |

### Apéndice B: Navegadores Recomendados

Por orden de rendimiento:
1. Google Chrome (recomendado)
2. Microsoft Edge
3. Mozilla Firefox
4. Safari (macOS)

### Apéndice C: Recursos Adicionales

- **Manual Técnico del Backend:** Para desarrolladores
- **Manual de API:** Para integraciones
- **Diseño Figma:** Referencia visual del sistema

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Versión:** 1.0.0
**Fecha de última actualización:** 05/11/2025
**Autor:** Equipo de Desarrollo IIAP
