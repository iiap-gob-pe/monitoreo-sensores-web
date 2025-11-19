# Actividad 05: Desarrollo del Frontend Web

**Proyecto:** Sistema de Monitoreo Ambiental - IIAP
**Responsable:** Michel Izquierdo
**Período:** 11/10/2025 - 05/11/2025 (26 días)
**Estado:** Completado

---

## 1.1. Objetivo

Desarrollar e implementar el frontend web del sistema de monitoreo ambiental utilizando React, Vite y Tailwind CSS, garantizando una interfaz responsiva, intuitiva y de alto rendimiento que permita visualizar datos ambientales en tiempo real y gestionar el sistema de manera eficiente.

**Objetivos específicos:**
- Implementar dashboard público con visualización de datos en tiempo real
- Desarrollar panel administrativo completo con autenticación JWT
- Crear 35+ componentes reutilizables con React
- Integrar mapa interactivo con Leaflet para visualización geoespacial de sensores
- Implementar gráficos dinámicos con Chart.js y Recharts
- Desarrollar sistema de exportación de reportes (PDF y Excel)
- Garantizar responsividad 100% (375px - 1920px)
- Optimizar rendimiento (Lighthouse score >90)

---

## 1.2. Justificación

El frontend es la cara visible del sistema de monitoreo ambiental, responsable de:

- **Experiencia de Usuario:** Interfaz intuitiva que permita a investigadores, estudiantes y público general acceder a datos ambientales sin curva de aprendizaje
- **Visualización Efectiva:** Transformar 144,000 lecturas/día en gráficos, mapas y KPIs comprensibles
- **Accesibilidad Universal:** Acceso desde cualquier dispositivo (móvil, tablet, desktop) y navegador, sin instalación de software
- **Gestión Administrativa:** Panel completo para que el IIAP administre sensores, configure alertas y genere reportes
- **Transparencia de Datos:** Apertura de datos ambientales al público, promoviendo investigación y conciencia ambiental

Un frontend deficiente resultaría en datos inaccesibles, frustración de usuarios, bajo uso del sistema y desperdicio de la inversión en hardware IoT y backend. El desarrollo con metodología SCRUM garantiza entregas iterativas con validación continua de usabilidad.

---

## 1.3. Planificación

### Metodología Aplicada: SCRUM para 1 Desarrollador

**Adaptación de SCRUM:**
- **Sprints:** 4 sprints de 1 semana cada uno (último sprint 5 días)
- **Daily Standup:** Auto-reflexión diaria (¿qué hice? ¿qué haré? ¿bloqueos?)
- **Sprint Review:** Auto-evaluación de UI/UX funcional al final de cada sprint
- **Sprint Retrospective:** Identificación de mejoras (rendimiento, accesibilidad)
- **Product Backlog:** Lista priorizada de user stories (28 historias)
- **Sprint Backlog:** User stories seleccionadas para cada sprint

### Cronograma según Imagen (11/10/25 - 05/11/25)

**Sprint 1 (11/10 - 17/10): Infraestructura y Componentes Base**
- Configuración de proyecto React + Vite
- Instalación de dependencias (React Router, Tailwind CSS, Axios, Leaflet, Chart.js)
- Estructura de carpetas (atomic design)
- Componentes base (Layout, Navbar, Sidebar, Footer)
- Sistema de rutas con React Router
- Context API para autenticación
- **Entregable:** Estructura de proyecto, navegación funcional, autenticación base

**Sprint 2 (18/10 - 24/10): Páginas Públicas**
- Dashboard público con 4 KPIs en tiempo real
- Mapa interactivo con Leaflet (marcadores de sensores)
- Página de Lecturas con filtros avanzados (fecha, sensor, zona)
- Gráficos con Chart.js (líneas temporales, barras comparativas)
- Responsividad mobile-first (375px - 767px)
- **Entregable:** Módulo público 100% funcional

**Sprint 3 (25/10 - 31/10): Panel Administrativo**
- Login con autenticación JWT
- Gestión de Sensores (CRUD completo con modal)
- Configuración de Umbrales de alertas
- Gestión de Alertas (listar, resolver, historial)
- Página de Perfil de usuario
- Protección de rutas privadas
- **Entregable:** Módulo administrativo 100% funcional

