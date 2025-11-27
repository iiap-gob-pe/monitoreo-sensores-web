# 🚀 Guía de Despliegue a Producción

## 📋 Tabla de Contenidos
1. [Cambios Necesarios para Producción](#cambios-necesarios-para-producción)
2. [Backend - API](#backend---api)
3. [Frontend - React](#frontend---react)
4. [Base de Datos PostgreSQL](#base-de-datos-postgresql)
5. [Checklist Pre-Despliegue](#checklist-pre-despliegue)
6. [Opciones de Hosting](#opciones-de-hosting)

---

## 🎯 Cambios Necesarios para Producción

### Resumen Rápido
Solo necesitas editar **2 archivos** para cambiar de desarrollo a producción:

1. **Backend**: `sensor_monitoreo_api/.env`
2. **Frontend**: `environmental-monitoring-web/.env`

**✅ NO necesitas editar** `app.js` - El CORS se configura automáticamente desde el archivo `.env`

---

## 🔧 Backend - API

### Archivo: `sensor_monitoreo_api/.env`

#### Cambios a Realizar:

```env
# 1. Cambiar NODE_ENV a production
NODE_ENV=production

# 2. Comentar DATABASE_URL local y descomentar la de producción
# DATABASE_URL="postgresql://postgres:admin6080@localhost:5432/sensores_bd"
DATABASE_URL="postgresql://usuario_prod:password_seguro@192.168.1.100:5432/sensores_bd"

# 3. Comentar CORS_ORIGIN local y descomentar la de producción
# CORS_ORIGIN=http://localhost:5173
CORS_ORIGIN=https://monitoreo.iiap.org.pe

# 4. (Opcional pero recomendado) Generar nuevo JWT_SECRET para producción
# Ejecuta: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=tu_nuevo_secret_generado_aqui

# 5. Cambiar LOG_LEVEL para reducir logs
LOG_LEVEL=warn
```

### Ejemplo Completo del `.env` para Producción:

```env
# ============================================================================
# CONFIGURACIÓN DE PRODUCCIÓN
# ============================================================================

# ENTORNO Y PUERTO
NODE_ENV=production
PORT=3000

# BASE DE DATOS POSTGRESQL
# ✅ PRODUCCIÓN (usando IP del servidor de base de datos)
DATABASE_URL="postgresql://iiap_user:SecurePass123!@192.168.1.100:5432/sensores_bd"

# CORS - Permitir acceso desde tu dominio
CORS_ORIGIN=https://monitoreo.iiap.org.pe

# JWT (Genera uno nuevo para producción)
JWT_SECRET=nuevo_secret_super_seguro_diferente_al_de_desarrollo
JWT_EXPIRES_IN=24h

# ALERTAS
ALERT_CHECK_INTERVAL=60000

# LOGGING (warn o error para producción)
LOG_LEVEL=warn
```

### Variables de Entorno del Servidor (Alternativa Recomendada)

En lugar de usar archivo `.env` en producción, es más seguro configurar las variables directamente en el servidor:

#### Linux (Ubuntu/Debian):
```bash
# Editar archivo de perfil
sudo nano /etc/environment

# Agregar las variables
NODE_ENV=production
DATABASE_URL="postgresql://..."
CORS_ORIGIN=https://monitoreo.iiap.org.pe
JWT_SECRET=tu_secret_aqui
```

#### PM2 (Process Manager):
```bash
# Crear archivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sensor-api',
    script: './server.js',
    cwd: '/ruta/al/sensor_monitoreo_api',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://...',
      CORS_ORIGIN: 'https://monitoreo.iiap.org.pe',
      JWT_SECRET: 'tu_secret_aqui'
    }
  }]
}

# Iniciar con PM2
pm2 start ecosystem.config.js --env production
```

#### Docker:
```bash
# Pasar variables al contenedor
docker run -d \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e CORS_ORIGIN=https://monitoreo.iiap.org.pe \
  -e JWT_SECRET=tu_secret_aqui \
  -p 3000:3000 \
  sensor-api
```

---

## 🎨 Frontend - React

### Archivo: `environmental-monitoring-web/.env`

#### Cambios a Realizar:

```env
# 1. Comentar VITE_API_URL local y descomentar la de producción
# VITE_API_URL=http://localhost:3000/api
VITE_API_URL=https://api.monitoreo.iiap.org.pe/api

# 2. Cambiar NODE_ENV a production
VITE_NODE_ENV=production
```

### Ejemplo Completo del `.env` para Producción:

```env
# ============================================================================
# CONFIGURACIÓN DE PRODUCCIÓN - FRONTEND
# ============================================================================

# CONFIGURACIÓN DE LA API BACKEND
# 🚀 PRODUCCIÓN
VITE_API_URL=https://api.monitoreo.iiap.org.pe/api

# INFORMACIÓN DE LA APLICACIÓN
VITE_APP_NAME=IIAP Monitoreo Ambiental
VITE_APP_VERSION=1.0.0

# ENTORNO
VITE_NODE_ENV=production
```

### Configuración en Hosting Providers

#### Vercel:
1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega:
   ```
   VITE_API_URL = https://api.monitoreo.iiap.org.pe/api
   VITE_NODE_ENV = production
   ```

#### Netlify:
1. Ve a Site settings → Build & deploy → Environment
2. Agrega las mismas variables

#### GitHub Pages:
No soporta variables de entorno en tiempo de ejecución. Debes hacer build localmente:
```bash
VITE_API_URL=https://api.monitoreo.iiap.org.pe/api npm run build
```

---

## 🗄️ Base de Datos PostgreSQL

### 1. Configurar PostgreSQL en el Servidor

#### Instalar PostgreSQL (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### Crear Usuario y Base de Datos:
```bash
# Conectar como postgres
sudo -u postgres psql

# Crear usuario
CREATE USER iiap_user WITH PASSWORD 'SecurePass123!';

# Crear base de datos
CREATE DATABASE sensores_bd OWNER iiap_user;

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE sensores_bd TO iiap_user;

# Salir
\q
```

#### Configurar Acceso Remoto (si el backend está en otro servidor):
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Cambiar:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Agregar línea (ajusta la IP según tu red):
host    sensores_bd    iiap_user    192.168.1.0/24    md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 2. Migrar Schema con Prisma

```bash
cd sensor_monitoreo_api

# Aplicar migraciones
npx prisma migrate deploy

# Verificar schema
npx prisma db pull
```

### 3. Importar Datos Iniciales (Opcional)

```bash
# Restaurar backup
psql -U iiap_user -d sensores_bd < backup.sql

# O ejecutar script de inicialización
psql -U iiap_user -d sensores_bd -f scripts/init.sql
```

---

## ✅ Checklist Pre-Despliegue

### Backend

- [ ] Cambiar `NODE_ENV=production` en `.env`
- [ ] Actualizar `DATABASE_URL` con IP/dominio del servidor de BD
- [ ] Actualizar `CORS_ORIGIN` con dominio del frontend
- [ ] Generar nuevo `JWT_SECRET` para producción
- [ ] Cambiar `LOG_LEVEL=warn` o `error`
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Probar conexión a base de datos de producción
- [ ] Ejecutar `npm install --production` (omite devDependencies)
- [ ] Ejecutar `npx prisma generate`
- [ ] Ejecutar `npx prisma migrate deploy`

### Frontend

- [ ] Cambiar `VITE_API_URL` a URL de producción
- [ ] Cambiar `VITE_NODE_ENV=production`
- [ ] Ejecutar `npm run build`
- [ ] Probar el build localmente: `npm run preview`
- [ ] Verificar que todas las rutas funcionan
- [ ] Verificar que la autenticación funciona

### Base de Datos

- [ ] PostgreSQL instalado y configurado en servidor
- [ ] Usuario y base de datos creados
- [ ] Firewall configurado para permitir conexiones
- [ ] Schema aplicado con Prisma
- [ ] Usuario admin creado
- [ ] Backup configurado

### Seguridad

- [ ] HTTPS configurado (certificado SSL)
- [ ] Firewall configurado
- [ ] Puerto 3000 (backend) accesible solo desde frontend o API Gateway
- [ ] Puerto 5432 (PostgreSQL) accesible solo desde backend
- [ ] Contraseñas fuertes en todos lados
- [ ] JWT_SECRET diferente al de desarrollo

### Testing

- [ ] Probar login desde el frontend de producción
- [ ] Probar que los sensores pueden enviar datos
- [ ] Probar consulta de datos en dashboard
- [ ] Probar alertas
- [ ] Probar reportes y exportación
- [ ] Verificar logs en el servidor

---

## 🌐 Opciones de Hosting

### Backend (Node.js + PostgreSQL)

#### Opción 1: VPS (Servidor Virtual Privado) - Recomendado para Control Total
**Providers**: DigitalOcean, Linode, AWS EC2, Google Cloud, Azure

**Pros**:
- Control total del servidor
- Mejor para aplicaciones grandes
- Puedes alojar backend y BD en el mismo servidor

**Setup Básico (Ubuntu)**:
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Instalar PostgreSQL
sudo apt install postgresql

# Instalar PM2 (Process Manager)
sudo npm install -g pm2

# Clonar proyecto
git clone https://github.com/tu-usuario/sensor-monitoreo.git
cd sensor-monitoreo/sensor_monitoreo_api

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env

# Iniciar con PM2
pm2 start server.js --name sensor-api
pm2 startup
pm2 save
```

**Configurar Nginx como Reverse Proxy**:
```nginx
server {
    listen 80;
    server_name api.monitoreo.iiap.org.pe;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Opción 2: Heroku
**Pros**: Fácil de usar, PostgreSQL incluido

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create sensor-api-iiap

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_secret
heroku config:set CORS_ORIGIN=https://tu-frontend.com

# Deploy
git push heroku main
```

#### Opción 3: Railway.app
**Pros**: Muy fácil, PostgreSQL incluido, deploy automático desde GitHub

1. Conecta tu repositorio de GitHub
2. Railway detecta Node.js automáticamente
3. Agrega PostgreSQL desde el marketplace
4. Configura variables de entorno en el panel

### Frontend (React/Vite)

#### Opción 1: Vercel - Recomendado para React
**Pros**: Gratis, deploy automático, muy rápido

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd environmental-monitoring-web
vercel

# Configurar dominio personalizado en el panel
```

#### Opción 2: Netlify
**Pros**: Gratis, muy fácil

1. Conecta repositorio de GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configura variables de entorno

#### Opción 3: Mismo VPS que el Backend
```bash
# Build del frontend
npm run build

# Copiar dist/ a Nginx
sudo cp -r dist/* /var/www/html/monitoreo/

# Configurar Nginx
server {
    listen 80;
    server_name monitoreo.iiap.org.pe;
    root /var/www/html/monitoreo;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Local → Staging → Producción

#### 1. Desarrollo Local
```env
# Backend .env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:admin6080@localhost:5432/sensores_bd"
CORS_ORIGIN=http://localhost:5173

# Frontend .env
VITE_API_URL=http://localhost:3000/api
```

#### 2. Staging (Servidor de Pruebas)
```env
# Backend .env
NODE_ENV=staging
DATABASE_URL="postgresql://user:pass@staging-db.com:5432/sensores_bd"
CORS_ORIGIN=https://staging.monitoreo.iiap.org.pe

# Frontend .env
VITE_API_URL=https://api-staging.monitoreo.iiap.org.pe/api
```

#### 3. Producción
```env
# Backend .env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db.com:5432/sensores_bd"
CORS_ORIGIN=https://monitoreo.iiap.org.pe

# Frontend .env
VITE_API_URL=https://api.monitoreo.iiap.org.pe/api
```

---

## 🆘 Troubleshooting

### Error: "CORS policy blocked"
**Solución**: Verifica que `CORS_ORIGIN` en el backend coincide EXACTAMENTE con el dominio del frontend (incluye https://)

### Error: "Unable to connect to database"
**Solución**:
1. Verifica que PostgreSQL está corriendo: `sudo systemctl status postgresql`
2. Verifica las credenciales en `DATABASE_URL`
3. Verifica firewall: `sudo ufw status`

### Error: Frontend no carga datos
**Solución**:
1. Abre DevTools → Network
2. Verifica que las peticiones van a la URL correcta
3. Verifica `VITE_API_URL` en `.env`
4. Recuerda hacer rebuild después de cambiar `.env`

### Error: "JWT malformed"
**Solución**: El `JWT_SECRET` del frontend no coincide con el del backend. Asegúrate de que son idénticos.

---

## 📞 Contacto y Soporte

Para más información, consulta:
- `CODIGO_AUDITORIA_Y_MEJORAS.md` - Auditoría de seguridad
- `GUIA_ESTANDARES.md` - Estándares de código
- `MANUAL_API_APP_MOVIL.md` - API para apps móviles

---

**Última actualización**: 13 de Noviembre, 2025
**Versión**: 1.0.0
