# Sistema de Gestión de Incidentes - CORPOELEC

Sistema de automatización para el registro y seguimiento de incidentes en materia de seguridad e higiene ocupacional en las instalaciones de CORPOELEC. La aplicación permite gestionar trabajadores, departamentos, centros de trabajo y reportes de incidentes con evidencias adjuntas.

## Características Principales

- **Autenticación de usuarios** con JWT
- **CRUD completo de trabajadores** con datos personales y laborales
- **Gestión de departamentos** con conteo de trabajadores
- **Gestión de centros de trabajo** con ubicación y conteo de trabajadores
- **Sistema de reportes** con:
  - Tipos: incidente, accidente, riesgo, capacitación, visita, otro
  - Severidad: baja, media, alta, crítica
  - Estados: pendiente, en revisión, resuelto, cerrado
  - **Adjunto de evidencias** (imágenes y documentos en Base64)
- **Búsqueda en tiempo real** en todas las secciones
- **Navegación encadenada**: Centro de Trabajo → Departamento → Trabajador
- **Diseño responsivo** para escritorio, tablet y móvil
- **Menú hamburguesa** en dispositivos móviles
- **Dropdown de usuario** con opción de cerrar sesión

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18.x | Entorno de ejecución |
| Express | 5.2.1 | Framework para API REST |
| MongoDB | 6.x | Base de datos NoSQL |
| Mongoose | 7.5.0 | ODM para MongoDB |
| JWT | 9.0.2 | Autenticación basada en tokens |
| bcryptjs | 2.4.3 | Encriptación de contraseñas |
| Joi | 17.11.0 | Validación de datos |
| Helmet | 7.0.0 | Seguridad de cabeceras HTTP |
| CORS | 2.8.6 | Políticas de seguridad |
| express-rate-limit | 6.10.0 | Limitación de peticiones |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| HTML5 | - | Estructura de páginas |
| CSS3 | - | Estilos y animaciones |
| JavaScript ES6 | - | Lógica de aplicación |
| Fetch API | - | Comunicación con backend |
| SVG | - | Iconografía del sistema |


## 📁 Estructura del Proyecto

```
sistema-gestion-incidentes/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Configuración de conexión a MongoDB
│   │   └── auth.js               # Configuración de JWT y encriptación
│   ├── controllers/
│   │   ├── authController.js     # Controlador de autenticación
│   │   ├── departmentController.js # Controlador de departamentos
│   │   ├── reportController.js   # Controlador de reportes
│   │   ├── workCenterController.js # Controlador de centros de trabajo
│   │   └── workerController.js   # Controlador de trabajadores
│   ├── models/
│   │   ├── Department.js         # Modelo de departamento
│   │   ├── Report.js             # Modelo de reporte
│   │   ├── User.js               # Modelo de usuario
│   │   ├── WorkCenter.js         # Modelo de centro de trabajo
│   │   └── Worker.js             # Modelo de trabajador
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   ├── departmentRoutes.js   # Rutas de departamentos
│   │   ├── reportRoutes.js       # Rutas de reportes
│   │   ├── workCenterRoutes.js   # Rutas de centros de trabajo
│   │   └── workerRoutes.js       # Rutas de trabajadores
│   ├── middleware/
│   │   ├── auth.js               # Middleware de autenticación
│   │   └── validation.js         # Middleware de validación
│   └── server.js                 # Punto de entrada del servidor
├── frontend/
│   ├── pages/
│   │   └── index.html            # Página principal
│   ├── components/
│   │   ├── header.html           # Encabezado reutilizable
│   │   ├── nav.html              # Navegación reutilizable
│   │   └── footer.html           # Pie de página reutilizable
│   ├── css/
│   │   ├── styles.css            # Estilos principales
│   │   └── components.css        # Estilos de componentes
│   ├── icons/
│   │   └── [archivos SVG]        # Iconografía del sistema
│   └── js/
│       ├── app.js                # Inicialización de la app
│       ├── api.js                # Cliente API
│       ├── auth.js               # Lógica de autenticación
│       ├── state.js              # Estado global
│       ├── loadComponents.js     # Carga de componentes HTML
│       ├── utils/
│       │   ├── helpers.js        # Funciones auxiliares
│       │   └── ui.js             # Funciones de interfaz
│       └── components/
│           ├── workers.js        # Lógica de trabajadores
│           ├── departments.js    # Lógica de departamentos
│           ├── workCenters.js    # Lógica de centros de trabajo
│           └── reports.js        # Lógica de reportes
├── package.json
├── package-lock.json
├── seed.js                         # Script de datos de ejemplo
└── README.md
```

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Inicio de sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Trabajadores

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/workers` | Listar trabajadores | Sí |
| POST | `/api/workers` | Crear trabajador | Sí |
| GET | `/api/workers/:id` | Obtener trabajador | Sí |
| PUT | `/api/workers/:id` | Actualizar trabajador | Sí |
| DELETE | `/api/workers/:id` | Eliminar trabajador | Sí (admin) |
| GET | `/api/workers/:id/reports` | Reportes del trabajador | Sí |

### Departamentos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/departments` | Listar departamentos | Sí |
| POST | `/api/departments` | Crear departamento | Sí |
| GET | `/api/departments/:id` | Obtener departamento | Sí |
| PUT | `/api/departments/:id` | Actualizar departamento | Sí |
| DELETE | `/api/departments/:id` | Eliminar departamento | Sí (admin) |