**Sprint 4 (01/11 - 05/11): Reportes, Exportación y Optimización**
- Sistema de reportes avanzados con filtros
- Exportación a PDF (jsPDF + jsPDF-AutoTable)
- Exportación a Excel (XLSX)
- Optimización de rendimiento (React.memo, lazy loading, code splitting)
- Testing manual exhaustivo
- Corrección de bugs
- Documentación de usuario (Guía de Usuario)
- **Entregable:** Sistema completo, optimizado, documentado

### Recursos Necesarios
- Node.js v22.16.0+, npm v10.0.0+
- Herramientas: Vite CLI, Chrome DevTools, Figma (referencia de diseño)
- Documentación: Manual de API (Actividad 04), Diseño UI/UX (Actividad 03)
- Backend funcionando en http://localhost:3000

---

## 1.4. Metodología

### Framework SCRUM Adaptado (1 Desarrollador)

#### Roles (Auto-asignados)
- **Product Owner:** Michel Izquierdo (priorización de features UI/UX)
- **Scrum Master:** Michel Izquierdo (facilitación del proceso)
- **Developer:** Michel Izquierdo (implementación frontend)

#### Artefactos

**1. Product Backlog (28 User Stories Priorizadas)**

**Extracto de User Stories (primeras 8 de 28 totales):**

| ID | User Story | Prioridad | Sprint |
|----|------------|-----------|--------|
| US-01 | Como usuario público, quiero ver un dashboard con KPIs para tener un resumen rápido | Alta | 2 |
| US-02 | Como usuario público, quiero ver un mapa con sensores para saber su ubicación | Alta | 2 |
| US-03 | Como admin, quiero iniciar sesión para acceder al panel administrativo | Alta | 3 |
| US-04 | Como admin, quiero gestionar sensores (CRUD) para mantener el sistema actualizado | Alta | 3 |
| US-05 | Como usuario público, quiero filtrar lecturas para analizar períodos específicos | Alta | 2 |
| US-06 | Como usuario público, quiero ver gráficos de tendencias para entender evolución de datos | Alta | 2 |
| US-07 | Como admin, quiero configurar umbrales para generar alertas automáticas | Alta | 3 |
| US-08 | Como admin, quiero exportar reportes a PDF para compartir con stakeholders | Media | 4 |

**Nota:** Lista completa de 28 user stories distribuidas en 4 sprints, priorizadas por valor de negocio y dependencias técnicas.

**2. Sprint Backlog (Ejemplo Sprint 2)**
- US-01: Dashboard público con 4 KPIs ✅
- US-02: Mapa interactivo con Leaflet ✅
- US-05: Filtros avanzados de lecturas ✅
- US-06: Gráficos Chart.js ✅
- US-09: Responsividad mobile ✅

**3. Incremento de Producto**
- Al final de cada sprint: features funcionales, testeadas manualmente, integradas en rama `develop`
- Demostración visual (capturas de pantalla o video)

#### Eventos

**Daily Scrum (Auto-reflexión - 5 min/día):**
```
Día: 12/10/2025
- Ayer: Configuré Vite + Tailwind, estructura de carpetas
- Hoy: Crear componente Navbar, implementar React Router
- Bloqueos: Ninguno
```

**Sprint Review (Auto-evaluación - 30 min al final de sprint):**
- Navegación manual del frontend implementado
- Verificación visual de componentes vs diseño Figma
- Validación de responsividad en Chrome DevTools
- Actualización de Product Backlog

**Sprint Retrospective (Mejora continua - 15 min al final de sprint):**
```
Sprint 2 Retrospective:
- ✅ Bien: Mapa funciona perfectamente, gráficos son claros
- ⚠️ Mejorar: Tiempos de carga un poco altos con 1000+ lecturas
- 🎯 Acción: Implementar paginación y lazy loading en Sprint 3
```

---

## 1.5. Diagrama de Actividades

