# Registro de Actividades - MAKUK Admin Panel

## Acceso al Panel de Administracion
- **Correo:** patcorher@gmail.com
- **Clave:** 123456
- **Ruta:** /admin/login

---

## 2026-03-10 (sesion 2)

### Cambios realizados

#### Fix: seccion piezas unicas no se mostraba en pagina principal
- **Archivo:** `src/components/UniquePieces.jsx`
- La seccion tenia un `return null` cuando no habia items destacados, lo que ocultaba toda la seccion (titulo, subtitulo, link).
- Se cambio para que la seccion siempre se muestre (igual que Categories), y solo las tarjetas se oculten si no hay productos destacados.
- **Nota:** los productos de piezas unicas deben tener `destacado = 1` en la BD para aparecer en el home. Se activa desde Admin → Piezas Unicas.

---

## 2026-03-10

### Resumen del dia
Correccion completa del sistema de movimiento/zoom de imagenes: migracion global de `objectPosition` a `translate()` en todas las vistas (admin, publicas, popup). Flechas simplificadas, touch drag en movil, y tarjetas admin igualadas a las publicas.

### Cambios realizados

#### 1. Fix flechas popup producto - cambio a translate()
- **Archivo:** `src/pages/Productos.jsx`
- Se corrigio el sistema de movimiento de imagen en el popup publico.
- Se reemplazo `transform-origin` por `translate()` para evitar el bloqueo entre ejes (mover en X bloqueaba Y y viceversa).
- El zoom ya no resetea la posicion de la imagen.
- Al cerrar el popup, la posicion y zoom vuelven a su estado original.

#### 2. Estilo flechas popup simplificado
- **Archivo:** `src/styles/productos.css`
- Se removio el fondo circular (`background`, `border`, `border-radius: 50%`) de las flechas del popup.
- Ahora son solo iconos sin envoltorio visual.
- Se redujo el gap entre flechas e imagen de 4px a 2px para acercarlas mas.

#### 3. Touch drag en movil para popup producto
- **Archivo:** `src/pages/Productos.jsx`
- Se agrego soporte de arrastre con dedo (touch) solo en dispositivos moviles (`isMobile`).
- Se usa `onTouchStart`, `onTouchMove`, `onTouchEnd` en el contenedor de la imagen.
- Sensibilidad ajustada a 0.15 para movimiento suave.
- `touchAction: none` en movil para evitar scroll del navegador al arrastrar.
- Las flechas se mantienen disponibles en ambos modos (desktop y movil).

#### 4. Migracion global de objectPosition a translate()
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/pages/admin/AdminUniquePieces.jsx`, `src/components/Categories.jsx`, `src/components/UniquePieces.jsx`, `src/pages/Productos.jsx`, `src/styles/admin.css`, `src/styles/secciones.css`, `src/styles/productos.css`
- Se elimino el uso de `objectPosition` + `transform: scale()` directamente en `<img>` en todas las vistas.
- Se introdujeron wrapper divs con `transform: scale(zoom) translate(tx, ty)` donde `tx = 50 - imagePosX` y `ty = 50 - imagePosY`.
- Esto resuelve el bloqueo entre ejes que ocurria con `objectPosition` (solo mueve donde hay exceso de contenido).
- CSS variables `--img-zoom`, `--img-tx`, `--img-ty` para animaciones de hover en paginas publicas.
- Heights responsive movidos de `img` a los wrappers correspondientes.

#### 5. Tarjetas admin igualadas a pagina publica
- **Archivo:** `src/styles/admin.css`
- Grid de tarjetas admin cambiado de 5 columnas a 4 columnas con gap de 20px.
- Imagen de tarjetas con `height: 180px` fijo (igual que pagina publica).
- Tarjetas de tipo de categoria y de productos con misma proporcion visual.

### Deploy
- Commits: `e85c63b`, `b841455`, `6674929`, `13243f6`, `dba4fd3`, `4f24dd7`.
- Deploy completo al VPS en cada commit: git pull + build + copia a `/var/www/makuk/frontend/build/`.

---

## 2026-03-08

### Resumen del dia
Optimizacion completa del sistema de imagenes: conversion automatica a WebP con sharp, generacion de thumbnails, lazy loading y popup de eliminacion de categorias. Se trabajo en rama `Imagenes_productos` que luego se mergeo a main.

### Cambios realizados

#### 1. Optimizacion de imagenes con sharp (backend)
- **Archivos:** `backend/src/routes/upload.js`, `backend/package.json`
- Se reemplazo `multer.diskStorage` por `multer.memoryStorage` para procesar la imagen en memoria antes de guardarla.
- Se integro `sharp` para:
  - Convertir cualquier imagen (JPG, PNG, GIF) a **WebP** automaticamente.
  - Redimensionar a max **1200px** de ancho (imagen principal, calidad 80).
  - Generar **thumbnail** de max **400px** de ancho (calidad 75).
- Cada imagen subida genera dos archivos: `uuid.webp` y `uuid_thumb.webp`.
- Se elimino la dependencia del `uploadController.js` (logica movida directamente a la ruta).

#### 2. Lazy loading en imagenes publicas (frontend)
- **Archivos:** `src/pages/Productos.jsx`, `src/components/Categories.jsx`, `src/components/UniquePieces.jsx`, `src/components/Worldwide.jsx`, `src/components/About.jsx`
- Se agrego `loading="lazy"` a todas las etiquetas `<img>` de componentes publicos.
- El navegador solo descarga las imagenes visibles en pantalla, el resto se carga al hacer scroll.

#### 3. Thumbnails en listados (frontend)
- **Archivo nuevo:** `src/utils/imageUtils.js`
- Se creo la funcion `getThumb(url)` que deriva la URL del thumbnail a partir de la imagen principal (`uuid.webp` → `uuid_thumb.webp`). Para imagenes legacy (no webp) devuelve la misma URL.
- **Archivos modificados:** `src/pages/Productos.jsx`, `src/components/Categories.jsx`, `src/components/UniquePieces.jsx`
- Los listados de productos, categorias y piezas unicas ahora cargan el **thumbnail** (~10-15KB) en vez de la imagen completa.
- El popup de detalle de producto sigue cargando la **imagen completa** (1200px).

#### 4. Popup de eliminacion de categorias (admin)
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/styles/admin.css`
- Se agrego boton de eliminar (icono basura) en cada tarjeta de categoria en la pestana "Tipos de categorias".
- Al hacer clic se abre un popup de confirmacion con:
  - Icono de advertencia (triangulo amarillo).
  - Nombre de la categoria a eliminar.
  - Aviso destacado: se eliminaran todos los productos dentro de la categoria (muestra cantidad exacta).
  - Botones "Cancelar" y "Eliminar".
