# Taskflow — Trabajo Práctico Experimental 4

Aplicación web Full Stack para organizar tareas personales. Cada usuario crea una cuenta, inicia sesión y gestiona sus tareas privadas mediante una API protegida con JWT.

## Tecnologías

- **Front-End:** React 19, Vite y CSS.
- **Back-End:** Node.js, Express 5 y API REST.
- **Base de datos:** MongoDB con Mongoose.
- **Seguridad:** bcryptjs para contraseñas, JSON Web Token para autenticación y Helmet para cabeceras HTTP.

## Funcionalidades

- Registro e inicio de sesión con validación de entradas.
- Contraseñas almacenadas como hash bcrypt; nunca se devuelven en la API.
- JWT con duración de 8 horas y middleware que protege las rutas privadas.
- Consulta del perfil autenticado y tareas del usuario.
- Crear, editar, completar, buscar, filtrar y eliminar tareas.
- Aislamiento de datos: un usuario no puede consultar ni modificar tareas de otro.
- Diseño adaptable a móvil y escritorio, con estados de carga y errores.

## Requisitos

- Node.js 20.19 o superior y npm.
- MongoDB local o una URI de MongoDB Atlas. Se incluye `compose.yaml` para iniciar MongoDB local con Docker.

## Ejecución local

1. Instala las dependencias desde la raíz:

   ```bash
   npm install
   ```

2. Inicia MongoDB. Si tienes Docker Desktop:

   ```bash
   docker compose up -d
   ```

   También puedes usar MongoDB instalado localmente o Atlas. Para Atlas, crea un usuario de base de datos, permite la IP del servidor en la lista de acceso y usa la URI `mongodb+srv://...`.

3. Copia `server/.env.example` a `server/.env`. Configura `MONGODB_URI` y sustituye `JWT_SECRET` por un valor aleatorio de al menos 32 caracteres. Puedes generarlo con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. No publiques el archivo `.env`.

4. Inicia el cliente y la API:

   ```bash
   npm run dev
   ```

   Abre `http://127.0.0.1:5173`. La API usa `http://localhost:4000`. En desarrollo, Vite redirige `/api` a la API.

## Variables de entorno

| Variable | Ubicación | Descripción |
| --- | --- | --- |
| `MONGODB_URI` | `server/.env` | URI de MongoDB. |
| `JWT_SECRET` | `server/.env` | Secreto para firmar JWT (mínimo 32 caracteres). |
| `PORT` | `server/.env` | Puerto de la API; predeterminado: `4000`. |
| `CLIENT_ORIGIN` | `server/.env` | Origen permitido por CORS; predeterminado: `http://localhost:5173`. |
| `VITE_API_URL` | `client/.env` | URL de la API cuando cliente y servidor se publican por separado; omitir en desarrollo local. |

## API

| Método | Ruta | Descripción | JWT |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Estado de la API y conexión con MongoDB. | No |
| `POST` | `/api/auth/register` | Registro; devuelve usuario y token. | No |
| `POST` | `/api/auth/login` | Inicio de sesión; devuelve usuario y token. | No |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado. | Sí |
| `GET` | `/api/tasks` | Lista de tareas propias. | Sí |
| `POST` | `/api/tasks` | Crea una tarea propia. | Sí |
| `PATCH` | `/api/tasks/:id` | Edita título, descripción o estado. | Sí |
| `DELETE` | `/api/tasks/:id` | Elimina una tarea propia. | Sí |

En las rutas privadas, envía `Authorization: Bearer <token>`. El cliente conserva el token en `sessionStorage`, por lo que cerrar la pestaña elimina la sesión local.

## Pruebas y compilación

```bash
npm test
npm run build
```

La prueba de integración inicia un MongoDB temporal, comprueba registro, inicio de sesión, token inválido, operaciones CRUD y aislamiento entre dos usuarios. `npm run build` genera el Front-End de producción en `client/dist`.

## Estructura

```text
client/           Aplicación React
server/src/       API Express, modelos Mongoose y middleware JWT
server/test/      Prueba de integración
compose.yaml      MongoDB local opcional
```
