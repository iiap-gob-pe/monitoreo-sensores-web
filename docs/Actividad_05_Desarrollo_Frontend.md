# Actividad 05: Desarrollo del Frontend Web
## Sistema de Monitoreo Ambiental IIAP

**Fecha de inicio:** 11/10/2025
**Fecha de finalización:** 05/11/2025
**Duración:** 26 días
**Responsable:** Desarrollador Frontend

---

## 1.1 Introducción

El desarrollo del frontend web del Sistema de Monitoreo Ambiental IIAP comprende la creación de una aplicación web moderna, responsiva e intuitiva que permita tanto a usuarios públicos como al administrador interactuar con los datos del sistema de monitoreo ambiental.

---

## 1.2 Objetivos

**Objetivo General:**
Desarrollar una interfaz web responsiva y accesible que permita visualizar datos ambientales en tiempo real y gestionar el sistema de monitoreo.

**Objetivos Específicos:**
1. Implementar dashboard público con visualización de datos en tiempo real
2. Desarrollar panel administrativo completo con autenticación
3. Crear componentes reutilizables con React
4. Integrar mapa interactivo con Leaflet para visualización de sensores
5. Implementar gráficos dinámicos con Chart.js
6. Desarrollar sistema de exportación de reportes (PDF, Excel)
7. Garantizar responsividad en dispositivos móviles y desktop
8. Optimizar rendimiento y experiencia de usuario

---

## 1.3 Alcance

**Incluye:**
- 8 páginas principales del sistema
- Mapa interactivo con Leaflet
- Gráficos dinámicos con Chart.js y Recharts
- Sistema de autenticación con JWT
- Exportación de reportes (PDF, Excel)
- Diseño responsivo (mobile-first)
- Consumo de API REST del backend

**No incluye:**
- Desarrollo del backend (Actividad 04)
- Configuración de servidores
- Integración con hardware ESP32

---

## 1.4 Metodología de Desarrollo

Se utilizó **SCRUM adaptado para 1 desarrollador**, organizado en 4 sprints de 6-7 días cada uno.

**Ceremonias adaptadas:**
- Daily standup personal (10 min diarios)
- Sprint planning (2 horas al inicio de cada sprint)
- Sprint review (1 hora al final de cada sprint)
- Sprint retrospective (1 hora al final de cada sprint)

---

## 1.5 Sprints Ejecutados

### **Sprint 1: Infraestructura y Componentes Base** (11-17/10, 7 días)
- Configuración del proyecto React + Vite
- Instalación de dependencias (React Router, Tailwind CSS, Axios)
- Estructura de carpetas del proyecto
- Componentes base (Layout, Navbar, Sidebar)
- Sistema de rutas con React Router
- Context API para autenticación

### **Sprint 2: Páginas Públicas** (18-24/10, 7 días)
- Dashboard público con KPIs
- Mapa interactivo con Leaflet
- Página de Lecturas con filtros avanzados
- Gráficos con Chart.js
- Responsividad mobile

### **Sprint 3: Panel Administrativo** (25/10-31/10, 7 días)
- Login con autenticación JWT
- Gestión de Sensores (CRUD completo)
- Configuración de Umbrales
- Gestión de Alertas
- Página de Perfil de usuario

### **Sprint 4: Reportes y Optimización** (01-05/11, 5 días)
- Sistema de reportes avanzados
- Exportación a PDF (jsPDF)
- Exportación a Excel (XLSX)
- Optimización de rendimiento
- Testing y corrección de bugs
- Documentación de usuario

---

## 1.6 Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | React | 19.1.1 |
| **Build Tool** | Vite | 7.1.7 |
| **Routing** | React Router DOM | 7.9.1 |
| **Estilos** | Tailwind CSS | 3.4.17 |
| **Componentes UI** | Headless UI | 2.2.8 |
| **Iconos** | Heroicons | 2.2.0 |
| **HTTP Client** | Axios | 1.12.2 |
| **Mapas** | Leaflet + React Leaflet | 1.9.4 / 5.0.0 |
| **Gráficos** | Chart.js + react-chartjs-2 | 4.5.0 / 5.3.0 |
| **Gráficos (alt)** | Recharts | 3.2.1 |
| **Exportación PDF** | jsPDF + jsPDF-AutoTable | 3.0.3 / 5.0.2 |
| **Exportación Excel** | XLSX | 0.18.5 |
| **Utilidades** | date-fns, clsx, jwt-decode | - |

---

## 1.7 Estructura del Proyecto