- Se muestra el conteo de productos en cada tarjeta de categoria.
- Al confirmar, se eliminan la categoria y todos sus productos asociados.
- Estilos responsive: en movil los botones se apilan verticalmente y el popup se ajusta al ancho.

#### 5. Script de migracion de imagenes existentes
- **Archivo nuevo:** `backend/src/scripts/migrate-images.js`
- Script para convertir imagenes existentes (JPG/PNG) a WebP + generar thumbnails.
- Actualiza las URLs en la base de datos automaticamente.
- No borra los archivos originales por seguridad.
- Uso: `node src/scripts/migrate-images.js` (en el VPS).

#### 6. Configuracion NGINX
- Se agrego `client_max_body_size 5M` en `/etc/nginx/sites-enabled/makuk` para permitir subida de imagenes de hasta 5MB (antes usaba el default de 1MB, causando error 413).

#### 7. Limpieza de base de datos
- Se ejecuto `TRUNCATE TABLE products` para vaciar todos los productos de prueba (11 registros).
- Se eliminaron todas las imagenes del directorio `/var/www/makuk/uploads/` (13 archivos).
- Auto_increment reiniciado a 1.

### Rama y deploy
- Se creo rama `Imagenes_productos`, se hicieron 2 commits y se mergeo a `main` via fast-forward.
- Deploy completo: backend (sharp instalado, PM2 reiniciado) + frontend (build y copia a `/var/www/makuk/frontend/build/`).

---

## 2026-03-01

### Resumen del dia
Continuacion del desarrollo del panel de administracion. Se trabajaron mejoras de UI/UX en multiples secciones: categorias, piezas unicas, sidebar, modales de productos y componentes compartidos.

### Cambios realizados

#### 1. Modal draggable en Categorias
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Se completo la implementacion del modal draggable. Se aplico `transform: translate()` al modal y se agrego `onMouseDown={handleDragStart}` en el titulo para poder arrastrar el modal con el mouse.

#### 2. Grilla de categorias de 4 a 5 columnas
- **Archivo:** `src/styles/admin.css`
- Se cambio `grid-template-columns: repeat(4, 1fr)` a `repeat(5, 1fr)` para mostrar 5 categorias por fila.

#### 3. Altura de tarjetas de categorias aumentada
- **Archivo:** `src/styles/admin.css`
- Se aumento la altura de las imagenes en tarjetas de 90px a 140px (`.admin-grid-card-img`).
- Se ajusto la tarjeta de agregar (`min-height: 180px`).

#### 4. Pestanas en AdminCategories
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Se agregaron dos pestanas: **"Tipos de categorias"** (contenido existente) y **"Subir productos"**.

#### 5. Funcionalidad de subir productos por categoria
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Se implemento la pestana "Subir productos" con:
  - Selector de categoria (dropdown)
  - Grilla de productos filtrados por categoria seleccionada
  - Tarjeta "+ Agregar producto" siempre como primera tarjeta
  - Modal de edicion de producto (nombre, descripcion, imagen, precios)
  - Modal draggable
- Los productos se guardan en `content.products.items` y se reflejan en la pagina publica.

#### 6. Botones Editar/Eliminar en tarjetas de productos
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/styles/admin.css`
- Se agregaron botones "Editar" y "Eliminar" debajo de cada tarjeta de producto.
- Modo normal: solo texto (sin iconos).
- Modo movil (768px): solo iconos (sin texto).
- Estilos: `.admin-grid-card-wrapper`, `.admin-grid-card-actions`, `.btn-card-edit`, `.btn-card-delete`.

#### 7. Imagenes completas en tarjetas
- **Archivo:** `src/styles/admin.css`
- Se cambio `object-fit: cover` a `object-fit: contain` en `.admin-grid-card-img` para que las imagenes se vean completas sin recorte.
- Se agrego `background: #f9f9f9` como fondo.

#### 8. Sidebar: botones del footer
- **Archivos:** `src/pages/admin/AdminLayout.jsx`, `src/styles/admin.css`
- Se elimino el boton "Restaurar" y la funcion `handleReset`.
- Se removio la importacion de `useContent`.
- Botones "Salir" y "Ver sitio" ahora estan uno al lado del otro, mas pequenos.
- Se movieron dentro del `<nav>` para que el scroll pase al lado como las opciones del menu.
- Estilos ajustados: padding reducido, font-size 0.7rem.

#### 9. AdminUniquePieces: titulo y subtitulo en misma fila
- **Archivo:** `src/pages/admin/AdminUniquePieces.jsx`
- Se envolvieron los campos titulo y subtitulo en `<div className="admin-row">`.

#### 10. AdminUniquePieces: tarjetas en grilla de 5
- **Archivo:** `src/pages/admin/AdminUniquePieces.jsx`
- Se reemplazo la lista accordion por grilla de tarjetas (`admin-grid-4` que usa 5 columnas).
- Se agrego modal de edicion al hacer click en una tarjeta.

#### 11. Pestanas en AdminUniquePieces
- **Archivo:** `src/pages/admin/AdminUniquePieces.jsx`
- Se agregaron dos pestanas: **"Productos de pagina"** y **"Piezas unicas"**.
- Pestana "Productos de pagina": textos de seccion + grilla de piezas existentes.
- Pestana "Piezas unicas": subir productos de categoria `piezas-unicas`.

#### 12. Subir productos en Piezas Unicas
- **Archivo:** `src/pages/admin/AdminUniquePieces.jsx`
- Se implemento la misma funcionalidad de subir productos que en categorias pero sin selector de categoria (todos se asignan a `piezas-unicas`).
- Tarjetas con botones Editar/Eliminar.
- Modal de edicion con los mismos campos.

