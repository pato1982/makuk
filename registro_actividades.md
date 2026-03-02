# Registro de Actividades - MAKUK Admin Panel

## Acceso al Panel de Administracion
- **Correo:** admin@makuk.cl
- **Clave:** makuk2024
- **Ruta:** /admin/login

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
- **Contraseña (respaldo):** 2uHQ8ba1E5c3JPo

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
- **Contraseña:** IqLcocwnzLyabEJoTZsSA
- **Base de datos:** makuk_db

### Comandos utiles
```bash
# Conectar al servidor
ssh makuk

# Consultar MySQL
ssh makuk "mysql -u makuk_user -p'IqLcocwnzLyabEJoTZsSA' makuk_db -e 'SHOW TABLES;'"

# Entrar a MySQL interactivo
ssh makuk -t "mysql -u makuk_user -p'IqLcocwnzLyabEJoTZsSA' makuk_db"
```

---

### Archivos modificados hoy
| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/admin/AdminCategories.jsx` | Pestanas, productos, modal draggable, botones |
| `src/pages/admin/AdminUniquePieces.jsx` | Pestanas, grilla, productos, modal |
| `src/pages/admin/AdminLayout.jsx` | Sidebar footer simplificado |
| `src/components/admin/AdminFormField.jsx` | Textarea auto-expandible |
| `src/styles/admin.css` | Grilla 5 cols, tarjetas, botones, modal compacto, textarea |