```
┌─────────────────────────────────────────────────────┐
│         INICIO: Desarrollo de Frontend              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  SPRINT 1: Infraestructura y Componentes Base      │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Configurar proyecto React + Vite          │  │
│  │ 2. Instalar dependencias (27 paquetes)       │  │
│  │ 3. Configurar Tailwind CSS                   │  │
│  │ 4. Crear estructura de carpetas              │  │
│  │ 5. Componentes base (Layout, Navbar)         │  │
│  │ 6. Configurar React Router (10 rutas)        │  │
│  │ 7. Crear AuthContext para JWT                │  │
│  └───────────────────────────────────────────────┘  │
│  Sprint Review ✅ | Retrospective ✅                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  SPRINT 2: Páginas Públicas                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Dashboard público con 4 KPI cards         │  │
│  │ 2. Integrar Leaflet + React Leaflet          │  │
│  │ 3. Mapa con marcadores de sensores           │  │
│  │ 4. Página Lecturas con tabla                 │  │
│  │ 5. Filtros avanzados (fecha, sensor, zona)   │  │
│  │ 6. Integrar Chart.js (gráfico de líneas)     │  │
│  │ 7. Responsividad mobile (375px+)             │  │
│  └───────────────────────────────────────────────┘  │
│  Sprint Review ✅ | Retrospective ✅                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  SPRINT 3: Panel Administrativo                    │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Página Login con formulario               │  │
│  │ 2. Integrar autenticación JWT con backend    │  │
│  │ 3. Protección de rutas privadas              │  │
│  │ 4. Gestión de Sensores (tabla + modales)     │  │
│  │ 5. CRUD completo (crear, editar, eliminar)   │  │
│  │ 6. Gestión de Alertas (listar, resolver)     │  │
│  │ 7. Configuración de Umbrales (formulario)    │  │
│  │ 8. Página de Perfil de usuario               │  │
│  └───────────────────────────────────────────────┘  │
│  Sprint Review ✅ | Retrospective ✅                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  SPRINT 4: Reportes, Exportación y Optimización   │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Página de Reportes con filtros            │  │
│  │ 2. Integrar jsPDF + jsPDF-AutoTable          │  │
│  │ 3. Exportación a PDF con gráficos            │  │
│  │ 4. Integrar XLSX para exportar a Excel       │  │
│  │ 5. Optimización: React.memo en componentes   │  │
│  │ 6. Optimización: Lazy loading de páginas     │  │
│  │ 7. Testing manual (32 casos de prueba)       │  │
│  │ 8. Corrección de bugs                        │  │
│  │ 9. Documentación: Guía de Usuario            │  │
│  └───────────────────────────────────────────────┘  │
│  Sprint Review ✅ | Retrospective ✅                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Integración y Deployment                           │
│  - Merge a rama main                                │
│  - Build de producción (npm run build)              │
│  - Despliegue en Vercel                             │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           FIN: Frontend Completo y Documentado      │
└─────────────────────────────────────────────────────┘
```

---

## 1.6. Análisis de Requerimientos

### Stack Tecnológico Implementado

| Componente | Tecnología | Versión | Justificación |
|------------|------------|---------|---------------|
| Framework | React | 19.1.1 | Componentes reutilizables, ecosistema maduro |
| Build Tool | Vite | 7.1.7 | HMR ultra-rápido, build optimizado |
| Routing | React Router DOM | 7.9.1 | SPA routing estándar, protección de rutas |
| Estilos | Tailwind CSS | 3.4.17 | Utility-first, desarrollo rápido, consistencia |
| Componentes UI | Headless UI | 2.2.8 | Componentes accesibles sin estilos |
| Iconos | Heroicons | 2.2.0 | SVG optimizados, integración con Tailwind |
| HTTP Client | Axios | 1.12.2 | Interceptores, manejo de errores, cancelación |
| Mapas | Leaflet + React Leaflet | 1.9.4 / 5.0.0 | Open source, sin costos de API |
| Gráficos | Chart.js + react-chartjs-2 | 4.5.0 / 5.3.0 | Simple, responsivo, interactivo |
| Gráficos (alt) | Recharts | 3.2.1 | React-native, composable |
| Exportación PDF | jsPDF + jsPDF-AutoTable | 3.0.3 / 5.0.2 | Generación PDF en cliente |
| Exportación Excel | XLSX | 0.18.5 | Exportación Excel en cliente |
| Utilidades | date-fns, clsx, jwt-decode | - | Manejo de fechas, clases condicionales, JWT |

### Arquitectura Implementada

**Patrón:** Atomic Design + Context API

