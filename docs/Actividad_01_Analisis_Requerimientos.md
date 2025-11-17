# Actividad 01: Análisis de Requerimientos de la Plataforma Web

**Proyecto:** Sistema de Monitoreo Ambiental - IIAP
**Responsable:** Michel Izquierdo
**Período:** [Fecha inicio] - [Fecha fin]
**Estado:** Completado

---

## 1.1. Objetivo

Realizar un análisis exhaustivo de los requerimientos funcionales y no funcionales necesarios para el desarrollo de una plataforma web de monitoreo ambiental que permita visualizar, analizar y gestionar datos en tiempo real provenientes de sensores ambientales distribuidos en diferentes zonas de la región amazónica.

**Objetivos específicos:**
- Identificar los requerimientos funcionales del sistema de monitoreo
- Definir los requerimientos no funcionales de seguridad, rendimiento y usabilidad
- Establecer las especificaciones técnicas para la integración con sensores IoT
- Documentar los casos de uso principales del sistema

---

## 1.2. Justificación

El Instituto de Investigaciones de la Amazonía Peruana (IIAP) requiere una plataforma centralizada para monitorear variables ambientales críticas (temperatura, humedad, CO2, CO) en tiempo real. La ausencia de un sistema integrado dificulta:

- **Monitoreo en tiempo real:** No existe visibilidad inmediata de las condiciones ambientales
- **Gestión de alertas:** Sin sistema automatizado para detectar valores críticos
- **Análisis histórico:** Datos dispersos dificultan el análisis de tendencias
- **Toma de decisiones:** Falta de herramientas para generar reportes y visualizaciones

El análisis de requerimientos permite establecer bases sólidas para desarrollar una solución que satisfaga las necesidades institucionales y garantice escalabilidad futura.

---

## 1.3. Planificación

### Cronograma de Actividades

| Fase | Actividad | Duración | Responsable |
|------|-----------|----------|-------------|
| 1 | Reunión con stakeholders | 2 días | Michel Izquierdo |
| 2 | Identificación de requerimientos funcionales | 3 días | Michel Izquierdo |
| 3 | Identificación de requerimientos no funcionales | 2 días | Michel Izquierdo |
| 4 | Análisis de integración IoT | 3 días | Michel Izquierdo |
| 5 | Elaboración de casos de uso | 2 días | Michel Izquierdo |
| 6 | Validación con stakeholders | 1 día | Michel Izquierdo |
| 7 | Documentación final | 2 días | Michel Izquierdo |
| **Total** | | **15 días** | |

### Recursos Necesarios
- Documentación institucional del IIAP
- Especificaciones técnicas de sensores ESP32
- Herramientas de diagramación (Lucidchart, Draw.io)
- Software de documentación (Markdown, Word)

---

## 1.4. Metodología

Se aplicó una metodología mixta combinando técnicas **cualitativas** y **cuantitativas**:

### Técnicas Cualitativas

**1. Entrevistas semiestructuradas**
- Público objetivo: Personal técnico y científico del IIAP
- Temas: Necesidades de monitoreo, flujos de trabajo, expectativas
- Resultado: Identificación de requisitos funcionales prioritarios

**2. Análisis documental**
- Revisión de protocolos de monitoreo ambiental
- Estudio de normativas técnicas (ISO, IEEE)
- Análisis de sistemas similares (benchmarking)

**3. Observación participante**
- Análisis del flujo de trabajo actual
- Identificación de puntos de fricción
- Detección de necesidades no explícitas

### Técnicas Cuantitativas

**1. Análisis de volumetría de datos**
- Frecuencia de lecturas: 1 lectura/minuto por sensor
- Proyección: 100 sensores activos
- Volumen estimado: ~144,000 lecturas/día

**2. Análisis de carga**
- Usuarios concurrentes estimados: 10-50
- Picos de tráfico: Horario laboral (8:00-18:00)
- Tiempo de respuesta objetivo: < 2 segundos

**3. Métricas de disponibilidad**
- Disponibilidad objetivo: 99.5% (uptime)
- Tolerancia a fallos de sensores: 100%
- Recuperación ante fallos: < 5 minutos

---

## 1.5. Diagrama de Actividades

