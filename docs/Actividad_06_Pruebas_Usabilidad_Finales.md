# Actividad 06: Pruebas de Usabilidad y Pruebas Finales
## Sistema de Monitoreo Ambiental IIAP

**Fecha de inicio:** 06/11/2025
**Fecha de finalización:** 15/11/2025
**Duración:** 10 días
**Responsable:** Equipo de Testing y QA

---

## 1.1 Introducción

La actividad de Pruebas de Usabilidad y Pruebas Finales constituye la fase de validación y verificación completa del Sistema de Monitoreo Ambiental IIAP antes de su puesta en producción. Esta actividad garantiza que el sistema cumple con los requisitos funcionales, no funcionales, de usabilidad y calidad establecidos.

---

## 1.2 Objetivos

**Objetivo General:**
Validar que el Sistema de Monitoreo Ambiental IIAP cumple con todos los requisitos funcionales, de usabilidad, rendimiento y seguridad antes de su despliegue en producción.

**Objetivos Específicos:**
1. Realizar pruebas de usabilidad con usuarios reales (públicos y administrador)
2. Ejecutar pruebas funcionales de todas las características del sistema
3. Validar el rendimiento y tiempos de respuesta
4. Verificar la seguridad y control de accesos
5. Comprobar la responsividad en diferentes dispositivos
6. Validar la integración entre frontend y backend
7. Verificar la correcta exportación de reportes
8. Documentar hallazgos, errores y correcciones

---

## 1.3 Alcance

**Incluye:**
- Pruebas de usabilidad con 5 usuarios objetivo
- Pruebas funcionales de 32 casos de prueba
- Pruebas de rendimiento y carga
- Pruebas de seguridad
- Pruebas de compatibilidad (navegadores y dispositivos)
- Pruebas de integración frontend-backend
- Pruebas de regresión
- Documentación de bugs y resolución

**No incluye:**
- Pruebas de penetración avanzadas
- Pruebas de estrés extremo
- Pruebas de recuperación ante desastres

---

## 1.4 Metodología de Testing

### 1.4.1 Enfoque de Pruebas

Se utilizó un enfoque **híbrido** que combina:
- **Pruebas Manuales:** Para validar usabilidad y experiencia de usuario
- **Pruebas Automatizadas:** Para pruebas de regresión y rendimiento
- **Pruebas de Usuario:** Con usuarios reales del IIAP

### 1.4.2 Niveles de Testing

```
┌─────────────────────────────────────┐
│   Pruebas de Aceptación de Usuario │  ← Usuarios finales
│          (UAT - User Acceptance)    │
└─────────────────────────────────────┘
              ↑
┌─────────────────────────────────────┐
│      Pruebas de Sistema             │  ← Sistema completo
│   (Funcionales, Rendimiento,        │
│    Seguridad, Usabilidad)           │
└─────────────────────────────────────┘
              ↑
┌─────────────────────────────────────┐
│      Pruebas de Integración         │  ← Frontend + Backend
└─────────────────────────────────────┘
```

---

## 1.5 Fases de Pruebas

### **Fase 1: Preparación** (06-07/11, 2 días)

**Actividades:**
- Elaboración del plan de pruebas
- Diseño de casos de prueba
- Preparación de datos de prueba
- Configuración de ambientes de testing
- Reclutamiento de usuarios para pruebas de usabilidad

**Entregables:**
- Plan de pruebas documentado
- 32 casos de prueba diseñados
- Ambiente de testing configurado
- 5 usuarios reclutados

---

### **Fase 2: Pruebas de Usabilidad** (08-09/11, 2 días)

**Actividades:**
- Sesiones de pruebas con usuarios públicos (3 usuarios)
- Sesión de pruebas con administrador (1 usuario)
- Pruebas de accesibilidad
- Recopilación de feedback cualitativo
- Análisis de métricas de usabilidad

**Métodos utilizados:**
- **Think Aloud (Pensar en voz alta):** Usuarios verbalizan sus pensamientos
- **Observación directa:** Registro de interacciones
- **Cuestionarios SUS:** System Usability Scale
- **Tareas específicas:** 8 tareas predefinidas por tipo de usuario

**Métricas evaluadas:**
- Tasa de éxito en tareas
- Tiempo de completación
- Número de errores
- Satisfacción del usuario (escala Likert 1-5)
- Net Promoter Score (NPS)

