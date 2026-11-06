# Anexo de tesis 2026 - Guadalupe Elisabeth Gallardo

Sitio completo en HTML, CSS y JavaScript, con PDF, fotografías y firmas originales. Nombre docente en los registros: Edith Espíndola.

## Publicar en GitHub Pages

1. Descomprimí este ZIP.
2. Subí TODO el contenido de esta carpeta a la raíz de tu repositorio: index.html, styles.css, app.js y la carpeta assets completa. Conservá sus nombres.
3. Activá GitHub Pages para la rama que contiene estos archivos y la carpeta raíz (/).
4. Abrí la dirección que GitHub asigne a tu página.

El repositorio puede tener cualquier nombre: los recursos usan rutas relativas. No requiere instalar paquetes ni compilar.

## Probar en tu computadora

Desde esta carpeta, ejecutá:

```bash
python -m http.server 8000
```

Después abrí http://localhost:8000 en tu navegador. Los PDF se muestran con el visor del navegador. También se pueden descargar.

## Subir con Git

En una copia local de TU repositorio, copiá todos los archivos de esta carpeta y ejecutá:

```bash
git add .
git commit -m "Agregar anexo completo de tesis 2026"
git push
```

## Calidad y archivos

Las fotografías, firmas y PDF se copiaron byte por byte desde el sitio publicado: no se redujo la resolución, no se alteraron los colores ni se recomprimieron los originales. La compresión ZIP es reversible. El archivo SHA256SUMS.txt permite comprobar su integridad.

El diseño adapta el tamaño de visualización a la pantalla; los originales conservan su resolución. No borres la carpeta assets ni cambies los nombres de sus archivos. Las firmas integradas son imágenes, no firmas digitales criptográficas.