```
┌─────────────────────────────────────────────────────┐
│              INICIO: Análisis de Requerimientos     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  1. Reunión con Stakeholders del IIAP               │
│     - Identificar necesidades                       │
│     - Definir alcance                               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  2. Recopilación de Información                     │
│     - Documentación técnica                         │
│     - Especificaciones de sensores                  │
│     - Normativas aplicables                         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  3. Análisis de Requerimientos Funcionales          │
│     - Visualización de datos                        │
│     - Sistema de alertas                            │
│     - Gestión de sensores                           │
│     - Generación de reportes                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  4. Análisis de Requerimientos No Funcionales       │
│     - Rendimiento                                   │
│     - Seguridad                                     │
│     - Usabilidad                                    │
│     - Escalabilidad                                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  5. Análisis de Integración IoT                     │
│     - Protocolo de comunicación (HTTP/REST)         │
│     - Formato de datos (JSON)                       │
│     - Autenticación de sensores                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  6. Elaboración de Casos de Uso                     │
│     - Usuario público (visualización)               │
│     - Administrador (gestión completa)              │
│     - Sensores IoT (envío de datos)                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  7. Validación de Requerimientos                    │
│     - Revisión con stakeholders                     │
│     - Ajustes y correcciones                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  8. Documentación Final                             │
│     - Informe de requerimientos                     │
│     - Especificaciones técnicas                     │
│     - Matriz de trazabilidad                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                FIN: Entregable Generado              │
└─────────────────────────────────────────────────────┘
```

---

## 1.6. Análisis de Requerimientos

### Requerimientos Funcionales (15 identificados)

| ID | Requerimiento | Descripción Breve | Prioridad |
|----|---------------|-------------------|-----------|
| RF-01 | Dashboard tiempo real | KPIs, mapa interactivo, últimas lecturas | Alta |
| RF-02 | Mapa interactivo | 5 vistas: sensores, rutas, mapas de calor (temp, CO2, CO) | Alta |
| RF-03 | Registro auto sensores | Creación automática al recibir primera lectura | Alta |
| RF-04 | Detección movilidad | Análisis de varianza GPS (umbral 11m) | Alta |
| RF-05 | Sistema alertas | Detección automática fuera de umbral, 4 niveles gravedad | Alta |
| RF-06 | Config umbrales | CRUD umbrales por sensor/parámetro, habilitar/deshabilitar | Alta |
| RF-07 | Lecturas históricas | Consulta con filtros avanzados, paginación, ordenamiento | Alta |
| RF-08 | Exportación datos | Excel, PDF, CSV con filtros aplicados | Media |
| RF-09 | Gestión recorridos | Visualizar, guardar, nombrar rutas móviles con metadata | Media |
| RF-10 | Mapas de calor | 3 tipos (temperatura, CO2, CO) con selector temporal | Media |
| RF-11 | Autenticación admin | Login JWT, expiración 8h, un solo usuario | Alta |
| RF-12 | Gestión sensores CRUD | Crear, editar, eliminar sensores manualmente (admin) | Alta |
| RF-13 | Resolución alertas | Marcar alertas como resueltas (irreversible) | Media |
| RF-14 | Preferencias sistema | Config personal: timezone, formato fecha, refresh | Baja |
| RF-15 | API REST sensores | POST /api/lecturas público para ESP32, validación datos | Alta |

### Requerimientos No Funcionales (8 identificados)

| ID | Categoría | Especificación | Métrica |
|----|-----------|----------------|---------|
| RNF-01 | Rendimiento | Páginas < 2s, API < 500ms, 50+ usuarios concurrentes | 95% cumplimiento |
| RNF-02 | Seguridad | JWT 128-char, bcrypt salt 10, Helmet, CORS, HTTPS prod | 0 vulnerabilidades críticas |
| RNF-03 | Usabilidad | Responsive, 3 clics máx, WCAG 2.1 AA, tooltips | SUS > 80 |
| RNF-04 | Disponibilidad | 99.5% uptime, RTO < 30min, RPO < 15min, backup diario | Medición mensual |
| RNF-05 | Escalabilidad | 100→500 sensores sin degradación, stateless, PostgreSQL | 3x carga inicial |
| RNF-06 | Mantenibilidad | Código limpio, docs, tests >70%, logs estructurados | Setup < 30min |
| RNF-07 | Portabilidad | Win/Linux/macOS, Docker, últimas 2 versiones browsers | 2+ plataformas |
| RNF-08 | Compatibilidad | ESP32 WiFi/GPRS, JSON, GeoJSON RFC 7946, ISO 8601 | 3+ tipos sensores |