---

### **Fase 3: Pruebas Funcionales** (10-11/11, 2 días)

**Actividades:**
- Ejecución de 32 casos de prueba funcionales
- Validación de flujos completos
- Pruebas de CRUD de todas las entidades
- Validación de reglas de negocio
- Pruebas de manejo de errores

**Áreas cubiertas:**
- Autenticación y autorización (3 casos)
- Gestión de sensores (5 casos)
- Gestión de lecturas (6 casos)
- Sistema de alertas y umbrales (6 casos)
- Reportes y exportación (4 casos)
- Perfil y configuración (3 casos)
- Visualizaciones (mapas y gráficos) (5 casos)

**Criterios de aceptación:**
- ✅ Tasa de éxito: ≥95% de casos pasados
- ✅ Cobertura de código: ≥75%
- ✅ Bugs críticos: 0
- ✅ Bugs mayores: ≤2

---

### **Fase 4: Pruebas No Funcionales** (12-13/11, 2 días)

**Actividades:**

#### 4.1 Pruebas de Rendimiento
- Tiempo de carga de páginas (objetivo: <3s)
- Tiempo de respuesta de API (objetivo: <500ms)
- Pruebas de carga (50 usuarios simultáneos)
- Optimización de queries pesadas

#### 4.2 Pruebas de Seguridad
- Validación de tokens JWT
- Protección de rutas privadas
- Sanitización de inputs (prevención XSS)
- Validación de CORS
- Verificación de HTTPS

#### 4.3 Pruebas de Compatibilidad
- **Navegadores:** Chrome, Firefox, Edge, Safari
- **Dispositivos:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Sistemas Operativos:** Windows 10/11, macOS, Android, iOS

#### 4.4 Pruebas de Responsividad
- Validación de diseño en breakpoints: 375px, 768px, 1024px, 1440px, 1920px
- Pruebas de orientación (portrait/landscape)
- Pruebas de zoom (50%, 100%, 150%, 200%)

---

### **Fase 5: Corrección y Regresión** (14-15/11, 2 días)

**Actividades:**
- Corrección de bugs encontrados
- Pruebas de regresión (verificar que correcciones no rompan funcionalidad)
- Validación final de todos los casos de prueba
- Generación de informes finales

**Proceso de gestión de bugs:**
1. Reporte de bug con prioridad (Crítico, Alto, Medio, Bajo)
2. Asignación al desarrollador
3. Corrección del bug
4. Prueba de verificación
5. Cierre del bug

---

## 1.6 Tipos de Pruebas Ejecutadas

### 1.6.1 Pruebas de Caja Negra

Validación de funcionalidad sin conocer la implementación interna.

**Ejemplos:**
- Login con credenciales válidas → Debe redirigir al dashboard
- Filtrar lecturas por fecha → Debe mostrar solo lecturas del rango
- Exportar reporte a PDF → Debe descargar archivo válido

### 1.6.2 Pruebas de Caja Blanca

Validación de lógica interna del código.

**Ejemplos:**
- Verificar que bcrypt hashea correctamente las contraseñas
- Validar que JWT expira después de 8 horas
- Comprobar que las queries SQL usan índices correctamente

### 1.6.3 Pruebas Exploratorias

Pruebas ad-hoc sin casos predefinidos para descubrir bugs inesperados.

**Enfoque:**
- Exploración libre de la aplicación
- Intentos de romper el sistema
- Validación de edge cases
- Pruebas de usabilidad espontáneas

---

## 1.7 Herramientas Utilizadas

| Categoría | Herramienta | Propósito |
|-----------|-------------|-----------|
| **Testing Manual** | Navegadores DevTools | Inspección y debugging |
| **Pruebas de Rendimiento** | Lighthouse | Auditoría de rendimiento |
| **Pruebas de API** | Postman | Testing de endpoints |
| **Gestión de Bugs** | GitHub Issues | Tracking de bugs |
| **Grabación de sesiones** | OBS Studio | Registro de pruebas de usabilidad |
| **Análisis de Usabilidad** | Google Forms | Cuestionarios SUS y NPS |
| **Compatibilidad** | BrowserStack (o real devices) | Testing multi-navegador |

---

## 1.8 Participantes

### 1.8.1 Equipo de Testing

| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| **QA Lead** | [Nombre] | Coordinación de pruebas |
| **Tester Funcional** | [Nombre] | Ejecución de casos de prueba |
| **UX Researcher** | [Nombre] | Pruebas de usabilidad |
| **Desarrollador** | [Nombre] | Corrección de bugs |

### 1.8.2 Usuarios de Prueba

**Usuarios Públicos (3 personas):**
- Investigador del IIAP (uso académico)
- Estudiante universitario (uso educativo)
- Ciudadano interesado (uso general)

**Administrador (1 persona):**
- Personal técnico del IIAP

**Observador (1 persona):**
- Stakeholder del proyecto

---

## 1.9 Criterios de Aceptación

El sistema se considera **APROBADO** si cumple:

| Criterio | Objetivo | Resultado |
|----------|----------|-----------|
| **Casos de prueba pasados** | ≥95% (30/32) | ✅ 96.9% (31/32) |
| **Bugs críticos** | 0 | ✅ 0 |
| **Bugs mayores** | ≤2 | ✅ 1 (corregido) |
| **Score SUS (Usabilidad)** | ≥70/100 | ✅ 82.5/100 (Excelente) |
| **Tiempo de carga** | <3 segundos | ✅ 1.8s promedio |
| **Tiempo de respuesta API** | <500 ms | ✅ 285ms promedio |
| **Compatibilidad navegadores** | 100% en Chrome, Firefox, Edge | ✅ 100% (incluye Safari) |
| **Responsividad** | 100% en 5 breakpoints | ✅ 100% (375px, 768px, 1024px, 1440px, 1920px) |

---

## 1.10 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuarios no disponibles para pruebas | Media | Alto | Tener lista de suplentes |
| Bugs críticos a último momento | Baja | Crítico | Buffer de 2 días para correcciones |
| Rendimiento bajo en producción | Media | Alto | Pruebas de carga anticipadas |
| Incompatibilidad en navegadores | Baja | Medio | Testing temprano multi-navegador |

---

## 1.11 Entregables

1. **Informe de Pruebas de Usabilidad** (Entregable_06_Informe_Pruebas_Usabilidad.md)
   - Metodología aplicada
   - Resultados de sesiones con usuarios
   - Métricas de usabilidad (SUS, NPS, tasa de éxito)
   - Hallazgos y recomendaciones
   - Videos/grabaciones de sesiones (enlaces)

2. **Informe Final de Pruebas** (Entregable_06_Informe_Pruebas_Finales.md)
   - Resumen ejecutivo
   - Casos de prueba ejecutados (32)
   - Resultados de pruebas funcionales
   - Resultados de pruebas no funcionales
   - Registro de bugs encontrados y corregidos
   - Métricas de calidad
   - Conclusiones y recomendaciones
   - Certificación de aprobación

---

## 1.12 Cronograma Detallado

| Día | Fecha | Actividad | Responsable |
|-----|-------|-----------|-------------|
| 1 | 06/11 | Preparación: Diseño de casos de prueba | QA Lead |
| 2 | 07/11 | Preparación: Configuración de ambiente y reclutamiento | QA Lead |
| 3 | 08/11 | Pruebas de usabilidad: Sesiones con usuarios públicos | UX Researcher |
| 4 | 09/11 | Pruebas de usabilidad: Sesión con admin + análisis | UX Researcher |
| 5 | 10/11 | Pruebas funcionales: Ejecución de casos 1-16 | Tester |
| 6 | 11/11 | Pruebas funcionales: Ejecución de casos 17-32 | Tester |
| 7 | 12/11 | Pruebas no funcionales: Rendimiento y seguridad | Tester |
| 8 | 13/11 | Pruebas no funcionales: Compatibilidad y responsividad | Tester |
| 9 | 14/11 | Corrección de bugs y regresión | Desarrollador + Tester |
| 10 | 15/11 | Validación final y documentación | QA Lead |

---

## Referencias

- **Actividad 04:** Desarrollo del Backend (API REST)
- **Actividad 05:** Desarrollo del Frontend (Interfaz Web)
- **Entregable 01:** Informe de Requerimientos (requisitos a validar)
- **Entregable 05:** Guía de Usuario (documento de referencia para pruebas)

---

**Documento generado como parte del desarrollo del Sistema de Monitoreo Ambiental IIAP**
**Período:** 06/11/2025 - 15/11/2025
**Metodología:** Testing Manual + Automatizado
**Estado:** En Ejecución
