---
ID: 15091600
title: 'VSTS: Migrar TFVC a Git'
author: fernandoescolar
post_date: 2016-09-15 00:00:00
layout: post
tags: azure devops git
---
Hace no mucho, [El Bruno](https://twitter.com/elbruno "El Bruno") me invitó a participar en [uno de sus conocidos podcast](https://elbruno.com/2016/08/30/podcast-por-que-odio-git/ "Podcast: Por qué odio Git"). En este caso la temática trataba de un artículo que podréis leer en esta misma Web: [Por qué odio Git](http://fernandoescolar.github.io/2016/02/16/por-que-odio-git/ "Artículo: por qué odio Git"). Dejando de lado lo agradecido que estoy por esta oportunidad, dentro de la conversación, me preguntó si me habían pedido migrar a Git muchos clientes. La verdad es que no. Pero me dió una buena idea sobre la que escribir.<!--break-->

![migrate to git meme](/assets/uploads/2016/09/meme-migrate.jpg)

Y es que la mejor forma de migrar de TFVC a Git, es no migrar. Si usamos directamente Git nos quitamos todos los problemas.

Pero si para ti esto es imposible. Si ya tienes un proyecto en Visual Studio Team Services. Si tienes un histórico, una trazabilidad. Si ~~te confundiste~~ elegiste TFVC como repositorio. Si ya estás harto de TFVC. O si eres un fanboy de Git. Si quieres cambiar el repositorio, pero no quieres perder nada. Tengo una buena noticia para ti: ¡sí se puede!

Lo primero que tenemos que hacer es crear un nuevo repositorio de código fuente dentro del proyecto. Una opción que encontraremos en la sección de código del portal de VSTS:

![nuevo repositorio](/assets/uploads/2016/09/migrate-git-1.png)

Pero esta vez hay que elegir Git. Y ponerle un nombre bonito:

![crear nuevo repositorio Git](/assets/uploads/2016/09/migrate-git-2.png)

Una opción de _hacker_ es activar el checkbox de crear el archivo "readme.md". Esto es un archivo con el leeme del proyecto. Muy útil si pensais pasarlo a GitHub en algún momento.

Al terminar de crear el repositorio, os aparecerá una pantalla donde encontrareis la url del mismo. Además de una opción para crear unas credenciales para poder conectaros:

![repositorio creado](/assets/uploads/2016/09/migrate-git-3.png)

Recordad guardaros tanto la url como las credenciales, que a continuación serán necesarias.

El problema de hoy en día es que existen multitud de opciones. Multitud de herramientas para hacer lo mismo. Nos encontramos en una permanente disyuntiva. Cerveza negra o rubia. Cristiano Ronaldo o Messi. [Allen o Johansson](http://www.fangazing.com/berto/algo_para_pensar_01__la_disyuntiva_allen__johansson/43&style=flat "Disyuntiva Allen-Johansson"). Cuando queremos migrar de TFVC a Git, es lo mismo. Nunca recuerdo cual era la aplicación buena: ¿"git-tf" o "git-tfs"?. Siempre me confundo. Al final termino instalándome ambas. Y ¿cómo eran los dichosos comandos?

Sí, comandos. Las herramientas que conozco que nos pueden ayudar, se ejecutan en modo consola. Por eso nos crearemos un directorio de trabajo. Por ejemplo "c:\wat", que será la ruta desde donde lanzaremos las instrucciones.

> You Can't Write Perfect Software. Did that hurt? It shouldn't. Accept it as an axiom of life. Embrace it. Celebrate it. Because perfect software doesn't exist. No one in the brief history of computing has ever written a piece of perfect software.

> **Andrew Hunt, The Pragmatic Programmer: From Journeyman to Master**

## Git-Tf
Git-Tf es la primera herramienta que conocí. Por eso la menciono primero. Está escrita en java. Esto la hace compatible con sistemas operativos windows, linux o macos. Es muy simple usarla. Si queremos instalarla tenemos la opción de usar chocolatey:

```bash
choco install git-tf -y
```

O bien descargarla de su [web](https://gittf.codeplex.com/ "Git-Tf").

Una vez lo hemos hecho, abriremos una consola. Y ejecutaremos un comando para descargarnos nuestro código fuente original. Git-Tf lo transformará a formato de repositorio Git:

```bash
C:\wat> git-tf clone "http://<YourName>.visualstudio.com/DefaultCollection/" "$/<TeamProjectName>/<Path>" –deep
```

Donde:

- **YourName**: es el nombre de tu cuenta de Visual Studio Team Services.

- **TeamProjectName**: es el nombre de tu proyecto.

- **Path**: si no deseas descargar el proyecto entero, solo una carpeta "source" o algo así, lo especificas aquí.

Esto nos descargará todo el código fuente con su historial desde el TFS. Desde nuestro repositorio TFVC.

Como anteriormente ya creamos el repositorio de Git, copiaremos la url del mismo que tendrá un formato del estilo:

```bash
https://<YourName>.visualstudio.com/DefaultCollection/<TeamProjectName>/_git/<GitName>
```

En la consola, nos situaremos en la carpeta "c:\wat". Dentro de esta buscaremos una subcarpeta con el nombre del proyecto que hemos descargado de TFVC anteriormente. Situaremos la consola en esa carpeta y añadiremos el repositorio de Git como un nuevo "remote":

```bash
C:\wat> cd <Project>
C:\wat\<Project>> git remote add origin "https://<YourName>.visualstudio.com/DefaultCollection/<TeamProjectName>/_git/<GitName>"
```

Lo que habremos hecho es relacionar nuestro repositorio local, el que acabamos de clonar desde TFVC, con el repositorio Git. A continuación, para iniciar la subida al repositorio Git, realizaremos un "push":

```bash
C:\wat\<Project>> git push origin master
```

Nos pedirá el usuario y la contraseña para realizar la subida. Los introducimos y esperamos a que suba todos los datos.

Cuando termine esta operación tendremos en nuestro repositorio de Git todos los changesets que teníamos en TFVC y ya podremos trabajar con él.

## Git-Tfs
Una alternativa a Git-Tf, es Git-Tfs. Es una herramienta semejante. Aunque a mi me gusta más. Está escrita en c#. Luego si no la migran a core, solo se podrá usar en sistemas windows. Para instalarla podemos seguir la misma mecánica. O usar chocolatey:

```bash
choco install gittfs -y
```

O dirigirnos a su [web](https://github.com/git-tfs/git-tfs "Git-Tfs"), a [la sección de releases](https://github.com/git-tfs/git-tfs/releases "Git-Tfs Releases").

Los comandos que tendremos que utilizar son muy parecidos. Aunque en este caso usaremos algún parámetro más. Lo primero clonaremos el repositorio de TFVC original y cambiaremos su formato a Git:

```bash
c:\wat> git tfs clone "http://<YourName>.visualstudio.com/DefaultCollection/" "$/<TeamProjectName>/<Path>" . --branches=all --export --export-work-item-mapping="c:\wat\mapping\file.txt"
```
Donde:

- **YourName**: es el nombre de tu cuenta de Visual Studio Team Services.

- **TeamProjectName**: es el nombre de tu proyecto.

- **Path**: si no deseas descargar el proyecto entero, solo una carpeta "source" o algo así, lo especificas aquí.

La parte buena de Git-Tfs es que es capaz de copiar también las branches. Además tiene un sistema de mapping de workitems. Muy útil si en lugar de migrar dentro de la misma cuenta de VSTS, lo estamos haciendo a otra. O incluso a un TFS on premises.

La contra es que, al ser una herramienta más completa, también se toma ciertas libertades. Una de ellas es cambiar los mensajes de TFVC, con un extra de metadatos. Así que el segundo comando que ejecutaremos limpiará esos mensajes:

```bash
C:\wat> cd <Project>
C:\wat\<Project>> git filter-branch -f --msg-filter "sed 's/^git-tfs-id:.*$//g'" -- --all
```

Después verficaremos que todo está correcto y borraremos la siguiente carpeta: "C:\wat\<Project>\.git\refs\original". Esto borrará branches antiguas.

Para terminar, incluiremos el repositorio de Git que creamos al principio y enviaremos todas las modificaciones:

```bash
C:\wat\<Project>> git remote add origin https://<YourName>.visualstudio.com/DefaultCollection/<TeamProjectName>/_git/<GitName>
C:\wat\<Project>> git push --all origin
```

Al finalizar, ya tendremos nuestro repositorio Git en VSTS listo para usar. Además conservará todos los changesets que realizamos en el anterior repositorio.

## Conclusiones
El coste de migrar a Git es relativamente pequeño. Pero el coste de que todos los desarrolladores de un equipo aprendan Git, es algo mayor. A mi personalmente el uso de Git me ha ayudado.

Si quieres realizar una migración rápida. Si no tienes/quieres migrar branches. Git-Tf es tu herramienta. Pero hay que tener en cuenta que no tiene versiones nuevas desde 2013.

Si quieres realizar una migración con todas las ramas. Si quieres luego seguir gestionando esta compatibilidad entre un TFVC y un Git. Git-Tfs es lo que deberías usar. Es muy potente. Mucho más de lo que se expone en este artículo. Pero también más complicada.

Y si os preguntais si estos comandos solo valen para una misma cuenta de Visual Studio Team Services, os puedo decir que no es así. Vale para TFS también. Además, no tiene por qué ser ni el mismo TFS ni VSTS el que recibe los cambios. Puedes recogerlos de una versión on-premises con TFVC y migrarlos a un repositorio Git de una cuenta de VSTS en la nube. Pero para esta última operación, os recomiendo que useis Git-Tfs.
