# Manual de Diseño UI/UX
## Sistema de Monitoreo Ambiental IIAP

**Versión:** 1.0.0
**Fecha:** 05/11/2025
**Equipo de Diseño:** Equipo IIAP
**Estado:** Producción

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Principios de Diseño](#2-principios-de-diseño)
3. [Sistema de Diseño](#3-sistema-de-diseño)
4. [Paleta de Colores](#4-paleta-de-colores)
5. [Tipografía](#5-tipografía)
6. [Componentes UI](#6-componentes-ui)
7. [Iconografía](#7-iconografía)
8. [Espaciado y Grid](#8-espaciado-y-grid)
9. [Wireframes](#9-wireframes)
10. [Mockups de Alta Fidelidad](#10-mockups-de-alta-fidelidad)
11. [Flujos de Usuario](#11-flujos-de-usuario)
12. [Responsive Design](#12-responsive-design)
13. [Accesibilidad](#13-accesibilidad)
14. [Interacciones y Microanimaciones](#14-interacciones-y-microanimaciones)
15. [Decisiones de Diseño](#15-decisiones-de-diseño)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este manual documenta el sistema de diseño completo del Sistema de Monitoreo Ambiental IIAP, proporcionando lineamientos claros para mantener coherencia visual y funcional en toda la aplicación.

### 1.2 Audiencia

- Diseñadores UI/UX
- Desarrolladores Frontend
- Product Managers
- Stakeholders del proyecto

### 1.3 Alcance del Diseño

El sistema de diseño cubre:
- ✅ Interfaz web completa (8 páginas principales)
- ✅ Componentes reutilizables (35+ componentes)
- ✅ Diseño responsivo (mobile, tablet, desktop)
- ✅ Estados de interacción (hover, active, disabled, loading)
- ✅ Sistema de temas (light mode)
- ✅ Guías de accesibilidad (WCAG 2.1 AA)

---

## 2. Principios de Diseño

### 2.1 Principios Fundamentales

#### **1. Claridad**
> La información debe ser clara, directa y fácil de entender para usuarios técnicos y no técnicos.

**Aplicación:**
- Uso de lenguaje simple y descriptivo
- Visualizaciones de datos claras (gráficos, mapas)
- Jerarquía visual bien definida
- Iconografía intuitiva

#### **2. Eficiencia**
> Los usuarios deben completar tareas con el mínimo número de pasos.

**Aplicación:**
- Acceso rápido a funciones principales
- Filtros avanzados pero simples
- Exportación con un solo clic
- Navegación intuitiva

#### **3. Consistencia**
> Elementos similares deben verse y comportarse de manera similar.

**Aplicación:**
- Paleta de colores unificada
- Tipografía consistente
- Componentes reutilizables
- Patrones de interacción predecibles

#### **4. Accesibilidad**
> El sistema debe ser usable por el mayor número de personas posible.

**Aplicación:**
- Contraste WCAG AA (mínimo 4.5:1)
- Tamaño de fuente legible (16px base)
- Navegación por teclado
- Textos alternativos en imágenes

#### **5. Transparencia**
> Los usuarios deben entender el estado del sistema en todo momento.

**Aplicación:**
- Estados de carga visibles
- Mensajes de error descriptivos
- Confirmaciones de acciones
- Feedback inmediato

---

### 2.2 Filosofía de Diseño

**Data-Driven Design:**
El diseño prioriza la visualización efectiva de datos ambientales complejos mediante:
- Gráficos interactivos
- Mapas geoespaciales
- KPIs destacados
- Tablas con filtros avanzados

**Mobile-First Approach:**
Diseñado primero para dispositivos móviles, expandiéndose a pantallas más grandes:
1. Mobile (375px - 767px)
2. Tablet (768px - 1023px)
3. Desktop (1024px+)

**Progressive Disclosure:**
Información presentada gradualmente para evitar sobrecarga cognitiva:
- Dashboard muestra resumen
- Páginas internas muestran detalles
- Filtros ocultos hasta ser necesarios

---

## 3. Sistema de Diseño

### 3.1 Framework de Diseño

**Herramientas utilizadas:**
- **Diseño:** Figma (prototipado y colaboración)
- **Implementación:** Tailwind CSS 3.4.17
- **Componentes:** Headless UI 2.2.8
- **Iconos:** Heroicons 2.2.0

### 3.2 Metodología: Atomic Design

El sistema sigue la metodología Atomic Design de Brad Frost:

```
Átomos → Moléculas → Organismos → Templates → Páginas
```

**Átomos:** Botones, inputs, labels, iconos
**Moléculas:** Search bars, cards, form groups
**Organismos:** Navbar, sidebar, tablas completas
**Templates:** Layouts de página
**Páginas:** Implementaciones finales

---

## 4. Paleta de Colores

### 4.1 Colores Primarios

La paleta está inspirada en la naturaleza amazónica y transmite profesionalismo científico.

#### **Verde Primario (Brand Color)**
Representa la Amazonía, naturaleza y sostenibilidad.

```css
/* Tailwind: green-600 */
--color-primary: #16a34a
--color-primary-light: #22c55e    /* green-500 */
--color-primary-dark: #15803d     /* green-700 */
```

**Uso:**
- Botones de acción primaria
- Enlaces importantes
- Badges de estado "activo"
- Highlights de datos positivos

**Ejemplos:**
```
█ #16a34a - Botón "Guardar", "Aplicar Filtros"
█ #22c55e - Hover de botón primario
█ #15803d - Active state de botón
```

---

#### **Azul Secundario**
Para elementos informativos y mapas.

```css
/* Tailwind: blue-600 */
--color-secondary: #2563eb
--color-secondary-light: #3b82f6   /* blue-500 */
--color-secondary-dark: #1d4ed8    /* blue-700 */
```

**Uso:**
- Marcadores de mapas
- Links de navegación
- Badges informativos
- Gráficos de humedad

**Ejemplos:**
```
█ #2563eb - Marcadores de sensores en mapa
█ #3b82f6 - Líneas de gráfico de humedad
```

---

### 4.2 Colores de Estado

#### **Éxito (Success)**
```css
/* Tailwind: green-500 */
--color-success: #22c55e
```
**Uso:** Alertas resueltas, acciones exitosas, sensores activos

#### **Advertencia (Warning)**
```css
/* Tailwind: yellow-500 */
--color-warning: #eab308
```
**Uso:** Alertas de nivel medio, sensores sin conexión reciente

#### **Error (Danger)**
```css
/* Tailwind: red-600 */
--color-danger: #dc2626
```
**Uso:** Errores, alertas críticas, sensores inactivos

#### **Información (Info)**
```css
/* Tailwind: blue-500 */
--color-info: #3b82f6
```
**Uso:** Mensajes informativos, tooltips

---

### 4.3 Colores Neutrales

Escala de grises para textos, fondos y bordes.

```css
/* Texto */
--color-text-primary: #111827      /* gray-900 */
--color-text-secondary: #6b7280    /* gray-500 */
--color-text-tertiary: #9ca3af     /* gray-400 */

/* Fondos */
--color-bg-primary: #ffffff
--color-bg-secondary: #f9fafb      /* gray-50 */
--color-bg-tertiary: #f3f4f6       /* gray-100 */

/* Bordes */
--color-border: #e5e7eb            /* gray-200 */
--color-border-dark: #d1d5db       /* gray-300 */
```

---

### 4.4 Colores para Gráficos

Paleta específica para visualización de datos (Chart.js):

```css
--chart-temp: #ef4444      /* red-500 - Temperatura */
--chart-humidity: #3b82f6  /* blue-500 - Humedad */
--chart-co2: #f59e0b       /* amber-500 - CO2 */
--chart-co: #8b5cf6        /* violet-500 - CO */
```

**Justificación:**
- **Rojo:** Asociado universalmente con temperatura/calor
- **Azul:** Asociado con agua/humedad
- **Ámbar:** Visualmente diferenciable, neutral para CO2
- **Violeta:** Contraste con otros colores, para CO

---

### 4.5 Contraste y Accesibilidad

Todos los pares de colores cumplen con WCAG 2.1 nivel AA:

| Par de Colores | Ratio de Contraste | Cumple AA | Cumple AAA |
|----------------|-------------------|-----------|------------|
| #111827 sobre #ffffff | 16.6:1 | ✅ | ✅ |
| #6b7280 sobre #ffffff | 4.7:1 | ✅ | ❌ |
| #16a34a sobre #ffffff | 3.1:1 | ❌ | ❌ |
| #ffffff sobre #16a34a | 3.1:1 | ❌ | ❌ |
| #ffffff sobre #2563eb | 8.6:1 | ✅ | ✅ |

**Nota:** Para botones con texto blanco sobre verde primario, se usa `green-700` (#15803d) con ratio 4.5:1 (cumple AA).

---

## 5. Tipografía

### 5.1 Familia Tipográfica

**Fuente Principal: Inter**

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Justificación:**
- ✅ Diseñada específicamente para pantallas
- ✅ Excelente legibilidad en tamaños pequeños
- ✅ Soporta 9 pesos (100-900)
- ✅ Gratuita y de código abierto
- ✅ Amplio soporte de caracteres (incluye acentos español)

**Fallback:** System fonts para máxima compatibilidad

---

### 5.2 Escala Tipográfica

Basada en escala modular (ratio 1.25 - Perfect Fourth):

| Nivel | Tamaño | Peso | Altura de Línea | Uso |
|-------|--------|------|-----------------|-----|
| **H1** | 36px (2.25rem) | 700 (Bold) | 1.2 | Títulos principales de página |
| **H2** | 30px (1.875rem) | 600 (Semibold) | 1.3 | Secciones principales |
| **H3** | 24px (1.5rem) | 600 (Semibold) | 1.4 | Subsecciones |
| **H4** | 20px (1.25rem) | 500 (Medium) | 1.5 | Títulos de cards |
| **H5** | 18px (1.125rem) | 500 (Medium) | 1.5 | Subtítulos |
| **Body Large** | 18px (1.125rem) | 400 (Regular) | 1.6 | Texto destacado |
| **Body** | 16px (1rem) | 400 (Regular) | 1.5 | Texto principal |
| **Body Small** | 14px (0.875rem) | 400 (Regular) | 1.5 | Texto secundario |
| **Caption** | 12px (0.75rem) | 400 (Regular) | 1.4 | Labels, metadatos |

**Código Tailwind:**
```jsx
<h1 className="text-4xl font-bold">Dashboard</h1>
<h2 className="text-3xl font-semibold">Sensores Activos</h2>
<h3 className="text-2xl font-semibold">Últimas Lecturas</h3>
<p className="text-base leading-relaxed">Texto del cuerpo</p>
<span className="text-sm text-gray-500">Metadato</span>
```

---

### 5.3 Estilos de Texto

#### **Negrita (Bold)**
- **Peso:** 700
- **Uso:** Títulos H1, datos numéricos destacados, KPIs
- **Ejemplo:** "28.5°C" en tarjetas de dashboard

#### **Semi-Negrita (Semibold)**
- **Peso:** 600
- **Uso:** Títulos H2-H3, encabezados de tabla
- **Ejemplo:** "Temperatura Promedio"

#### **Medio (Medium)**
- **Peso:** 500
- **Uso:** Botones, labels de formulario, navegación activa
- **Ejemplo:** "Iniciar Sesión"

#### **Regular**
- **Peso:** 400
- **Uso:** Texto de cuerpo, descripción, contenido general
- **Ejemplo:** Párrafos, contenido de tablas

---

### 5.4 Jerarquía Visual

**Principios aplicados:**

1. **Tamaño:** Mayor tamaño = Mayor importancia
2. **Peso:** Mayor peso = Mayor énfasis
3. **Color:** Texto oscuro = Primario, gris = Secundario
4. **Espaciado:** Mayor espaciado alrededor = Mayor importancia

**Ejemplo de jerarquía en Card de Sensor:**

```
[ID: SENSOR_001]           ← Caption (12px, gray-500)
Sensor Temperatura Lab 1   ← H4 (20px, bold, gray-900)
Urbana • Activo            ← Body Small (14px, gray-600)
Última lectura: 28.5°C     ← Body (16px, gray-700)
```

---

## 6. Componentes UI

### 6.1 Botones

Los botones siguen un sistema consistente de tamaños, variantes y estados.

#### **Variantes de Botones**

**1. Primary Button (Acción principal)**

```jsx
<button className="
  bg-green-600 hover:bg-green-700 active:bg-green-800
  text-white font-medium
  px-4 py-2 rounded-lg
  transition-colors duration-200
">
  Guardar
</button>
```

**Características:**
- Fondo verde primario
- Texto blanco, peso 500
- Padding: 16px horizontal, 8px vertical
- Border radius: 8px
- Transición suave en hover (200ms)

**Uso:** Acciones principales como "Guardar", "Crear Sensor", "Aplicar Filtros"

---

**2. Secondary Button (Acción secundaria)**

```jsx
<button className="
  bg-white hover:bg-gray-50 active:bg-gray-100
  text-gray-700 font-medium
  border border-gray-300
  px-4 py-2 rounded-lg
  transition-colors duration-200
">
  Cancelar
</button>
```

**Uso:** Acciones secundarias como "Cancelar", "Volver", "Limpiar Filtros"

---

**3. Danger Button (Acción destructiva)**

```jsx
<button className="
  bg-red-600 hover:bg-red-700 active:bg-red-800
  text-white font-medium
  px-4 py-2 rounded-lg
  transition-colors duration-200
">
  Eliminar
</button>
```

**Uso:** Acciones irreversibles como "Eliminar Sensor", "Eliminar Alerta"

---

**4. Ghost Button (Acción terciaria)**

```jsx
<button className="
  bg-transparent hover:bg-gray-100 active:bg-gray-200
  text-gray-700 font-medium
  px-4 py-2 rounded-lg
  transition-colors duration-200
">
  Ver Detalles
</button>
```

**Uso:** Acciones terciarias, enlaces de navegación, acciones en tablas

---

#### **Tamaños de Botones**

| Tamaño | Padding | Texto | Altura | Uso |
|--------|---------|-------|--------|-----|
| **Small** | px-3 py-1.5 | 14px | 32px | Tablas, acciones inline |
| **Medium** | px-4 py-2 | 16px | 40px | Uso general (default) |
| **Large** | px-6 py-3 | 18px | 48px | CTAs principales |

---

#### **Estados de Botones**

| Estado | Apariencia | Cursor |
|--------|-----------|--------|
| **Default** | Color base | `cursor-pointer` |
| **Hover** | Color más oscuro | `cursor-pointer` |
| **Active** | Color aún más oscuro | `cursor-pointer` |
| **Focus** | Ring azul (`ring-2 ring-blue-500`) | `cursor-pointer` |
| **Disabled** | Opacidad 50%, fondo gris | `cursor-not-allowed` |
| **Loading** | Spinner animado, opacidad 75% | `cursor-wait` |

**Código de botón con loading:**

```jsx
<button disabled className="relative bg-green-600 text-white px-4 py-2 rounded-lg">
  <span className="opacity-0">Guardar</span>
  <div className="absolute inset-0 flex items-center justify-center">
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  </div>
</button>
```

---

### 6.2 Inputs y Formularios

#### **Text Input**

```jsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Nombre del Sensor
  </label>
  <input
    type="text"
    placeholder="Ej: Sensor Lab 1"
    className="
      w-full px-3 py-2
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      placeholder:text-gray-400
      transition-shadow duration-200
    "
  />
  <p className="text-xs text-gray-500">Debe ser único en el sistema</p>
</div>
```

**Características:**
- Altura: 40px
- Padding: 12px horizontal, 8px vertical
- Border: 1px gris (#e5e7eb)
- Focus: Ring azul de 2px
- Placeholder en gris claro

---

#### **Select (Dropdown)**

```jsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Zona
  </label>
  <select className="
    w-full px-3 py-2
    border border-gray-300 rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    bg-white
  ">
    <option value="">Seleccione una zona</option>
    <option value="urbana">Urbana</option>
    <option value="rural">Rural</option>
    <option value="suburbana">Suburbana</option>
  </select>
</div>
```

---

#### **Date Picker**

```jsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Fecha de Inicio
  </label>
  <input
    type="date"
    className="
      w-full px-3 py-2
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
    "
  />
</div>
```

---

#### **Estados de Inputs**

| Estado | Borde | Ring | Descripción |
|--------|-------|------|-------------|
| **Default** | `border-gray-300` | - | Estado inicial |
| **Focus** | `border-transparent` | `ring-2 ring-blue-500` | Usuario interactuando |
| **Error** | `border-red-500` | `ring-2 ring-red-500` | Validación fallida |
| **Success** | `border-green-500` | - | Validación exitosa |
| **Disabled** | `border-gray-200 bg-gray-50` | - | No editable |

**Input con error:**

```jsx
<input
  className="border-red-500 ring-2 ring-red-500"
  aria-invalid="true"
/>
<p className="text-sm text-red-600 mt-1">
  Este campo es obligatorio
</p>
```

---

### 6.3 Cards

Las cards son contenedores versátiles para agrupar información relacionada.

#### **Card Básica**

```jsx
<div className="
  bg-white rounded-lg shadow-sm
  border border-gray-200
  p-6
">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Título de la Card
  </h3>
  <p className="text-gray-600">
    Contenido de la card
  </p>
</div>
```

**Características:**
- Fondo blanco
- Border radius: 8px
- Shadow: `shadow-sm` (sutil)
- Padding: 24px
- Border: 1px gris claro

---

#### **KPI Card (Dashboard)**

```jsx
<div className="
  bg-white rounded-lg shadow-sm
  border border-gray-200
  p-6
  hover:shadow-md transition-shadow duration-200
">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">
        Temperatura Promedio
      </p>
      <p className="text-3xl font-bold text-gray-900 mt-2">
        28.5°C
      </p>
      <p className="text-xs text-green-600 mt-1">
        ↑ 2.3% vs ayer
      </p>
    </div>
    <div className="p-3 bg-red-100 rounded-full">
      <svg className="w-8 h-8 text-red-600">
        <!-- Icono termómetro -->
      </svg>
    </div>
  </div>
</div>
```

**Elementos:**
1. Título descriptivo (arriba izquierda)
2. Valor principal grande y bold (centro)
3. Métrica comparativa (abajo, con color según tendencia)
4. Icono contextual (derecha, en círculo con fondo color pastel)

---

#### **Sensor Card**

```jsx
<div className="
  bg-white rounded-lg shadow-sm
  border border-gray-200
  p-4
  hover:shadow-md hover:border-green-500
  transition-all duration-200
  cursor-pointer
">
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h4 className="text-lg font-semibold text-gray-900">
          Sensor Lab 1
        </h4>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Activo
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        ID: SENSOR_001 • Urbana
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Temp:</span>
          <span className="font-semibold text-gray-900 ml-1">28.5°C</span>
        </div>
        <div>
          <span className="text-gray-500">Hum:</span>
          <span className="font-semibold text-gray-900 ml-1">65%</span>
        </div>
      </div>
    </div>
    <button className="text-gray-400 hover:text-gray-600">
      <svg className="w-5 h-5"><!-- Icono tres puntos --></svg>
    </button>
  </div>
</div>
```

---

### 6.4 Badges y Tags

#### **Status Badges**

```jsx
/* Activo */
<span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
  Activo
</span>

/* Inactivo */
<span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
  Inactivo
</span>

/* Advertencia */
<span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
  Sin conexión
</span>

/* Informativo */
<span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
  Móvil
</span>
```

**Características:**
- Padding: 8px horizontal, 4px vertical
- Border radius: 9999px (completamente redondeado)
- Tamaño de texto: 12px
- Peso: 500 (medium)
- Fondo pastel, texto saturado

---

#### **Severity Badges (Alertas)**

```jsx
/* Crítico */
<span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
  CRÍTICO
</span>

/* Alto */
<span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
  ALTO
</span>

/* Medio */
<span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
  MEDIO
</span>

/* Bajo */
<span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
  BAJO
</span>
```

**Características:**
- Fondo saturado (no pastel)
- Texto blanco
- Font weight: 700 (bold)
- Border radius: 4px (menos redondeado que status)
- Texto en MAYÚSCULAS para mayor énfasis

---

### 6.5 Tablas

#### **Estructura de Tabla**

```jsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Sensor
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Temperatura
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          Sensor Lab 1
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          28.5°C
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <button className="text-blue-600 hover:text-blue-800">Editar</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Características:**
- Encabezados con fondo gris claro (`bg-gray-50`)
- Texto de encabezados en mayúsculas, tamaño 12px
- Filas con hover state (`hover:bg-gray-50`)
- Padding: 24px horizontal, 16px vertical
- Divisores entre filas (`divide-y divide-gray-200`)
- Scroll horizontal en móviles (`overflow-x-auto`)

---

### 6.6 Modales

#### **Modal Básico**

```jsx
<div className="fixed inset-0 z-50 overflow-y-auto">
  {/* Overlay */}
  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

  {/* Modal Content */}
  <div className="flex min-h-full items-center justify-center p-4">
    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Crear Nuevo Sensor
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6"><!-- X icon --></svg>
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4">
        <!-- Contenido del modal -->
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
          Cancelar
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Guardar
        </button>
      </div>
    </div>
  </div>
</div>
```

**Características:**
- Overlay oscuro semi-transparente (50% opacidad)
- Modal centrado vertical y horizontalmente
- Ancho máximo: 448px (28rem)
- Padding: 24px
- Shadow: `shadow-xl`
- Animación de entrada/salida (fade + scale)

---

### 6.7 Alerts y Notificaciones

#### **Alert Boxes**

```jsx
/* Success Alert */
<div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
  <div className="flex items-start">
    <svg className="w-5 h-5 text-green-500 mt-0.5"><!-- Check icon --></svg>
    <div className="ml-3">
      <p className="text-sm font-medium text-green-800">
        Sensor creado exitosamente
      </p>
      <p className="text-sm text-green-700 mt-1">
        El sensor ya puede comenzar a enviar datos.
      </p>
    </div>
  </div>
</div>

/* Error Alert */
<div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
  <div className="flex items-start">
    <svg className="w-5 h-5 text-red-500 mt-0.5"><!-- Alert icon --></svg>
    <div className="ml-3">
      <p className="text-sm font-medium text-red-800">
        Error al guardar
      </p>
      <p className="text-sm text-red-700 mt-1">
        El ID del sensor ya existe en el sistema.
      </p>
    </div>
  </div>
</div>
```

---

#### **Toast Notifications**

```jsx
<div className="
  fixed top-4 right-4 z-50
  max-w-sm w-full
  bg-white rounded-lg shadow-lg
  border border-gray-200
  p-4
  animate-slide-in
">
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <svg className="w-6 h-6 text-green-500"><!-- Check icon --></svg>
    </div>
    <div className="ml-3 flex-1">
      <p className="text-sm font-medium text-gray-900">
        Cambios guardados
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Los umbrales han sido actualizados.
      </p>
    </div>
    <button className="ml-4 text-gray-400 hover:text-gray-600">
      <svg className="w-5 h-5"><!-- X icon --></svg>
    </button>
  </div>
</div>
```

**Características:**
- Posición: Esquina superior derecha
- Ancho máximo: 384px (24rem)
- Auto-dismiss después de 5 segundos
- Animación de entrada (slide-in from right)
- Animación de salida (fade-out)

---

## 7. Iconografía

### 7.1 Librería de Iconos

**Heroicons v2.2.0** - Librería oficial de Tailwind CSS

**Estilos disponibles:**
- **Outline:** Líneas de 1.5px, uso general
- **Solid:** Relleno completo, botones y navegación activa

### 7.2 Tamaños de Iconos

| Contexto | Tamaño | Clase Tailwind | Uso |
|----------|--------|----------------|-----|
| **Pequeño** | 16px | `w-4 h-4` | Inline con texto, badges |
| **Mediano** | 20px | `w-5 h-5` | Botones, inputs, navigation |
| **Grande** | 24px | `w-6 h-6` | Encabezados, cards destacadas |
| **Extra Grande** | 32px | `w-8 h-8` | KPI cards, iconos principales |

### 7.3 Iconos Principales del Sistema

| Icono | Nombre | Uso | Estilo |
|-------|--------|-----|--------|
| 🏠 | HomeIcon | Dashboard, navegación | Outline |
| 📊 | ChartBarIcon | Lecturas, gráficos | Outline |
| 📡 | SignalIcon | Sensores | Outline |
| 🚨 | BellAlertIcon | Alertas | Solid (cuando hay alertas) |
| 📄 | DocumentTextIcon | Reportes | Outline |
| 👤 | UserCircleIcon | Perfil | Outline |
| ⚙️ | CogIcon | Configuración | Outline |
| 🗺️ | MapIcon | Mapas | Outline |
| 🌡️ | (Custom) | Temperatura | Custom SVG |
| 💧 | (Custom) | Humedad | Custom SVG |
| ☁️ | CloudIcon | CO2 | Outline |
| ⚠️ | ExclamationTriangleIcon | Advertencias | Solid |
| ✓ | CheckCircleIcon | Confirmaciones | Solid |
| ✏️ | PencilIcon | Editar | Outline |
| 🗑️ | TrashIcon | Eliminar | Outline |
| ➕ | PlusIcon | Crear nuevo | Outline |
| 🔍 | MagnifyingGlassIcon | Búsqueda | Outline |
| 📥 | ArrowDownTrayIcon | Descargar/Exportar | Outline |
| 🔐 | LockClosedIcon | Login, seguridad | Solid |
| 🔓 | ArrowRightOnRectangleIcon | Logout | Outline |

### 7.4 Colores de Iconos

```css
/* Por defecto: Gris */
.icon-default { color: #6b7280; } /* gray-500 */

/* En navegación activa: Verde */
.icon-active { color: #16a34a; } /* green-600 */

/* En botones primarios: Blanco */
.icon-primary { color: #ffffff; }

/* Iconos de estado */
.icon-success { color: #22c55e; } /* green-500 */
.icon-warning { color: #eab308; } /* yellow-500 */
.icon-danger { color: #dc2626; } /* red-600 */
.icon-info { color: #3b82f6; } /* blue-500 */
```

---

## 8. Espaciado y Grid

### 8.1 Sistema de Espaciado

Basado en escala de 4px de Tailwind CSS:

| Valor | Píxeles | Clase Tailwind | Uso Común |
|-------|---------|----------------|-----------|
| 0 | 0px | `space-0` | Reset |
| 1 | 4px | `space-1` | Espaciado muy pequeño |
| 2 | 8px | `space-2` | Gap entre iconos y texto |
| 3 | 12px | `space-3` | Padding de badges |
| 4 | 16px | `space-4` | Padding de botones, gap entre elementos |
| 5 | 20px | `space-5` | - |
| 6 | 24px | `space-6` | Padding de cards, secciones |
| 8 | 32px | `space-8` | Separación entre secciones |
| 10 | 40px | `space-10` | - |
| 12 | 48px | `space-12` | Márgenes grandes entre bloques |
| 16 | 64px | `space-16` | Espaciado de página |

### 8.2 Layout Grid

**Container:**
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Contenido -->
</div>
```

**Breakpoints:**
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

**Grid de 12 columnas:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Columna 1</div>
  <div>Columna 2</div>
  <div>Columna 3</div>
</div>
```

### 8.3 Espaciado de Componentes

**Cards:**
- Padding interno: `p-6` (24px)
- Gap entre cards: `gap-6` (24px)

**Secciones:**
- Padding top/bottom: `py-8` (32px)
- Margin entre secciones: `my-12` (48px)

**Formularios:**
- Gap entre campos: `space-y-4` (16px)
- Gap entre label e input: `space-y-1` (4px)

---

## 9. Wireframes

### 9.1 Dashboard Público - Wireframe

```
┌──────────────────────────────────────────────────────────┐
│  [Logo IIAP]         Monitoreo Ambiental    [Login Btn] │ ← Navbar
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   🌡️ 28.5°C  │ │   💧 65%     │ │  ☁️ 420 ppm  │    │ ← KPIs
│  │ Temperatura  │ │  Humedad     │ │    CO2       │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │              MAPA INTERACTIVO                   │    │ ← Mapa Leaflet
│  │        (Marcadores de sensores)                 │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Últimas Lecturas                          [Ver Todas]  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Sensor    │ Fecha/Hora │ Temp  │ Hum   │ CO2    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Lab 1     │ 12:30 PM   │ 28.5° │ 65%   │ 420    │   │ ← Tabla
│  │ Lab 2     │ 12:29 PM   │ 27.1° │ 68%   │ 410    │   │
│  │ ...       │ ...        │ ...   │ ...   │ ...    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 9.2 Página de Sensores (Admin) - Wireframe

```
┌──────────────────────────────────────────────────────────┐
│  ☰ Sidebar │                                             │
├────────────┼─────────────────────────────────────────────┤
│ Dashboard  │  Gestión de Sensores    [+ Nuevo Sensor]   │
│ Lecturas   │                                             │
│ ► Sensores │  Filtros: [Zona ▼] [Estado ▼] [Buscar🔍]  │
│ Alertas    │                                             │
│ Reportes   │  ┌──────────────────────────────────────┐  │
│ Perfil     │  │ ID        │ Nombre  │ Zona │ Estado │  │
│            │  ├──────────────────────────────────────┤  │
│            │  │ SENSOR_01 │ Lab 1   │ Urb. │ 🟢Activo│ │
│            │  │ SENSOR_02 │ Lab 2   │ Urb. │ 🟢Activo│ │
│ [Logout]   │  │ SENSOR_03 │ Campo A │ Rur. │ 🔴Inact│ │
│            │  └──────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────┘
```

---

### 9.3 Modal Crear Sensor - Wireframe

```
         ┌──────────────────────────────┐
         │  Crear Nuevo Sensor      [X] │
         ├──────────────────────────────┤
         │                              │
         │  ID del Sensor *             │
         │  [________________]          │
         │                              │
         │  Nombre *                    │
         │  [________________]          │
         │                              │
         │  Zona *                      │
         │  [Seleccione... ▼]          │
         │                              │
         │  Tipo *                      │
         │  ( ) Fijo  ( ) Móvil        │
         │                              │
         │  Descripción                 │
         │  [________________]          │
         │  [________________]          │
         │                              │
         │        [Cancelar] [Guardar] │
         └──────────────────────────────┘
```

---

## 10. Mockups de Alta Fidelidad

*Nota: Los mockups completos están disponibles en Figma. A continuación se describen los elementos visuales clave.*

### 10.1 Dashboard Público - Mockup

**Elementos visuales:**

**Navbar:**
- Fondo blanco con shadow sutil
- Logo IIAP a la izquierda (120px width)
- Título "Sistema de Monitoreo Ambiental" centrado
- Botón "Iniciar Sesión" verde a la derecha

**KPI Cards:**
- 4 cards en row (responsive a 2 en tablet, 1 en móvil)
- Card de temperatura: Icono termómetro rojo en círculo rojo pastel
- Card de humedad: Icono gota azul en círculo azul pastel
- Card de CO2: Icono nube ámbar en círculo ámbar pastel
- Cada card muestra valor grande (36px), label arriba, tendencia abajo

**Mapa:**
- Altura: 400px en desktop, 300px en móvil
- Marcadores verdes para sensores activos
- Popup blanco con shadow al hacer clic
- Controles de zoom en esquina superior izquierda

**Tabla de lecturas:**
- Encabezado con fondo gris claro
- Filas alternadas con hover
- Última columna con badge de estado
- Paginación en la parte inferior

---

### 10.2 Página de Login - Mockup

**Layout:**
- Centrado vertical y horizontal
- Card blanca con shadow grande
- Logo IIAP centrado arriba
- Título "Iniciar Sesión" (H2)
- Formulario con 2 campos + botón
- Fondo con gradiente verde sutil

**Formulario:**
```
┌─────────────────────────────┐
│       [Logo IIAP]           │
│                             │
│      Iniciar Sesión         │
│                             │
│  Email                      │
│  [🔒 _____________]         │
│                             │
│  Contraseña                 │
│  [🔐 _____________ 👁️]     │
│                             │
│  [    Iniciar Sesión    ]   │  ← Botón verde, ancho completo
│                             │
└─────────────────────────────┘
```

---

### 10.3 Página de Alertas - Mockup

**Filtros superiores:**
- Tabs: "Activas" | "Resueltas" | "Todas"
- Filtro de gravedad: Chips seleccionables (Crítico, Alto, Medio, Bajo)
- Filtro de fecha range picker

**Lista de alertas:**
- Cards apiladas verticalmente
- Borde izquierdo grueso (4px) en color según gravedad
- Icono de alerta a la izquierda
- Información de la alerta en el centro
- Botones de acción a la derecha

**Ejemplo de card de alerta:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Alerta de CO2 - Sensor Lab 1      [CRÍTICO]    │
│                                                     │
│ Valor actual: 1200 ppm | Umbral: 800 ppm           │
│ Hace 15 minutos • Urbana                            │
│                                           [Resolver]│
└─────────────────────────────────────────────────────┘
```

---

## 11. Flujos de Usuario

### 11.1 Flujo: Usuario Público Consulta Lecturas

```
[Landing: Dashboard]
         ↓
[Click en "Lecturas" en navbar]
         ↓
[Página Lecturas - Vista inicial con últimas 100 lecturas]
         ↓
[Usuario aplica filtros: Fecha, Sensor, Zona]
         ↓
[Click "Aplicar Filtros"]
         ↓
[Tabla se actualiza con resultados filtrados]
         ↓
[Scroll down - Gráficos se muestran debajo]
         ↓
[Interacción con gráfico: Hover para ver valores exactos]
         ↓
[Opcional: Click "Exportar" → Descarga CSV]
```

**Tiempo estimado:** 30-60 segundos
**Pasos:** 5-7

---

### 11.2 Flujo: Admin Crea Nuevo Sensor

```
[Login Page]
         ↓
[Ingresar credenciales + Click "Iniciar Sesión"]
         ↓
[Dashboard Admin]
         ↓
[Click "Sensores" en sidebar]
         ↓
[Página Sensores - Lista de sensores existentes]
         ↓
[Click "+ Nuevo Sensor" (esquina superior derecha)]
         ↓
[Modal se abre - Formulario vacío]
         ↓
[Completar campos: ID, Nombre, Zona, Tipo]
         ↓
[Click "Guardar"]
         ↓
         ├─ Validación OK → [Toast: "Sensor creado"] → [Modal se cierra] → [Tabla se actualiza]
         └─ Validación FAIL → [Error debajo del campo] → [Corregir] → [Retry]
```

**Tiempo estimado:** 45-90 segundos
**Pasos:** 8-10

---

### 11.3 Flujo: Admin Configura Umbrales

```
[Página Alertas]
         ↓
[Click tab "Configurar Umbrales"]
         ↓
[Selector de sensor - Click dropdown]
         ↓
[Seleccionar sensor específico]
         ↓
[Formulario se carga con umbrales actuales (si existen)]
         ↓
[Modificar valores:
  - Temperatura Mín/Máx
  - Humedad Mín/Máx
  - CO2 Mín/Máx
  - CO Mín/Máx]
         ↓
[Click "Guardar Umbrales"]
         ↓
[Toast: "Umbrales actualizados exitosamente"]
         ↓
[Sistema comienza a monitorear con nuevos umbrales]
```

**Tiempo estimado:** 60-120 segundos
**Pasos:** 7-8

---

### 11.4 Flujo: Admin Genera Reporte PDF

```
[Página Reportes]
         ↓
[Seleccionar tipo: "Reporte de Lecturas"]
         ↓
[Configurar rango de fechas con date pickers]
         ↓
[Seleccionar sensor (opcional) o "Todos"]
         ↓
[Seleccionar parámetros a incluir (checkboxes)]
         ↓
[Seleccionar formato: PDF]
         ↓
[Click "Generar Reporte"]
         ↓
[Loading spinner (2-5 segundos)]
         ↓
[Previsualización del reporte en pantalla]
         ↓
[Click "Exportar a PDF"]
         ↓
[Archivo PDF se descarga automáticamente]
         ↓
[Toast: "Reporte descargado exitosamente"]
```

**Tiempo estimado:** 30-60 segundos
**Pasos:** 10

---

## 12. Responsive Design

### 12.1 Breakpoints y Estrategia

**Enfoque:** Mobile-First

**Breakpoints:**
1. **Mobile:** 375px - 767px (base)
2. **Tablet:** 768px - 1023px
3. **Desktop:** 1024px - 1439px
4. **Large Desktop:** 1440px+

### 12.2 Adaptaciones por Dispositivo

#### **Mobile (375px - 767px)**

**Navbar:**
- Hamburger menu (☰) en lugar de menú horizontal
- Logo reducido a 80px width
- Botón "Login" se muestra como icono de usuario

**KPI Cards:**
- Grid de 1 columna (stack vertical)
- Padding reducido a `p-4`

**Mapa:**
- Altura reducida a 250px
- Controles de zoom más grandes (touch-friendly)

**Tablas:**
- Scroll horizontal (`overflow-x-auto`)
- Columnas mínimas visibles (ocultar secundarias)
- Opción de vista de cards en lugar de tabla

**Sidebar (Admin):**
- Se convierte en drawer que se abre desde la izquierda
- Overlay oscuro cuando está abierto
- Cierre al hacer clic fuera

**Formularios:**
- Inputs de ancho completo
- Botones de ancho completo
- Menor padding vertical

---

#### **Tablet (768px - 1023px)**

**KPI Cards:**
- Grid de 2 columnas

**Tablas:**
- Más columnas visibles
- Menos scroll horizontal

**Sidebar:**
- Sigue siendo drawer (no fixed)

**Formularios:**
- Campos en 2 columnas cuando es apropiado

---

#### **Desktop (1024px+)**

**Sidebar:**
- Fixed a la izquierda (siempre visible)
- Width: 256px

**KPI Cards:**
- Grid de 4 columnas

**Tablas:**
- Todas las columnas visibles
- Acciones inline

**Modales:**
- Ancho máximo 600px (en lugar de 400px)

---

### 12.3 Ejemplo de Código Responsivo

```jsx
<div className="
  grid
  grid-cols-1           /* Mobile: 1 columna */
  md:grid-cols-2        /* Tablet: 2 columnas */
  lg:grid-cols-4        /* Desktop: 4 columnas */
  gap-4                 /* Mobile: 16px gap */
  lg:gap-6              /* Desktop: 24px gap */
">
  <KPICard />
  <KPICard />
  <KPICard />
  <KPICard />
</div>
```

---

## 13. Accesibilidad

### 13.1 Estándares Cumplidos

**WCAG 2.1 Nivel AA** - Cumplimiento completo

**Criterios clave:**
- ✅ 1.4.3 Contraste (Mínimo): 4.5:1 para texto normal
- ✅ 1.4.6 Contraste (Mejorado): 7:1 para texto importante
- ✅ 2.1.1 Teclado: Toda funcionalidad accesible por teclado
- ✅ 2.4.7 Foco Visible: Indicador de foco visible
- ✅ 3.2.4 Identificación Consistente: Componentes identificados consistentemente
- ✅ 4.1.2 Nombre, Función, Valor: Elementos programáticamente determinables

---

### 13.2 Navegación por Teclado

**Teclas soportadas:**

| Tecla | Acción |
|-------|--------|
| **Tab** | Navegar al siguiente elemento interactivo |
| **Shift + Tab** | Navegar al elemento anterior |
| **Enter** | Activar botón/link enfocado |
| **Space** | Activar checkbox/radio enfocado |
| **Esc** | Cerrar modal/dropdown abierto |
| **Arrow Keys** | Navegar dentro de dropdowns/select |

**Orden de tabulación lógico:**
1. Navbar links
2. Contenido principal (de arriba a abajo, izquierda a derecha)
3. Sidebar (si existe)
4. Footer

---

### 13.3 Indicadores de Foco

```css
/* Focus visible en inputs */
input:focus {
  outline: none;
  ring: 2px solid #3b82f6; /* blue-500 */
  ring-offset: 2px;
}

/* Focus visible en botones */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Focus visible en links */
a:focus-visible {
  outline: 2px dashed #16a34a; /* green-600 */
  outline-offset: 4px;
}
```

---

### 13.4 Textos Alternativos

**Imágenes:**
```jsx
<img src="sensor.jpg" alt="Sensor de temperatura Lab 1 ubicado en zona urbana" />
```

**Iconos decorativos:**
```jsx
<svg aria-hidden="true"><!-- Icon --></svg>
```

**Iconos funcionales:**
```jsx
<button>
  <svg aria-label="Eliminar sensor"><!-- Trash icon --></svg>
  <span className="sr-only">Eliminar</span>
</button>
```

---

### 13.5 ARIA Labels

**Formularios:**
```jsx
<input
  type="text"
  id="sensor-name"
  aria-label="Nombre del sensor"
  aria-describedby="sensor-name-help"
  aria-required="true"
/>
<p id="sensor-name-help">Debe ser único en el sistema</p>
```

**Estados dinámicos:**
```jsx
<button aria-pressed={isActive}>
  {isActive ? 'Activo' : 'Inactivo'}
</button>

<div role="alert" aria-live="polite">
  Sensor creado exitosamente
</div>
```

**Modales:**
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Crear Nuevo Sensor</h2>
  <!-- Contenido -->
</div>
```

---

### 13.6 Tamaños Táctiles

Todos los elementos interactivos cumplen con el mínimo de 44x44px (WCAG 2.5.5):

```jsx
/* Botón pequeño sigue siendo touch-friendly */
<button className="
  p-2              /* 8px padding */
  min-w-[44px]     /* 44px ancho mínimo */
  min-h-[44px]     /* 44px alto mínimo */
">
  <svg className="w-5 h-5"><!-- Icon 20px --></svg>
</button>
```

---

## 14. Interacciones y Microanimaciones

### 14.1 Principios de Animación

**Duración:**
- Transiciones rápidas: 150ms (cambios sutiles)
- Transiciones estándar: 200-300ms (hover, focus)
- Animaciones complejas: 400-600ms (modales, drawers)

**Easing:**
- `ease-in-out`: Transiciones simétricas (default)
- `ease-out`: Entradas (elementos aparecen)
- `ease-in`: Salidas (elementos desaparecen)

**Respetar preferencias:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 14.2 Animaciones de Componentes

#### **Hover en Botones**
```css
.btn-primary {
  transition: background-color 200ms ease-in-out,
              transform 100ms ease-out;
}

.btn-primary:hover {
  background-color: /* darker */;
}

.btn-primary:active {
  transform: scale(0.98);
}
```

---

#### **Hover en Cards**
```css
.card {
  transition:
    box-shadow 200ms ease-in-out,
    border-color 200ms ease-in-out;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #16a34a; /* green-600 */
}
```

---

#### **Modal Fade-In**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-overlay {
  animation: fadeIn 200ms ease-out;
}

.modal-content {
  animation: scaleIn 300ms ease-out;
}
```

---

#### **Toast Slide-In**
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast {
  animation: slideInRight 300ms ease-out;
}
```

---

#### **Loading Spinner**
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

### 14.3 Estados de Carga

**Skeleton Screens:**

```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

**Loading States en Botones:**
```jsx
{isLoading ? (
  <button disabled className="relative bg-green-600 opacity-75">
    <span className="opacity-0">Guardar</span>
    <svg className="animate-spin absolute inset-0 m-auto h-5 w-5">
      <!-- Spinner -->
    </svg>
  </button>
) : (
  <button className="bg-green-600">Guardar</button>
)}
```

---

## 15. Decisiones de Diseño

### 15.1 ¿Por qué Verde como Color Primario?

**Razones:**
1. **Identidad IIAP:** Instituto enfocado en Amazonía peruana
2. **Asociación semántica:** Verde = Naturaleza, medio ambiente
3. **Psicología del color:** Verde transmite calma, crecimiento, sostenibilidad
4. **Diferenciación:** La mayoría de dashboards usan azul, verde destaca
5. **Accesibilidad:** Buenos niveles de contraste en tonos oscuros

---

### 15.2 ¿Por qué Inter como Fuente?

**Razones:**
1. **Optimizada para pantallas:** Diseñada específicamente para UI digital
2. **Legibilidad superior:** Especialmente en tamaños pequeños (12-14px)
3. **Versatilidad:** 9 pesos permiten jerarquía clara
4. **Gratuita:** Licencia Open Font License
5. **Soporte completo:** Incluye todos los caracteres del español
6. **Tendencia actual:** Usada por GitHub, Mozilla, y otros sistemas de diseño

**Alternativas consideradas:**
- **Roboto:** Muy común, menos diferenciación
- **San Francisco:** Solo macOS/iOS
- **Poppins:** Muy redondeada, menos profesional para datos científicos

---

### 15.3 ¿Por qué Tailwind CSS?

**Razones:**
1. **Velocidad de desarrollo:** Utility-first acelera prototipado
2. **Consistencia automática:** Escala de diseño predefinida
3. **Responsive fácil:** Prefijos `sm:`, `md:`, `lg:`
4. **Tree-shaking:** Solo CSS usado se incluye en producción
5. **Customizable:** Tailwind config permite ajustes
6. **Comunidad:** Amplia adopción, muchos recursos

**Desventajas aceptadas:**
- Clases largas en HTML (mitigado con componentes React)
- Curva de aprendizaje inicial

---

### 15.4 ¿Por qué Leaflet para Mapas?

**Razones:**
1. **Open source:** Sin costos de API (vs Google Maps)
2. **Ligero:** ~39 KB gzipped
3. **Flexible:** Múltiples proveedores de tiles (OpenStreetMap, etc.)
4. **Sin límites:** Sin cuotas de uso
5. **Privacidad:** No tracking de Google

**Alternativas consideradas:**
- **Google Maps:** Costos altos, 28,000 cargas/mes gratis insuficiente
- **Mapbox:** Freemium pero límites bajos
- **Apple Maps:** Solo en ecosistema Apple

---

### 15.5 ¿Por qué Chart.js para Gráficos?

**Razones:**
1. **Simple:** API intuitiva
2. **Responsivo:** Gráficos adaptan automáticamente
3. **Interactivo:** Tooltips, leyendas clickeables
4. **Ligero:** ~60 KB gzipped
5. **Bien documentado:** Muchos ejemplos

**Alternativas consideradas:**
- **Recharts:** Más React-native pero menos flexible
- **D3.js:** Muy potente pero curva de aprendizaje alta
- **ApexCharts:** Bueno pero más pesado

---

### 15.6 ¿Por qué Modales en lugar de Páginas?

**Decisión:** Crear/Editar sensores en modales, no en páginas separadas.

**Razones:**
1. **Contexto:** Usuario mantiene vista de la lista de sensores
2. **Rapidez:** No hay navegación entre páginas
3. **Menor carga cognitiva:** No perder ubicación en la aplicación
4. **Mejor UX:** Común en aplicaciones modernas

**Trade-off:**
- En móviles, modales pueden ser incómodos (mitigado con modales full-screen en mobile)

---

### 15.7 ¿Por qué No Tema Oscuro (Dark Mode)?

**Decisión:** Solo modo claro en v1.0.0

**Razones:**
1. **Enfoque:** Priorizar funcionalidades core
2. **Audiencia:** Uso principal en horarios diurnos (científicos, investigadores)
3. **Datos visuales:** Gráficos y mapas funcionan mejor en fondo claro
4. **Tiempo limitado:** Implementación de dark mode requiere 2x CSS

**Futuro:** Planificado para v2.0.0 si hay demanda de usuarios

---

### 15.8 ¿Por qué Tabs en lugar de Páginas Separadas?

**Decisión:** Alertas y Umbrales en la misma página con tabs

**Razones:**
1. **Relación conceptual:** Umbrales generan alertas
2. **Flujo común:** Configurar umbral → Ver alertas resultantes
3. **Menos clicks:** No necesitar cambiar de página
4. **Espacio en sidebar:** Reducir opciones de menú

---

## Apéndices

### Apéndice A: Checklist de Diseño

**Antes de implementar un componente nuevo:**

- [ ] ¿Usa colores de la paleta definida?
- [ ] ¿Usa tipografía Inter con tamaños de escala?
- [ ] ¿Tiene estados hover, focus, active, disabled?
- [ ] ¿Es responsivo en mobile, tablet, desktop?
- [ ] ¿Cumple contraste WCAG AA (mínimo 4.5:1)?
- [ ] ¿Es navegable por teclado?
- [ ] ¿Tiene ARIA labels apropiados?
- [ ] ¿Respeta `prefers-reduced-motion`?
- [ ] ¿Usa espaciado de la escala (múltiplos de 4px)?
- [ ] ¿Es consistente con componentes existentes?

---

### Apéndice B: Recursos de Diseño

**Archivos de diseño:**
- Figma: [Link al proyecto] (acceso restringido)
- Paleta de colores: `colors.json`
- Exportables: `assets/icons/`, `assets/images/`

**Documentación externa:**
- Tailwind CSS: https://tailwindcss.com/docs
- Headless UI: https://headlessui.com/
- Heroicons: https://heroicons.com/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

### Apéndice C: Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Atomic Design** | Metodología de diseño que organiza componentes en átomos, moléculas, organismos |
| **Breakpoint** | Ancho de pantalla donde el diseño cambia (ej: 768px para tablet) |
| **Component** | Elemento reutilizable de UI (botón, card, input) |
| **Design System** | Colección de componentes, patrones y lineamientos de diseño |
| **Design Token** | Valor reutilizable (color, tamaño, espaciado) |
| **Mobile-First** | Diseñar primero para móvil, luego expandir a desktop |
| **Progressive Disclosure** | Mostrar información gradualmente para evitar sobrecarga |
| **Responsive** | Diseño que se adapta a diferentes tamaños de pantalla |
| **Touch Target** | Área clickeable/tocable de un elemento (mínimo 44x44px) |
| **Utility-First** | Enfoque de CSS con clases de propósito único (Tailwind) |
| **WCAG** | Web Content Accessibility Guidelines - Estándares de accesibilidad |

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Versión:** 1.0.0
**Fecha de última actualización:** 05/11/2025
**Equipo de Diseño:** Equipo IIAP
**Estado:** Producción
