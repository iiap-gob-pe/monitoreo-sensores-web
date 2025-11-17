# GUÍA RÁPIDA: OBTENCIÓN DE ENTREGABLES DE BASE DE DATOS
## Sistema de Monitoreo Ambiental - IIAP

---

**Documento:** Guía para Obtener Entregables de Base de Datos usando pgAdmin
**Entregables:** Diagrama Entidad-Relación + Script SQL
**Herramienta:** pgAdmin 4
**Versión:** 1.0
**Fecha:** [Fecha de elaboración]

---

## 📋 ENTREGABLES REQUERIDOS

1. **Modelo Entidad-Relación (Diagrama ER)**
   - Formato: Imagen PNG/SVG de alta calidad
   - Contenido: 8 entidades, relaciones, cardinalidades, atributos

2. **Script SQL de la Base de Datos**
   - Formato: Archivo .sql ejecutable
   - Contenido: CREATE TABLE, ALTER TABLE, CREATE INDEX, comentarios

---

## 🔧 REQUISITOS PREVIOS

### 1. Instalar pgAdmin 4

**Descargar:**
- URL: https://www.pgadmin.org/download/
- Versión recomendada: pgAdmin 4.8 o superior
- Compatible con: Windows, macOS, Linux

**Instalación:**
1. Descargar instalador para tu sistema operativo
2. Ejecutar instalador y seguir asistente
3. Abrir pgAdmin 4 (se abre en navegador)
4. Configurar contraseña maestra (primera vez)

### 2. Conectar a la Base de Datos

**Paso 1: Registrar servidor**
- Click derecho en "Servers" → "Register" → "Server"

**Paso 2: Configurar conexión**

**Pestaña "General":**
- Name: `IIAP - Sensor Monitoreo`

**Pestaña "Connection":**
- Host name/address: `localhost` (o IP del servidor)
- Port: `5432`
- Maintenance database: `postgres`
- Username: `postgres` (o tu usuario)
- Password: `[tu contraseña]`
- Save password: ✓ (marcar)

**Paso 3: Guardar**
- Click en "Save"
- Verificar que aparece el servidor en el panel izquierdo

**Paso 4: Navegar a la base de datos**
```
Servers
└── IIAP - Sensor Monitoreo
    └── Databases
        └── sensor_monitoreo    ← Tu base de datos
            ├── Schemas
            │   └── public
            │       └── Tables   ← 8 tablas aquí
            └── ...
```

---

## 🎯 ENTREGABLE 1: DIAGRAMA ENTIDAD-RELACIÓN (ERD)

### Generar ERD con pgAdmin 4

**Paso 1: Seleccionar la base de datos**
- En el panel izquierdo, hacer click en `sensor_monitoreo` para seleccionar la base de datos

**Paso 2: Generar ERD**
- Click derecho en la base de datos `sensor_monitoreo`
- Seleccionar **"Generate ERD"** (o **"ERD For Database"**)
- Esperar unos segundos mientras pgAdmin analiza la estructura

**Paso 3: Visualizar diagrama**

Se abrirá una nueva pestaña con el diagrama ER mostrando:
- ✅ Las 8 tablas del sistema
- ✅ Relaciones con flechas (Primary Key → Foreign Key)
- ✅ Campos de cada tabla con tipos de datos
- ✅ Claves primarias (PK) marcadas con icono de llave
- ✅ Claves foráneas (FK) marcadas con icono de llave + flecha

**Paso 4: Ajustar visualización (opcional)**

Para mejor presentación:
- **Reorganizar tablas:** Arrastrar las tablas para mejor disposición visual
  - Tabla `sensores` al centro (tabla principal)
  - Tablas relacionadas alrededor (`lecturas`, `alertas`, `sensor_umbral`, `recorridos_guardados`)
  - Tabla `usuarios` y relacionadas (`logs_actividad`, `preferencias_sistema`) en zona separada