#### 13. Modales de productos: botones Guardar/Cancelar
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/pages/admin/AdminUniquePieces.jsx`
- Se cambiaron los botones del modal de "Eliminar"/"Cerrar" a **"Guardar"/"Cancelar"**.
- **Guardar:** cierra el modal y mantiene el producto.
- **Cancelar:** cierra el modal y elimina el producto si era nuevo (no lo guarda).
- Se agrego estado `isNewProduct` para diferenciar entre crear y editar.
- Cerrar con X o click fuera tambien cancela.
- Titulo del modal cambia segun si es nuevo ("Agregar producto") o existente ("Editar producto").
- Estilo del boton Guardar: `.btn-save-modal` (color cobre).

#### 14. ImageUploader en modales de productos
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/pages/admin/AdminUniquePieces.jsx`
- Se reemplazo el campo de texto "Imagen (URL)" + preview manual por el componente `ImageUploader` en modo compact.
- Al hacer click se abre el selector de archivos y la imagen se muestra directamente.

#### 15. Modales mas compactos
- **Archivo:** `src/styles/admin.css`
- Padding del modal reducido de 20px a 16px.
- Margin entre campos reducido de 10px a 7px.
- Font-size de labels reducido a 0.75rem.
- Padding de inputs reducido a 5px 8px, font-size 0.8rem.

#### 16. Textarea auto-expandible en descripcion
- **Archivos:** `src/components/admin/AdminFormField.jsx`, `src/styles/admin.css`
- Campo de descripcion cambiado de input text a textarea con auto-resize.
- Empieza con 1 fila, crece automaticamente segun contenido.
- Tope maximo de 3 filas visibles (`max-height: 4.5em`).
- Scroll interno despues de 3 filas.
- Se agrego clase `.textarea-auto` con `resize: none` y `overflow-y: auto`.

#### 17. Boton Destacado removido de modales de productos
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/pages/admin/AdminUniquePieces.jsx`
- Se elimino el toggle "Destacado" de ambos modales de agregar/editar producto.

---

## Conexion al Servidor VPS

### SSH
- **Host alias:** `makuk`
- **IP:** 186.64.122.100
- **Puerto:** 34263
- **Usuario:** root
- **Autenticacion:** Clave SSH ed25519
- **Clave privada:** `~/.ssh/makuk_vps`
- **Clave publica:** `~/.ssh/makuk_vps.pub`
- **Comentario clave:** segundo-usuario-makuk
- **Contraseña (respaldo):** (ver gestor de credenciales)

### Conexion rapida
```bash
ssh makuk
```

### Configuracion SSH (~/.ssh/config)
```
Host makuk
    HostName 186.64.122.100
    User root
    Port 34263
    IdentityFile ~/.ssh/makuk_vps
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

### MySQL (via SSH)
- **Host:** localhost (desde el servidor)
- **Puerto:** 3306
- **Usuario:** makuk_user
- **Contraseña:** (en .env del backend en VPS)
- **Base de datos:** makuk_db

### Comandos utiles
```bash
# Conectar al servidor
ssh makuk

# Consultar MySQL
ssh makuk "mysql -u makuk_user -p'***' makuk_db -e 'SHOW TABLES;'"

# Entrar a MySQL interactivo
ssh makuk -t "mysql -u makuk_user -p'***' makuk_db"
```

---

## 2026-03-01 (sesion 2) - Deploy al VPS

### Resumen
Se configuro el flujo completo de deploy: repositorio Git → GitHub → VPS. El sitio quedo en produccion en **makuk.cl**.

### Flujo de deploy implementado
```
PC local (git push) → GitHub → VPS (git pull + npm install + npm run build)
```

### GitHub
- **Repositorio:** https://github.com/pato1982/makuk.git
- **Usuario:** pato1982
- **Token (PAT):** (almacenado en credential manager local)
- **Branch:** main

### Pasos realizados

#### 1. Inicializacion del repositorio Git
- `git init` en `/mnt/c/Users/Telqway/Desktop/paginas/makuk/makuk-react`
- Se agrego `.env` al `.gitignore` (contiene credenciales admin)
- Se configuro identidad git: `pato1982` / `pato1982@users.noreply.github.com`
- Commit inicial con 63 archivos
- Push a `https://github.com/pato1982/makuk.git` (branch `main`)

#### 2. Instalacion de Node.js en el VPS
- Se instalo Node.js v20.20.0 LTS via NodeSource
- npm v10.8.2
- Comando: `curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs`

#### 3. Compilacion en el VPS
- Clonado del repo en `/var/www/makuk/frontend/repo`
- `npm install` + `npm run build` ejecutados en el servidor
- Archivos de `dist/` copiados a `/var/www/makuk/frontend/build/` (donde Nginx los sirve)

#### 4. Verificacion
- Nginx recargado exitosamente (`nginx -t && systemctl reload nginx`)
- Sitio respondiendo HTTP 200
- URL: **http://makuk.cl** / **http://www.makuk.cl**

### Estructura en el VPS
```
/var/www/makuk/frontend/
├── repo/          ← repositorio git clonado (fuente)
│   ├── src/
│   ├── dist/      ← build generado por Vite
│   └── ...
└── build/         ← archivos servidos por Nginx (copia de dist/)
    ├── index.html
    ├── assets/
    ├── imagenes/
    └── vite.svg
```

### Comando para futuros deploys
```bash
ssh makuk "cd /var/www/makuk/frontend/repo && git pull && npm install && npm run build && rm -rf ../build/* && cp -r dist/* ../build/"
```

### Notas
- Node.js no esta instalado en WSL local (no se puede compilar localmente)
- El build se hace directamente en el VPS
- El `.env` no se sube a GitHub; en produccion las variables VITE_ se embeben en el build
- Nginx config apunta a `build/`, Vite genera `dist/` → se copian los contenidos

---

