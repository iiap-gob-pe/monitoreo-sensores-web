# 📘 Guía de Estándares de Código - Proyecto IIAP

## 🎯 Propósito
Este documento define los estándares de código para el proyecto de Monitoreo Ambiental del IIAP. Seguir estos estándares asegura código consistente, mantenible y profesional.

---

## 📋 TABLA DE CONTENIDOS
1. [Nomenclatura](#nomenclatura)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Backend - API REST](#backend---api-rest)
4. [Frontend - React](#frontend---react)
5. [Base de Datos](#base-de-datos)
6. [Seguridad](#seguridad)
7. [Git y Commits](#git-y-commits)

---

## 1. NOMENCLATURA

### Variables y Funciones
```javascript
// ✅ Correcto: camelCase
const userName = 'Juan';
const userId = 123;
function calculateTotal() {}
async function fetchUserData() {}
```

```javascript
// ❌ Incorrecto
const user_name = 'Juan';      // snake_case
const UserName = 'Juan';        // PascalCase
```

### Constantes
```javascript
// ✅ Correcto: UPPER_SNAKE_CASE
const API_URL = 'http://localhost:3000';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;
```

### Clases y Componentes React
```javascript
// ✅ Correcto: PascalCase
class UserService {}
class SensorController {}
function DashboardPage() {}
function UserProfile() {}
```

### Archivos
```bash
# ✅ Correcto
sensorController.js          # Controllers
userService.js               # Services
DashboardPage.jsx            # React components
constants.js                 # Config files
```

### Base de Datos
```sql
-- ✅ Correcto: snake_case
CREATE TABLE usuarios (
  id_usuario INT,
  nombre_completo VARCHAR(100),
  created_at TIMESTAMP
);
```

---

## 2. ESTRUCTURA DE ARCHIVOS

### Backend
```
sensor_monitoreo_api/
├── src/
│   ├── config/              # Configuraciones
│   │   ├── database.js      # Singleton de Prisma
│   │   └── constants.js     # Constantes del backend
│   ├── controllers/         # Lógica de negocio
│   │   ├── sensorController.js
│   │   └── usuarioController.js
│   ├── routes/              # Definición de rutas
│   │   ├── sensores.js
│   │   └── usuarios.js
│   ├── middleware/          # Middlewares
│   │   ├── auth.js
│   │   └── validation.js
│   ├── services/            # Servicios reutilizables
│   └── app.js               # Configuración de Express
├── prisma/
│   └── schema.prisma        # Schema de base de datos
├── .env                     # Variables de entorno (NO commitear)
├── .env.example             # Plantilla de variables
└── server.js                # Punto de entrada
```

### Frontend
```
environmental-monitoring-web/
├── src/
│   ├── pages/               # Páginas principales
│   │   ├── Dashboard.jsx
│   │   └── Sensores.jsx
│   ├── components/          # Componentes reutilizables
│   │   ├── dashboard/       # Componentes específicos
│   │   └── shared/          # Componentes compartidos
│   ├── context/             # Context API
│   │   └── AuthContext.jsx
│   ├── services/            # Servicios API
│   │   ├── api.js
│   │   └── usuariosAPI.js
│   ├── config/              # Configuración
│   │   └── constants.js     # Constantes centralizadas
│   └── App.jsx
├── .env                     # Variables de entorno (NO commitear)
└── .env.example             # Plantilla de variables
```

---

## 3. BACKEND - API REST

### Estructura de Controladores

```javascript
// ✅ Correcto
const { prisma } = require('../config/database');

const sensorController = {
  // Obtener todos
  obtenerTodos: async (req, res) => {
    try {
      const sensores = await prisma.sensores.findMany();

      res.status(200).json({
        success: true,
        message: 'Sensores obtenidos exitosamente',
        data: sensores
      });
    } catch (error) {
      console.error('Error al obtener sensores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Crear nuevo
  crear: async (req, res) => {
    try {
      const { id_sensor, nombre_sensor } = req.body;

      // Validar campos requeridos
      if (!id_sensor || !nombre_sensor) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: id_sensor, nombre_sensor'
        });
      }

      const nuevoSensor = await prisma.sensores.create({
        data: req.body
      });

      res.status(201).json({
        success: true,
        message: 'Sensor creado exitosamente',
        data: nuevoSensor
      });
    } catch (error) {
      console.error('Error al crear sensor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear sensor',
        error: error.message
      });
    }
  }
};

module.exports = sensorController;
```

### Respuestas API Estándar

```javascript
// ✅ Éxito
{
  success: true,
  message: "Descripción de la operación",
  data: { /* datos */ }
}

// ✅ Error
{
  success: false,
  message: "Descripción del error para el usuario",
  error: "Detalles técnicos (solo en desarrollo)"
}

// ✅ Éxito con paginación
{
  success: true,
  message: "Datos obtenidos exitosamente",
  data: [ /* items */ ],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

### Rutas con Autenticación

```javascript
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { verificarToken, verificarRol, verificarTokenOpcional } = require('../middleware/auth');

// ✅ Rutas públicas (solo lectura)
router.get('/', sensorController.obtenerTodos);
router.get('/:id', sensorController.obtenerPorId);

// ✅ Rutas protegidas (requiere login)
router.post('/', verificarToken, sensorController.crear);

// ✅ Rutas restringidas (solo admin)
router.delete('/:id', verificarToken, verificarRol('admin'), sensorController.eliminar);

// ✅ Rutas con token opcional
router.get('/estadisticas', verificarTokenOpcional, sensorController.obtenerEstadisticas);

module.exports = router;
```

### Uso del Singleton de Prisma

```javascript
// ✅ Correcto
const { prisma } = require('../config/database');

// Usar en cualquier controlador
const usuarios = await prisma.usuarios.findMany();
```

```javascript
// ❌ Incorrecto - NO crear múltiples instancias
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```

---

## 4. FRONTEND - REACT

### Estructura de Componentes

```javascript
// ✅ Correcto
import { useState, useEffect } from 'react';
import { API_URL } from '../config/constants';

export default function DashboardPage() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/sensores`);
      const data = await response.json();

      if (data.success) {
        setDatos(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* JSX aquí */}
    </div>
  );
}
```

### Uso de Constantes

```javascript
// ✅ Correcto - Importar desde constants.js
import {
  API_URL,
  USER_ROLES,
  THEME_COLORS,
  ERROR_MESSAGES
} from '../config/constants';

// Usar en el código
const endpoint = `${API_URL}/sensores`;
const isAdmin = user.rol === USER_ROLES.ADMIN;
const errorMsg = ERROR_MESSAGES.NETWORK_ERROR;
```

```javascript
// ❌ Incorrecto - Valores hardcodeados
const endpoint = 'http://localhost:3000/api/sensores';
const isAdmin = user.rol === 'admin';
const errorMsg = 'Error de conexión con el servidor';
```

### Hooks Personalizados

```javascript
// ✅ Correcto - hooks/useFetch.js
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

---

## 5. BASE DE DATOS

### Nombres de Tablas y Columnas

```sql
-- ✅ Correcto: snake_case, singular para columnas, plural para tablas
CREATE TABLE sensores (
  id_sensor SERIAL PRIMARY KEY,
  nombre_sensor VARCHAR(100) NOT NULL,
  zona VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lecturas (
  id_lectura SERIAL PRIMARY KEY,
  id_sensor INT REFERENCES sensores(id_sensor),
  lectura_datetime TIMESTAMP NOT NULL,
  temperatura DECIMAL(5,2),
  humedad DECIMAL(5,2)
);
```

### Schema Prisma

```prisma
// ✅ Correcto
model sensores {
  id_sensor         String          @id @db.VarChar(50)
  nombre_sensor     String          @db.VarChar(100)
  zona              String          @db.VarChar(20)
  created_at        DateTime?       @default(now()) @db.Timestamp(6)
  updated_at        DateTime?       @updatedAt @db.Timestamp(6)
  lecturas          lecturas[]

  @@map("sensores")
}

model lecturas {
  id_lectura       Int       @id @default(autoincrement())
  id_sensor        String?   @db.VarChar(50)
  temperatura      Decimal?  @db.Decimal(5, 2)
  sensor           sensores? @relation(fields: [id_sensor], references: [id_sensor], onDelete: Cascade)

  @@map("lecturas")
}
```

---

## 6. SEGURIDAD

### Variables de Entorno

```bash
# ✅ .env (NO commitear)
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET=4f05aebfed4c321e484d2f302c0c273a01b3abea52b694ae...
NODE_ENV=production

# ✅ .env.example (SÍ commitear)
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_bd"
JWT_SECRET=tu_secret_super_seguro_aqui
NODE_ENV=development
```

### Autenticación JWT

```javascript
// ✅ Middleware de autenticación
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: decoded.id_usuario }
    });

    if (!usuario || usuario.estado !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autorizado'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};
```

### Validación de Entrada

```javascript
// ✅ Validación básica en controlador
const crear = async (req, res) => {
  const { id_sensor, nombre_sensor } = req.body;

  // Validar campos requeridos
  if (!id_sensor || !nombre_sensor) {
    return res.status(400).json({
      success: false,
      message: 'Campos requeridos faltantes'
    });
  }

  // Validar formato de email (si aplica)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de email inválido'
    });
  }

  // Continuar con la creación...
};
```

---

## 7. GIT Y COMMITS

### Mensajes de Commit

```bash
# ✅ Formato recomendado
<tipo>: <descripción corta>

<descripción detallada opcional>

# Tipos comunes:
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
refactor: # Refactorización sin cambio de funcionalidad
docs:     # Solo documentación
style:    # Formato, no afecta lógica
test:     # Agregar o modificar tests
chore:    # Tareas de mantenimiento

# ✅ Ejemplos
feat: Agregar endpoint para estadísticas de sensores
fix: Corregir cálculo de temperatura promedio
refactor: Implementar singleton de Prisma en controladores
docs: Actualizar guía de estándares de código
```

### Archivos a Ignorar (.gitignore)

```gitignore
# Node modules
node_modules/
npm-debug.log*

# Variables de entorno
.env
.env.local
.env.production

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/migrations/
```

---

## ✅ CHECKLIST DE REVISIÓN DE CÓDIGO

Antes de hacer commit, verificar:

- [ ] ¿Los nombres de variables siguen la convención (camelCase)?
- [ ] ¿Las constantes están en UPPER_SNAKE_CASE?
- [ ] ¿Se usa el singleton de Prisma en lugar de new PrismaClient()?
- [ ] ¿Las URLs están en variables de entorno/constantes?
- [ ] ¿Las rutas sensibles tienen autenticación?
- [ ] ¿Las respuestas API siguen el formato estándar?
- [ ] ¿Hay manejo de errores con try-catch?
- [ ] ¿Los mensajes de error son descriptivos?
- [ ] ¿No hay código comentado innecesario?
- [ ] ¿No se commitea el archivo .env?

---

## 📚 RECURSOS ADICIONALES

### Documentación del Proyecto
- `CODIGO_AUDITORIA_Y_MEJORAS.md` - Auditoría completa
- `RESUMEN_MEJORAS.md` - Resumen de mejoras
- `GUIA_ESTANDARES.md` - Este documento

### Archivos de Referencia
- `sensor_monitoreo_api/src/config/database.js` - Singleton de Prisma
- `sensor_monitoreo_api/src/middleware/auth.js` - Autenticación
- `sensor_monitoreo_api/src/routes/sensores.js` - Ejemplo de rutas
- `environmental-monitoring-web/src/config/constants.js` - Constantes

---

**Última actualización**: 13 de Noviembre, 2025
**Versión**: 1.0.0
**Mantenido por**: Equipo IIAP