**Estructura de carpetas:**
```
frontend/
├── public/                      # Assets estáticos
│   └── iiap-logo.svg
├── src/
│   ├── assets/                  # Imágenes, fuentes
│   ├── components/              # Componentes reutilizables (35+)
│   │   ├── atoms/               # Botones, inputs, badges
│   │   ├── molecules/           # Search bars, cards, form groups
│   │   ├── organisms/           # Navbar, Sidebar, Tablas
│   │   └── Layout.jsx           # Layout principal
│   ├── pages/                   # Páginas (10 rutas)
│   │   ├── Dashboard.jsx        # Público
│   │   ├── Lecturas.jsx         # Público
│   │   ├── Login.jsx            # Público
│   │   ├── Sensores.jsx         # Privado
│   │   ├── Alertas.jsx          # Privado
│   │   ├── Reportes.jsx         # Privado
│   │   ├── Perfil.jsx           # Privado
│   │   ├── Configuracion.jsx    # Privado
│   │   └── NotFound.jsx         # 404
│   ├── context/                 # Context API
│   │   └── AuthContext.jsx      # Autenticación global
│   ├── services/                # Llamadas a API (9 servicios)
│   │   ├── api.js               # Axios configurado
│   │   ├── authService.js
│   │   ├── sensorService.js
│   │   ├── lecturaService.js
│   │   ├── alertaService.js
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── utils/                   # Funciones utilitarias
│   │   ├── formatters.js        # Formateo de datos
│   │   └── validators.js        # Validaciones
│   ├── config/                  # Configuración
│   │   └── constants.js         # Constantes globales
│   ├── App.jsx                  # Componente raíz con rutas
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales (Tailwind)
├── .env                         # Variables de entorno
├── .env.example
├── vite.config.js               # Configuración Vite
├── tailwind.config.js           # Configuración Tailwind
├── postcss.config.js            # PostCSS para Tailwind
└── package.json                 # Dependencias
```

### Páginas Implementadas (10 rutas)

| # | Ruta | Acceso | Componente | Descripción |
|---|------|--------|------------|-------------|
| 1 | `/` | Público | Dashboard.jsx | Dashboard con KPIs, mapa, últimas lecturas |
| 2 | `/lecturas` | Público | Lecturas.jsx | Tabla con filtros, gráficos de tendencias |
| 3 | `/login` | Público | Login.jsx | Autenticación de administrador |
| 4 | `/sensores` | Privado | Sensores.jsx | CRUD de sensores con mapa |
| 5 | `/alertas` | Privado | Alertas.jsx | Gestión de alertas y umbrales |
| 6 | `/reportes` | Privado | Reportes.jsx | Generación y exportación de reportes |
| 7 | `/perfil` | Privado | Perfil.jsx | Gestión de perfil y cambio de contraseña |
| 8 | `/configuracion` | Privado | Configuracion.jsx | Preferencias del sistema |
| 9 | `/logout` | Privado | (redirect) | Cierre de sesión |
| 10 | `*` | Público | NotFound.jsx | Página 404 |

---

## 1.7. Resultados del Análisis

### Métricas de Desarrollo (Metodología SCRUM)

| Métrica | Objetivo | Real | Estado |
|---------|----------|------|--------|
| User Stories completadas | 28 | 28 | ✅ 100% |
| Páginas implementadas | 8 | 10 | ✅ Superado |
| Componentes creados | 30+ | 35+ | ✅ Superado |
| Sprints ejecutados | 4 | 4 | ✅ Cumplido |
| Lighthouse Score (Performance) | >85 | 92/100 | ✅ Superado |
| Tiempo de build | <30s | ~15s | ✅ Superado |
| Bundle size (gzipped) | <500 KB | ~450 KB | ✅ Cumplido |
| Días planificados | 26 | 26 | ✅ Cumplido |

### Velocity por Sprint

| Sprint | User Stories Planeadas | Completadas | Velocity | Nota |
|--------|------------------------|-------------|----------|------|
| Sprint 1 | 6 | 6 | 6 | Infraestructura establecida |
| Sprint 2 | 7 | 7 | 7 | Módulo público funcionando |
| Sprint 3 | 10 | 10 | 10 | Módulo admin completo |
| Sprint 4 | 5 | 5 | 5 | Optimización y docs finalizadas |
| **Total** | **28** | **28** | **Promedio: 7** | ✅ Sin deuda técnica |

---

## 1.8. Resultados del Diseño

### Componentes UI Implementados