- **Zoom:** Usar botones de zoom o rueda del mouse para ajustar tamaño

- **Opciones de vista:**
  - Click en icono de engranaje (⚙️) para configurar:
    - Mostrar/ocultar columnas
    - Mostrar/ocultar tipos de datos
    - Mostrar/ocultar índices

**Paso 5: Exportar diagrama**

**Opción A: Exportar como imagen PNG (Recomendado)**
1. Click en menú **"File"** → **"Save Image"**
2. Nombre del archivo: `ER_Diagram_IIAP.png`
3. Ubicación: `docs/entregables/`
4. Click en "Save"

**Opción B: Exportar como SVG (Vectorial - Alta calidad)**
1. Click en menú **"File"** → **"Save Image"** → Elegir formato **SVG**
2. Nombre del archivo: `ER_Diagram_IIAP.svg`
3. Este formato es escalable sin pérdida de calidad

**Paso 6: Verificar entregable**
- Abrir el archivo exportado
- Verificar que se vean claramente:
  - ✓ Nombres de tablas
  - ✓ Nombres de campos
  - ✓ Líneas de relación
  - ✓ Texto legible (fuente mínimo 10pt)

**Resultado:**
- ✅ Archivo: `ER_Diagram_IIAP.png` o `ER_Diagram_IIAP.svg`
- ✅ Ubicación: `docs/entregables/`
- ✅ Listo para incluir en documentación

---

## 🗄️ ENTREGABLE 2: SCRIPT SQL DE LA BASE DE DATOS

### Exportar Script SQL con pgAdmin 4

**Paso 1: Seleccionar la base de datos**
- En el panel izquierdo, click derecho en `sensor_monitoreo`

**Paso 2: Backup con opciones de solo estructura**
- Seleccionar **"Backup..."**
- Se abre ventana de configuración de backup

**Paso 3: Configurar opciones de exportación**

**Pestaña "General":**
- Filename: Navegar a `docs/entregables/script_base_datos_IIAP.sql`
- Format: **Plain** (formato texto SQL)

**Pestaña "Dump Options #1":**
- Secciones a incluir:
  - ✓ **Pre-data** (estructura de tablas)
  - ✓ **Data** (desmarcar si solo quieres estructura)
  - ✗ **Post-data** (opcional, incluye triggers si existen)

- Objetos:
  - ✓ **Only schema** (marcar esto para exportar solo estructura sin datos)

**Pestaña "Dump Options #2":**
- Do not save:
  - ✓ **Owner** (no incluir comandos de propietario)
  - ✓ **Privileges** (no incluir comandos GRANT/REVOKE)
  - ✓ **Tablespace** (no incluir tablespaces)

- Queries:
  - ✓ **Use Column Inserts** (si incluyes datos, usar formato legible)
  - ✓ **Use Insert Commands** (si incluyes datos)

**Paso 4: Ejecutar backup**
- Click en botón **"Backup"**
- Esperar a que finalice (barra de progreso en esquina inferior derecha)
- Mensaje de éxito: "Backup completed successfully"

**Paso 5: Limpiar script generado (opcional)**

Abrir el archivo `script_base_datos_IIAP.sql` y:

1. **Eliminar líneas innecesarias al inicio:**
```sql
-- Eliminar estas líneas:
--
-- PostgreSQL database dump
--
-- Dumped from database version 16.x
-- Dumped by pg_dump version 16.x
SET statement_timeout = 0;
SET lock_timeout = 0;
...
```

2. **Mantener solo:**
- CREATE TYPE (enums)
- CREATE TABLE
- ALTER TABLE (constraints y foreign keys)
- CREATE INDEX
- COMMENT ON (comentarios de tablas)

**Paso 6: Agregar encabezado profesional**

Al inicio del archivo, agregar:

```sql
-- ================================================================
-- SISTEMA DE MONITOREO AMBIENTAL - IIAP
-- Script de Creación de Base de Datos
-- ================================================================
-- Autor: Michel Izquierdo
-- Fecha: [Fecha actual]
-- Versión: 1.0
-- SGBD: PostgreSQL 12+
-- Codificación: UTF-8
-- ================================================================
-- DESCRIPCIÓN:
-- Este script crea la estructura completa de la base de datos
-- del Sistema de Monitoreo Ambiental del IIAP, incluyendo:
--   - 8 tablas relacionales (sensores, lecturas, alertas,
--     sensor_umbral, usuarios, logs_actividad,
--     recorridos_guardados, preferencias_sistema)
--   - 6 relaciones con integridad referencial
--   - 11 índices optimizados para consultas frecuentes
--   - 5 tipos ENUM para valores controlados
--   - Restricciones de integridad (UNIQUE, CHECK, NOT NULL)
-- ================================================================
-- INSTRUCCIONES DE USO:
-- 1. Crear base de datos vacía:
--    CREATE DATABASE sensor_monitoreo;
-- 2. Conectar a la base de datos:
--    \c sensor_monitoreo
-- 3. Ejecutar este script:
--    \i script_base_datos_IIAP.sql
-- 4. Verificar tablas creadas:
--    \dt
-- 5. Verificar índices:
--    \di
-- ================================================================

-- Habilitar extensiones necesarias (si aplica)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inicio del script
-- ================================================================

[CONTENIDO DEL SCRIPT AQUÍ]
```

**Paso 7: Validar script**

Probar el script en una base de datos de prueba:

```sql
-- En psql o pgAdmin Query Tool:
CREATE DATABASE test_sensor_monitoreo;
\c test_sensor_monitoreo
\i docs/entregables/script_base_datos_IIAP.sql

-- Verificar tablas creadas
\dt

-- Debe mostrar:
-- public | alertas                  | table | postgres
-- public | lecturas                 | table | postgres
-- public | logs_actividad           | table | postgres
-- public | preferencias_sistema     | table | postgres
-- public | recorridos_guardados     | table | postgres
-- public | sensor_umbral            | table | postgres
-- public | sensores                 | table | postgres
-- public | usuarios                 | table | postgres

-- Verificar índices
\di

-- Debe mostrar 11+ índices

-- Si todo está correcto, eliminar BD de prueba
\c postgres
DROP DATABASE test_sensor_monitoreo;
```

**Resultado:**
- ✅ Archivo: `script_base_datos_IIAP.sql`
- ✅ Ubicación: `docs/entregables/`
- ✅ Ejecutable en PostgreSQL 12+
- ✅ ~300-400 líneas de código SQL
- ✅ Documentado y profesional

---

## 📦 ORGANIZAR ENTREGABLES

### Estructura Final de Carpetas

Después de generar ambos entregables, tu carpeta `docs` debe verse así:

```
sensor_monitoreo/
└── docs/
    ├── entregables/
    │   ├── Actividad_02_Diseño_Base_Datos.md    ← Descripción actividad
    │   ├── ER_Diagram_IIAP.png                  ← Diagrama ER (imagen)
    │   ├── ER_Diagram_IIAP.svg                  ← Diagrama ER (vectorial, opcional)
    │   └── script_base_datos_IIAP.sql           ← Script SQL completo
    └── ...
```

### Crear Estructura de Carpetas

Si no existe, crear carpeta de entregables:

**En Windows (PowerShell):**
```powershell
cd C:\Users\clorm\OneDrive\Escritorio\IIAP\sensor_monitoreo
mkdir -p docs/entregables
```

**En Linux/macOS:**
```bash
cd ~/ruta/al/proyecto/sensor_monitoreo
mkdir -p docs/entregables
```

---

## ✅ CHECKLIST DE ENTREGABLES

### Antes de Entregar, Verificar:

#### Diagrama ER ✓
- [ ] Archivo exportado: `ER_Diagram_IIAP.png` o `ER_Diagram_IIAP.svg`
- [ ] Incluye las 8 tablas (sensores, lecturas, alertas, sensor_umbral, usuarios, logs_actividad, recorridos_guardados, preferencias_sistema)
- [ ] Muestra relaciones con flechas y cardinalidades (1:N, 1:1)
- [ ] Incluye atributos principales de cada tabla
- [ ] Marca claves primarias (PK) con icono de llave
- [ ] Marca claves foráneas (FK) con conexiones visuales
- [ ] Formato PNG o SVG de alta calidad (mínimo 1920x1080)
- [ ] Texto legible al imprimir en tamaño carta
- [ ] Tablas organizadas visualmente (no superpuestas)

#### Script SQL ✓
- [ ] Archivo: `script_base_datos_IIAP.sql`
- [ ] Ejecutable en PostgreSQL 12+ sin errores
- [ ] Incluye encabezado con metadatos (autor, fecha, versión)
- [ ] Incluye instrucciones de uso
- [ ] Incluye CREATE TYPE para 5 ENUMs
- [ ] Incluye CREATE TABLE para 8 tablas
- [ ] Incluye ALTER TABLE para claves foráneas y constraints
- [ ] Incluye CREATE INDEX para índices (mínimo 11)
- [ ] Sin comandos de SET innecesarios (limpiado)
- [ ] Sin comandos de OWNER o GRANT (limpiado)
- [ ] Codificación UTF-8
- [ ] Tamaño aproximado: 300-400 líneas
- [ ] Probado en base de datos de prueba (sin errores)

---

## 🚀 RESUMEN RÁPIDO (Pasos Mínimos)

### Para Diagrama ER:
1. Abrir pgAdmin 4
2. Conectar a servidor PostgreSQL
3. Click derecho en `sensor_monitoreo` → **"Generate ERD"**
4. Reorganizar tablas visualmente (opcional)
5. Menú **File** → **Save Image** → PNG
6. Guardar en: `docs/entregables/ER_Diagram_IIAP.png`

**⏱️ Tiempo estimado: 5 minutos**

---

### Para Script SQL:
1. Click derecho en `sensor_monitoreo` → **"Backup..."**
2. Configurar:
   - Format: **Plain**
   - Filename: `docs/entregables/script_base_datos_IIAP.sql`
   - Dump Options #1: marcar **"Only schema"**
   - Dump Options #2: marcar **"Owner"** y **"Privileges"**
3. Click **"Backup"**
4. Abrir archivo y agregar encabezado profesional
5. Limpiar líneas de SET innecesarias (opcional)
6. Probar en BD de prueba

**⏱️ Tiempo estimado: 10 minutos**

---

**⏱️ TIEMPO TOTAL: 15 minutos para ambos entregables** ✅

---

## 💡 TIPS Y MEJORES PRÁCTICAS

### Para el Diagrama ER

1. **Organización visual:**
   - Tabla `sensores` al centro (núcleo del sistema)
   - Tablas hijas (`lecturas`, `alertas`, `umbrales`, `recorridos`) alrededor
   - Grupo de `usuarios` y relacionadas en zona separada

2. **Claridad:**
   - Evitar superposición de líneas de relación
   - Usar zoom adecuado (100% o 125%)
   - Asegurar que todos los campos sean legibles

3. **Exportación:**
   - PNG para documentos Word/PDF
   - SVG para documentos que requieran escalabilidad

### Para el Script SQL

1. **Limpieza:**
   - Eliminar comandos de configuración (SET)
   - Eliminar comentarios autogenerados excesivos
   - Mantener solo lo esencial

2. **Documentación:**
   - Encabezado claro con metadata
   - Comentarios en secciones importantes
   - Instrucciones de uso incluidas

3. **Validación:**
   - Siempre probar en BD de prueba
   - Verificar que crea todas las tablas
   - Verificar que crea todos los índices
   - Verificar que no hay errores de sintaxis

---

## 📞 SOPORTE Y SOLUCIÓN DE PROBLEMAS