### Casos de Uso Principales (10 consolidados)

**Nota:** Durante el análisis inicial se identificaron 12 casos de uso, los cuales fueron consolidados en 10 casos de uso finales durante la fase de diseño, siguiendo las mejores prácticas de IBM para nomenclatura de casos de uso (verbos activos + objeto).

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
- CU "Ver recorrido móvil" + "Guardar recorrido" → CU-09 "Gestionar Recorridos Móviles"
- CU "Ver mapa calor" → Integrado en CU-06 "Visualizar Dashboard Público"
- CU "Exportar GeoJSON" → Integrado en CU-10 "Exportar Datos"

---

## 1.7. Resultados del Análisis

### Requerimientos Priorizados (MoSCoW)

#### Must Have (Debe tener)
- ✅ Dashboard con datos en tiempo real
- ✅ Mapa interactivo con sensores
- ✅ Sistema de alertas automáticas
- ✅ Registro automático de sensores
- ✅ Acceso público de lectura

#### Should Have (Debería tener)
- ✅ Exportación de datos (Excel, PDF)
- ✅ Gestión de recorridos móviles
- ✅ Filtros avanzados de búsqueda
- ✅ Mapas de calor (temperatura, CO2, CO)

#### Could Have (Podría tener)
- ⚠️ Notificaciones por correo
- ⚠️ API REST pública documentada
- ⚠️ Sistema de roles múltiples

#### Won't Have (No tendrá - v1.0)
- ❌ Aplicación móvil nativa
- ❌ Machine Learning para predicciones
- ❌ Integración con redes sociales

### Matriz de Trazabilidad

| ID | Requerimiento | Prioridad | Complejidad | Estado |
|----|---------------|-----------|-------------|--------|
| RF-01 | Dashboard tiempo real | Must | Media | ✅ Validado |
| RF-02 | Sistema de alertas | Must | Alta | ✅ Validado |
| RF-03 | Gestión sensores | Must | Baja | ✅ Validado |
| RF-04 | Reportes | Should | Media | ✅ Validado |
| RF-05 | Recorridos | Should | Alta | ✅ Validado |
| RNF-01 | Rendimiento | Must | Alta | ✅ Validado |
| RNF-02 | Seguridad | Must | Media | ✅ Validado |

---

## 1.8. Resultados del Diseño

### Arquitectura Propuesta

**Patrón:** Cliente-Servidor con API REST

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Sensores IoT  │────────▶│   Backend API    │────────▶│  PostgreSQL │
│   (ESP32)       │  HTTP   │  (Node.js +      │   ORM   │             │
│                 │  POST   │   Express +      │ Prisma  │             │
└─────────────────┘         │   Prisma)        │         └─────────────┘
                            └────────┬─────────┘
                                     │
                                     │ REST API
                                     ▼
                            ┌──────────────────┐
                            │  Frontend Web    │
                            │  (React + Vite)  │
                            │  - Público       │
                            │  - Admin         │
                            └──────────────────┘
