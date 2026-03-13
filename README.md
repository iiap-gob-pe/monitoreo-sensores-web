# Sistema de Monitoreo Ambiental IIAP

Plataforma web para el monitoreo ambiental en tiempo real, desarrollada para el Instituto de Investigaciones de la Amazonía Peruana (IIAP). Este sistema consolida datos capturados internamente por dispositivos IoT (ESP32) para medir parámetros críticos como temperatura, humedad, calidad del aire y geoperfil espacial.

---

## Índice

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Estructura y Módulos](#estructura-y-módulos)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos del Entorno](#requisitos-del-entorno)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Repositorio](#estructura-del-repositorio)

---

## Descripción del Proyecto

El Sistema de Monitoreo Ambiental IIAP abstrae la recolección, consolidación y representación cartográfica de datos ambientales en la región amazónica. Utiliza protocolos RESTful para sincronizar información levantada por hardware autónomo (sensores MQ, DHT y GPS) y la entrega a un panel analítico integral para coadyuvar a la toma de decisiones ecológicas y la gestión de la investigación.

## Estructura y Módulos

El proyecto está dividido en interfaces públicas y privadas con los siguientes módulos principales:

### Panel de Control (Dashboard)
- **Mapa en Tiempo Real:** Interfaz geográfica (Leaflet) para observar los nodos fijos y en movimiento.
- **Mapas de Calor:** Agregación estadística espacial para las métricas de Temperatura, Monóxido de Carbono (CO) y Dióxido de Carbono (CO2).
- **Control de Recorridos:** Visualización topológica para dispositivos de telemetría móvil mediante trazado histórico y reducción de ruido geográfico.

### Módulo Administrativo
- **Gestión de Sensores:** Mantenimiento (CRUD) y categorización de dispositivos IoT en zonas geográficas administradas.
- **Configuración de Alertas:** Parametrización de tolerancias ambientales que activan notificaciones ante escenarios críticos.
- **Administración de Acceso:** Rol based access control (RBAC) con autenticación basada en estándares JWT orientada a investigadores.

---

## Tecnologías Utilizadas

La arquitectura de la solución se basa en una división monolítica separada (Backend/Frontend):

### Backend
* **Entorno de Ejecución:** Node.js (v22.16.0 o superior).
* **Framework Web:** Express.js (v4.21.2)
* **Acceso a Datos:** Prisma ORM (v6.14.0)
* **Base de Datos:** PostgreSQL (v12 o superior)
* **Seguridad:** JSON Web Tokens (JWT) y Bcrypt local.

### Frontend
* **Core:** React (v19.1.1) ejecutado en Vite.
* **Estilización:** Tailwind CSS (v3.4.17)
* **Cartografía:** Leaflet (v1.9.4) junto con React-Leaflet.
* **Gráficas:** Chart.js 

---

## Requisitos del Entorno

Antes de iniciar la instalación de este proyecto, asegúrese de tener configurados los siguientes paquetes en su sistema operativo:

* Node.js (Versión 22.16.0 como mínimo).
* Gestor de paquetes npm (Versión 10.0.0 o superior).
* Servidor PostgreSQL local o remoto (Versión 12+).
* Git para la clonación del repositorio original.

---

## Instalación y Configuración

Siga los siguientes pasos para ejecutar el proyecto en su ambiente de desarrollo local:

### 1. Clonación del Repositorio
\`\`\`bash
git clone https://github.com/iiap/sensor_monitoreo.git
cd sensor_monitoreo
\`\`\`

### 2. Despliegue del Backend
El directorio contenedor de la API engloba la lógica de base de datos.
\`\`\`bash
# Posicionarse en el directorio del API
cd sensor_monitoreo_api

# Instalación de pre-requisitos de Node
npm install

# Creación de variables de entorno recomendadas
cp .env.example .env

# Configure obligatoriamente el archivo .env con las credenciales de PSQL. Ejemplo:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/iiap_db"

# Aplicación de las migraciones SQL
npx prisma migrate dev --name init
\`\`\`

### 3. Despliegue del Frontend
El directorio frontend se comunica mediante las variables de Vite.
\`\`\`bash
# Desde la raíz del repositorio
cd environmental-monitoring-web

# Instalación de dependencias React
npm install

# Creación de variables de entorno
cp .env.example .env

# Verifique que .env contenga el enlace al endpoint de desarrollo:
# VITE_API_URL=http://localhost:3000/api
\`\`\`

### 4. Inicialización
Necesitará requerir ambos subproyectos en terminales separadas.
\`\`\`bash
# En la consola del Backend:
npm run dev

# En la consola del Frontend:
npm run dev
\`\`\`

Acceda al navegador de su red local dirigido a \`http://localhost:5173\`.

---

## Estructura del Repositorio

La arquitectura del proyecto separa estrictamente las responsabilidades del cliente y del servidor del siguiente modo:

\`\`\`
sensor_monitoreo/
├── environmental-monitoring-web/   # Aplicación Frontend React.js (Vite)
│   ├── public/                     # Archivos estáticos accesibles directamente
│   ├── src/
│   │   ├── assets/                 # Imágenes, iconos y recursos multimedia
│   │   ├── components/             # Componentes React Re-usables
│   │   │   ├── auth/               # Formularios de autenticación
│   │   │   ├── common/             # Botones, Modales, Tarjetas aisladas
│   │   │   ├── dashboard/          # MapView.jsx, Estadisticas e Indicadores
│   │   │   └── layout/             # Sidebar, Navbar y Contenedor Principal
│   │   ├── config/                 # Constantes globales y variables predefinidas
│   │   ├── context/                # Estados globales (AuthContext)
│   │   ├── hooks/                  # Custom React Hooks
│   │   ├── pages/                  # Vistas enrutadas (Dashboard, Login, Admin, Perfil)
│   │   ├── services/               # Consumidores Axios hacia Endpoints de la API
│   │   └── utils/                  # Herramientas matemáticas y formateadores
│   ├── index.html                  # Punto de montaje del Virtual DOM
│   ├── package.json                # Dependencias Frontend
│   ├── tailwind.config.js          # Directrices de Diseño Tailwind
│   └── vite.config.js              # Configuración de compilador y puerto local
│
├── sensor_monitoreo_api/           # Servidor Backend RESTful API (Node.js)
│   ├── prisma/                     # Motor Relacional ORM
│   │   ├── migrations/             # Historial de cambios SQL de Base de Datos
│   │   └── schema.prisma           # Modelaje de Tablas (Lecturas, Sensores, Usuarios)
│   ├── rutas/                      # Respaldos de archivos CSV de módulos GPS
│   ├── scripts/                    # Rutinas asíncronas de base de datos
│   │   ├── delete_sensor.js        # Purga de sensores por consola
│   │   ├── importar_datos.js       # Migradores en bloque
│   │   └── importar_rutas.js       # Sanitizador relacional de GPS CSV
│   ├── src/
│   │   ├── config/                 # Pasarelas de conexión
│   │   ├── controllers/            # Lógica de Negocio 
│   │   │   ├── alertaController.js
│   │   │   ├── authController.js
│   │   │   ├── lecturaController.js
│   │   │   ├── recorridosController.js
│   │   │   ├── sensorController.js
│   │   │   └── usuarioController.js
│   │   ├── middlewares/            # Interceptores Express
│   │   │   ├── auth.js             # Verificador JWT
│   │   │   └── validator.js        # Inspector de Payloads
│   │   ├── routes/                 # Exposición de Rutas al cliente
│   │   │   └── [endpoints].js      
│   │   └── app.js                  # Orquestador de Express JS
│   ├── server.js                   # Ejecutor de Puerto HTTP
│   └── package.json                # Dependencias Backend
│
├── docs/                           # Central de archivos documentales (UML, Pruebas y Specs)
│   ├── Actividades/
│   └── Entregables/
├── .gitignore                      # Reglas de exclusión Git
└── README.md                       # Documentación inicial de proyecto
\`\`\`