### Error: "Generate ERD option not available"

**Posible causa:** Versión antigua de pgAdmin

**Solución:**
- Actualizar pgAdmin a versión 4.8+
- Descargar de: https://www.pgadmin.org/download/

---

### Error: "Backup failed - permission denied"

**Posible causa:** No tienes permisos de escritura en carpeta destino

**Solución:**
```bash
# En Windows PowerShell (ejecutar como Administrador):
icacls "C:\Users\clorm\OneDrive\Escritorio\IIAP\sensor_monitoreo\docs\entregables" /grant Users:F

# En Linux/macOS:
sudo chmod 755 ~/ruta/al/proyecto/sensor_monitoreo/docs/entregables
```

---

### Error: Script SQL falla al ejecutar

**Posible causa:** Dependencias de tablas no respetadas

**Solución:**
- Asegurarse de que tablas padre se crean antes que tablas hijo
- Orden correcto:
  1. CREATE TYPE (enums)
  2. CREATE TABLE (tablas sin FK primero)
  3. ALTER TABLE (agregar FK después)
  4. CREATE INDEX (al final)

---

### Diagrama ER muy grande o muy pequeño

**Solución:**
- En pgAdmin ERD: Usar botones de zoom (+/-)
- Reorganizar tablas manualmente para compactar
- Al exportar, elegir tamaño personalizado (File → Export → Options)

---

### Script SQL incluye datos (INSERT statements)

**Solución:**
- Repetir proceso de Backup
- En "Dump Options #1" asegurarse de marcar **"Only schema"**
- NO marcar "Data" (debe estar desmarcado)

---

## 📝 VALIDACIÓN FINAL

### Lista de Verificación Pre-Entrega

**Diagrama ER:**
- ✓ Abre correctamente en visor de imágenes
- ✓ Resolución adecuada (no pixelado al 100%)
- ✓ Todas las 8 tablas visibles y legibles
- ✓ Relaciones marcadas con líneas claras
- ✓ Nombres de campos legibles (mínimo 10pt)
- ✓ Archivo < 5 MB (tamaño razonable)

**Script SQL:**
- ✓ Ejecuta sin errores en PostgreSQL limpio
- ✓ Crea exactamente 8 tablas
- ✓ Crea al menos 11 índices
- ✓ Incluye 5 tipos ENUM
- ✓ Tiene encabezado profesional
- ✓ Sin errores de sintaxis
- ✓ Codificación UTF-8 (caracteres especiales se ven bien)

**Documentación:**
- ✓ Archivo `Actividad_02_Diseño_Base_Datos.md` completo
- ✓ Ambos entregables en carpeta `docs/entregables/`
- ✓ Nombres de archivo descriptivos y profesionales

---

## 🎓 ENTREGA FINAL

### Archivos a Entregar

1. **Actividad_02_Diseño_Base_Datos.md** (Descripción de la actividad)
2. **ER_Diagram_IIAP.png** o **ER_Diagram_IIAP.svg** (Diagrama visual)
3. **script_base_datos_IIAP.sql** (Script SQL ejecutable)

### Ubicación

```
docs/entregables/
├── Actividad_02_Diseño_Base_Datos.md
├── ER_Diagram_IIAP.png
└── script_base_datos_IIAP.sql
```

### Formato de Presentación

Si se requiere en un solo documento (Word/PDF):

1. Abrir documento Word
2. Insertar contenido de `Actividad_02_Diseño_Base_Datos.md`
3. Insertar imagen del diagrama ER
4. Insertar script SQL como código (formato monoespaciado)
5. Exportar como PDF

---

**FIN DE LA GUÍA**

**Elaborado por:** Michel Izquierdo
**Versión:** 1.0
**Última actualización:** [Fecha]
**Herramienta utilizada:** pgAdmin 4

---

**✅ LISTO PARA USAR**

Esta guía te permite obtener ambos entregables en **15 minutos** usando solo pgAdmin 4.