```

### Stack Tecnológico Definido

**Backend:**
- Node.js v22+
- Express.js (framework web)
- Prisma (ORM)
- PostgreSQL (base de datos)
- JWT (autenticación admin)

**Frontend:**
- React 19
- Vite (build tool)
- Tailwind CSS (estilos)
- Leaflet (mapas)
- Recharts (gráficos)

**IoT:**
- ESP32 microcontroladores
- Sensores: DHT22, MQ-135, MQ-7, GPS

---

## 1.9. Resultados de Actividades

### Entregables Generados

1. **Informe de Requerimientos Detallado** ✅
   - 15 requerimientos funcionales
   - 8 requerimientos no funcionales
   - Casos de uso documentados
   - Matriz de trazabilidad

2. **Especificaciones Técnicas** ✅
   - Arquitectura del sistema
   - Stack tecnológico definido
   - Protocolo de comunicación IoT
   - Modelo de datos preliminar

3. **Casos de Uso Documentados** ✅
   - Visualización pública de datos
   - Gestión administrativa
   - Integración con sensores
   - Sistema de alertas

### Métricas de Cumplimiento

| Métrica | Objetivo | Real | Estado |
|---------|----------|------|--------|
| Requerimientos identificados | 20+ | 23 | ✅ Superado |
| Casos de uso | 10+ | 12 | ✅ Superado |
| Validaciones con stakeholders | 2 | 2 | ✅ Cumplido |
| Días planificados | 15 | 15 | ✅ Cumplido |

---

## 1.10. Conclusiones y Recomendaciones

### Conclusiones

1. **Viabilidad técnica confirmada:** El análisis demostró que es viable desarrollar la plataforma con tecnologías modernas y accesibles (Node.js, React, PostgreSQL).

2. **Requerimientos claros y priorizados:** Se identificaron 23 requerimientos clasificados según metodología MoSCoW, garantizando enfoque en funcionalidades críticas.

3. **Integración IoT factible:** El protocolo HTTP/REST permite integración simple con ESP32, eliminando complejidad de MQTT u otros protocolos.

4. **Modelo de acceso validado:** Acceso público sin login + administrador único satisface necesidades institucionales sin complejidad innecesaria.

5. **Escalabilidad considerada:** Arquitectura modular permite crecimiento futuro (más sensores, tipos de datos, usuarios).

### Recomendaciones

1. **Implementar en fases:** Priorizar funcionalidades "Must Have" en versión 1.0, agregar "Should Have" en versiones posteriores.

2. **Pruebas con sensores reales:** Validar protocolo de comunicación con hardware ESP32 real antes de despliegue masivo.

3. **Documentar API REST:** Generar documentación automática (Swagger/OpenAPI) para facilitar integraciones futuras.

4. **Considerar backup automático:** Implementar respaldos diarios de base de datos para prevenir pérdida de datos históricos.

5. **Monitoreo de rendimiento:** Implementar logging y métricas desde el inicio para detectar cuellos de botella.

6. **Capacitación de usuarios:** Preparar material de capacitación para personal del IIAP que administrará el sistema.

---

## 1.11. Bibliografía

### Libros y Documentación Técnica

1. **Sommerville, I.** (2016). *Software Engineering* (10th ed.). Pearson Education. ISBN: 978-0133943030.

2. **Pressman, R. S., & Maxim, B. R.** (2015). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill Education. ISBN: 978-0078022128.

3. **IEEE** (2014). *IEEE Std 830-1998: Recommended Practice for Software Requirements Specifications*. IEEE Computer Society.

### Documentación de Tecnologías

4. **Node.js Foundation** (2024). *Node.js Documentation*. Recuperado de https://nodejs.org/docs/

5. **Prisma.io** (2024). *Prisma ORM Documentation*. Recuperado de https://www.prisma.io/docs

6. **React Team** (2024). *React Documentation*. Recuperado de https://react.dev/

7. **Leaflet.js** (2024). *Leaflet - An open-source JavaScript library for mobile-friendly interactive maps*. Recuperado de https://leafletjs.com/

### IoT y Sensores

8. **Espressif Systems** (2024). *ESP32 Technical Reference Manual*. Recuperado de https://www.espressif.com/en/products/socs/esp32

9. **Aosong Electronics** (2023). *DHT22 Digital Temperature and Humidity Sensor Datasheet*. Recuperado de https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf

10. **Zhengzhou Winsen Electronics** (2023). *MQ-135 Gas Sensor Technical Manual*. Recuperado de https://www.winsen-sensor.com/sensors/voc-sensor/mq135.html

### Artículos Científicos

11. **Kumar, A., & Hancke, G. P.** (2014). "Energy Efficient Environment Monitoring System Based on the IEEE 802.15.4 Standard for Low Cost Requirements". *IEEE Sensors Journal*, 14(8), 2557-2566. DOI: 10.1109/JSEN.2014.2313625

12. **Saravanan, K., Anusuya, E., Kumar, R., & Son, L. H.** (2018). "Real-time water quality monitoring using Internet of Things in SCADA". *Environmental Monitoring and Assessment*, 190(9), 556. DOI: 10.1007/s10661-018-6914-x

### Estándares y Normativas

13. **ISO/IEC 25010** (2011). *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)*. International Organization for Standardization.

14. **W3C** (2024). *Web Content Accessibility Guidelines (WCAG) 2.2*. Recuperado de https://www.w3.org/WAI/WCAG22/quickref/

### Metodologías

15. **Agile Alliance** (2024). *Agile 101*. Recuperado de https://www.agilealliance.org/agile101/

16. **Scrum.org** (2024). *Scrum Guide*. Recuperado de https://scrumguides.org/

---

**Elaborado por:** Michel Izquierdo
**Fecha:** [Fecha de elaboración]
**Versión:** 1.0
