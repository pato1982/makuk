# MAKUK - Tienda de Joyería Artesanal

Sitio web e-commerce para MAKUK, marca de joyería artesanal chilena. Incluye catálogo de productos, panel de administración completo y gestión de contenido dinámico.

## Stack Tecnológico

- **Frontend:** React 19 + Vite + React Router 7
- **Backend:** Node.js + Express 4 + MySQL (mysql2)
- **Autenticación:** JWT (access + refresh tokens)
- **Servidor:** VPS con NGINX (reverse proxy) + PM2

## Estructura del Proyecto

```
makuk-react/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── context/            # AuthContext, CartContext, ContentContext
│   ├── pages/              # Páginas públicas y admin
│   ├── services/           # api.js (funciones fetch)
│   └── styles/             # CSS por sección
├── backend/
│   └── src/
│       ├── config/         # db.js, seed.js
│       ├── controllers/    # Lógica de negocio
│       ├── middleware/     # Auth middleware (JWT)
│       ├── routes/         # Rutas Express
│       └── server.js       # Entry point
└── public/                 # Assets estáticos
```

## Configuración

### Backend

1. Copiar `backend/.env.example` a `backend/.env` y completar las variables
2. Crear la base de datos MySQL y el usuario
3. Ejecutar el seed: `npm run seed`
4. Iniciar: `npm run dev` (desarrollo) o `npm start` (producción)

### Frontend

1. Instalar dependencias: `npm install`
2. Configurar la URL de la API en `src/services/api.js`
3. Desarrollo: `npm run dev`
4. Build: `npm run build`

## Deploy

El deploy del frontend se hace desde el VPS:

```bash
cd /var/www/makuk/frontend/repo
git pull && npm install && npm run build
rm -rf ../build/* && cp -r dist/* ../build/
```

El backend corre con PM2:

```bash
cd /var/www/makuk/backend
pm2 restart makuk-api
```

## Testing

```bash
cd backend && npm test
```
