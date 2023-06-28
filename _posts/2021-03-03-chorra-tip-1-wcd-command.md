---
published: true
ID: 202103031
title: 'ChorraTip: rutas windows en git bash'
author: fernandoescolar
post_date: 2021-03-03 13:20:00
layout: post
tags: bash git windows
background: '/assets/uploads/bg/tip.jpg'
---
¿No te ha pasado nunca que estás navegando por carpetas en el explorador de windows y copias la ruta para pegar en el terminal? A mí sí. Y resulta que esto no funciona con el **bash** de *Git for Windows*. Así que he decidido hacer que sí que funcione<!--break-->. Porque infravaloramos el poder que tiene el simple deseo de ser mas vago. Es una de las fuerzas más importantes que dan impulso a la evolución de la humanidad.

Así pues, en el #chorraTip del día de hoy, vamos a crear el comando `wcd` para el **bash** de *Git for Windows*. Solo tienes que seguir estos pasos:

- Crea un archivo en "C:\Program Files\Git\usr\bin\" llamado "wincd".
- Añade este contenido:

```bash
#!/usr/bin/env bash
dir=$(echo "/$1" | sed -e 's/\\/\//g' -e 's/://' -e 's/\/C\//\/c\//')
cd "$dir"
```

- Abre tu terminal de **bash**.

- Situate en tu carpeta *HOME*:

```bash
$ cd ~
```

- Crea un alias para hacer que el comando `wincd` se ejecute en el mismo proceso que el **bash**:

```bash
$ echo alias wcd='. wincd' >> .bashrc
```

- Ya puedes copiar la ruta del explorador de windows y llamar a `wcd` para situarte ahí directamente:

```bash
$ wcd "C:\projects\ConsoleApp1\bin"
```

Menuda chorrada...