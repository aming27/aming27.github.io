---
published: true
ID: 202301111
title: 'Mi chuleta de Git'
author: fernandoescolar
post_date: 2023-01-11 01:01:46
layout: post
tags: git best-practices
background: '/assets/uploads/bg/libros.jpg'
---

Los repositorios de Git pueden ser muy útiles, pero a veces el uso del terminal puede ser intimidante. No es el objetivo de este artículo tratar todo lo que abarca esta tecnología de una forma pormenorizada, simplemente mostrar algunos trucos para hacer el trabajo con Git del día a día un poco más fácil<!--break-->.

¡No tan rápido Fittipaldi! Antes de empezar, debes saber que Git es un sistema de control de versiones, no un sistema de archivos. Esto significa que Git no almacena los archivos en sí, sino que almacena los cambios realizados en los archivos. Esto nos permite ver quién hizo qué cambio, cuándo lo hizo y por qué. Además, Git nos permite trabajar en equipo, ya que nos permite fusionar cambios realizados por diferentes personas en el mismo proyecto.

**Existen un montón de [herramientas visuales para ejecutar en tu escritorio que te permiten trabajar con Git](https://letmegooglethat.com/?q=git+desktop+tool) sin tener que usar la línea de comandos**. Pero a mí lo que me va es la marcha y suelo usar el terminal para todo. Si eres de los míos es posible que no te acuerdes de todos los comandos y por eso he escrito esta publicación, para no perder tiempo buscándolo por internet y que podamos perder nuestro tiempo en una página bonita y conocida:

## Inicializar y clonar repositorios

Puedes crear un repositorio de Git en tu sistema desde cero o partir de un repositorio de código remoto ya existente.

- `git init`: Inicializa un repositorio de Git en el directorio actual
- `git clone <url>`: Clona un repositorio remoto de Git en tu sistema

## Configuración

Git requiere que configures tu nombre de usuario y tu correo electrónico antes de poder realizar cambios. Puedes configurar estos valores de forma local o global.

- `git config --local user.name "Tu nombre"`: Configura tu nombre de usuario de forma local (sólo en el repositorio actual)
- `git config --local user.email "tu@email.com"`: Configura tu correo electrónico de forma local (sólo en el repositorio actual)
- `git config --global user.name "Tu nombre"`: Configura tu nombre de usuario de forma global (para todos los repositorios en tu sistema)
- `git config --global user.email "tu@email.com"`: Configura tu correo electrónico de forma global (para todos los repositorios en tu sistema)

## Gestionar "remotes"

Un "remote" es un repositorio de Git al que estamos conectados y que podemos sincronizar nuestros cambios. Cuando clonamos un repositorio, se crea una conexión con el repositorio original llamada "origin". Podemos tener varios "remotes" diferentes para diferentes repositorios, y podemos gestionarlos con los siguientes comandos:

- `git remote`: Muestra una lista de todos los "remotes" existentes
- `git remote add <nombre_remoto> <url>`: Agrega un nuevo "remote" con el nombre y la URL especificados
- `git remote rename <nombre_remoto_actual> <nuevo_nombre_remoto>`: Renombra un "remote" existente
- `git remote remove <nombre_remoto>`: Elimina un "remote" existente
- `git remote set-url <nombre_remoto> <url>`: Cambia la URL de un "remote" existente

## Trabajar con ramas

Una "branch" o "rama" es una copia de nuestro código en un momento dado. Podemos crear ramas para probar nuevas funcionalidades o arreglar errores sin afectar al código principal. Podemos fusionar las ramas de vuelta al código principal cuando estemos listos.

- `git branch`: Muestra una lista de todas las ramas del repositorio
- `git branch <nombre_rama>`: Crea una nueva rama con el nombre especificado
- `git checkout <nombre_rama>`: Cambia a la rama especificada
- `git merge <nombre_rama>`: Fusiona la rama especificada con la rama actual
- `git branch -d <nombre_rama>`: Borra la rama especificada
- `git branch -m <nuevo_nombre>`: Renombra la rama actual

## Añadir y confirmar cambios

Git almacena nuestro código en "commits", que son instantáneas de nuestro código en un momento dado. Para realizar un "commit", primero hay que informar de qué archivos hemos creado, modificado o borrado, y después ya podremos crear el "commit". Cada vez que hacemos un "commit", debemos proporcionar un mensaje que explique qué cambios hemos realizado.

- `git add <archivo>`: Añade un archivo al área de "staging" (o "commit" actual)
- `git add .`: Añade todos los archivos modificados al área de "staging" (o "commit" actual)
- `git rm <archivo>`: Elimina un archivo del área de "staging" (o "commit" actual)
- `git mv <archivo> <nueva_ruta>`: Actualiza la ruta de un archivo en el área de "staging" (o "commit" actual)
- `git commit -m "Mensaje del commit"`: Confirma los cambios en el área de "staging" (o "commit" actual) con un mensaje de commit
- `git commit -am "Mensaje del commit"`: Añade y confirma todos los archivos modificados en un solo paso
- `git log`: Muestra una lista de todos los commits realizados en el repositorio

## Deshacer cambios

Podemos deshacer cambios en nuestro código de varias formas. Podemos deshacer los cambios de un archivo específico, de un commit específico, o deshacer todos los cambios realizados desde un commit específico.

- `git checkout -- <archivo>`: Deshace los cambios de un archivo específico
- `git revert <commit-hash>`: Deshace los cambios de un commit específico
- `git reset --soft <commit-hash>`: Deshace los cambios, pero deja los archivos modificados en el área de "staging" (o "commit" actual)
- `git reset --mixed <commit-hash>`: Deshace los cambios y elimina los archivos modificados del área de "staging" (o "commit" actual)
- `git reset --hard <commit-hash>`: Deshace los cambios y elimina completamente los archivos modificados del área de "staging" (o "commit" actual) y del directorio de trabajo
- `git rebase <commit-hash>`: Aplica los cambios realizados en el código desde del commit especificado que no estén en la rama actual

## Ver el estado y la historia de un repositorio

- `git status`: Muestra el estado actual del repositorio (qué archivos están en el área de "staging" (o "commit" actual), qué archivos han sido modificados, etc.)
- `git log`: Muestra una lista de todos los commits realizados en el repositorio
- `git log --graph`: Muestra un gráfico ASCII de la historia de commits y ramas
- `git show <commit-hash>`: Muestra los cambios realizados en un commit específico
- `git grep <texto>`: Busca el texto especificado en todos los archivos del repositorio
- `git blame <archivo>`: Muestra quién ha realizado cada cambio en un archivo específico
- `git diff <nombre_rama_2>...<nombre_rama_1>`: Muestra los cambios realizados en el código de la rama 1 que no están en la rama 2
- `git diff --staged`: Muestra los cambios realizados en el código que se han añadido al área de "staging" (o "commit" actual)

## Sincronizar cambios con un repositorio remoto

Sincronizar los cambios es importante porque nos permite asegurarnos de que todos los miembros del equipo tengan acceso a la última versión del código. Si varios miembros del equipo están trabajando en el mismo proyecto, es probable que cada uno realice cambios diferentes en el código. Si no sincronizamos los cambios, es posible que terminemos con varias versiones diferentes del mismo código, lo que puede llevar a confusiones y problemas.

- `git fetch <nombre_remoto>`: Descarga los cambios del repositorio remoto especificado, pero no los fusiona con la rama actual
- `git pull <nombre_remoto>`: Descarga los cambios del repositorio remoto especificado y los fusiona con la rama actual
- `git push <nombre_remoto> <nombre_rama>`: Sube los cambios de la rama especificada al repositorio remoto
- `git merge

## Etiquetas

Los "tags" en Git son etiquetas que podemos asignar a commits específicos para marcarlos de alguna manera. Por ejemplo, podemos usar tags para marcar versiones específicas de nuestro código, como versiones estables o lanzamientos. Los tags son útiles porque nos permiten acceder fácilmente a ciertos commits sin tener que recordar sus identificadores de commit.

- `git tag`: Muestra una lista de todos los tags del repositorio
- `git tag <nombre_tag>`: Crea un nuevo tag con el nombre especificado
- `git tag -a <nombre_tag> -m "Mensaje del tag"`: Crea un nuevo tag anotado con el nombre y el mensaje especificados
- `git tag -d <nombre_tag>`: Elimina el tag especificado
- `git push <nombre_remoto> <nombre_tag>`: Sube el tag especificado al repositorio remoto
- `git push <nombre_remoto> --tags`: Sube todos los tags al repositorio remoto
- `git push <nombre_remoto> <nombre_tag> --delete`: Elimina el tag especificado del repositorio remoto
- `git show <nombre_tag>`: Muestra los cambios realizados en el commit al que apunta el tag especificado

## Stash

"Stash" es una característica de Git que nos permite guardar de forma temporal los cambios realizados en nuestro repositorio sin tener que hacer un commit. Esto es útil cuando queremos cambiar de rama o hacer un pull de un repositorio remoto, pero no queremos perder los cambios que hemos realizado.

- `git stash`: Guarda los cambios en un stash temporal
- `git stash list`: Muestra una lista de todos los stashes
- `git stash apply`: Aplica los cambios del stash más reciente
- `git stash drop`: Elimina el stash más reciente
- `git stash pop`: Aplica los cambios del stash más reciente y lo elimina
- `git stash apply stash@{n}`: Aplica los cambios del stash con el índice `n` (el número del "stash" en la lista)
- `git stash apply stash@{n} --onto <rama>`: Aplica los cambios del stash con el índice `n` (el número del "stash" en la lista) y los fusiona con la rama especificada
- `git stash drop stash@{n}`: Elimina el stash con el índice `n` (el número del "stash" en la lista)
- `git stash pop stash@{n}`: Aplica los cambios del stash con el índice `n` (el número del "stash" en la lista) y lo elimina

## Conclusiones

Si no te acuerdas de algo:

- `git --help`: Este comando te mostrará una lista de todos los comandos disponibles y una breve descripción de cada uno