### Archivos modificados hoy
| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/admin/AdminCategories.jsx` | Pestanas, productos, modal draggable, botones |
| `src/pages/admin/AdminUniquePieces.jsx` | Pestanas, grilla, productos, modal |
| `src/pages/admin/AdminLayout.jsx` | Sidebar footer simplificado |
| `src/components/admin/AdminFormField.jsx` | Textarea auto-expandible |
| `src/styles/admin.css` | Grilla 5 cols, tarjetas, botones, modal compacto, textarea |

---

## 2026-03-02

### Resumen del dia
Navegacion del sitio publico, modal de contacto, layout mobile de productos, sistema de portadas por categoria en el admin y reestructuracion del footer.

### Cambios realizados

#### 1. Header: Colecciones navega a /productos
- **Archivo:** `src/components/Header.jsx`
- Click en "Colecciones" ahora navega a `/productos` (muestra todos los productos) en vez de hacer scroll a la seccion de categorias en la home.

#### 2. Header: Contacto abre modal
- **Archivos:** `src/components/Header.jsx`, `src/components/ContactModal.jsx`, `src/styles/productos.css`
- Click en "Contacto" en el header abre un modal con formulario (nombre, telefono, correo, consulta).
- Modal compacto (`max-width: 400px`), acorde al estilo del proyecto (colores cobre, tipografias, animacion `modalIn`).
- Estado de confirmacion "Mensaje enviado" al submitear.
- Responsive: en movil se reduce a `max-width: 320px`.

#### 3. Productos mobile: filas de 5 con scroll horizontal
- **Archivos:** `src/pages/Productos.jsx`, `src/styles/productos.css`
- En modo movil (<700px), los productos se agrupan en filas de 5 tarjetas.
- Cada fila es un contenedor con scroll horizontal (swipe), mostrando 2 tarjetas a la vez.
- Scroll snap para alinear tarjetas al deslizar.
- Scrollbar fino estilizado en color cobre.
- Se agrego estado `isMobile` con listener de resize y `useMemo` para agrupar productos en chunks de 5.
- En desktop/tablet sigue funcionando la grilla normal.

#### 4. Fix sincronizacion filtro URL en Productos
- **Archivo:** `src/pages/Productos.jsx`
- Se corrigio el `useEffect` de `categoriaURL`: ahora resetea a `'todos'` cuando el parametro `cat` desaparece de la URL, evitando que el filtro quede pegado al navegar entre `/productos?cat=X` y `/productos`.

#### 5. Footer: reestructuracion a 3 columnas
- **Archivos:** `src/components/Footer.jsx`, `src/styles/footer.css`
- Se eliminaron las listas de categorias bajo "Colecciones" y "Mas Joyas", dejando solo los titulos como links.
- "Colecciones" → navega a `/productos` (todos los productos).
- "Mas Joyas" → navega a `/productos?cat=unicas` (piezas unicas filtradas).
- Se agruparon ambos links en una sola columna central (`footer-links-col`).
- Footer paso de 4 columnas a 3: Logo/descripcion | Colecciones + Mas Joyas | Contacto.
- Columna izquierda mas ancha (`3fr 1fr 1.5fr`).
- Links del footer heredan color dorado (`copper-shine`) con hover de opacidad.
- En movil: contacto oculto, links centrados.

#### 6. Admin: toggle de portada en tarjetas de productos
- **Archivos:** `src/pages/admin/AdminCategories.jsx`, `src/styles/admin.css`
- Se agrego barra toggle (`card-toggle-bar`) encima de cada tarjeta de producto en la pestana "Subir productos" de Categorias.
- Toggle compacto alineado a la derecha, mismo estilo visual que piezas unicas.
- Solo 1 producto puede estar activo por categoria (portada de esa coleccion).

#### 7. Admin: popup "Portada ya seleccionada"
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Si se intenta activar un segundo toggle en la misma categoria, aparece popup indicando que debe desactivar el actual primero.
- Usa el mismo estilo `limit-popup` que piezas unicas.

#### 8. Admin: popup "Selecciona una portada"
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Si una categoria tiene productos pero ninguno con toggle activo, no permite cambiar de categoria ni de pestana.
- Aparece popup "Selecciona una portada" indicando que debe activar 1 producto como imagen de portada para esa categoria.

#### 9. Portada de categoria desde producto destacado
- **Archivo:** `src/components/Categories.jsx`
- La imagen de cada tarjeta de categoria en la home ahora se obtiene del producto con `destacado: true` de esa categoria.
- Funcion `getPortada(slug)` busca el producto destacado; si no hay, usa la imagen original como fallback.

#### 10. Sanitizacion de datos al cargar admin
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Al inicializar `productsData`, se sanitizan los destacados: si una categoria tiene mas de 1 producto destacado, solo se mantiene el primero.
- Se corrigio en `content.json` el producto id 6 ("Brazalete Raices") que tenia `destacado: true` duplicado en la categoria "pulseras".

#### 11. Sync nombresCategorias al guardar
- **Archivo:** `src/pages/admin/AdminCategories.jsx`
- Al guardar, `nombresCategorias` se reconstruye completamente desde las categorias actuales (ya no hace merge con nombres viejos).
- Se preserva la entrada "unicas" (Piezas Unicas) que viene de otra seccion.

### Archivos modificados/creados
| Archivo | Tipo de cambio |
|---------|---------------|
| `src/components/Header.jsx` | Navegacion Colecciones y Contacto modal |
| `src/components/ContactModal.jsx` | **Nuevo** - Modal de contacto |
| `src/components/Categories.jsx` | Portada desde producto destacado |
| `src/components/Footer.jsx` | 3 columnas, links sin sublistas |
| `src/pages/Productos.jsx` | Filas scroll mobile, fix filtro URL |
| `src/pages/admin/AdminCategories.jsx` | Toggle portada, popups validacion, sanitizacion |
| `src/data/content.json` | Fix destacado duplicado en pulseras |
| `src/styles/productos.css` | Estilos scroll mobile, modal contacto |
| `src/styles/footer.css` | 3 columnas, estilos links h4 |
| `src/styles/admin.css` | Toggle externo categorias |

### Deploy
- **Commit:** `2f6eeee`
- **Push:** GitHub `origin/main`
- **VPS:** `ssh makuk` → git pull + build + deploy exitoso

---

## 2026-03-03 - Conexion a Base de Datos (Pasos 1-11)

### Resumen del dia
Migracion completa del frontend y backend para conectar el sitio a MySQL. Se implementaron los pasos 1 al 11 del plan de 15 pasos para conectar todo a la base de datos.

### Plan de 15 pasos
| Paso | Descripcion | Estado |
|------|------------|--------|
| 1 | Crear base de datos MySQL y tablas | Completado |
| 2 | Seed inicial con datos de content.json | Completado |
| 3 | Backend Express con estructura MVC | Completado |
| 4 | Rutas de autenticacion (JWT access/refresh) | Completado |
| 5 | Rutas admin CRUD (PUT por seccion) | Completado |
| 6 | Ruta publica GET /api/content | Completado |
| 7 | api.js en frontend (apiFetch con auto-refresh) | Completado |
| 8 | Migrar AuthContext a JWT | Completado |
| 9 | Migrar ContentContext a API | Completado |
| 10 | Conectar paginas admin con saveSection | Completado (integrado en paso 9) |
| 11 | AdminControl con getAdminStats | Completado |
| 12 | ImageUploader con uploadImage | Pendiente |
| 13 | Subir backend al VPS + PM2 | Pendiente |
| 14 | NGINX reverse proxy | Pendiente |
| 15 | Testing E2E | Pendiente |

### Cambios realizados

#### Paso 8: Migrar AuthContext a JWT
- **Archivos:** `src/context/AuthContext.jsx`, `src/pages/admin/Login.jsx`, `src/components/admin/ProtectedRoute.jsx`, `src/pages/admin/AdminLayout.jsx`
- AuthContext ahora usa `loginApi()`, `logoutApi()`, `getMe()` del api.js en vez de comparar contra variables de entorno
- Estado `loading` para verificar token al cargar la pagina
- ProtectedRoute muestra spinner "Verificando sesion..." mientras carga
- Login.jsx: handleSubmit async con try/catch, estados `submitting` y `recoveryError`
- Boton "Acceso rapido" eliminado (ya no hay credenciales hardcodeadas)
- Login redirige a /admin si ya esta autenticado (useEffect con isAuthenticated)
- handleLogout en AdminLayout ahora es async con await
- Limpieza de `makuk_auth` viejo del localStorage
- Error de red muestra "Error de conexion. Verifica tu internet e intenta de nuevo."

#### Paso 9: Migrar ContentContext a API
- **Archivos:** `src/context/ContentContext.jsx`, `src/components/admin/ProtectedRoute.jsx`
- ContentContext ahora carga contenido desde `GET /api/content` (fetchContent del api.js)
- Fallback a `content.json` si la API no responde (para desarrollo local sin backend)
- `updateSection()` hace actualizacion optimista del state + `saveSection()` al backend
- ProtectedRoute espera tanto auth como contenido antes de montar paginas admin
- Limpieza de `makuk_content` viejo del localStorage
- `contentService.js` eliminado (codigo muerto, reemplazado por api.js)

#### Fixes del paso 9 (6 problemas encontrados y corregidos)
- **Archivos:** 10 paginas admin, `ContentContext.jsx`, `api.js`, `admin.css`, `Dashboard.jsx`, `AdminControl.jsx`
- **Fix 1:** handleSave async en las 10 paginas admin — "Guardado" solo aparece si la API confirma; si falla muestra error rojo
- **Fix 2:** Segundo fetch en apiFetch (tras refresh de token) protegido con try/catch para errores de red
- **Fix 3:** `reloadContent` con try/catch para errores de API
- **Fix 4:** `contentService.js` eliminado (nadie lo importaba)
- **Fix 5:** Dashboard.jsx texto actualizado: "Los cambios se guardan en la base de datos" (antes decia localStorage)
- **Fix 6:** AdminControl.jsx: estado de DB ahora dice "Conectada" con punto verde (antes decia "Pendiente")
- Paginas con multiples updateSection usan `Promise.all` (AdminHeader 3 calls, AdminCategories 2, AdminUniquePieces 2)
- Estilo `.save-error` agregado a admin.css (fondo rosa, texto rojo, icono de exclamacion)

#### Paso 11: AdminControl con getAdminStats()
- **Archivos:** `src/pages/admin/AdminControl.jsx`, `backend/src/controllers/adminController.js`
- Backend `getStats` ampliado: ahora devuelve 6 contadores + tamaño de la DB
  - `products`, `categories`, `testimonials`, `countries`, `processSteps`, `aboutFeatures`, `dbSizeBytes`
  - Queries en paralelo con `Promise.all` para mejor rendimiento
- AdminControl ya no lee de `content` en memoria; hace `getAdminStats()` al montar
- Barra de almacenamiento muestra tamaño real de la DB MySQL (antes calculaba tamaño de localStorage)
- Loading spinner y error handling al cargar estadisticas

### Backend creado (pasos 1-7)
- **Directorio:** `backend/`
- **Stack:** Node.js + Express + MySQL (mysql2)
- **Autenticacion:** JWT con access token (15 min) + refresh token (7 dias), bcrypt para passwords
- **Estructura:**
  ```
  backend/src/
  ├── config/
  │   ├── db.js          ← Pool MySQL
  │   ├── schema.sql     ← Estructura de tablas
  │   ├── seed.js        ← Script de seed
  │   └── seed.sql       ← Datos iniciales
  ├── controllers/
  │   ├── adminController.js   ← CRUD de secciones + stats
  │   ├── authController.js    ← Login/logout/refresh/recovery/me
  │   ├── contentController.js ← GET publico (todo el contenido)
  │   └── uploadController.js  ← Upload de imagenes
  ├── middleware/
  │   └── auth.js        ← requireAuth (verifica JWT)
  ├── routes/
  │   ├── admin.js       ← PUT /api/admin/:section (protegidas)
  │   ├── auth.js        ← /api/auth/* (login, logout, refresh, recovery, me)
  │   ├── content.js     ← GET /api/content (publica)
  │   └── upload.js      ← POST /api/upload (protegida)
  ├── utils/
  │   └── tokens.js      ← Generacion/verificacion JWT
  └── server.js          ← Entry point Express
  ```

### Frontend api.js
- **Archivo:** `src/services/api.js`
- `apiFetch()` — fetch con auto-refresh de tokens JWT y mensajes de error amigables
- Funciones exportadas: `loginApi`, `logoutApi`, `getMe`, `requestRecovery`, `fetchContent`, `saveSection`, `getAdminStats`, `uploadImage`
- Mapeo de rutas: `uniquePieces` → `unique-pieces`, `productsPage` → `products-page`

### Commits
| Hash | Descripcion |
|------|------------|
| `205b1bd` | Backend Express + MySQL y migracion auth a JWT (pasos 1-8) |
| `5faba12` | Paso 9: Migrar ContentContext a API |
| `74c77ef` | Fix 6 problemas del paso 9 |
| `ee5d8d3` | Paso 11: AdminControl con getAdminStats() desde MySQL |

### Archivos modificados/creados
| Archivo | Tipo de cambio |
|---------|---------------|
| `backend/` (17 archivos) | **Nuevo** — Backend completo |
| `src/services/api.js` | **Nuevo** — Funciones de API |
| `src/context/AuthContext.jsx` | Migrado a JWT |
| `src/context/ContentContext.jsx` | Migrado a API |
| `src/components/admin/ProtectedRoute.jsx` | Spinner auth + content |
| `src/pages/admin/Login.jsx` | Async, redirect si logueado |
| `src/pages/admin/AdminLayout.jsx` | handleLogout async |
| `src/pages/admin/AdminHeader.jsx` | handleSave async + error |
| `src/pages/admin/AdminCategories.jsx` | handleSave async + error |
| `src/pages/admin/AdminUniquePieces.jsx` | handleSave async + error |
| `src/pages/admin/AdminAbout.jsx` | handleSave async + error |
| `src/pages/admin/AdminProcess.jsx` | handleSave async + error |
| `src/pages/admin/AdminWorldwide.jsx` | handleSave async + error |
| `src/pages/admin/AdminTestimonials.jsx` | handleSave async + error |
| `src/pages/admin/AdminFooter.jsx` | handleSave async + error |
| `src/pages/admin/AdminProducts.jsx` | handleSave async + error |
| `src/pages/admin/AdminProductsPage.jsx` | handleSave async + error |
| `src/pages/admin/AdminControl.jsx` | Migrado a getAdminStats() |
| `src/pages/admin/Dashboard.jsx` | Texto actualizado |
| `src/styles/admin.css` | .save-error |
| `src/services/contentService.js` | **Eliminado** |
| `.gitignore` | Backend .env |

#### Paso 12: ImageUploader con uploadImage()
- **Archivo:** `src/components/admin/ImageUploader.jsx`
- Cambiado de base64 `readAsDataURL` a subida real via `POST /api/upload`
- `uploadImage(file)` envia FormData al backend, Multer guarda con UUID en `/var/www/makuk/uploads/`
- Estados: `uploading` (spinner), `uploadError` (mensaje de error)
- Input file se limpia despues de cada upload para permitir resubir el mismo archivo
- Modo compact: click en el area completa abre selector de archivos
- Modo normal: boton de upload al lado del input de URL

#### Paso 13: Backend en VPS con PM2
- Instalado PM2 globalmente: `npm install -g pm2`
- Backend subido a `/var/www/makuk/backend/` via SCP
- `.env` creado con credenciales MySQL, JWT secrets (generados con `openssl rand -hex 64`), y `UPLOAD_DIR=/var/www/makuk/uploads`
- `npm install` en el servidor
- Iniciado con PM2: `pm2 start src/server.js --name makuk-api`
- PM2 configurado para autostart: `pm2 startup && pm2 save`
- Backend corriendo en puerto 3001

#### Paso 14: NGINX reverse proxy
- Config en `/etc/nginx/sites-available/makuk`:
  - `location /api/` → proxy a `http://127.0.0.1:3001` (sin trailing slash para preservar prefijo `/api/`)
  - `location ^~ /uploads/` → alias a `/var/www/makuk/uploads/` (con `^~` para prioridad sobre regex de assets)
  - `location ~* \.(js|css|png|...)$` → cache 30 dias
  - Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Fix: trailing slash en proxy_pass eliminado (causaba strip de `/api/` prefix)
- Fix: `^~` agregado a `/uploads/` (regex de assets `.png` interceptaba las imagenes subidas)

#### Paso 15: Testing E2E
- Todos los endpoints verificados via IP directa (186.64.122.100):
  - Frontend: HTML carga correctamente
  - GET /api/content: 12 secciones desde MySQL
  - GET /api/health: status ok
  - Rutas admin protegidas: "Token requerido" sin auth
  - POST /api/auth/login: tokens JWT generados correctamente
  - GET /api/auth/me: datos de usuario
  - GET /api/admin/stats: contadores y tamaño DB
  - PUT /api/admin/hero: guardado exitoso
  - POST /api/upload: imagen subida con UUID
  - GET /uploads/: imagen accesible via NGINX

### Plan de 15 pasos — Estado final
| Paso | Descripcion | Estado |
|------|------------|--------|
| 1 | Crear base de datos MySQL y tablas | Completado |
| 2 | Seed inicial con datos de content.json | Completado |
| 3 | Backend Express con estructura MVC | Completado |
| 4 | Rutas de autenticacion (JWT access/refresh) | Completado |
| 5 | Rutas admin CRUD (PUT por seccion) | Completado |
| 6 | Ruta publica GET /api/content | Completado |
| 7 | api.js en frontend (apiFetch con auto-refresh) | Completado |
| 8 | Migrar AuthContext a JWT | Completado |
| 9 | Migrar ContentContext a API | Completado |
| 10 | Conectar paginas admin con saveSection | Completado |
| 11 | AdminControl con getAdminStats | Completado |
| 12 | ImageUploader con uploadImage | Completado |
| 13 | Subir backend al VPS + PM2 | Completado |
| 14 | NGINX reverse proxy | Completado |
| 15 | Testing E2E | Completado |

### Push a GitHub
- Push exitoso despues de permitir secreto via GitHub secret scanning
- Commit `21d7573` → `origin/main`

### Pendiente: DNS
- El dominio `makuk.cl` aun apunta al hosting cPanel (15.204.101.117)
- El VPS con todo funcionando esta en 186.64.122.100
- Cuando se tenga acceso a NIC Chile:
  1. Cambiar registro A de `makuk.cl` → `186.64.122.100`
  2. Cambiar registro A de `www.makuk.cl` → `186.64.122.100`
  3. Instalar SSL: `sudo certbot --nginx -d makuk.cl -d www.makuk.cl`
- Mientras tanto, el sitio es accesible via `http://186.64.122.100`

### Commits de la sesion
| Hash | Descripcion |
|------|------------|
| `205b1bd` | Backend Express + MySQL y migracion auth a JWT (pasos 1-8) |
| `5faba12` | Paso 9: Migrar ContentContext a API |
| `74c77ef` | Fix 6 problemas del paso 9 |
| `ee5d8d3` | Paso 11: AdminControl con getAdminStats() desde MySQL |
| `b40b91c` | Actualizar registro de actividades con pasos 1-11 |
| `2ed332d` | Paso 12: ImageUploader sube archivos al servidor via API |
| `21d7573` | Remover credenciales del registro de actividades |

---

## 2026-03-03 (sesion 2) - Mejoras UI/UX y Panel de Control

### Resumen
Fix de testimonios publicos, mejoras en el header/footer, pagina de login, y reestructuracion completa del panel de control admin.

### Cambios realizados

#### 1. Fix testimonios publicos invisibles
- **Archivos:** `src/pages/admin/AdminTestimonials.jsx`, `src/styles/admin.css`
- Las clases `.testimonial-card` del admin sobreescribian los estilos publicos (fondo blanco sobre texto color crema = invisible).
- Solucion: renombrar clases del admin a `.admin-testimonial-card`, `.admin-testimonials-grid`, etc.

#### 2. Icono de sesion en el Header
- **Archivos:** `src/components/Header.jsx`, `src/styles/header.css`
- Se agrego icono de usuario (`fa-user`) al lado derecho del carrito de compras.
- Click navega a `/admin/login`.
- Mismo tamano y estilo que el carrito.
- En movil: gap reducido a 5px entre carrito e icono de sesion.

#### 3. Boton volver en Login
- **Archivos:** `src/pages/admin/Login.jsx`, `src/styles/admin.css`
- Flecha circular (`fa-arrow-left`) a la izquierda del titulo "MAKUK" en la pagina de login.
- Click vuelve a la pagina principal (`/`).
- Transparente con borde cobre suave, hover relleno cobre.
- Responsive: 36px desktop, 33px tablet, 30px movil.

#### 4. Barra de almacenamiento del Servidor (VPS)
- **Archivos:** `backend/src/controllers/adminController.js`, `src/pages/admin/AdminControl.jsx`, `src/styles/admin.css`
- Backend: endpoint `/api/admin/stats` ahora devuelve `diskTotal` y `diskUsed` via `df -B1 /`.
- Frontend: dos barras lado a lado — MySQL y Servidor.
- Muestra GB usados, GB totales y GB libres.
- En movil se apilan en columna.
- Colores dinamicos: verde (<50%), naranja (<80%), rojo (>80%).

#### 5. KPIs del panel de control simplificados
- **Archivo:** `src/pages/admin/AdminControl.jsx`
- Se redujeron de 6 a 4 KPIs: Productos, Categorias, Piezas unicas, Testimonios.
- Se eliminaron: Paises, Pasos proceso, Features.
- Grilla: 4 columnas en desktop/tablet, 2x2 en movil.
- Tamanos ajustados para cada modo responsive.

#### 6. Estado del sistema: Servidor agregado
- **Archivo:** `src/pages/admin/AdminControl.jsx`
- Se agrego indicador "Servidor" con estado "Activo".
- "Panel de administracion" renombrado a "Panel admin".
- Ahora muestra 4 indicadores: Sitio web, Base de datos, Servidor, Panel admin.

#### 7. Responsive panel de control (movil)
- **Archivo:** `src/styles/admin.css`
- Fix overflow horizontal: `overflow-x: hidden` y `box-sizing: border-box` en `.admin-main`, `.admin-page`, `.admin-card`.
- Barras de almacenamiento: altura 18px, textos 0.65rem.
- KPIs: padding 8px, icono 0.85rem, numero 1rem, label 0.6rem.
- Estado del sistema: grid 2 columnas.

### Commits de la sesion
| Hash | Descripcion |
|------|------------|
| `7d6a29f` | Fix: testimonios publicos invisibles por conflicto CSS con admin |
| `845e39d` | Icono login en header, boton volver en login, barra almacenamiento servidor |
| `f39a5f6` | Fix: overflow horizontal en panel control movil y KPIs mas compactos |
| `b71923d` | Panel control: KPIs simplificados, servidor en estado del sistema |

### Pendiente
- Backend: agregar conteo `uniquePieces` en endpoint stats (productos de categoria piezas-unicas)

---

## 2026-03-04 - Auditoria de Seguridad y Popup de Producto

### Resumen del dia
Auditoria completa de seguridad del backend, optimizacion del frontend con lazy loading, tests automatizados, backups del VPS, y rediseno del popup de detalle de producto.

### Cambios realizados

#### 1. Auditoria de seguridad backend
- **Archivo:** `backend/src/controllers/adminController.js`
- Reemplazado `execSync('df -B1 /')` por `fs.statfs()` nativo de Node.js para obtener espacio en disco.
- Se elimino vulnerabilidad de command injection (CRITICO).

#### 2. CORS restringido con whitelist
- **Archivo:** `backend/src/server.js`
- CORS ya no acepta cualquier origen (`*`).
- Whitelist configurada: `http://localhost:5173`, `http://186.64.122.100`, `http://makuk.cl`, `http://www.makuk.cl` y variantes HTTPS.
- Origenes permitidos se leen desde variable de entorno `CORS_ORIGINS`.

#### 3. Lazy loading de rutas admin
- **Archivo:** `src/App.jsx`
- Todas las paginas admin (`Login`, `AdminLayout`, `Dashboard`, etc.) cargadas con `React.lazy()` + `import()`.
- `Suspense` con fallback "Cargando..." envuelve las rutas admin.
- Reduce el bundle publico inicial (usuarios no-admin no descargan codigo del admin).

#### 4. Fix: Suspense dentro de Routes
- **Archivo:** `src/App.jsx`
- `<Suspense>` estaba como hijo directo de `<Routes>`, lo cual React Router no permite (solo acepta `<Route>`).
- Causaba pantalla en blanco al cargar el sitio.
- Solucion: mover `Suspense` al `element` de cada ruta lazy individualmente.

#### 5. Tests automatizados
- **Archivos:** `backend/tests/api.test.js`, `backend/package.json`
- Agregado vitest + supertest como dependencias de desarrollo.
- Tests basicos de API: health check, contenido publico, rutas protegidas sin token.
- Script `npm test` configurado en package.json.

#### 6. README reescrito
- **Archivo:** `README.md`
- README anterior era el template de Vite.
- Reescrito con informacion real del proyecto: stack, estructura, instalacion, deploy, variables de entorno.

#### 7. Backend .env.example
- **Archivo:** `backend/.env.example`
- Template de variables de entorno para facilitar setup en nuevos entornos.
- Incluye: DB, JWT secrets, upload dir, CORS origins, puerto.

#### 8. Backups automaticos en VPS
- Configurado cron job diario en el VPS para backup de MySQL.
- Script de backup en `/var/www/makuk/backend/backup.sh`.
- Retencion de 7 dias de backups.

#### 9. Documento de auditoria
- **Archivo:** `AUDITORIA_MAKUK.md`
- Documento completo con hallazgos de seguridad, severidad, estado y recomendaciones.
- Cubre: command injection, CORS, lazy loading, tests, backups, y mas.

#### 10. Popup de detalle de producto rediseñado
- **Archivos:** `src/pages/Productos.jsx`, `src/styles/productos.css`
- Diseño lightbox: imagen grande arriba ocupando todo el ancho.
- Zona de info abajo dividida en dos columnas:
  - **Columna izquierda:** nombre centrado + precios (anterior tachado / actual en negrita).
  - **Columna derecha:** descripcion en texto justificado con ultima linea centrada (`text-align-last: center`).
- Precios: muestra precio anterior solo si existe y es diferente al actual.
- `formatearPrecio()` duplicado en componente `Productos` para acceso desde el popup.
- Responsive (<=500px): columnas se apilan verticalmente, texto centrado.

### Archivos modificados/creados
| Archivo | Tipo de cambio |
|---------|---------------|
| `AUDITORIA_MAKUK.md` | **Nuevo** — Documento de auditoria |
| `README.md` | Reescrito con info real del proyecto |
| `backend/.env.example` | **Nuevo** — Template de variables de entorno |
| `backend/tests/api.test.js` | **Nuevo** — Tests de API |
| `backend/package.json` | Dependencias de test |
| `backend/src/controllers/adminController.js` | Fix command injection (fs.statfs) |
| `backend/src/server.js` | CORS con whitelist |
| `src/App.jsx` | Lazy loading + fix Suspense en Routes |
| `src/pages/Productos.jsx` | Popup con dos columnas, precios, formatearPrecio |
| `src/styles/productos.css` | Estilos popup lightbox + dos columnas + responsive |

### Commits de la sesion
| Hash | Descripcion |
|------|------------|
| `9cc6527` | Auditoria: seguridad backend, lazy loading, tests, backups y docs |
| `556133b` | Popup producto: diseño lightbox con imagen destacada, info en dos columnas y precios |

---

## 2026-03-05 - Rediseno Popup de Producto

### Resumen del dia
Rediseno completo del popup de detalle de producto: layout cuadrado con dos columnas (imagen + info), imagen paneable con mouse/touch, y tooltip de ayuda para el usuario.

### Cambios realizados

#### 1. Popup cuadrado con dos columnas (desktop)
- **Archivos:** `src/pages/Productos.jsx`, `src/styles/productos.css`
- Popup cambiado de vertical (imagen arriba, info abajo) a horizontal con dos columnas.
- Tamano fijo: 480x320px, todos los popups del mismo tamano.
- **Columna izquierda (60%):** imagen del producto con `object-fit: cover`, ocupa todo el espacio.
- **Columna derecha (40%):** nombre (arriba), descripcion (medio, centrada verticalmente), precios anterior y actual (abajo, separados izquierda/derecha).
- Precio anterior tachado solo aparece si existe y es diferente al actual.

#### 2. Layout movil del popup
- **Archivos:** `src/pages/Productos.jsx`, `src/styles/productos.css`
- En movil (<500px) el popup cambia a vertical: imagen arriba (220px de alto).
- Debajo de la imagen: fila con nombre a la izquierda y descripcion a la derecha.
- Precios centrados en fila inferior, antes y despues lado a lado.

#### 3. Imagen paneable (drag to move)
- **Archivo:** `src/pages/Productos.jsx`
- Implementado sistema de paneo de imagen dentro del popup.
- **Desktop:** click y arrastrar con el mouse (cursor grab/grabbing).
- **Movil:** tocar y deslizar con el dedo.
- Solo permite movimiento en el eje donde la imagen tiene recorte (horizontal si es mas ancha, vertical si es mas alta).
- Al cerrar y reabrir el popup, la imagen siempre vuelve a su posicion original centrada (50% 50%).
- Usa `useRef` para el estado del paneo sin causar re-renders.

#### 4. Icono de ayuda con tooltip
- **Archivos:** `src/pages/Productos.jsx`, `src/styles/productos.css`
- Icono de manito (`fa-hand-paper`) arriba a la derecha de la imagen, boton circular blanco semitransparente.
- Al apretar muestra tooltip oscuro con mensaje contextual:
  - Desktop: "Haz click y arrastra para mover la imagen"
  - Movil: "Mantene presionada la imagen y desliza para moverla"
- Tooltip se oculta/muestra con toggle al apretar el icono.
- Se resetea al abrir un nuevo popup.
- Estilos: `.popup-pan-hint-btn` (boton), `.popup-pan-tooltip` (mensaje).

### Archivos modificados
| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/Productos.jsx` | Popup dos columnas, pan de imagen, tooltip de ayuda |
| `src/styles/productos.css` | Layout cuadrado, columnas, grab cursor, hint btn, tooltip, responsive |

### Commits de la sesion
| Hash | Descripcion |
|------|------------|
| `0dbc92f` | Popup producto: diseno cuadrado con dos columnas, imagen paneable y tooltip de ayuda |

### Deploy
- **Push:** GitHub `origin/main`
- **VPS:** Deploy exitoso via `ssh makuk` → git pull + build + deploy