**Átomos (elementos básicos):**
- Button (4 variantes: primary, secondary, danger, ghost)
- Input (text, email, password, date, number)
- Select (dropdown)
- Badge (status, severity)
- Label
- Checkbox
- Radio button

**Moléculas (combinaciones simples):**
- SearchBar (input + botón)
- KPICard (icono + título + valor + tendencia)
- SensorCard (información de sensor con acciones)
- FormGroup (label + input + error message)
- DateRangePicker (dos date inputs)

**Organismos (componentes complejos):**
- Navbar (logo + navegación + auth)
- Sidebar (navegación admin)
- DataTable (tabla con paginación, ordenamiento)
- FilterPanel (múltiples filtros agrupados)
- MapView (Leaflet con marcadores y popups)
- ChartComponent (Chart.js wrapper)
- Modal (overlay + contenido + acciones)
- AlertList (lista de alertas con acciones)

### Diseño Responsivo

| Breakpoint | Ancho | Adaptaciones |
|------------|-------|--------------|
| **Mobile** | 375px - 767px | Grid 1 col, menú hamburguesa, inputs full-width |
| **Tablet** | 768px - 1023px | Grid 2 cols, sidebar drawer |
| **Desktop** | 1024px - 1439px | Grid 3-4 cols, sidebar fixed |
| **Large** | 1440px+ | Grid 4 cols, max-width container |

### Accesibilidad

| Criterio WCAG 2.1 | Cumplimiento | Implementación |
|-------------------|--------------|----------------|
| Contraste (1.4.3) | ✅ AA | Contraste mínimo 4.5:1 |
| Teclado (2.1.1) | ✅ AA | Navegación completa por teclado |
| Foco visible (2.4.7) | ✅ AA | Ring azul en elementos enfocados |
| ARIA labels | ✅ | Labels en iconos y formularios |
| Textos alternativos | ✅ | Alt text en imágenes, aria-label en SVG |

---

## 1.9. Resultados de Actividades

### Entregables Generados

1. **Frontend Funcional** ✅
   - 10 páginas operativas
   - 35+ componentes reutilizables
   - Sistema de autenticación JWT
   - Integración completa con backend (32 endpoints)
   - Exportación a PDF y Excel

2. **Guía de Usuario** ✅
   - Manual completo para usuarios públicos
   - Manual completo para administradores
   - Capturas de pantalla de todas las funciones
   - Solución de problemas comunes
   - FAQ (Preguntas frecuentes)

### Pruebas Realizadas

**Testing Manual:**
- ✅ 10 páginas navegadas y testeadas
- ✅ Casos de éxito (datos se muestran correctamente)
- ✅ Casos de error (manejo de errores, mensajes claros)
- ✅ Responsividad (DevTools en 5 breakpoints)
- ✅ Compatibilidad (Chrome, Firefox, Edge, Safari)

**Métricas de Rendimiento (Lighthouse):**
- Performance: 92/100 ✅
- Accessibility: 95/100 ✅
- Best Practices: 100/100 ✅
- SEO: 100/100 ✅

### Bugs Corregidos Durante Desarrollo

| ID | Descripción | Gravedad | Sprint | Estado |
|----|-------------|----------|--------|--------|
| BUG-01 | Mapa no carga en Safari | Media | 2 | ✅ Corregido |
| BUG-02 | Filtros no se aplican correctamente | Alta | 2 | ✅ Corregido |
| BUG-03 | Token expira sin notificación | Media | 3 | ✅ Corregido |
| BUG-04 | PDF no descarga en Firefox | Media | 4 | ✅ Corregido |
| BUG-05 | Gráfico se desborda en mobile | Baja | 2 | ✅ Corregido |

---

## 1.10. Funcionalidades Implementadas

### Módulo Público

1. **Dashboard**
   - 4 KPIs en tiempo real (Temperatura, Humedad, CO2, Total Sensores)
   - Mapa interactivo con marcadores clickeables
   - Tabla de últimas 10 lecturas
   - Auto-refresh cada 30 segundos (opcional)

2. **Lecturas**
   - Tabla paginada (20, 50, 100 registros por página)
   - Filtros: Rango de fechas, Sensor, Zona, Parámetros
   - Gráfico de líneas (tendencias temporales)
   - Gráfico de barras (comparativa entre sensores)
   - Exportación a CSV (para usuarios públicos)

### Módulo Administrativo

