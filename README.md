# Visor panorámico · Casa natal de Goya

Sitio estático autónomo para GitHub Pages u otro alojamiento de archivos HTML. El navegador del visitante dibuja cada panorámica con WebGL; no necesita servidor de renderizado, Pixel Streaming, cuentas ni API externa.

## Publicar en GitHub Pages

1. Extrae este ZIP y sube **el contenido de la carpeta** a la raíz de un repositorio de GitHub. `index.html` debe quedar en la raíz, junto a `app.js`, `styles.css`, `.nojekyll`, `datos/` y `panoramas/`.
2. En el repositorio entra en **Settings → Pages**. En **Build and deployment** selecciona **Deploy from a branch**, rama `main`, carpeta `/(root)`, y guarda.
3. GitHub te dará la dirección de la web. No hace falta instalar dependencias ni ejecutar una compilación.

IMPORTANTE: GitHub Pages publica el contenido del sitio en internet; incluso un repositorio privado puede generar una web pública. Para limitar visitantes usa un alojamiento con control de acceso o prepara otra solución de autenticación. No subas documentación o fotos que deban permanecer privadas sin verificar permisos y derechos.

## Añadir panorámicas

Exporta tus 15 panoramas 360º equirectangulares desde Twinmotion como JPG y guárdalos en `panoramas/00.jpg`, `panoramas/01.jpg`, ... `panoramas/14.jpg`. Se recomienda una proporción 2:1. En `datos/fichas.js` puedes cambiar en cada punto el campo `panorama` si los archivos tienen otro nombre o si exportas en PNG (por ejemplo, `panoramas/00.png`). Mientras falten las imágenes, aparecerá el aviso «Panorámica pendiente».

## Editar texto e imágenes

Abre `datos/fichas.js` con un editor de texto. En cada uno de los 15 puntos modifica `titulo`, la aclaración opcional `detalle`, `panorama` y `bloques`. El texto completo de «Alcoba suroeste» está copiado como plantilla en los 15 puntos; el punto 09 ya tiene ese título.

- Texto: `{"tipo":"texto","texto":"Explicación con [A] y [1]"}`.
- Título: `{"tipo":"subtitulo","texto":"Planos"}`.
- Foto: `{"tipo":"imagen","referencia":"1","codigo":"ACGF_322_c_1","url":"fotos/acta.jpg","pie":"Descripción y crédito"}`.

Añade las imágenes de las fichas a la carpeta que indiques en `url`; si queda vacío aparece un marcador. Guarda y sube los cambios para actualizar la web. Los vínculos `#p00` a `#p14` abren directamente cada punto.

## Probar en tu ordenador

Desde esta carpeta ejecuta `python -m http.server 8000` (o `python3 -m http.server 8000`) y abre `http://localhost:8000`. Con ello las imágenes se sirven igual que en un alojamiento web. También puedes abrir `index.html` directamente, aunque algunos navegadores restringen las texturas WebGL desde archivos locales.

## Ajustar el ancho de la ficha

En ordenador, arrastra la barra fina que separa la panorámica del panel de texto. También puedes situarte sobre ella y pulsar las flechas izquierda/derecha. El ancho se recuerda en ese navegador. En móvil el panel ocupa todo el ancho disponible debajo de la panorámica.

## Índice de la columna izquierda

El índice agrupa los puntos en Ámbitos, I Exterior, II Interior (planta baja, planta primera y falsa) y Exterior. Los títulos y las aclaraciones entre corchetes vienen de `datos/fichas.js`; los encabezados de grupo están definidos en `app.js`. Si ya has personalizado textos en un `fichas.js` anterior, guarda una copia antes de reemplazarlo.

## Logotipo de cabecera

El logotipo blanco de la Diputación Provincial de Zaragoza está en `assets/diputacion-zaragoza.png`. Al actualizar desde este paquete, sube también la carpeta `assets` completa, además del `index.html` y `styles.css`. Su tamaño se controla en `styles.css` bajo «Logotipo blanco».

## Navegación móvil

El selector móvil reemplaza la larga lista horizontal y permite pasar directamente a cualquiera de los 15 ámbitos. La vista panorámica queda libre, sin tarjeta ni esquema superpuesto.

## Comprobar el peso de las panorámicas

Abre `herramientas/comprobar-panoramas.html` en tu ordenador y selecciona tus 15 JPG/PNG antes de subirlos. El informe indica archivos ausentes, tamaño por imagen y tamaño total. Esta herramienta funciona localmente, sin subir imágenes. Marca como grandes las de más de 10 MiB y avisa si alguna supera 25 MiB, límite de subida de archivos desde el navegador en GitHub. Tras elegir una vista, la web muestra «Cargando panorámica…» hasta que la imagen está lista; si no encuentra el archivo, muestra su ruta para ayudarte a corregir el nombre.
