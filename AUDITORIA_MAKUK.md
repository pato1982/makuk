# AUDITORÍA INTEGRAL — MAKUK Joyería Artesanal

> **Fecha:** 4 de marzo de 2026
> **Proyecto:** MAKUK — Plataforma e-commerce de joyería artesanal tejida en cobre
> **Stack:** React 19 + Vite 7 | Express 4 + MySQL 8 | JWT Auth
> **Equipo auditor:** 12 especialistas (Architect, Security, Frontend, Backend, DBA, DevOps, QA, Code Reviewer, API Designer, UI/UX, Performance, Tech Writer)

---

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Arquitectura Actual](#arquitectura-actual)
- [1. Architect — Arquitectura de Software](#1-architect--arquitectura-de-software)
- [2. Security Auditor — Seguridad](#2-security-auditor--seguridad)
- [3. Frontend Dev — Componentes React](#3-frontend-dev--componentes-react)
- [4. Backend Dev — API y Lógica de Negocio](#4-backend-dev--api-y-lógica-de-negocio)
- [5. DBA — Base de Datos MySQL](#5-dba--base-de-datos-mysql)
- [6. DevOps — Deployment e Infraestructura](#6-devops--deployment-e-infraestructura)
- [7. QA Tester — Cobertura de Tests](#7-qa-tester--cobertura-de-tests)
- [8. Code Reviewer — Calidad de Código](#8-code-reviewer--calidad-de-código)
- [9. API Designer — Diseño de Endpoints](#9-api-designer--diseño-de-endpoints)
- [10. UI/UX — Experiencia de Usuario](#10-uiux--experiencia-de-usuario)
- [11. Perf Engineer — Performance](#11-perf-engineer--performance)
- [12. Tech Writer — Documentación](#12-tech-writer--documentación)
- [Resumen Consolidado por Severidad](#resumen-consolidado-por-severidad)
- [Top 10 Acciones Prioritarias](#top-10-acciones-prioritarias)
- [Veredicto Final](#veredicto-final)

---

## Resumen Ejecutivo

**MAKUK** es una plataforma e-commerce full-stack para joyería artesanal tejida en cobre, con un sitio público (Home, Productos), un panel admin CMS completo (10 secciones editables), carrito de compras en cliente y autenticación JWT.

Se realizó una auditoría integral con **12 especialistas**, analizando todo el código fuente del proyecto. Se identificaron **95 hallazgos** distribuidos así:

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 **CRÍTICO** | 10 | Requieren atención inmediata |
| 🟠 **ALTO** | 38 | Mejoras significativas necesarias |
| 🟡 **MEDIO** | 36 | Deberían abordarse progresivamente |
| 🔵 **BAJO** | 11 | Nice to have |

Las áreas más afectadas son **Seguridad** (11 hallazgos, 3 críticos) y **Testing** (0% cobertura, 2 críticos).

---

## Arquitectura Actual

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE (Navegador)                    │
│                                                         │
│  React 19 + Vite 7                                      │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ AuthContext  │ │ContentContext│ │ CartContext   │     │
│  │ (JWT)       │ │(All content) │ │(localStorage) │     │
│  └──────┬──────┘ └──────┬───────┘ └──────────────┘     │
│         │               │                               │
│  ┌──────┴───────────────┴───────┐                      │
│  │       api.js (fetch wrapper) │                      │
│  └──────────────┬───────────────┘                      │
│                 │ HTTP                                   │
└─────────────────┼───────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────┐
│                 ▼    SERVIDOR (Express 4)                │
│  ┌──────────────────────────┐                           │
│  │       server.js          │                           │
│  │  cors() + json(10mb)     │                           │
│  └────────────┬─────────────┘                           │
│               │                                         │
│  ┌────────────┼─────────────────────────────────┐      │
│  │  Routers:  │                                  │      │
│  │  /api/auth    → authController     (5 endpts) │      │
│  │  /api/content → contentController  (1 endpt)  │      │
│  │  /api/admin   → adminController    (13 endpts)│      │
│  │  /api/upload  → multer + UUID      (1 endpt)  │      │
│  └────────────┬──────────────────────────────────┘      │
│               │                                         │
│  ┌────────────┼──────────┐  ┌────────────────────┐     │
│  │  Middleware Auth JWT   │  │  /uploads (static)  │     │
│  │  (verifyAccessToken)   │  │  /var/www/makuk/    │     │
│  └────────────┬──────────┘  └────────────────────┘     │
│               │                                         │
└───────────────┼─────────────────────────────────────────┘
                │
┌───────────────┼─────────────────────────────────────────┐
│               ▼    MySQL 8.0                            │
│  23 tablas: users, refresh_tokens, password_recovery,   │
│  header, nav_items, hero, intro, categories_section,    │
│  categories, products, unique_pieces_section, about,    │
│  about_features, process_section, process_steps,        │
│  worldwide, worldwide_stats, worldwide_countries,       │
│  testimonials_section, testimonials, footer,            │
│  products_page                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Architect — Arquitectura de Software

**Auditor:** Arquitecto de Software Senior
**Alcance:** Diseño de sistemas, separación de capas, patrones, escalabilidad

### 🔴 CRÍTICOS

#### 1.1 Sin code splitting — Todo el admin se carga para visitantes públicos
- **Archivo:** `src/App.jsx` líneas 1-26
- **Problema:** Las 10 páginas del panel admin (`AdminLayout`, `Dashboard`, `AdminHeader`, `AdminCategories`, `AdminUniquePieces`, `AdminAbout`, `AdminProcess`, `AdminWorldwide`, `AdminTestimonials`, `AdminFooter`, `AdminProducts`, `AdminProductsPage`, `AdminControl`) se importan estáticamente en `App.jsx`. Esto significa que un visitante que solo quiere ver la tienda descarga ~60% de código JavaScript que nunca va a usar.
- **Impacto:** Bundle inicial innecesariamente grande, tiempo de carga mayor, peor puntuación en Lighthouse.
- **Remediación:** Usar `React.lazy()` + `<Suspense>` para las rutas admin:
  ```jsx
  const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
  const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
  // ... etc
  ```

### 🟠 ALTOS

#### 1.2 Monolito de contenido — Se carga TODO en un solo fetch
- **Archivo:** `src/context/ContentContext.jsx` línea 15
- **Problema:** Al montar la app, `ContentProvider` llama a `fetchContentApi()` que ejecuta `GET /api/content`, el cual a su vez ejecuta **19 queries SQL en paralelo** y retorna todo el contenido del sitio (header, hero, intro, categorías, productos, about, process, worldwide, testimonials, footer). No hay carga por demanda ni paginación.
- **Impacto:** Primera carga lenta, desperdicio de ancho de banda para páginas que no se visitan, 19 conexiones simultáneas al pool de MySQL.
- **Remediación:** Dividir en endpoints por sección (`/api/content/header`, `/api/content/hero`, etc.) y cargar bajo demanda según la ruta activa.

#### 1.3 Sin capa de servicios en backend
- **Archivo:** `backend/src/controllers/adminController.js`
- **Problema:** Los controladores contienen lógica de negocio Y acceso a datos mezclados en la misma función. No existe una capa `services/` que separe responsabilidades. Por ejemplo, `updateCategories` tiene la lógica de transacción, las queries SQL y el mapeo de datos, todo junto.
- **Impacto:** Dificulta testing unitario, reutilización de lógica y mantenimiento a largo plazo.
- **Remediación:** Crear `backend/src/services/` con módulos por dominio (`categoryService.js`, `productService.js`, etc.) que encapsulen las operaciones de base de datos.

#### 1.4 Sin Error Boundaries en React
- **Archivo:** `src/App.jsx`
- **Problema:** No hay ningún componente `ErrorBoundary` en la jerarquía de React. Si cualquier componente lanza un error durante el render, **toda la aplicación se crashea** y el usuario ve una pantalla en blanco.
- **Impacto:** Una imagen rota, un dato nulo inesperado o un error de red puede tumbar toda la app.
- **Remediación:** Envolver secciones críticas con `ErrorBoundary` que muestre un fallback amigable.

### 🟡 MEDIOS

#### 1.5 Carrito solo en cliente (localStorage)
- **Archivo:** `src/context/CartContext.jsx`
- **Problema:** El carrito de compras vive exclusivamente en `localStorage` del navegador. No se persiste en el servidor.
- **Impacto:** Si el usuario cambia de dispositivo, borra datos del navegador, o usa modo incógnito, pierde su carrito. No hay forma de recuperar carritos abandonados ni analytics de conversión.
- **Remediación:** Considerar persistir el carrito en backend (vinculado a sesión o usuario) para mejorar la experiencia cross-device.

#### 1.6 Patrón destructivo delete-all + re-insert
- **Archivo:** `backend/src/controllers/adminController.js` líneas 63-79, 88-115, 145-161, 170-187, 200-224, 228-251
- **Problema:** Para actualizar secciones como categorías, productos, testimonios, etc., el sistema ejecuta `DELETE FROM [tabla]` y luego reinserta todos los registros nuevos. Esto genera IDs auto-incrementales nuevos cada vez, rompe cualquier referencia externa y causa fragmentación en la tabla.
- **Impacto:** Pérdida de IDs estables, imposibilidad de crear relaciones futuras (ej: productos favoritos, historial de pedidos), y potencial pérdida de datos si la transacción falla entre el DELETE y los INSERTs.
- **Remediación:** Implementar upsert (`INSERT ... ON DUPLICATE KEY UPDATE`) o PATCH individual por registro.

### 🔵 BAJOS

#### 1.7 Sin versionado de API
- **Archivo:** `backend/src/server.js` líneas 22-25
- **Problema:** Las rutas se definen como `/api/auth`, `/api/content` sin número de versión.
- **Impacto:** Cuando se necesiten cambios breaking en la API, no habrá forma de mantener compatibilidad con clientes existentes.
- **Remediación:** Usar `/api/v1/auth`, `/api/v1/content`, etc.

---

## 2. Security Auditor — Seguridad

**Auditor:** Security Auditor Senior
**Alcance:** OWASP Top 10, vulnerabilidades, hardening
**Framework:** Clasificación basada en [OWASP Top 10 2021](https://owasp.org/Top10/)

### 🔴 CRÍTICOS

#### 2.1 Ejecución de comandos del sistema operativo (Command Injection Risk)
- **OWASP:** A03 - Injection
- **Archivo:** `backend/src/controllers/adminController.js` línea 287
- **Código afectado:**
  ```javascript
  const { execSync } = await import('child_process');
  const dfOutput = execSync("df -B1 / | tail -1").toString().trim();
  ```
- **Problema:** La función `getStats` importa dinámicamente `child_process` y ejecuta un comando del sistema operativo (`df -B1 / | tail -1`) de forma síncrona. Aunque actualmente el comando está hardcodeado, este patrón:
  1. **Bloquea el event loop** de Node.js mientras ejecuta el comando.
  2. Establece un precedente peligroso de uso de `execSync` en controladores.
  3. Puede fallar en sistemas Windows (el comando `df` no existe).
- **Impacto:** Riesgo de command injection si se modifica para aceptar parámetros. Bloqueo del servidor durante la ejecución.
- **Remediación:** Usar la librería `check-disk-space` o `node:fs.statfs` para obtener información del disco de forma segura y asíncrona.

#### 2.2 Credenciales por defecto en producción
- **OWASP:** A07 - Identification and Authentication Failures
- **Archivo:** `backend/src/config/seed.js` (referenciado en seed.sql)
- **Problema:** El sistema se inicializa con credenciales por defecto (`admin@makuk.cl` / `makuk2024`) mediante el script de seeding. Si estas credenciales no se cambian antes del deployment a producción, cualquier persona que conozca el código fuente puede acceder al panel admin.
- **Impacto:** Acceso completo al panel de administración: modificación de contenido, subida de archivos, acceso a estadísticas del servidor.
- **Remediación:**
  1. Forzar cambio de contraseña en primer login.
  2. Generar contraseña aleatoria durante el seeding y mostrarla una sola vez.
  3. Agregar política de complejidad de contraseñas.

#### 2.3 CORS completamente abierto
- **OWASP:** A05 - Security Misconfiguration
- **Archivo:** `backend/src/server.js` línea 13
- **Código afectado:**
  ```javascript
  app.use(cors());
  ```
- **Problema:** `cors()` sin opciones acepta peticiones desde **cualquier origen** (`Access-Control-Allow-Origin: *`). Esto permite que cualquier sitio web malicioso haga peticiones a la API de MAKUK desde el navegador de un usuario autenticado.
- **Impacto:** Un atacante podría crear un sitio que, al ser visitado por un admin de MAKUK, ejecute operaciones en la API usando sus credenciales.
- **Remediación:**
  ```javascript
  app.use(cors({
    origin: ['https://makuk.cl', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));
  ```

### 🟠 ALTOS

#### 2.4 Tokens JWT almacenados en localStorage (XSS vulnerable)
- **OWASP:** A07 - Identification and Authentication Failures
- **Archivo:** `src/services/api.js` líneas 6-7, 13-18
- **Código afectado:**
  ```javascript
  function getAccessToken() {
    return localStorage.getItem('makuk_access_token');
  }
  function saveTokens(accessToken, refreshToken) {
    localStorage.setItem('makuk_access_token', accessToken);
    localStorage.setItem('makuk_refresh_token', refreshToken);
  }
  ```
- **Problema:** `localStorage` es accesible desde cualquier script JavaScript en la página. Si existe una vulnerabilidad XSS (incluso en una librería de terceros), un atacante puede robar ambos tokens.
- **Impacto:** Robo de sesión completa, incluyendo el refresh token que dura 7 días.
- **Remediación:** Mover los tokens a cookies con flags `httpOnly`, `Secure`, `SameSite=Strict`. El access token puede permanecer en memoria (variable JS) para peticiones API.

#### 2.5 IP del servidor expuesta en repositorio
- **OWASP:** A05 - Security Misconfiguration
- **Archivo:** `vite.config.js` líneas 10-11
- **Código afectado:**
  ```javascript
  '/api': {
    target: 'http://186.64.122.100',
  ```
- **Problema:** La dirección IP real del servidor de producción está hardcodeada en un archivo del repositorio. Si el repo es público o se comparte, facilita ataques dirigidos (port scanning, DoS, intentos de acceso SSH).
- **Impacto:** Exposición del servidor a ataques directos sin necesidad de resolver DNS.
- **Remediación:** Usar variable de entorno: `target: process.env.VITE_API_TARGET || 'http://localhost:3001'`.

#### 2.6 Sin headers de seguridad HTTP
- **OWASP:** A05 - Security Misconfiguration
- **Archivo:** `backend/src/server.js`
- **Problema:** El servidor no usa `helmet` ni configura headers de seguridad manualmente. Faltan:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (CSP)
  - `X-XSS-Protection: 0` (deprecated pero útil para navegadores viejos)
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Impacto:** El sitio es vulnerable a clickjacking, MIME sniffing, y ataques man-in-the-middle si no se fuerza HTTPS.
- **Remediación:** `npm install helmet` y agregar `app.use(helmet())` antes de las rutas.

#### 2.7 Sin verificación de rol en middleware de autenticación
- **OWASP:** A01 - Broken Access Control
- **Archivo:** `backend/src/middleware/auth.js` líneas 3-22
- **Código afectado:**
  ```javascript
  export function requireAuth(req, res, next) {
    // ... verifica JWT pero NO verifica rol
    const payload = verifyAccessToken(token);
    req.user = payload;
    next(); // ← Cualquier usuario autenticado pasa
  }
  ```
- **Problema:** El middleware `requireAuth` solo verifica que el JWT sea válido, pero **no verifica que el usuario tenga rol `admin`**. Si existieran múltiples roles (o si se agregan en el futuro), cualquier usuario autenticado podría acceder a todas las rutas admin.
- **Impacto:** Escalación de privilegios potencial.
- **Remediación:** Agregar middleware `requireRole('admin')` o verificar `req.user.role === 'admin'` en las rutas admin.

#### 2.8 Sin rate limiting en endpoint de login
- **OWASP:** A07 - Identification and Authentication Failures
- **Archivo:** `backend/src/routes/auth.js`
- **Problema:** El endpoint `POST /api/auth/login` no tiene rate limiting. Un atacante puede intentar miles de combinaciones de email/contraseña por segundo sin ninguna restricción.
- **Impacto:** Ataques de fuerza bruta contra las credenciales de administrador.
- **Remediación:**
  ```javascript
  import rateLimit from 'express-rate-limit';
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: { error: 'Demasiados intentos. Intenta en 15 minutos.' }
  });
  router.post('/login', loginLimiter, login);
  ```

#### 2.9 Recovery key expuesta en console.log
- **OWASP:** A09 - Security Logging and Monitoring Failures
- **Archivo:** `backend/src/controllers/authController.js` línea 132
- **Código afectado:**
  ```javascript
  console.log(`Recovery key para ${email}: ${recoveryKey}`);
  ```
- **Problema:** La clave de recuperación de contraseña se imprime en los logs del servidor en texto plano. Cualquier persona con acceso a los logs puede usar esta clave para resetear la contraseña del admin.
- **Impacto:** Compromiso de cuentas si los logs son accesibles.
- **Remediación:** Enviar la recovery key por email (integrar servicio de email como SendGrid o Resend) y **nunca** logguearla. Si se necesita debug, usar un flag de entorno.

### 🟡 MEDIOS

#### 2.10 Sin validación de input en controladores admin
- **OWASP:** A03 - Injection
- **Archivo:** `backend/src/controllers/adminController.js` (todos los endpoints)
- **Problema:** Los controladores destructuran el `req.body` directamente sin validar tipos, campos requeridos, longitudes máximas ni formatos. Ejemplo:
  ```javascript
  const { title, subtitle, items } = req.body; // Sin validación
  ```
  Aunque las queries usan parámetros preparados (protección contra SQL injection), la falta de validación permite datos malformados o inesperados.
- **Impacto:** Datos corruptos en la base de datos, errores inesperados, potenciales crashes.
- **Remediación:** Implementar validación con Zod o Joi en cada endpoint.

#### 2.11 Sin limpieza de refresh tokens expirados
- **OWASP:** A07 - Identification and Authentication Failures
- **Archivo:** `backend/src/controllers/authController.js`
- **Problema:** La tabla `refresh_tokens` acumula tokens expirados indefinidamente. No existe ningún mecanismo (cron job, cleanup periódico) para eliminarlos.
- **Impacto:** La tabla crece sin límite, degrada performance de queries y consume espacio en disco.
- **Remediación:** Agregar un cron job o un middleware que ejecute periódicamente: `DELETE FROM refresh_tokens WHERE expires_at < NOW()`.

### 🔵 BAJOS

#### 2.12 Logging insuficiente sin audit trail
- **OWASP:** A09 - Security Logging and Monitoring Failures
- **Archivo:** Todo el backend
- **Problema:** Solo se usa `console.error` para errores. No hay logging estructurado (JSON), niveles de log, rotación de archivos, ni audit trail de acciones administrativas.
- **Impacto:** En caso de un incidente de seguridad, no hay forma de determinar qué sucedió, cuándo ni quién lo hizo.
- **Remediación:** Implementar `winston` o `pino` con niveles de log, formato JSON, y registrar todas las acciones admin con timestamp + userId.

---

## 3. Frontend Dev — Componentes React

**Auditor:** Desarrollador Frontend Senior
**Alcance:** Componentes, estado, patrones React, accesibilidad, CSS

### 🟠 ALTOS

#### 3.1 Sin TypeScript en todo el frontend
- **Archivo:** Todo `src/` (52+ archivos `.jsx`)
- **Problema:** El proyecto no usa TypeScript. Todos los archivos son `.jsx` con JavaScript vanilla. No hay type checking, interfaces, ni autocompletado de props.
- **Impacto:** Bugs por tipos incorrectos que solo se detectan en runtime, refactoring más arriesgado, developer experience degradada.
- **Remediación:** Migrar progresivamente a TypeScript (`.tsx`), empezando por `api.js` → `api.ts` y los contexts.

#### 3.2 Función `formatearPrecio` duplicada
- **Archivos:** `src/context/CartContext.jsx` línea 30, `src/pages/Productos.jsx` línea 12
- **Problema:** La misma función de formateo de precios existe en al menos 2 archivos con implementaciones similares:
  ```javascript
  // CartContext.jsx
  const formatearPrecio = (valor) => {
    return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  ```
- **Impacto:** Si se corrige un bug de formateo en un lugar, el otro queda inconsistente. Violación del principio DRY.
- **Remediación:** Extraer a `src/utils/formatters.js` e importar desde ambos archivos.

#### 3.3 Sin estados de error granulares en ContentContext
- **Archivo:** `src/context/ContentContext.jsx`
- **Problema:** Solo existe un estado `contentLoading` (boolean). No hay estado de error. Si la API falla, el usuario no recibe ningún feedback — simplemente ve el contenido por defecto sin saber que hubo un error.
  ```javascript
  .catch(err => {
    console.error('Error cargando contenido desde API:', err);
    // No se setea ningún estado de error visible al usuario
  })
  ```
- **Impacto:** El usuario podría estar viendo datos desactualizados sin saberlo.
- **Remediación:** Agregar estado `contentError` y mostrar feedback al usuario cuando la API falla.

### 🟡 MEDIOS

#### 3.4 Componente definido dentro de archivo de página
- **Archivo:** `src/pages/Productos.jsx`
- **Problema:** El componente `ProductoCard` está definido dentro del mismo archivo de la página `Productos`. Debería ser un componente separado en `src/components/ProductoCard.jsx`.
- **Impacto:** No es reutilizable, dificulta testing individual, archivo de página más largo de lo necesario.
- **Remediación:** Extraer `ProductoCard` a su propio archivo en `src/components/`.

#### 3.5 Resize listener sin debounce
- **Archivo:** `src/pages/Productos.jsx`
- **Problema:** El event listener de `window.resize` ejecuta `setState` en cada pixel de cambio de tamaño de ventana. Esto causa decenas de re-renders innecesarios por segundo.
- **Impacto:** Jank visual y consumo excesivo de CPU durante el resize.
- **Remediación:** Usar un custom hook con debounce (300ms) o `ResizeObserver`.

#### 3.6 Sin `loading="lazy"` en imágenes de productos
- **Archivo:** `src/pages/Productos.jsx`
- **Problema:** Las imágenes de productos (`<img>`) no tienen el atributo `loading="lazy"` ni dimensiones fijas (`width`/`height`).
- **Impacto:** Todas las imágenes se descargan al cargar la página (incluso las que no son visibles). El layout "salta" cuando las imágenes cargan (CLS alto).
- **Remediación:** Agregar `loading="lazy"` y dimensiones fijas a todas las `<img>`.

#### 3.7 Navegación con `<a>` sin href
- **Archivo:** `src/components/Header.jsx` línea 78
- **Código afectado:**
  ```jsx
  <li key={i}><a onClick={() => scrollToSection(item.sectionId)}>{item.label}</a></li>
  ```
- **Problema:** Los links de navegación usan `<a>` sin `href`. Esto los hace:
  - Inaccesibles por teclado (no focuseables con Tab)
  - Invisibles para SEO
  - No funcionan con click derecho → "Abrir en nueva pestaña"
  - No muestran cursor pointer por defecto
- **Impacto:** Accesibilidad degradada, SEO pobre.
- **Remediación:** Usar `<button>` para acciones o `<a href="#sectionId">` para navegación.

### 🔵 BAJOS

#### 3.8 Sin prop-types ni validación de props
- **Archivo:** Todos los componentes
- **Problema:** Ningún componente valida sus props con `PropTypes` ni TypeScript interfaces.
- **Impacto:** Errors difíciles de debugear cuando se pasan props incorrectas.
- **Remediación:** Si no se migra a TypeScript, agregar `PropTypes` a los componentes principales.

---

## 4. Backend Dev — API y Lógica de Negocio

**Auditor:** Desarrollador Backend Senior
**Alcance:** Express, controladores, middleware, manejo de errores, patterns

### 🔴 CRÍTICOS

#### 4.1 `execSync` en controller web
- **Archivo:** `backend/src/controllers/adminController.js` línea 287
- **Problema:** (Ver detalle en Hallazgo 2.1 de Security). Uso de `child_process.execSync()` dentro de un handler HTTP. Esto:
  1. **Bloquea el event loop** de Node.js completamente durante la ejecución del comando.
  2. Mientras se ejecuta, **ninguna otra petición** puede ser procesada.
  3. Si el comando tarda o cuelga, el servidor completo se congela.
- **Impacto:** Degradación de performance del servidor bajo carga. Riesgo de DoS.
- **Remediación:** Usar alternativa asíncrona: `exec` (callback), `execFile` (más seguro), o preferiblemente una librería Node.js nativa.

### 🟠 ALTOS

#### 4.2 Sin validación de input en ningún endpoint
- **Archivo:** Todos los controllers en `backend/src/controllers/`
- **Problema:** Los request bodies se destructuran directamente sin ningún tipo de validación:
  ```javascript
  const { title, subtitle, items } = req.body;
  // ¿Y si title es un número? ¿Y si items no es un array?
  ```
  No se usa Zod, Joi, express-validator, ni ninguna librería de validación.
- **Impacto:** Datos inválidos en la DB, errores crípticos de MySQL, comportamiento impredecible.
- **Remediación:** Implementar Zod schemas para cada endpoint:
  ```javascript
  const updateHeroSchema = z.object({
    title: z.string().min(1).max(255),
    subtitle: z.string().optional(),
    ctaText: z.string().max(255),
    backgroundImage: z.string().url().optional()
  });
  ```

#### 4.3 Sin middleware de error global
- **Archivo:** `backend/src/server.js`
- **Problema:** No existe un error handler centralizado. Cada función de controlador tiene su propio `try/catch` con `console.error` + `res.status(500).json({ error: 'Error del servidor' })` repetido ~15 veces.
- **Impacto:** Duplicación de código, manejo de errores inconsistente, stack traces potencialmente expuestos.
- **Remediación:** Agregar error middleware global al final de server.js:
  ```javascript
  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Error del servidor'
        : err.message
    });
  });
  ```

#### 4.4 Queries en loop dentro de transacciones
- **Archivo:** `backend/src/controllers/adminController.js` líneas 11-16, 64-69, 89-94, 146-151, 172-177, 201-215, 235-240
- **Problema:** Los INSERTs se ejecutan uno por uno en un `for` loop:
  ```javascript
  for (let i = 0; i < navItems.length; i++) {
    await conn.query('INSERT INTO nav_items (...) VALUES (?, ?, ?)', [...]);
  }
  ```
  Con 10 categorías, esto genera 10 queries separadas en vez de una sola.
- **Impacto:** 10x más round-trips a la base de datos. Más lento, más carga en MySQL, más tiempo con la transacción abierta.
- **Remediación:** Usar bulk INSERT:
  ```javascript
  const values = items.map((item, i) => [item.slug, item.nombre, i + 1]);
  await conn.query('INSERT INTO categories (slug, nombre, sort_order) VALUES ?', [values]);
  ```

### 🟡 MEDIOS

#### 4.5 Sin graceful shutdown
- **Archivo:** `backend/src/server.js` líneas 31-33
- **Problema:** El servidor inicia con `app.listen()` pero no maneja señales `SIGTERM` ni `SIGINT`. Cuando el proceso se reinicia (deploy, PM2 restart), las conexiones activas se cortan abruptamente.
- **Impacto:** Transacciones en curso pueden quedar incompletas. Clientes reciben errores de conexión sin retry.
- **Remediación:**
  ```javascript
  process.on('SIGTERM', () => {
    server.close(() => {
      pool.end();
      process.exit(0);
    });
  });
  ```

#### 4.6 Sin request logging
- **Archivo:** `backend/src/server.js`
- **Problema:** No usa `morgan` ni ningún middleware de logging de peticiones HTTP. No hay registro de qué endpoints se llaman, con qué frecuencia, ni qué status codes retornan.
- **Impacto:** Imposible diagnosticar problemas en producción, analizar patrones de uso, o detectar ataques.
- **Remediación:** `npm install morgan` y agregar `app.use(morgan('combined'))` en producción.

#### 4.7 Import dinámico de child_process
- **Archivo:** `backend/src/controllers/adminController.js` línea 287
- **Problema:** `const { execSync } = await import('child_process')` es un import dinámico de un módulo core dentro de una función async. Este patrón es inusual, dificulta el análisis estático, y no se detecta fácilmente en auditorías de seguridad automatizadas.
- **Impacto:** Code smell que dificulta auditoría y mantenimiento.
- **Remediación:** Eliminar el uso de `child_process` completamente (ver 4.1).

### 🔵 BAJOS

#### 4.8 Sin compresión HTTP
- **Archivo:** `backend/src/server.js`
- **Problema:** No usa middleware `compression` para gzip/brotli. Las respuestas JSON se envían sin comprimir.
- **Impacto:** Mayor consumo de ancho de banda, respuestas más lentas en conexiones lentas.
- **Remediación:** `npm install compression` y agregar `app.use(compression())`.

---

## 5. DBA — Base de Datos MySQL

**Auditor:** DBA Senior
**Alcance:** Schema, índices, queries, integridad de datos, tipos de datos

### 🟠 ALTOS

#### 5.1 Sin índices en columnas de búsqueda/filtro
- **Archivo:** `backend/src/config/schema.sql` líneas 96-106
- **Problema:** La tabla `products` no tiene índices en las columnas usadas para filtrar y ordenar:
  - `categoria` — se usa en `WHERE categoria = 'piezas-unicas'`
  - `destacado` — se usa en `WHERE destacado = 1`
  - `sort_order` — se usa en `ORDER BY sort_order`
- **Impacto:** Full table scan en cada consulta. Con 100+ productos, las queries se degradan.
- **Remediación:**
  ```sql
  CREATE INDEX idx_products_categoria ON products(categoria);
  CREATE INDEX idx_products_destacado ON products(destacado);
  CREATE INDEX idx_products_sort ON products(sort_order);
  ```

#### 5.2 Sin columna `updated_at` en ninguna tabla
- **Archivo:** `backend/src/config/schema.sql` (23 tablas)
- **Problema:** De las 23 tablas, solo `users` tiene `created_at` y **ninguna** tiene `updated_at`. No hay forma de saber cuándo se modificó un registro por última vez.
- **Impacto:** Imposible implementar cache invalidation, auditoría de cambios, resolución de conflictos, ni debugging temporal.
- **Remediación:** Agregar a todas las tablas de contenido:
  ```sql
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ```

#### 5.3 `products.categoria` sin foreign key
- **Archivo:** `backend/src/config/schema.sql` líneas 99 vs 83-90
- **Problema:** La columna `products.categoria` es `VARCHAR(100)` que almacena el slug de la categoría, pero **no tiene foreign key** hacia `categories.slug`. La integridad referencial depende completamente del frontend.
- **Impacto:** Se pueden insertar productos con categorías que no existen. Los datos pueden quedar inconsistentes.
- **Remediación:**
  ```sql
  ALTER TABLE products
    ADD CONSTRAINT fk_products_categoria
    FOREIGN KEY (categoria) REFERENCES categories(slug)
    ON UPDATE CASCADE ON DELETE RESTRICT;
  ```
  **Nota:** El patrón actual de `DELETE FROM categories` + re-insert rompería esta FK. Se necesita cambiar también el patrón de actualización.

### 🟡 MEDIOS

#### 5.4 Precios almacenados como INT
- **Archivo:** `backend/src/config/schema.sql` líneas 101-102
- **Código:**
  ```sql
  precio_actual INT DEFAULT 0,
  precio_anterior INT DEFAULT 0,
  ```
- **Problema:** Los precios se almacenan como enteros. Si la tienda necesita manejar decimales (ej: $45.500,50), no podrá representarlos.
- **Impacto:** Limitación de negocio. OK para pesos chilenos (sin decimales) pero no para otras monedas.
- **Remediación:** Considerar `DECIMAL(10,2)` si se planea internacionalizar.

#### 5.5 Sin índice en `refresh_tokens.token`
- **Archivo:** `backend/src/config/schema.sql` líneas 14-20
- **Problema:** Las búsquedas de refresh token (`WHERE token = ?`) no tienen índice. El token es un string largo (JWT) que se busca en cada operación de refresh.
- **Impacto:** Full table scan en cada refresh. Con acumulación de tokens expirados (ver 2.11), la tabla crece y las queries se degradan.
- **Remediación:**
  ```sql
  CREATE INDEX idx_refresh_token ON refresh_tokens(token);
  ```

#### 5.6 Patrón delete-all + re-insert destruye IDs
- **Archivo:** `backend/src/controllers/adminController.js` líneas 63, 88
- **Problema:** (Ver también 1.6). Cada vez que se actualizan categorías o productos:
  ```javascript
  await conn.query('DELETE FROM categories');
  // ... re-insert con nuevos IDs auto-incrementales
  ```
  Los IDs cambian en cada actualización.
- **Impacto:** Imposible crear referencias estables a productos (URLs, favoritos, historial, analytics).
- **Remediación:** Usar `INSERT ... ON DUPLICATE KEY UPDATE` o `UPSERT`.

#### 5.7 Sin charset explícito en schema
- **Archivo:** `backend/src/config/schema.sql`
- **Problema:** No se especifica `CHARACTER SET` ni `COLLATION` en las tablas. Depende del default del servidor MySQL.
- **Impacto:** Si el servidor MySQL tiene charset `latin1` por defecto, los caracteres especiales (ñ, acentos, emojis) podrían almacenarse incorrectamente.
- **Remediación:** Agregar al inicio del schema:
  ```sql
  SET NAMES utf8mb4;
  -- Y en cada tabla:
  CREATE TABLE ... (...) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  ```

### 🔵 BAJOS

#### 5.8 Columnas JSON sin índice virtual
- **Archivo:** `backend/src/config/schema.sql` líneas 127, 234
- **Problema:** Las columnas `about.paragraphs` (JSON) y `products_page.sort_labels` (JSON) no tienen índices virtuales para búsqueda.
- **Impacto:** Mínimo con el volumen actual (1 registro cada una). Solo relevante si se necesita buscar dentro del JSON en el futuro.
- **Remediación:** No urgente. Crear índices virtuales solo si se necesitan queries sobre el contenido JSON.

---

## 6. DevOps — Deployment e Infraestructura

**Auditor:** DevOps Engineer Senior
**Alcance:** CI/CD, deployment, monitoreo, backups, seguridad de infraestructura

### 🔴 CRÍTICOS

#### 6.1 Sin CI/CD pipeline
- **Archivo:** Proyecto completo
- **Problema:** No existe:
  - `.github/workflows/` (GitHub Actions)
  - `Jenkinsfile`
  - `.gitlab-ci.yml`
  - Ni ningún otro sistema de CI/CD

  Todo deployment es presumiblemente manual: SSH al servidor, `git pull`, `npm install`, reiniciar proceso.
- **Impacto:**
  - Sin tests antes de deploy → bugs en producción
  - Sin build automático → errores de build no detectados
  - Sin rollback automatizado → recovery lento
  - Dependencia de una persona para deployar
- **Remediación:** Crear GitHub Action básico:
  ```yaml
  # .github/workflows/deploy.yml
  on:
    push:
      branches: [main]
  jobs:
    test-and-deploy:
      steps:
        - npm ci && npm run lint && npm test
        - npm run build
        - # Deploy via SSH/rsync
  ```

#### 6.2 Sin backups automatizados
- **Archivo:** Proyecto completo
- **Problema:** No hay evidencia de:
  - Backups automáticos de MySQL (`mysqldump` en cron)
  - Backups de la carpeta `/var/www/makuk/uploads` (imágenes subidas)
  - Estrategia de retención de backups
  - Backups offsite (S3, Google Cloud Storage)
- **Impacto:** Si el servidor falla, se pierde **toda** la base de datos y todas las imágenes subidas por los administradores. Pérdida de datos = pérdida de negocio.
- **Remediación:**
  1. Cron job diario: `mysqldump makuk_db | gzip > backup-$(date +%Y%m%d).sql.gz`
  2. Rsync de `/uploads` a almacenamiento externo
  3. Retención de al menos 30 días
  4. Backups offsite (S3 o similar)

### 🟠 ALTOS

#### 6.3 IP del servidor hardcodeada en repositorio
- **Archivo:** `vite.config.js` líneas 10-11
- **Problema:** (Ver también 2.5). La IP `186.64.122.100` está en el código fuente.
- **Remediación:** Usar `process.env.VITE_API_TARGET`.

#### 6.4 Sin Dockerfile ni containerización
- **Archivo:** Proyecto completo
- **Problema:** No existe `Dockerfile`, `docker-compose.yml` ni ninguna configuración de contenedores.
- **Impacto:**
  - No se puede replicar el entorno de producción localmente
  - Dificulta CI/CD
  - Sin rollbacks rápidos (no hay imágenes versionadas)
  - "Funciona en mi máquina" como único debugging
- **Remediación:** Crear `Dockerfile` para el backend y `docker-compose.yml` para desarrollo local con MySQL incluido.

#### 6.5 Sin `.env.example`
- **Archivo:** Proyecto completo
- **Problema:** No existe un archivo `.env.example` que documente las 10+ variables de entorno necesarias para ejecutar el proyecto:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
  - `PORT`, `UPLOAD_DIR`, `MAX_FILE_SIZE`
  - `VITE_API_URL`
- **Impacto:** Un nuevo desarrollador no puede saber qué variables configurar sin leer todo el código.
- **Remediación:** Crear `backend/.env.example` y `.env.example` en la raíz.

#### 6.6 Sin monitoreo ni health checks automatizados
- **Archivo:** Proyecto completo
- **Problema:** Aunque existe un endpoint `/api/health`, no hay:
  - Monitoreo externo (UptimeRobot, Pingdom, etc.)
  - APM (Application Performance Monitoring)
  - Alertas de caída por email/Slack
  - Métricas de uso (CPU, memoria, conexiones DB)
- **Impacto:** Si el servidor cae, nadie se entera hasta que un usuario lo reporta.
- **Remediación:** Como mínimo, configurar UptimeRobot (gratuito) para monitorear `/api/health`.

### 🟡 MEDIOS

#### 6.7 Sin configuración Nginx versionada
- **Archivo:** Proyecto completo
- **Problema:** La configuración de Nginx no está en el repositorio. Si el servidor muere o necesita reconstrucción, la configuración se pierde.
- **Remediación:** Crear `infra/nginx/makuk.conf` en el repo.

#### 6.8 Sin PM2 config versionada
- **Archivo:** Proyecto completo
- **Problema:** No hay `ecosystem.config.js` para PM2. El proceso Node.js podría no reiniciarse automáticamente tras un crash, o podría estar corriendo con `node src/server.js` directamente.
- **Remediación:** Crear `backend/ecosystem.config.cjs`.

### 🔵 BAJOS

#### 6.9 Favicon genérico de Vite
- **Archivo:** `index.html` línea 4
- **Problema:** Usa `vite.svg` como favicon. La tienda MAKUK debería tener su propio favicon/logo.
- **Remediación:** Crear favicon personalizado con el logo de MAKUK.

---

## 7. QA Tester — Cobertura de Tests

**Auditor:** QA Engineer Senior
**Alcance:** Tests unitarios, integración, E2E, cobertura

### 🔴 CRÍTICOS

#### 7.1 Cobertura de tests: 0%
- **Archivo:** Todo el proyecto
- **Problema:** No existe **ningún** archivo de test en todo el proyecto:
  - 0 archivos `.test.js` / `.test.jsx` / `.spec.js`
  - 0 archivos en directorios `__tests__/`
  - Sin `vitest.config.js` ni `jest.config.js`
  - Sin `playwright.config.js`
- **Impacto:** Cualquier cambio puede romper funcionalidad existente sin que nadie lo detecte hasta producción.

#### 7.2 Sin framework de testing instalado
- **Archivo:** `package.json` y `backend/package.json`
- **Problema:** No hay dependencias de testing en ninguno de los dos `package.json`:
  - Sin `vitest` / `jest`
  - Sin `@testing-library/react`
  - Sin `supertest`
  - Sin `playwright` / `cypress`
  - Sin `c8` / `istanbul` (coverage)
- **Impacto:** No se puede escribir ni ejecutar tests sin setup previo.
- **Remediación:**
  ```bash
  # Frontend
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

  # Backend
  cd backend && npm install -D vitest supertest
  ```

### 🟠 ALTOS

#### 7.3 Flujos críticos de negocio sin validar
- **Problema:** Los siguientes flujos no tienen ningún tipo de validación automatizada:
  1. **Carrito de compras:** Agregar, eliminar, calcular totales con IVA
  2. **Login/Logout:** Autenticación, refresh de tokens, expiración
  3. **Panel Admin:** Actualización de las 10 secciones del CMS
  4. **Upload de imágenes:** Validación de tipos, tamaño, almacenamiento
  5. **Carga de contenido público:** Las 19 queries del endpoint `/api/content`
- **Impacto:** Cualquiera de estos flujos puede romperse silenciosamente.

#### 7.4 Sin tests de API
- **Problema:** Los 4 routers y 20 endpoints no tienen ningún test de integración con `supertest`.
- **Remediación prioritaria (primeros tests a escribir):**
  1. `POST /api/auth/login` — happy path + credenciales inválidas
  2. `GET /api/content` — retorna estructura correcta
  3. `PUT /api/admin/products` — requiere auth, actualiza datos
  4. `POST /api/upload` — valida tipo de archivo y tamaño

### 🟡 MEDIOS

#### 7.5 Sin tests de regresión para el patrón delete+insert
- **Problema:** El patrón de `DELETE FROM [tabla]` + re-insert es especialmente riesgoso sin tests. Si una transacción falla entre el DELETE y los INSERTs, se pierden todos los datos de esa sección. Un test de regresión debería verificar que ante un error, la transacción hace rollback correctamente.

---

## 8. Code Reviewer — Calidad de Código

**Auditor:** Code Reviewer Senior
**Alcance:** Principios SOLID, DRY, naming, complejidad, code smells

### 🟠 ALTOS

#### 8.1 Controlador admin monolítico (335 líneas)
- **Archivo:** `backend/src/controllers/adminController.js`
- **Problema:** Un solo archivo contiene 12 funciones de update + 1 función de stats = 13 funciones exportadas en 335 líneas. Es el archivo más largo del backend.
- **Impacto:** Difícil de navegar, mantener y testear. Violación del principio de Single Responsibility.
- **Remediación:** Dividir en controladores por dominio:
  ```
  controllers/
  ├── admin/
  │   ├── headerController.js
  │   ├── categoryController.js
  │   ├── productController.js
  │   ├── contentSectionController.js  (hero, intro, about, process, worldwide)
  │   ├── testimonialController.js
  │   ├── footerController.js
  │   └── statsController.js
  ```

#### 8.2 Duplicación masiva del patrón transaccional
- **Archivo:** `backend/src/controllers/adminController.js`
- **Problema:** El siguiente patrón se repite **7 veces** casi idéntico:
  ```javascript
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM [tabla]');
    for (let i = 0; i < items.length; i++) {
      await conn.query('INSERT INTO [tabla] (...) VALUES (?)', [...]);
    }
    await conn.commit();
    res.json({ message: '[Sección] actualizada' });
  } catch (err) {
    await conn.rollback();
    console.error('Error [función]:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
  ```
- **Impacto:** ~120 líneas de código duplicado. Si se necesita cambiar el manejo de errores, hay que modificar 7 funciones.
- **Remediación:** Extraer helper genérico:
  ```javascript
  async function replaceAll(table, parentColumn, parentId, items, mapper) { ... }
  ```

### 🟡 MEDIOS

#### 8.3 Mezcla inconsistente de idiomas
- **Archivos:** Todo el proyecto
- **Problema:** Variables y funciones mezclan español e inglés sin convención:
  - Español: `carrito`, `agregarAlCarrito`, `formatearPrecio`, `nombre`, `ubicacion`
  - Inglés: `content`, `loading`, `items`, `showConfirmModal`, `isAuthenticated`
  - Mixto: `precioActual`, `navItems`, `sectionId`
- **Impacto:** Confusión al leer el código, onboarding más lento para nuevos devs.
- **Remediación:** Establecer convención. Recomendación: inglés para código, español para textos/labels visibles al usuario.

#### 8.4 `console.log/error` en producción
- **Archivos:** Múltiples en backend
- **Problema:** Se usa `console.error` en cada catch (~15 instancias) y `console.log` para recovery keys. Sin logger formal con niveles.
- **Impacto:** Logs ruidosos sin estructura, información sensible expuesta.
- **Remediación:** Implementar `pino` o `winston` con niveles (error, warn, info, debug).

#### 8.5 Magic number para IVA
- **Archivo:** `src/context/CartContext.jsx` línea 5
- **Código:** `const IVA_RATE = 0.19;`
- **Problema:** La tasa de IVA está hardcodeada como constante local. Si cambia (por regulación o por venta en otro país), hay que modificar el código y redeployar.
- **Impacto:** Rigidez ante cambios fiscales.
- **Remediación:** Mover a configuración (variable de entorno o tabla de configuración en DB).

#### 8.6 Catch vacíos que silencian errores
- **Archivo:** `src/services/api.js` líneas 45-47, 57-58, 89-90, 112-113
- **Problema:** Varios bloques `catch` vacíos o que solo hacen `return false`:
  ```javascript
  } catch {
    throw new Error('Error de conexión...');
  }
  // ...
  } catch {
    return false; // ← Error silenciado completamente
  }
  ```
- **Impacto:** Errores de red o API se pierden sin logging ni debugging posible.

### 🔵 BAJOS

#### 8.7 Sin comentarios JSDoc
- **Archivo:** Todo el código
- **Problema:** Ninguna función tiene documentación JSDoc. Los parámetros y return types no están documentados.
- **Impacto:** Developer experience reducida, especialmente sin TypeScript.

---

## 9. API Designer — Diseño de Endpoints

**Auditor:** API Designer Senior
**Alcance:** Convenciones REST, respuestas, versionado, documentación

### 🟠 ALTOS

#### 9.1 Sin versionado de API
- **Archivo:** `backend/src/server.js` líneas 22-25
- **Rutas actuales:**
  ```
  /api/auth/...
  /api/content
  /api/admin/...
  /api/upload
  ```
- **Problema:** Sin número de versión. Cualquier cambio breaking en la API rompe el frontend inmediatamente.
- **Remediación:** Usar `/api/v1/...` y crear `/api/v2/...` cuando haya cambios breaking.

#### 9.2 Sin formato de respuesta estándar (envelope)
- **Archivos:** Todos los controllers
- **Problema:** Las respuestas no siguen un formato consistente:
  ```javascript
  // authController → { accessToken, refreshToken, user }
  // adminController → { message: 'Header actualizado' }
  // contentController → { header, hero, intro, ... } (datos directos)
  // Error → { error: 'Error del servidor' }
  ```
  No hay envelope estándar como `{ success, data, error, meta }`.
- **Impacto:** El frontend necesita manejar cada endpoint de forma diferente. Dificulta crear un interceptor genérico.
- **Remediación:** Estandarizar:
  ```javascript
  // Éxito
  { success: true, data: { ... } }
  // Error
  { success: false, error: { code: "VALIDATION_ERROR", message: "..." } }
  ```

#### 9.3 GET /api/content retorna todo el sitio en una respuesta
- **Archivo:** `backend/src/controllers/contentController.js`
- **Problema:** Un solo endpoint retorna el contenido completo del sitio: header + hero + intro + categorías + productos + about + process + worldwide + testimonials + footer + productsPage. No permite solicitar secciones individuales.
- **Impacto:** Desperdicio de ancho de banda. Si la página de productos solo necesita `products` y `header`, igual descarga todo.
- **Remediación:** Crear endpoints individuales: `/api/content/header`, `/api/content/products`, etc. O implementar query parameter: `/api/content?sections=header,products`.

### 🟡 MEDIOS

#### 9.4 PUT para operaciones destructivas
- **Archivo:** `backend/src/controllers/adminController.js` línea 83
- **Problema:** `PUT /api/admin/products` borra TODOS los productos y reinserta. Semánticamente, PUT debería ser idempotente y reemplazar un recurso específico, no borrar y recrear colecciones enteras.
- **Remediación:** Usar `POST /api/admin/products/bulk` o `PATCH /api/admin/products` con operaciones granulares.

#### 9.5 Sin paginación en productos
- **Archivo:** `backend/src/controllers/contentController.js` línea 34
- **Query:** `SELECT * FROM products ORDER BY sort_order`
- **Problema:** Se seleccionan TODOS los productos sin `LIMIT` ni `OFFSET`. No hay soporte de paginación.
- **Impacto:** Con 1000+ productos, la respuesta sería enorme y lenta.
- **Remediación:** Agregar query params `?page=1&limit=20` y retornar meta de paginación.

#### 9.6 Sin documentación de API
- **Archivo:** Proyecto completo
- **Problema:** No existe:
  - OpenAPI/Swagger specification
  - Postman collection
  - Archivo markdown con documentación de endpoints
- **Impacto:** Nuevos desarrolladores deben leer el código para entender la API.
- **Remediación:** Crear documentación (al menos un `API.md` con endpoints, auth, request/response).

### 🔵 BAJOS

#### 9.7 Status codes inconsistentes
- **Archivos:** Todos los controllers
- **Problema:** Todas las operaciones exitosas retornan `200 OK`, incluyendo actualizaciones que deberían retornar `204 No Content` o `201 Created`.
- **Remediación:** Usar status codes semánticos: 201 para creación, 204 para update sin body de respuesta.

---

## 10. UI/UX — Experiencia de Usuario

**Auditor:** UI/UX Designer Senior
**Alcance:** Flujos de usuario, accesibilidad, responsive, experiencia de compra

### 🟠 ALTOS

#### 10.1 Sin flujo de checkout / proceso de compra
- **Archivo:** Proyecto completo
- **Problema:** El carrito de compras permite agregar productos y calcular totales, pero **no existe ningún flujo de pago**. No hay:
  - Página de checkout
  - Integración con pasarela de pagos (Stripe, PayPal, Mercado Pago)
  - Formulario de datos de envío
  - Confirmación de pedido

  El flujo aparente es contactar por WhatsApp para completar la compra.
- **Impacto:** La tienda no puede convertir visitantes en compradores de forma autónoma. Cada venta requiere intervención manual.
- **Remediación:** Implementar al menos un botón "Comprar por WhatsApp" que envíe el resumen del carrito, o integrar una pasarela de pagos.

#### 10.2 Links de navegación inaccesibles
- **Archivo:** `src/components/Header.jsx` línea 78
- **Problema:** (Ver también 3.7). Los enlaces de navegación usan `<a onClick>` sin `href`, haciéndolos:
  - No focuseables con teclado (Tab)
  - Sin cursor pointer nativo
  - Invisibles para screen readers
  - No funcionan con "Abrir en nueva pestaña"
- **Impacto:** Accesibilidad WCAG 2.1 no cumplida. Usuarios con discapacidades no pueden navegar el sitio.

#### 10.3 Sin feedback visual en acciones admin
- **Archivos:** Todas las páginas admin
- **Problema:** Las operaciones de guardado en el panel admin solo retornan `{ message: '...' }` del backend, pero no hay implementación visible de:
  - Toast/notificación de éxito
  - Indicador de "Guardando..."
  - Mensaje de error visible al admin
- **Impacto:** El administrador no sabe si sus cambios se guardaron exitosamente.

### 🟡 MEDIOS

#### 10.4 Sin meta tags SEO
- **Archivo:** `index.html`
- **Problema:** Falta:
  - `<meta name="description" content="...">`
  - Open Graph tags (`og:title`, `og:description`, `og:image`)
  - Twitter Card tags
  - Schema.org structured data (Product, LocalBusiness)
- **Impacto:** Posicionamiento pobre en Google. Las redes sociales no muestran preview al compartir el link.

#### 10.5 Sin página 404
- **Archivo:** `src/App.jsx`
- **Problema:** No existe una ruta catch-all (`<Route path="*" element={<NotFound />} />`). Si un usuario visita `/productos/collar-xyz` o cualquier URL inválida, ve una página en blanco.
- **Impacto:** Experiencia confusa. El usuario no sabe si el sitio está roto o la página no existe.

#### 10.6 Sin breadcrumbs en página de productos
- **Archivo:** `src/pages/Productos.jsx`
- **Problema:** No hay indicación de ubicación (breadcrumbs) ni forma de volver al inicio de forma evidente desde la página de productos.
- **Impacto:** Navegación menos intuitiva, especialmente en móviles.

#### 10.7 Botón de login/admin visible para todos los visitantes
- **Archivo:** `src/components/Header.jsx` líneas 94-100
- **Problema:** El icono de usuario (que lleva a `/admin/login`) es visible para todos los visitantes en el header.
- **Impacto:** Expone la existencia del panel admin a todos. Normalmente el acceso admin se oculta o se accede por URL directa.

### 🔵 BAJOS

#### 10.8 Sin estados vacíos
- **Archivo:** `src/pages/Productos.jsx`
- **Problema:** Si no hay productos en una categoría filtrada, no se muestra ningún mensaje. Solo aparece el grid vacío.
- **Remediación:** Agregar: "No hay productos en esta categoría."

---

## 11. Perf Engineer — Performance

**Auditor:** Performance Engineer Senior
**Alcance:** Core Web Vitals, bundle size, queries, caching, network

### 🟠 ALTOS

#### 11.1 Sin lazy loading de rutas admin
- **Archivo:** `src/App.jsx` líneas 1-26
- **Problema:** (Ver también 1.1). Todas las importaciones son estáticas. El bundle incluye código admin para visitantes públicos.
- **Impacto estimado:** Bundle ~60% más grande de lo necesario para visitantes públicos.
- **Remediación:** `React.lazy()` + `Suspense` para rutas admin.

#### 11.2 Font Awesome completo cargado por CDN
- **Archivo:** `index.html` línea 13
- **Código:**
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  ```
- **Problema:** Se carga el CSS completo de Font Awesome (~60KB minified, ~200KB con las fuentes) cuando el proyecto solo usa ~15 iconos (`fa-gem`, `fa-heart`, `fa-star`, `fa-fire`, `fa-hands`, `fa-shopping-cart`, `fa-user`, `fa-facebook`, `fa-instagram`, etc.).
- **Impacto:** ~55KB de CSS innecesario que bloquea el render.
- **Remediación:** Usar `@fortawesome/react-fontawesome` con tree-shaking para importar solo los iconos necesarios.

#### 11.3 Sin cache headers en archivos estáticos
- **Archivo:** `backend/src/server.js` línea 28
- **Código:**
  ```javascript
  app.use('/uploads', express.static(process.env.UPLOAD_DIR || '/var/www/makuk/uploads'));
  ```
- **Problema:** `express.static()` sin opciones de cache. Las imágenes subidas se re-descargan en cada visita.
- **Impacto:** Ancho de banda desperdiciado, carga más lenta para visitantes recurrentes.
- **Remediación:**
  ```javascript
  app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '7d',
    immutable: true,
    etag: true
  }));
  ```

#### 11.4 19 queries paralelas saturan el connection pool
- **Archivo:** `backend/src/controllers/contentController.js` líneas 27-47
- **Problema:** `GET /api/content` ejecuta 19 queries en `Promise.all()`. El pool de MySQL tiene `connectionLimit: 10`. Esto significa que una sola petición consume **potencialmente todas las conexiones** del pool, dejando sin conexiones a peticiones concurrentes.
- **Impacto:** Bajo carga concurrente, las peticiones se encolan esperando conexiones libres. Con 5+ usuarios simultáneos, timeout probable.
- **Remediación:**
  1. Reducir a queries agrupadas (ej: JOINs en vez de queries separadas)
  2. Implementar cache en memoria (las secciones del CMS cambian raramente)
  3. Aumentar `connectionLimit` a 20-30

### 🟡 MEDIOS

#### 11.5 Google Fonts render-blocking
- **Archivo:** `index.html` líneas 9-11
- **Problema:** 2 familias de fuentes (Cormorant Garamond con 4 pesos + Montserrat con 4 pesos) se cargan como CSS blocking en el `<head>`. El navegador no renderiza texto hasta que las fuentes estén disponibles.
- **Impacto:** Retraso en LCP (Largest Contentful Paint). En conexiones lentas, puede agregar 1-3 segundos.
- **Remediación:** Agregar `font-display: swap` (ya está en la URL como `display=swap`), pero también considerar:
  1. Precargar la fuente principal: `<link rel="preload" as="font" ...>`
  2. Self-host las fuentes para evitar dependencia de CDN externo

#### 11.6 Sin compresión de respuestas HTTP
- **Archivo:** `backend/src/server.js`
- **Problema:** No usa middleware `compression`. Las respuestas JSON (especialmente `/api/content` que retorna todo el contenido) van sin comprimir.
- **Impacto:** ~3x más bytes transferidos en comparación con gzip.

#### 11.7 Imágenes sin dimensiones causan CLS
- **Archivo:** `src/pages/Productos.jsx`
- **Problema:** Los tags `<img>` no tienen atributos `width` y `height`. El navegador no puede reservar espacio antes de que la imagen cargue.
- **Impacto:** Layout shift (CLS) alto. Elementos "saltan" cuando las imágenes cargan, afectando Core Web Vitals.

#### 11.8 Sin preload de recursos críticos
- **Archivo:** `index.html`
- **Problema:** No hay `<link rel="preload">` para la imagen hero (background del banner), que es el LCP element.
- **Impacto:** El navegador no descubre la imagen hero hasta que parsea el CSS/JS, retrasando LCP.

### 🔵 BAJOS

#### 11.9 Sin Service Worker / PWA
- **Archivo:** Proyecto completo
- **Problema:** No hay service worker ni manifest.json para PWA.
- **Impacto:** Sin cache offline ni instalación en dispositivo móvil. Relevante para una tienda e-commerce.

---

## 12. Tech Writer — Documentación

**Auditor:** Technical Writer Senior
**Alcance:** README, documentación de API, guías, changelog

### 🔴 CRÍTICOS

#### 12.1 README genérico de Vite
- **Archivo:** `README.md`
- **Problema:** El README es el template por defecto generado por `create-vite` con instrucciones genéricas de React + Vite. **No contiene información alguna sobre MAKUK**:
  - No dice qué es el proyecto
  - No tiene instrucciones de instalación
  - No explica cómo configurar la base de datos
  - No tiene guía de deployment
  - No documenta las variables de entorno
- **Impacto:** Un nuevo desarrollador que clone el repo no tiene idea de cómo ejecutar el proyecto.

### 🟠 ALTOS

#### 12.2 Sin `.env.example` documentado
- **Archivo:** Proyecto completo
- **Problema:** (Ver también 6.5). Las 10+ variables de entorno necesarias no están documentadas en ningún lugar. Un nuevo dev debe buscar en el código cada `process.env.XXX`.
- **Remediación:** Crear `backend/.env.example`:
  ```bash
  # Base de datos
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=makuk_user
  DB_PASSWORD=     # ← contraseña segura
  DB_NAME=makuk_db

  # JWT
  JWT_SECRET=      # ← string aleatorio de 64 chars
  JWT_REFRESH_SECRET= # ← string aleatorio diferente
  JWT_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d

  # Servidor
  PORT=3001
  UPLOAD_DIR=/var/www/makuk/uploads
  MAX_FILE_SIZE=5242880   # 5MB en bytes
  ```

#### 12.3 Sin documentación de API
- **Archivo:** Proyecto completo
- **Problema:** (Ver también 9.6). Los 20 endpoints de la API no están documentados. No hay:
  - OpenAPI/Swagger spec
  - Postman collection exportada
  - Archivo `API.md` con la lista de endpoints
- **Impacto:** Otros desarrolladores o servicios no pueden consumir la API sin leer el código.

#### 12.4 Sin guía de deployment
- **Archivo:** Proyecto completo
- **Problema:** No existe documentación de cómo desplegar el proyecto en producción:
  - Configuración de Nginx
  - Setup de PM2
  - Creación de la base de datos
  - Seeding inicial
  - Certificado SSL
  - Configuración de firewall

### 🟡 MEDIOS

#### 12.5 Sin CHANGELOG
- **Archivo:** Proyecto completo
- **Problema:** No hay registro formal de cambios. Los commits de git son la única referencia.
- **Remediación:** Crear `CHANGELOG.md` siguiendo el formato [Keep a Changelog](https://keepachangelog.com/).

#### 12.6 Sin CONTRIBUTING.md
- **Archivo:** Proyecto completo
- **Problema:** No hay guía de contribución que establezca:
  - Cómo configurar el entorno de desarrollo
  - Convenciones de código
  - Proceso de pull requests
  - Estilo de commits

#### 12.7 Schema.sql con documentación mínima
- **Archivo:** `backend/src/config/schema.sql`
- **Problema:** Las tablas tienen separadores visuales pero sin explicar:
  - Relaciones entre tablas
  - Significado de columnas no obvias
  - Constraints de negocio (ej: ¿cuántos steps puede tener un proceso?)
  - Valores válidos para `role` en `users`

### 🔵 BAJOS

#### 12.8 Sin LICENSE
- **Archivo:** Proyecto completo
- **Problema:** No hay archivo `LICENSE` que establezca los términos de uso del código.
- **Remediación:** Agregar licencia apropiada (MIT, Apache 2.0, o propietaria).

---

## Resumen Consolidado por Severidad

### Todos los hallazgos CRÍTICOS (10)

| # | Especialista | Hallazgo | Ref. |
|---|---|---|---|
| 1 | Architect | Sin code splitting — admin se carga para visitantes | 1.1 |
| 2 | Security | `execSync` en controller — command injection risk | 2.1 |
| 3 | Security | Credenciales por defecto en producción | 2.2 |
| 4 | Security | CORS completamente abierto (`cors()` sin config) | 2.3 |
| 5 | Backend | `execSync` bloquea event loop | 4.1 |
| 6 | DevOps | Sin CI/CD pipeline | 6.1 |
| 7 | DevOps | Sin backups automatizados | 6.2 |
| 8 | QA | 0% cobertura de tests | 7.1 |
| 9 | QA | Sin framework de testing instalado | 7.2 |
| 10 | Tech Writer | README genérico sin info del proyecto | 12.1 |

### Todos los hallazgos ALTOS (38)

| # | Especialista | Hallazgo | Ref. |
|---|---|---|---|
| 1 | Architect | Monolito de contenido — todo en un fetch | 1.2 |
| 2 | Architect | Sin capa de servicios en backend | 1.3 |
| 3 | Architect | Sin Error Boundaries en React | 1.4 |
| 4 | Security | JWT tokens en localStorage (XSS) | 2.4 |
| 5 | Security | IP del servidor expuesta en repo | 2.5 |
| 6 | Security | Sin headers de seguridad (helmet) | 2.6 |
| 7 | Security | Sin verificación de rol en auth middleware | 2.7 |
| 8 | Security | Sin rate limiting en login | 2.8 |
| 9 | Security | Recovery key en console.log | 2.9 |
| 10 | Frontend | Sin TypeScript | 3.1 |
| 11 | Frontend | formatearPrecio duplicado | 3.2 |
| 12 | Frontend | Sin estados de error en ContentContext | 3.3 |
| 13 | Backend | Sin validación de input (Zod/Joi) | 4.2 |
| 14 | Backend | Sin middleware de error global | 4.3 |
| 15 | Backend | Queries en loop (no bulk INSERT) | 4.4 |
| 16 | DBA | Sin índices en columnas de búsqueda | 5.1 |
| 17 | DBA | Sin updated_at en tablas | 5.2 |
| 18 | DBA | products.categoria sin FK | 5.3 |
| 19 | DevOps | IP hardcodeada en repo | 6.3 |
| 20 | DevOps | Sin Docker | 6.4 |
| 21 | DevOps | Sin .env.example | 6.5 |
| 22 | DevOps | Sin monitoreo ni alertas | 6.6 |
| 23 | QA | Flujos críticos sin tests | 7.3 |
| 24 | QA | Sin tests de API | 7.4 |
| 25 | Code Rev. | adminController monolítico (335 líneas) | 8.1 |
| 26 | Code Rev. | Patrón transaccional duplicado 7x | 8.2 |
| 27 | API | Sin versionado de API | 9.1 |
| 28 | API | Sin formato de respuesta estándar | 9.2 |
| 29 | API | GET /content retorna todo | 9.3 |
| 30 | UI/UX | Sin checkout / proceso de compra | 10.1 |
| 31 | UI/UX | Links de navegación inaccesibles | 10.2 |
| 32 | UI/UX | Sin feedback visual en admin | 10.3 |
| 33 | Perf | Sin lazy loading de rutas admin | 11.1 |
| 34 | Perf | Font Awesome completo por CDN | 11.2 |
| 35 | Perf | Sin cache headers en uploads | 11.3 |
| 36 | Perf | 19 queries saturan connection pool | 11.4 |
| 37 | Tech Writer | Sin .env.example documentado | 12.2 |
| 38 | Tech Writer | Sin documentación de API | 12.3 |

---

## Top 10 Acciones Prioritarias

| # | Acción | Especialistas | Impacto Esperado |
|---|--------|---------------|------------------|
| 1 | **Implementar tests** (Vitest + Testing Library + Supertest) | QA, Code Reviewer | Previene regresiones, habilita CI/CD |
| 2 | **Hardening de seguridad**: CORS restrictivo, helmet, rate limiting, validación con Zod | Security, Backend | Protege contra los ataques más comunes |
| 3 | **Eliminar `execSync`** del controller de stats | Security, Backend | Elimina riesgo de command injection y bloqueo |
| 4 | **Lazy loading de rutas admin** con `React.lazy()` | Architect, Perf, Frontend | Reduce bundle inicial ~60% |
| 5 | **Crear CI/CD con GitHub Actions** (lint, test, build, deploy) | DevOps | Automatiza calidad y deployment |
| 6 | **Escribir README real** + `.env.example` + docs de API | Tech Writer | Permite onboarding de nuevos devs |
| 7 | **Agregar índices DB** en `products.categoria`, `refresh_tokens.token` | DBA | Mejora queries y previene degradación |
| 8 | **Mover tokens a cookies httpOnly** | Security, Frontend | Elimina vulnerabilidad XSS en tokens |
| 9 | **Implementar checkout** o integrar WhatsApp Business API | UI/UX | Habilita la conversión real de ventas |
| 10 | **Configurar backups automáticos** de MySQL y uploads | DevOps | Protege contra pérdida de datos del negocio |

---

## Veredicto Final

El proyecto MAKUK tiene una **base sólida y bien estructurada** para ser un MVP de e-commerce. La separación frontend/backend, el sistema CMS completo con transacciones MySQL, y el flujo de autenticación JWT demuestran buenas decisiones fundamentales.

**Fortalezas detectadas:**
- Arquitectura frontend/backend limpia y separada
- CMS completo con 10 secciones editables
- Transacciones MySQL con rollback en operaciones complejas
- Queries parametrizadas (protección contra SQL injection)
- UUID naming para uploads (seguridad de archivos)
- Content fallback para desarrollo local
- Refresh token almacenado en DB (revocable)

**Áreas de mejora prioritarias:**
- Seguridad (CORS, headers, rate limiting, validación)
- Testing (0% → al menos 60% cobertura)
- DevOps (CI/CD, backups, monitoreo)
- Performance (code splitting, caching, lazy loading)
- Documentación (README, API docs, deployment guide)

**Recomendación:** Abordar las 10 acciones prioritarias en sprints de 2 semanas, empezando por seguridad y testing.

---

> *Auditoría realizada por el equipo de 12 especialistas coordinados por el Orquestador de Desarrollo.*
> *Documento generado el 4 de marzo de 2026.*