3. **Login**
   - Formulario de autenticación
   - Validación de credenciales
   - Persistencia de sesión (localStorage)
   - Redirección automática si ya está autenticado

4. **Gestión de Sensores**
   - Tabla con lista de sensores
   - Crear sensor (modal con formulario)
   - Editar sensor (modal pre-llenado)
   - Eliminar sensor (confirmación)
   - Mapa con ubicaciones de sensores
   - Filtro por zona y estado

5. **Gestión de Alertas**
   - Tabs: Activas | Resueltas | Todas
   - Lista de alertas con severidad (Crítico, Alto, Medio, Bajo)
   - Resolver alerta (botón de acción)
   - Configurar umbrales por sensor (formulario)
   - Historial de alertas resueltas

6. **Reportes**
   - Configuración de reporte (tipo, fechas, filtros)
   - Previsualización del reporte
   - Exportación a PDF (con gráficos)
   - Exportación a Excel (datos tabulados)
   - 4 tipos de reportes: Lecturas, Alertas, Sensores, Estadístico

7. **Perfil**
   - Información personal del usuario
   - Cambiar contraseña (formulario seguro)
   - Historial de actividad (últimas 20 acciones)

8. **Configuración**
   - Preferencias de visualización (idioma, zona horaria, formato de fecha)
   - Preferencias de gráficos (tipo por defecto, animaciones)
   - Notificaciones (email, SMS - UI preparada para futura integración)

---

## 1.11. Optimizaciones Realizadas

### Rendimiento

1. **Code Splitting**
   ```javascript
   // React.lazy para lazy loading de páginas
   const Sensores = lazy(() => import('./pages/Sensores'));
   const Reportes = lazy(() => import('./pages/Reportes'));
   ```

2. **Memoización**
   ```javascript
   // React.memo para evitar re-renders innecesarios
   export default React.memo(SensorCard);
   ```

3. **Optimización de Imágenes**
   - Uso de SVG para iconos (en lugar de PNG)
   - Lazy loading de imágenes con `loading="lazy"`

4. **Paginación**
   - Tablas con paginación (máximo 100 registros por página)
   - Evita cargar miles de lecturas a la vez

### Bundle Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'maps': ['leaflet', 'react-leaflet']
        }
      }
    }
  }
}
```

**Resultado:**
- Vendor chunk: ~180 KB (gzipped)
- Charts chunk: ~110 KB (gzipped)
- Maps chunk: ~85 KB (gzipped)
- App chunk: ~75 KB (gzipped)
- **Total:** ~450 KB (gzipped)

---

## 1.12. Lecciones Aprendidas

### ✅ Qué funcionó bien

1. **Tailwind CSS:** Desarrollo UI ultra-rápido, consistencia automática
2. **React Router:** Protección de rutas sencilla con componentes personalizados
3. **Context API:** Suficiente para gestión de estado de autenticación (no se necesitó Redux)
4. **Leaflet:** Excelente alternativa gratuita a Google Maps
5. **Vite:** Build y HMR extremadamente rápidos, mejor DX que CRA

### ⚠️ Desafíos enfrentados

1. **Chart.js con React:** Configuración inicial compleja, resuelto con wrapper de react-chartjs-2
2. **Exportación PDF:** Gráficos no se incluyen nativamente, resuelto convirtiendo Chart.js a imágenes base64
3. **Safari compatibilidad:** Leaflet tenía problemas en Safari, resuelto actualizando a versión 1.9.4
4. **Manejo de errores global:** Implementar interceptores de Axios para manejar errores 401/403 globalmente

### 🎯 Mejoras para futuras iteraciones

1. **Tests automatizados:** Implementar Jest + React Testing Library
2. **Storybook:** Documentar componentes interactivamente
3. **Dark mode:** Implementar tema oscuro con Tailwind
4. **i18n:** Internacionalización (español + inglés)
5. **PWA:** Progressive Web App para uso offline

---

## Referencias

- **Actividad 03:** Diseño del Panel de Monitoreo Web (Figma)
- **Actividad 04:** Desarrollo del Backend (API REST)
- **Entregable 04:** Manual de Consumo de API
- **Entregable 05:** Guía de Usuario

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Período:** 11/10/2025 - 05/11/2025
**Metodología:** SCRUM para 1 Desarrollador
**Estado:** Completado ✅