### Centros de Trabajo

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/work-centers` | Listar centros | Sí |
| POST | `/api/work-centers` | Crear centro | Sí |
| GET | `/api/work-centers/:id` | Obtener centro | Sí |
| PUT | `/api/work-centers/:id` | Actualizar centro | Sí |
| DELETE | `/api/work-centers/:id` | Eliminar centro | Sí (admin) |

### Reportes

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/reports` | Listar reportes | Sí |
| POST | `/api/reports` | Crear reporte | Sí |
| GET | `/api/reports/:id` | Obtener reporte | Sí |
| PUT | `/api/reports/:id` | Actualizar reporte | Sí |
| DELETE | `/api/reports/:id` | Eliminar reporte | Sí |

## Instalación y Ejecución

### Requisitos Previos

- Node.js 18.x o superior
- MongoDB 6.x o superior
- npm 9.x o superior

### Pasos de Instalación

**1. Clonar el repositorio**

```bash
git clone https://github.com/verofpp/Sistema-reporte-de-incidentes.git
cd Sistema-reporte-de-incidentes
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Iniciar MongoDB**

```bash
# En Windows
net start MongoDB

# En macOS
brew services start mongodb-community

# En Linux
sudo systemctl start mongod
```

**4. Poblar la base de datos con datos de ejemplo**

```bash
node seed.js
```

**5. Iniciar el servidor backend**

```bash
node backend/server.js
```

**6. Abrir el frontend**

Abrir el archivo `frontend/pages/index.html` en el navegador o usar Live Server.

## Credenciales de Prueba

Una vez ejecutado el seed, se pueden usar las siguientes credenciales:

| Campo | Valor |
|-------|-------|
| Email | `admin@corpoelec.com` |
| Contraseña | `admin123` |

## Modelos de Datos

### User (Usuarios)

```javascript
{
  nombre: String,
  email: String (único),
  password: String (encriptado),
  rol: 'admin' | 'user',
  activo: Boolean
}
```

### Worker (Trabajadores)

```javascript
{
  primer_nombre: String,
  segundo_nombre: String,
  primer_apellido: String,
  segundo_apellido: String,
  cedula: String (único),
  numero_trabajador: String (único),
  email: String,
  telefono: String,
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir',
  departmentId: ObjectId (ref: Department),
  workCenterId: ObjectId (ref: WorkCenter),
  cargo: String,
  fecha_nacimiento: Date,
  fecha_ingreso: Date,
  activo: Boolean
}
```

### Department (Departamentos)

```javascript
{
  nombre: String (único),
  activo: Boolean
}
```

### WorkCenter (Centros de Trabajo)

```javascript
{
  nombre: String (único),
  ubicacion: String,
  activo: Boolean
}
```

### Report (Reportes)

```javascript
{
  workerId: ObjectId (ref: Worker),
  titulo: String,
  descripcion: String,
  tipo: 'incidente' | 'accidente' | 'riesgo' | 'capacitacion' | 'visita' | 'otro',
  severidad: 'baja' | 'media' | 'alta' | 'critica',
  fecha_reporte: Date,
  estado: 'pendiente' | 'en_revision' | 'resuelto' | 'cerrado',
  evidencias: String (nombre del archivo),
  evidenciaData: String (Base64),
  evidenciaTipo: String (MIME type),
  activo: Boolean
}
```

## Funcionalidades del Frontend

### Navegación

- **Trabajadores**: Lista completa con búsqueda, creación, edición y eliminación
- **Departamentos**: Lista con conteo de trabajadores y navegación a trabajadores
- **Centros de Trabajo**: Lista con conteo de trabajadores y navegación a departamentos
- **Reportes**: Lista con filtros y gestión de evidencias

### Interacciones

- **Click en trabajador**: Muestra detalle completo con sus reportes
- **Click en departamento**: Muestra trabajadores del departamento
- **Click en centro de trabajo**: Muestra departamentos con trabajadores
- **Navegación encadenada**: Centro → Departamento → Trabajador

### Responsive

- **Escritorio**: Vista completa con navegación horizontal
- **Tablet**: Ajuste de tamaños y espaciados
- **Móvil**: Menú hamburguesa, botones verticales, layout optimizado

## Seguridad

- **Encriptación de contraseñas** con bcrypt
- **Autenticación JWT** con expiración de 7 días
- **Rate limiting** (100 peticiones por 15 minutos por IP)
- **Headers de seguridad** con Helmet
- **Validación de datos** con Joi
- **Soft delete** para preservar el historial

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia el servidor con nodemon (recarga automática) |
| `node seed.js` | Pobla la base de datos con datos de ejemplo |
