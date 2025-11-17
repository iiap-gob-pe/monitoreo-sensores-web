# Manual de Instalación y Despliegue
## Sistema de Monitoreo Ambiental IIAP

**Versión:** 1.0.0
**Fecha:** 06/11/2025
**Audiencia:** Desarrolladores, DevOps, Administradores de Sistemas

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Instalación en Desarrollo](#3-instalación-en-desarrollo)
4. [Configuración del Backend](#4-configuración-del-backend)
5. [Configuración del Frontend](#5-configuración-del-frontend)
6. [Configuración de la Base de Datos](#6-configuración-de-la-base-de-datos)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Ejecución en Modo Desarrollo](#8-ejecución-en-modo-desarrollo)
9. [Testing](#9-testing)
10. [Build para Producción](#10-build-para-producción)
11. [Despliegue en Producción](#11-despliegue-en-producción)
12. [Monitoreo y Mantenimiento](#12-monitoreo-y-mantenimiento)
13. [Solución de Problemas](#13-solución-de-problemas)
14. [Respaldo y Recuperación](#14-respaldo-y-recuperación)

---

## 1. Introducción

### 1.1 Propósito del Manual

Este manual proporciona instrucciones detalladas para instalar, configurar y desplegar el Sistema de Monitoreo Ambiental IIAP en entornos de desarrollo y producción.

### 1.2 Alcance

El manual cubre:
- ✅ Instalación local para desarrollo
- ✅ Configuración de entornos
- ✅ Despliegue en servidores de producción
- ✅ Configuración de CI/CD
- ✅ Monitoreo y mantenimiento

### 1.3 Arquitectura del Sistema

El sistema consta de 3 componentes principales:

```
┌─────────────────────────────────────────────────┐
│                   CLIENTE                        │
│        (Navegadores Web: Chrome, Firefox)        │
└────────────────┬────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────┐
│              FRONTEND (React)                    │
│    - Vite 7.1.7                                  │
│    - React 19.1.1                                │
│    - Tailwind CSS 3.4.17                         │
│    Servidor: Nginx / Vercel                      │
└────────────────┬────────────────────────────────┘
                 │ API REST (HTTP/JSON)
┌────────────────▼────────────────────────────────┐
│            BACKEND (Node.js + Express)           │
│    - Node.js 22.16.0                             │
│    - Express 4.21.2                              │
│    - Prisma ORM 6.14.0                           │
│    Servidor: Railway / Render / VPS             │
└────────────────┬────────────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────────────┐
│          BASE DE DATOS (PostgreSQL)              │
│    - PostgreSQL 12+                              │
│    Servidor: Supabase / Railway / VPS           │
└─────────────────────────────────────────────────┘
```

---

## 2. Requisitos Previos

### 2.1 Hardware

**Para Desarrollo:**
- CPU: Procesador dual-core 2.0 GHz o superior
- RAM: 8 GB mínimo, 16 GB recomendado
- Almacenamiento: 10 GB libres mínimo
- Conexión a Internet: 5 Mbps o superior

**Para Producción:**
- CPU: 4 cores o más
- RAM: 16 GB mínimo
- Almacenamiento: 50 GB SSD
- Conexión: 100 Mbps o superior

---

### 2.2 Software

#### **2.2.1 Sistema Operativo**

| SO | Versión Mínima | Notas |
|----| --------------|-------|
| **Windows** | Windows 10/11 | Desarrollo y producción |
| **macOS** | 11 Big Sur o superior | Desarrollo |
| **Linux** | Ubuntu 20.04 LTS o superior | Desarrollo y producción (recomendado) |

---

#### **2.2.2 Node.js**

**Versión requerida:** Node.js 22.16.0 (LTS)

**Instalación en Windows:**
```bash
# Descargar desde https://nodejs.org/
# Ejecutar el instalador .msi
# Verificar instalación:
node --version   # Debe mostrar: v22.16.0
npm --version    # Debe mostrar: 10.x.x o superior
```

**Instalación en macOS:**
```bash
# Usando Homebrew:
brew install node@22

# Verificar:
node --version
npm --version
```

**Instalación en Linux (Ubuntu/Debian):**
```bash
# Usando NodeSource:
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar:
node --version
npm --version
```

**Instalación en Linux (usando nvm - Recomendado):**
```bash
# Instalar nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar shell:
source ~/.bashrc

# Instalar Node.js 22:
nvm install 22
nvm use 22
nvm alias default 22

# Verificar:
node --version
```

---

#### **2.2.3 PostgreSQL**

**Versión requerida:** PostgreSQL 12 o superior

**Instalación en Windows:**
```bash
# Descargar desde https://www.postgresql.org/download/windows/
# Ejecutar el instalador
# Durante la instalación:
#   - Puerto: 5432 (default)
#   - Contraseña: Establecer contraseña segura para usuario 'postgres'
#   - Locale: Spanish_Peru o English_United States

# Verificar:
psql --version
```

**Instalación en macOS:**
```bash
# Usando Homebrew:
brew install postgresql@15

# Iniciar servicio:
brew services start postgresql@15

# Verificar:
psql --version
```

**Instalación en Linux (Ubuntu/Debian):**
```bash
# Actualizar repositorios:
sudo apt update

# Instalar PostgreSQL:
sudo apt install postgresql postgresql-contrib

# Iniciar servicio:
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar:
psql --version
sudo systemctl status postgresql
```

---

#### **2.2.4 Git**

**Instalación en Windows:**
```bash
# Descargar desde https://git-scm.com/download/win
# Ejecutar instalador con opciones por defecto
git --version
```

**Instalación en macOS:**
```bash
brew install git
git --version
```

**Instalación en Linux:**
```bash
sudo apt install git
git --version
```

---

#### **2.2.5 Editor de Código (Opcional pero Recomendado)**

**Visual Studio Code:**
- Descargar desde: https://code.visualstudio.com/
- Extensiones recomendadas:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  - GitLens

---

## 3. Instalación en Desarrollo

### 3.1 Clonar el Repositorio

```bash
# Opción 1: Usando HTTPS
git clone https://github.com/iiap/sensor_monitoreo.git

# Opción 2: Usando SSH (si tienes clave SSH configurada)
git clone git@github.com:iiap/sensor_monitoreo.git

# Navegar al directorio:
cd sensor_monitoreo

# Verificar estructura:
ls -la
# Debe mostrar: backend/, frontend/, docs/, README.md, etc.
```

---

### 3.2 Estructura del Proyecto

```
sensor_monitoreo/
├── backend/                 # Servidor Node.js + Express
│   ├── src/                 # Código fuente
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── routes/          # Definición de rutas
│   │   ├── middlewares/     # Middleware (auth, errores)
│   │   ├── utils/           # Funciones utilitarias
│   │   └── server.js        # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   └── migrations/      # Migraciones SQL
│   ├── .env.example         # Plantilla de variables de entorno
│   ├── package.json         # Dependencias backend
│   └── README.md
│
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Llamadas a API
│   │   ├── context/         # Context API (Auth)
│   │   └── App.jsx          # Componente raíz
│   ├── public/              # Archivos estáticos
│   ├── .env.example         # Plantilla de variables de entorno
│   ├── package.json         # Dependencias frontend
│   ├── vite.config.js       # Configuración de Vite
│   └── tailwind.config.js   # Configuración de Tailwind
│
├── docs/                    # Documentación completa
│   ├── Actividad_01_Analisis_Requerimientos.md
│   ├── Entregable_01_Informe_Requerimientos.md
│   ├── Entregable_03_Manual_Diseño_UI_UX.md
│   ├── Entregable_04_Manual_Tecnico_Backend.md
│   ├── Entregable_04_Manual_API.md
│   ├── Entregable_05_Guia_Usuario.md
│   ├── Entregable_06_Informe_Pruebas_Finales.md
│   └── Entregable_07_Manual_Instalacion_Despliegue.md (este archivo)
│
└── README.md                # Documentación principal
```

---

## 4. Configuración del Backend

### 4.1 Navegar al Directorio del Backend

```bash
cd backend
```

---

### 4.2 Instalar Dependencias

```bash
npm install
```

**Tiempo estimado:** 1-3 minutos

**Dependencias instaladas (principales):**
- express@4.21.2
- @prisma/client@6.14.0
- bcryptjs@2.4.3
- jsonwebtoken@9.0.2
- cors@2.8.5
- dotenv@16.4.5
- helmet@8.0.0
- express-validator@7.2.0

**Dependencias de desarrollo:**
- prisma@6.14.0
- nodemon@3.1.9

---

### 4.3 Verificar package.json

El archivo `backend/package.json` debe contener:

```json
{
  "name": "iiap-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "npx prisma migrate dev",
    "migrate:deploy": "npx prisma migrate deploy",
    "prisma:studio": "npx prisma studio",
    "prisma:generate": "npx prisma generate",
    "seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@prisma/client": "^6.14.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "express-validator": "^7.2.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.9",
    "prisma": "^6.14.0"
  }
}
```

---

## 5. Configuración del Frontend

### 5.1 Navegar al Directorio del Frontend

```bash
# Desde la raíz del proyecto:
cd frontend

# O desde backend:
cd ../frontend
```

---

### 5.2 Instalar Dependencias

```bash
npm install
```

**Tiempo estimado:** 2-4 minutos

**Dependencias instaladas (principales):**
- react@19.1.1
- react-dom@19.1.1
- react-router-dom@7.9.1
- axios@1.12.2
- tailwindcss@3.4.17
- leaflet@1.9.4
- chart.js@4.5.0
- react-chartjs-2@5.3.0
- jspdf@3.0.3
- xlsx@0.18.5

---

### 5.3 Verificar package.json

El archivo `frontend/package.json` debe contener:

```json
{
  "name": "iiap-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx",
    "format": "prettier --write \"src/**/*.{js,jsx}\""
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.1",
    "axios": "^1.12.2",
    "@headlessui/react": "^2.2.8",
    "@heroicons/react": "^2.2.0",
    "tailwindcss": "^3.4.17",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "chart.js": "^4.5.0",
    "react-chartjs-2": "^5.3.0",
    "recharts": "^3.2.1",
    "jspdf": "^3.0.3",
    "jspdf-autotable": "^5.0.2",
    "xlsx": "^0.18.5",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "jwt-decode": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^7.1.7",
    "eslint": "^8.57.0",
    "prettier": "^3.3.3"
  }
}
```

---

## 6. Configuración de la Base de Datos

### 6.1 Crear la Base de Datos PostgreSQL

#### **Opción 1: Usando psql (Terminal)**

```bash
# Conectar como usuario postgres:
# Windows:
psql -U postgres

# Linux/macOS:
sudo -u postgres psql

# Crear base de datos:
CREATE DATABASE iiap_db;

# Crear usuario (opcional pero recomendado):
CREATE USER iiap_admin WITH PASSWORD 'tu_contraseña_segura';

# Otorgar permisos:
GRANT ALL PRIVILEGES ON DATABASE iiap_db TO iiap_admin;

# Salir:
\q
```

---

#### **Opción 2: Usando pgAdmin (GUI)**

1. Abrir pgAdmin
2. Click derecho en "Databases"
3. Seleccionar "Create" → "Database"
4. Nombre: `iiap_db`
5. Owner: `postgres` (o crear nuevo usuario)
6. Click "Save"

---

#### **Opción 3: Usando DBeaver (GUI)**

1. Abrir DBeaver
2. Click en "Database" → "New Database Connection"
3. Seleccionar PostgreSQL
4. Configurar:
   - Host: `localhost`
   - Port: `5432`
   - Database: `postgres` (temporal)
   - Username: `postgres`
   - Password: tu contraseña
5. Conectar
6. Click derecho en la conexión → "Create" → "Database"
7. Nombre: `iiap_db`

---

### 6.2 Verificar Conexión

```bash
# Conectar a la base de datos creada:
psql -U postgres -d iiap_db

# Verificar que esté vacía:
\dt

# Debe mostrar: "Did not find any relations." (normal en BD nueva)

# Salir:
\q
```

---

## 7. Variables de Entorno

### 7.1 Configurar Variables del Backend

#### **Paso 1: Crear archivo .env**

```bash
# Desde el directorio backend/:
cd backend

# Windows:
copy .env.example .env

# Linux/macOS:
cp .env.example .env
```

---

#### **Paso 2: Editar .env**

Abrir `backend/.env` con un editor de texto y configurar:

```env
# ==================================
# CONFIGURACIÓN DEL SERVIDOR
# ==================================
PORT=3000
NODE_ENV=development

# ==================================
# BASE DE DATOS (PostgreSQL)
# ==================================
# Formato: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Desarrollo local:
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/iiap_db"

# Si creaste un usuario específico:
# DATABASE_URL="postgresql://iiap_admin:tu_contraseña_segura@localhost:5432/iiap_db"

# Producción (ejemplo con Supabase):
# DATABASE_URL="postgresql://postgres:contraseña@db.xxxxxxxxxxxx.supabase.co:5432/postgres"

# ==================================
# AUTENTICACIÓN JWT
# ==================================
# IMPORTANTE: Cambiar en producción por una clave muy segura
JWT_SECRET="clave_secreta_desarrollo_cambiar_en_produccion_minimo_32_caracteres"
JWT_EXPIRES_IN=8h

# ==================================
# BCRYPT
# ==================================
BCRYPT_SALT_ROUNDS=10

# ==================================
# CORS
# ==================================
# URLs permitidas para hacer peticiones al backend
CORS_ORIGIN=http://localhost:5173

# Producción (separar con comas):
# CORS_ORIGIN=https://monitoreo-iiap.com,https://www.monitoreo-iiap.com

# ==================================
# RATE LIMITING
# ==================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==================================
# LOGS
# ==================================
LOG_LEVEL=info
```

---

#### **Paso 3: Generar JWT_SECRET Seguro (Producción)**

```bash
# Opción 1: Usando Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: Usando OpenSSL
openssl rand -hex 64

# Copiar la salida y reemplazar JWT_SECRET en .env
```

---

### 7.2 Configurar Variables del Frontend

#### **Paso 1: Crear archivo .env**

```bash
# Desde el directorio frontend/:
cd frontend

# Windows:
copy .env.example .env

# Linux/macOS:
cp .env.example .env
```

---

#### **Paso 2: Editar .env**

Abrir `frontend/.env` y configurar:

```env
# ==================================
# API BACKEND
# ==================================
# Desarrollo local:
VITE_API_URL=http://localhost:3000/api

# Producción:
# VITE_API_URL=https://api.monitoreo-iiap.com/api

# ==================================
# ENTORNO
# ==================================
VITE_ENV=development

# ==================================
# CONFIGURACIÓN DE MAPAS
# ==================================
# Leaflet usa OpenStreetMap (gratuito), no requiere API key

# ==================================
# CONFIGURACIÓN GENERAL
# ==================================
VITE_APP_NAME=Sistema de Monitoreo Ambiental IIAP
VITE_APP_VERSION=1.0.0
```

**Nota:** En Vite, las variables de entorno DEBEN empezar con `VITE_` para estar disponibles en el cliente.

---

## 8. Ejecución en Modo Desarrollo

### 8.1 Ejecutar Migraciones de Base de Datos

```bash
# Desde backend/:
cd backend

# Generar cliente Prisma:
npx prisma generate

# Ejecutar migraciones (crea las tablas):
npx prisma migrate dev --name init

# Salida esperada:
# ✔ Generated Prisma Client
# ✔ Applied migration: 20251106_init
```

**Esto creará 8 tablas:**
1. `sensores`
2. `lecturas`
3. `alertas`
4. `sensor_umbral`
5. `usuarios`
6. `logs_actividad`
7. `recorridos_guardados`
8. `preferencias_sistema`

---

### 8.2 Poblar Base de Datos (Seed)

```bash
# Ejecutar seed para datos de prueba:
npm run seed

# Esto creará:
# - 1 usuario administrador (admin@iiap.gob.pe / Admin123!)
# - 5 sensores de ejemplo
# - 100 lecturas de prueba
# - 3 alertas de ejemplo
```

---

### 8.3 Verificar Datos en la Base de Datos

**Opción 1: Prisma Studio (Recomendado)**

```bash
# Desde backend/:
npx prisma studio

# Se abrirá navegador en http://localhost:5555
# Podrás ver y editar todas las tablas con una interfaz gráfica
```

**Opción 2: psql**

```bash
psql -U postgres -d iiap_db

# Ver tablas:
\dt

# Ver usuarios:
SELECT * FROM usuarios;

# Ver sensores:
SELECT * FROM sensores;

# Salir:
\q
```

---

### 8.4 Iniciar el Backend

```bash
# Desde backend/:
npm run dev

# Salida esperada:
# [nodemon] starting `node src/server.js`
# 🚀 Servidor corriendo en http://localhost:3000
# ✅ Conectado a PostgreSQL
# 📊 Entorno: development
```

**El backend estará disponible en:** http://localhost:3000

**Endpoints de prueba:**
- GET http://localhost:3000/api/health → `{"status": "ok"}`
- GET http://localhost:3000/api/sensores → Lista de sensores

---

### 8.5 Iniciar el Frontend

**En una nueva terminal:**

```bash
# Desde frontend/:
cd frontend
npm run dev

# Salida esperada:
# VITE v7.1.7  ready in 1234 ms
#
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.x:5173/
# ➜  press h to show help
```

**El frontend estará disponible en:** http://localhost:5173

---

### 8.6 Verificar que Todo Funcione

1. **Abrir navegador:** http://localhost:5173
2. **Verificar Dashboard:**
   - Deben aparecer 4 KPIs con datos
   - Mapa debe mostrar marcadores de sensores
   - Tabla de últimas lecturas debe tener datos
3. **Probar login:**
   - Click en "Iniciar Sesión"
   - Usuario: `admin@iiap.gob.pe`
   - Contraseña: `Admin123!`
   - Debe redirigir al dashboard administrativo
4. **Verificar funciones admin:**
   - Click en "Sensores" → Debe mostrar lista
   - Click "+ Nuevo Sensor" → Modal debe abrir
   - Click en "Alertas" → Debe mostrar alertas de ejemplo

**Si todo funciona: ✅ Instalación exitosa**

---

## 9. Testing

### 9.1 Tests del Backend

```bash
# Desde backend/:
npm test

# Ejecuta tests de integración y unitarios
# Cobertura esperada: ~75%
```

---

### 9.2 Tests del Frontend

```bash
# Desde frontend/:
npm run lint

# Verifica errores de sintaxis y estilo
```

---

### 9.3 Pruebas Manuales

**Checklist de pruebas:**

**Backend:**
- [ ] POST /api/auth/login → Autenticación funciona
- [ ] GET /api/sensores → Retorna lista de sensores
- [ ] POST /api/sensores → Crea nuevo sensor (con token)
- [ ] GET /api/lecturas/recientes → Retorna lecturas
- [ ] GET /api/alertas/activas → Retorna alertas

**Frontend:**
- [ ] Dashboard carga correctamente
- [ ] Mapa muestra marcadores
- [ ] Login funciona
- [ ] CRUD de sensores funciona
- [ ] Gráficos se renderizan
- [ ] Exportación a PDF/Excel funciona
- [ ] Responsivo en móvil (inspeccionar con DevTools)

---

## 10. Build para Producción

### 10.1 Build del Backend

```bash
# Desde backend/:

# Limpiar node_modules (opcional):
rm -rf node_modules
npm install --production

# O mantener devDependencies si necesitas Prisma CLI:
npm install

# Generar cliente Prisma:
npx prisma generate

# No se requiere build explícito (Node.js ejecuta JS directamente)
```

---

### 10.2 Build del Frontend

```bash
# Desde frontend/:

# Limpiar builds anteriores:
rm -rf dist

# Crear build optimizado:
npm run build

# Salida esperada:
# vite v7.1.7 building for production...
# ✓ 1234 modules transformed.
# dist/index.html                   0.45 kB
# dist/assets/index-abc123.js     450.32 kB │ gzip: 145.21 kB
# dist/assets/index-abc123.css     12.45 kB │ gzip: 3.21 kB
# ✓ built in 15.34s
```

**Archivos generados en `frontend/dist/`:**
- `index.html` - HTML principal
- `assets/` - JS, CSS, imágenes optimizadas

---

### 10.3 Preview del Build

```bash
# Desde frontend/:
npm run preview

# Abre: http://localhost:4173
# Prueba el build de producción localmente
```

---

## 11. Despliegue en Producción

### 11.1 Opciones de Despliegue

| Componente | Opción 1 | Opción 2 | Opción 3 |
|------------|----------|----------|----------|
| **Frontend** | Vercel (Recomendado) | Netlify | Nginx en VPS |
| **Backend** | Railway (Recomendado) | Render | Node.js en VPS |
| **Base de Datos** | Supabase (Recomendado) | Railway | PostgreSQL en VPS |

---

### 11.2 Despliegue del Frontend en Vercel

#### **Paso 1: Crear cuenta en Vercel**

1. Ir a https://vercel.com/
2. Sign up con GitHub
3. Autorizar acceso a repositorios

---

#### **Paso 2: Importar Proyecto**

```bash
# Instalar Vercel CLI (opcional):
npm install -g vercel

# Desde frontend/:
vercel

# Seguir pasos:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N
# - Project name: iiap-frontend
# - In which directory is your code? ./
# - Override settings? N
```

---

#### **Paso 3: Configurar Variables de Entorno**

1. Ir a dashboard de Vercel
2. Seleccionar proyecto → Settings → Environment Variables
3. Agregar:
   - `VITE_API_URL` → URL del backend en producción (ej: `https://api-iiap.railway.app/api`)
   - `VITE_ENV` → `production`

---

#### **Paso 4: Deploy**

```bash
# Deploy automático al hacer push a main:
git push origin main

# O manual:
vercel --prod
```

**URL de producción:** https://iiap-frontend.vercel.app

---

### 11.3 Despliegue del Backend en Railway

#### **Paso 1: Crear cuenta en Railway**

1. Ir a https://railway.app/
2. Sign up con GitHub
3. Crear nuevo proyecto

---

#### **Paso 2: Conectar Repositorio**

1. Click "New Project"
2. Seleccionar "Deploy from GitHub repo"
3. Seleccionar repositorio `sensor_monitoreo`
4. Root directory: `/backend`

---

#### **Paso 3: Configurar Variables de Entorno**

En Railway dashboard → Variables:

```
DATABASE_URL=postgresql://...  (Railway provee esto automáticamente si agregas PostgreSQL)
JWT_SECRET=<generar clave segura de 64 caracteres>
JWT_EXPIRES_IN=8h
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=https://iiap-frontend.vercel.app
NODE_ENV=production
PORT=3000
```

---

#### **Paso 4: Agregar PostgreSQL**

1. En Railway dashboard → "New" → "Database" → "PostgreSQL"
2. Railway automáticamente:
   - Crea base de datos
   - Configura `DATABASE_URL`
   - Conecta con el backend

---

#### **Paso 5: Ejecutar Migraciones**

```bash
# Railway ejecutará automáticamente:
npx prisma migrate deploy

# Si no, agregarlo en package.json:
{
  "scripts": {
    "start": "npx prisma migrate deploy && node src/server.js"
  }
}
```

---

#### **Paso 6: Deploy**

Railway despliega automáticamente al hacer push a GitHub.

**URL de producción:** https://iiap-backend.up.railway.app

---

### 11.4 Despliegue de Base de Datos en Supabase

#### **Paso 1: Crear cuenta en Supabase**

1. Ir a https://supabase.com/
2. Sign up
3. Crear nuevo proyecto:
   - Project name: `iiap-monitoring`
   - Database password: `<contraseña segura>`
   - Region: South America (São Paulo) - más cercano a Perú

---

#### **Paso 2: Obtener Connection String**

1. Ir a Settings → Database
2. Copiar "Connection string" (URI mode)
3. Reemplazar `[YOUR-PASSWORD]` con tu contraseña

Ejemplo:
```
postgresql://postgres:tu_contraseña@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

---

#### **Paso 3: Configurar en Backend**

Actualizar `DATABASE_URL` en Railway/Render con la connection string de Supabase.

---

#### **Paso 4: Ejecutar Migraciones**

```bash
# Local, apuntando a Supabase:
DATABASE_URL="postgresql://postgres:..." npx prisma migrate deploy

# O dejar que Railway lo haga automáticamente
```

---

### 11.5 Despliegue en VPS (Alternativa)

Si prefieres un VPS (DigitalOcean, AWS EC2, Linode):

#### **Requisitos del Servidor:**
- Ubuntu 22.04 LTS
- 2 GB RAM mínimo
- 2 CPU cores
- 20 GB SSD

---

#### **Paso 1: Configurar Servidor**

```bash
# Conectar via SSH:
ssh root@tu_ip_servidor

# Actualizar sistema:
apt update && apt upgrade -y

# Instalar Node.js:
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Instalar PostgreSQL:
apt install -y postgresql postgresql-contrib

# Instalar Nginx:
apt install -y nginx

# Instalar PM2 (gestor de procesos):
npm install -g pm2

# Instalar certbot (SSL):
apt install -y certbot python3-certbot-nginx
```

---

#### **Paso 2: Configurar PostgreSQL**

```bash
# Crear base de datos:
sudo -u postgres psql
CREATE DATABASE iiap_db;
CREATE USER iiap_admin WITH PASSWORD 'contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE iiap_db TO iiap_admin;
\q
```

---

#### **Paso 3: Clonar y Configurar Backend**

```bash
# Crear directorio:
mkdir -p /var/www/iiap
cd /var/www/iiap

# Clonar repositorio:
git clone https://github.com/iiap/sensor_monitoreo.git
cd sensor_monitoreo/backend

# Instalar dependencias:
npm install

# Configurar .env:
nano .env
# (Pegar configuración de producción)

# Ejecutar migraciones:
npx prisma migrate deploy

# Iniciar con PM2:
pm2 start src/server.js --name iiap-backend
pm2 save
pm2 startup
```

---

#### **Paso 4: Configurar Nginx para Backend**

```bash
nano /etc/nginx/sites-available/iiap-backend

# Contenido:
server {
    listen 80;
    server_name api.monitoreo-iiap.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Activar:
ln -s /etc/nginx/sites-available/iiap-backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

#### **Paso 5: Configurar SSL con Let's Encrypt**

```bash
certbot --nginx -d api.monitoreo-iiap.com

# Seguir pasos interactivos
# Certificado se renovará automáticamente
```

---

#### **Paso 6: Desplegar Frontend**

```bash
cd /var/www/iiap/sensor_monitoreo/frontend

# Build:
npm install
npm run build

# Configurar Nginx para frontend:
nano /etc/nginx/sites-available/iiap-frontend

# Contenido:
server {
    listen 80;
    server_name monitoreo-iiap.com www.monitoreo-iiap.com;

    root /var/www/iiap/sensor_monitoreo/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Comprimir assets:
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# Activar:
ln -s /etc/nginx/sites-available/iiap-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL:
certbot --nginx -d monitoreo-iiap.com -d www.monitoreo-iiap.com
```

---

## 12. Monitoreo y Mantenimiento

### 12.1 Monitoreo del Backend

#### **PM2 (si usas VPS)**

```bash
# Ver status:
pm2 status

# Ver logs en tiempo real:
pm2 logs iiap-backend

# Monitoreo:
pm2 monit

# Reiniciar:
pm2 restart iiap-backend

# Ver métricas:
pm2 describe iiap-backend
```

---

#### **Railway/Render**

- Dashboard web muestra:
  - CPU usage
  - Memory usage
  - Request rate
  - Logs en tiempo real

---

### 12.2 Monitoreo de la Base de Datos

#### **Supabase**

Dashboard → Database → Reports:
- Queries ejecutadas
- Uso de almacenamiento
- Conexiones activas

---

#### **PostgreSQL (VPS)**

```bash
# Conectar:
sudo -u postgres psql

# Ver conexiones activas:
SELECT count(*) FROM pg_stat_activity;

# Ver tamaño de BD:
SELECT pg_size_pretty(pg_database_size('iiap_db'));

# Ver queries lentas:
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

---

### 12.3 Logs

#### **Backend logs**

```bash
# PM2:
pm2 logs iiap-backend --lines 100

# Railway:
# Ver en dashboard web

# Logs guardados:
tail -f /var/log/iiap/backend.log
```

---

#### **Nginx logs**

```bash
# Access logs:
tail -f /var/log/nginx/access.log

# Error logs:
tail -f /var/log/nginx/error.log

# Filtrar errores 500:
grep "500" /var/log/nginx/access.log
```

---

### 12.4 Métricas de Rendimiento

**Herramientas recomendadas:**

1. **Uptime Monitoring:**
   - UptimeRobot (gratuito): https://uptimerobot.com/
   - Configurar checks cada 5 minutos

2. **Application Monitoring:**
   - Sentry (errores): https://sentry.io/
   - Integrar en backend:
     ```bash
     npm install @sentry/node
     ```

3. **Database Monitoring:**
   - pgAdmin
   - Supabase Dashboard

---

### 12.5 Tareas de Mantenimiento

**Diarias:**
- [ ] Verificar uptime del sistema
- [ ] Revisar logs de errores

**Semanales:**
- [ ] Revisar uso de recursos (CPU, RAM, disco)
- [ ] Verificar backups de BD
- [ ] Actualizar dependencias menores (si hay parches de seguridad)

**Mensuales:**
- [ ] Analizar métricas de uso
- [ ] Limpieza de logs antiguos
- [ ] Actualizar dependencias mayores
- [ ] Revisar y optimizar queries lentas

**Trimestrales:**
- [ ] Actualizar Node.js LTS
- [ ] Auditoría de seguridad (npm audit)
- [ ] Revisar certificados SSL

---

## 13. Solución de Problemas

### 13.1 Backend no Inicia

**Síntoma:**
```
Error: Cannot find module 'express'
```

**Solución:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

**Síntoma:**
```
Error: P1001: Can't reach database server
```

**Solución:**
1. Verificar que PostgreSQL esté corriendo:
   ```bash
   # Linux:
   sudo systemctl status postgresql

   # Windows:
   # Abrir Services y verificar PostgreSQL
   ```
2. Verificar `DATABASE_URL` en `.env`
3. Probar conexión:
   ```bash
   psql -U postgres -d iiap_db
   ```

---

### 13.2 Frontend no Carga

**Síntoma:**
Pantalla blanca en el navegador

**Solución:**
1. Abrir DevTools (F12) → Console
2. Ver errores
3. Verificar que backend esté corriendo
4. Verificar `VITE_API_URL` en `.env`

---

**Síntoma:**
```
Failed to fetch
```

**Solución:**
1. Verificar que backend esté en http://localhost:3000
2. Verificar CORS:
   ```javascript
   // backend/src/server.js debe tener:
   app.use(cors({
     origin: process.env.CORS_ORIGIN
   }));
   ```

---

### 13.3 Migraciones Fallan

**Síntoma:**
```
Migration failed to apply
```

**Solución:**
```bash
# Resetear base de datos (SOLO EN DESARROLLO):
npx prisma migrate reset

# Volver a aplicar:
npx prisma migrate dev
```

---

### 13.4 Autenticación no Funciona

**Síntoma:**
```
401 Unauthorized
```

**Solución:**
1. Verificar que `JWT_SECRET` sea el mismo en backend `.env`
2. Verificar token en localStorage:
   ```javascript
   // En DevTools Console:
   localStorage.getItem('token')
   ```
3. Verificar que token no haya expirado (8 horas por defecto)

---

### 13.5 Mapa no se Muestra

**Síntoma:**
Área gris en lugar del mapa

**Solución:**
1. Verificar conexión a internet
2. Limpiar caché del navegador
3. Verificar que Leaflet CSS esté cargado:
   ```html
   <!-- En index.html: -->
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
   ```

---

## 14. Respaldo y Recuperación

### 14.1 Backup de Base de Datos

#### **Backup Manual**

```bash
# Crear backup:
pg_dump -U postgres iiap_db > backup_$(date +%Y%m%d).sql

# O con compresión:
pg_dump -U postgres iiap_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

---

#### **Backup Automático (cron)**

```bash
# Editar crontab:
crontab -e

# Agregar (backup diario a las 2 AM):
0 2 * * * pg_dump -U postgres iiap_db | gzip > /backups/iiap_$(date +\%Y\%m\%d).sql.gz

# Guardar solo últimos 7 días:
0 3 * * * find /backups/iiap_*.sql.gz -mtime +7 -delete
```

---

### 14.2 Restaurar Backup

```bash
# Desde archivo .sql:
psql -U postgres iiap_db < backup_20251106.sql

# Desde archivo comprimido:
gunzip -c backup_20251106.sql.gz | psql -U postgres iiap_db
```

---

### 14.3 Backup en Supabase

Supabase realiza backups automáticos diarios.

**Restaurar:**
1. Dashboard → Database → Backups
2. Seleccionar fecha
3. Click "Restore"

---

### 14.4 Disaster Recovery Plan

**En caso de pérdida completa del servidor:**

1. **Recuperar código:**
   ```bash
   git clone https://github.com/iiap/sensor_monitoreo.git
   ```

2. **Restaurar base de datos:**
   ```bash
   # Crear BD nueva:
   createdb iiap_db

   # Restaurar desde backup:
   psql iiap_db < ultimo_backup.sql
   ```

3. **Reconfigurar entorno:**
   - Configurar `.env` con nuevas credenciales
   - Instalar dependencias
   - Ejecutar migraciones si es necesario

4. **Redesplegar:**
   - Backend en Railway/Render/VPS
   - Frontend en Vercel
   - Actualizar DNS si cambió IP

**Tiempo estimado de recuperación (RTO):** 2-4 horas

---

## Apéndices

### Apéndice A: Comandos Útiles

```bash
# ==================================
# BACKEND
# ==================================
npm run dev              # Iniciar en modo desarrollo
npm start                # Iniciar en modo producción
npm run migrate          # Ejecutar migraciones
npx prisma studio        # Abrir GUI de base de datos
npx prisma generate      # Regenerar cliente Prisma
npm run seed             # Poblar BD con datos de prueba

# ==================================
# FRONTEND
# ==================================
npm run dev              # Iniciar dev server
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # Verificar código

# ==================================
# BASE DE DATOS
# ==================================
psql -U postgres         # Conectar a PostgreSQL
\l                       # Listar bases de datos
\c iiap_db               # Conectar a iiap_db
\dt                      # Listar tablas
\d sensores              # Describir tabla sensores
\q                       # Salir

# ==================================
# GIT
# ==================================
git status               # Ver estado
git add .                # Agregar cambios
git commit -m "msg"      # Commit
git push origin main     # Push a GitHub
git pull                 # Pull cambios
```

---

### Apéndice B: Estructura de Puertos

| Servicio | Puerto | Uso |
|----------|--------|-----|
| Backend (dev) | 3000 | API REST |
| Frontend (dev) | 5173 | Vite dev server |
| Frontend (preview) | 4173 | Preview build |
| PostgreSQL | 5432 | Base de datos |
| Prisma Studio | 5555 | GUI de BD |

---

### Apéndice C: Checklist de Despliegue

**Antes de deploy a producción:**

- [ ] Variables de entorno configuradas correctamente
- [ ] `JWT_SECRET` es seguro (64+ caracteres)
- [ ] `NODE_ENV=production` en backend
- [ ] Contraseña de admin cambiada (no usar `Admin123!`)
- [ ] CORS configurado con dominio de producción
- [ ] SSL/HTTPS activado
- [ ] Backups automáticos de BD configurados
- [ ] Monitoreo activado (Sentry, UptimeRobot)
- [ ] Tests pasando (npm test)
- [ ] Documentación actualizada
- [ ] DNS configurado correctamente

---

### Apéndice D: Contacto y Soporte

**Equipo de Desarrollo:**
- Email: soporte.monitoreo@iiap.gob.pe
- GitHub Issues: https://github.com/iiap/sensor_monitoreo/issues

**Emergencias (caída del sistema):**
- Teléfono: +51 XXX XXX XXX

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Versión:** 1.0.0
**Fecha de última actualización:** 06/11/2025
**Equipo DevOps:** Equipo IIAP
**Estado:** Producción