```
environmental-monitoring-web/
│
├── src/
│   ├── assets/                  # Recursos estáticos
│   ├── components/              # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MapView.jsx
│   │   ├── SensorCard.jsx
│   │   └── ...
│   │
│   ├── pages/                   # Páginas principales
│   │   ├── Dashboard.jsx        # Dashboard público
│   │   ├── Lecturas.jsx         # Lecturas con filtros
│   │   ├── Sensores.jsx         # Gestión de sensores
│   │   ├── Alertas.jsx          # Gestión de alertas
│   │   ├── Reportes.jsx         # Reportes y exportación
│   │   ├── Login.jsx            # Autenticación
│   │   ├── Perfil.jsx           # Perfil de usuario
│   │   └── Configuracion.jsx    # Configuración del sistema
│   │
│   ├── context/                 # Context API
│   │   └── AuthContext.jsx      # Contexto de autenticación
│   │
│   ├── services/                # Servicios de API
│   │   ├── api.js               # Cliente Axios
│   │   ├── authService.js       # Servicios de autenticación
│   │   ├── sensorService.js     # Servicios de sensores
│   │   ├── lecturaService.js    # Servicios de lecturas
│   │   └── ...
│   │
│   ├── hooks/                   # Custom Hooks
│   ├── utils/                   # Funciones utilitarias
│   ├── config/                  # Configuraciones
│   ├── App.jsx                  # Componente principal
│   └── main.jsx                 # Punto de entrada
│
├── public/                      # Archivos públicos
├── index.html                   # HTML principal
├── vite.config.js               # Configuración de Vite
├── tailwind.config.js           # Configuración de Tailwind
└── package.json                 # Dependencias
```

---

## 1.8 Páginas Principales

| # | Página | Acceso | Descripción |
|---|--------|--------|-------------|
| 1 | **Dashboard** | Público | Vista general con KPIs, mapa, últimas lecturas |
| 2 | **Lecturas** | Público | Tabla de lecturas con filtros avanzados y gráficos |
| 3 | **Login** | Público | Autenticación de administrador |
| 4 | **Sensores** | Privado | CRUD completo de sensores con mapa |
| 5 | **Alertas** | Privado | Gestión de alertas y umbrales |
| 6 | **Reportes** | Privado | Generación y exportación de reportes |
| 7 | **Perfil** | Privado | Gestión de perfil de usuario |
| 8 | **Configuración** | Privado | Preferencias del sistema |

---

## 1.9 Características Implementadas

### **Funcionalidades Públicas:**
- ✅ Dashboard con 4 KPIs principales (temperatura, humedad, CO2, total sensores)
- ✅ Mapa interactivo con marcadores de sensores
- ✅ Visualización de últimas lecturas en tiempo real
- ✅ Filtrado de lecturas por fecha, sensor, parámetro
- ✅ Gráficos de tendencias temporales
- ✅ Diseño responsivo mobile-first

### **Funcionalidades Administrativas:**
- ✅ Login seguro con JWT
- ✅ CRUD completo de sensores
- ✅ Configuración de umbrales personalizados
- ✅ Gestión de alertas (resolver, eliminar)
- ✅ Exportación de reportes a PDF
- ✅ Exportación de reportes a Excel
- ✅ Gestión de perfil de usuario
- ✅ Cambio de contraseña
- ✅ Logs de actividad del administrador

### **Características Técnicas:**
- ✅ Autenticación persistente (localStorage + JWT)
- ✅ Protección de rutas privadas
- ✅ Manejo de errores global
- ✅ Loading states en todas las peticiones
- ✅ Optimización de re-renders con React.memo
- ✅ Lazy loading de componentes pesados
- ✅ Code splitting automático con Vite

---

## 1.10 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **User Stories Completadas** | 28/28 (100%) |
| **Componentes Creados** | 35+ |
| **Páginas Implementadas** | 8 |
| **Líneas de Código** | ~8,500 |
| **Dependencias** | 18 (producción) + 11 (desarrollo) |
| **Tiempo de Build** | ~15 segundos |
| **Tamaño del Bundle** | ~450 KB (gzipped) |
| **Lighthouse Score** | 92/100 (Performance) |

---

## 1.11 Entregables

1. **Código fuente completo** del frontend
2. **Aplicación desplegada** (build de producción)
3. **Guía de Usuario** (documento completo con capturas)

---

## Referencias

- **Actividad 03:** Diseño del Panel de Monitoreo Web (Figma)
- **Actividad 04:** Desarrollo del Backend (API REST)
- **Entregable 05:** Guía de Usuario

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Período:** 11/10/2025 - 05/11/2025
**Metodología:** SCRUM para 1 Desarrollador
**Estado:** Producción v1.0.0
