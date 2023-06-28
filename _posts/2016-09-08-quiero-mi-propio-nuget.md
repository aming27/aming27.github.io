---
ID: 08091600
title: Quiero mi propio NuGet
author: fernandoescolar
post_date: 2016-09-08 00:00:00
layout: post
published: true
tags: nuget-server nuget dotnet
background: '/assets/uploads/bg/diehard1.jpg'
---
¿Recuerdas la primera vez que viste a John McClane? Nada más llegar en avión, le llevaron a la torre Nakatomi. La idea era recoger a Holly y llevarla de vuelta a casa. En navidad. Todo era estupendo. Hasta Allen disfrutaba de un día tranquilo. Pero un maldito bastardo llamado Hans tuvo que venir a joder el cotarro.<!--break-->

Esta misma situación nos la encontramos a diario en el mundo del desarrollo. Y generalmente terminamos llamando al John McClane de turno, para que nos solucione el fregao.

La historia comienza con un cliente (_Holly_). Tiene una librería que se usa en muchos proyectos. Y esta librería o bien se copia a mano o bien se copia todo el código fuente de solución en solución (_Hans_). Nos encontramos en la tesitura de tener que añadir una funcionalidad nueva a esta librería (_Proyecto Nakatomi_). Y a la hora de actualizar todos los proyectos es cuando nos encontramos los problemas (_Navidad_). La única solución será usar un gestor de paquetes versionados que contengan esta librería. Pero no podemos usar el gestor de paquetes por defecto, ya que nos obligaría a publicar para todo el mundo este ensamblado. Así que decidimos montar un servidor de NuGet interno (_John McClane_).

Existen varias alternativas a esto, como servicios tipo MyGet. Pero entonces esto no sería una jungla de cristal...

## ¿Cómo me hago un NuGet.Server?
No es la primera vez que me encuentro en disposición de ~~hacer un John McClane~~ instalar un servidor de NuGet. Recuerdo bien los pasos. Es muy sencillo: Creas una aplicación Web vacía con Visual Studio. Buscas el paquete de NuGet llamado "NuGet.Server". Lo instalas. Cambias un par de parámetros de configuración. Y a publicar.

Así que me pongo manos a la obra. Completo todos los pasos. Compilo. Falla (se rompen las ventanas dejando los trozos de cristal a mi lado, y yo descalzo).

Buscando la solución no tardamos en encontrar la [web del proyecto](https://github.com/NuGet/NuGet.Server "NuGet.Server on GitHub"). Ahora hospedado en github y bajo el manto protector del equipo de Open Source de Microsoft ("_Ahora tengo una ametralladora, Jo Jo Jo_").

A partir de aquí dos caminos se abren. Pero solo se puede elegir uno:

### Bajar por el hueco de los ascensores
Aprovechando que conocemos la web con el código fuente: https://github.com/NuGet/NuGet.Server. Solo tenemos que seleccionar la rama estable de "release":

![Nuget.Server "relase" branch](/assets/uploads/2016/09/github-nuget-1.png)

Después buscamos el enlace para descargar el código en forma de archivo zip:

![GitHub download repository as zip](/assets/uploads/2016/09/github-nuget-2.png)

Y una vez finalizada la descarga, descomprimimos el archivo.

### Usar el conducto de la ventilación
El camino complejo pero seguro, consiste en abrir un terminal, bash o consola. Ahí nos _pelearemos_ con comandos Git (_Terroristas_):

```bash
# clonamos el repositorio en la carpeta nuget-server
$ git clone https://github.com/NuGet/NuGet.Server.git nuget-server
```

Después elegimos la branch de "release":

```bash
$ cd nuget-server
$ git checkout release
```

### Configurando NuGet.Server
Independientemente del camino elegido, llegamos al punto de tener que buscar el archivo de la solución "NuGet.Server.sln" y abrirlo con Visual Studio.

![Solution Explorer: NuGet.Server](/assets/uploads/2016/09/vs-nuget-1.png)

Allí nos dirigiremos al archivo "Web.config", dentro de la sección "appSettings", a una línea que añade la clave "apiKey":

!["apiKey" in Web.config](/assets/uploads/2016/09/vs-nuget-2.png)

Aquí deberemos sustituir el valor por el que más rabia nos dé. En mi caso puse: "yippee-ki-yay".

Para terminar, publicaremos la solución en una WebApp de Azure. O si aun no tenemos una cuenta en la nube, la podremos publicar en forma de aplicación Web en cualquier IIS.

Habíamos conseguido arreglar el día de navidad. Además con el bonus extra de tener que escribir en directo comandos en una ventana negra con texto blanquecino. ¡Brujería!

![Logro desbloqueado: brujería](/assets/uploads/2016/09/Fernando+ha+usado+brujería.gif)

## ¿Cómo hago que Visual Studio use mi servidor NuGet?
Está claro que de nada sirve un servidor si nadie consume los servicios de los que provee. Pero que no cunda el pánico. Simplemente tendremos que abrir Visual Studio y navegar por el menú "tools" > "NuGet Package Manager" > "Package Manager Settings":

![Package Manager Settings](/assets/uploads/2016/09/vs-add-nuget-server-1.png)

En la ventana que nos aparece elegiremos "Package Sources":

![Package Sources](/assets/uploads/2016/09/vs-add-nuget-server-2.png)

Y pulsaremos el símbolo de "+" verde. Entonces nos aparecerá una línea nueva. En la parte inferior podremos cambiar su configuración:

![Add package source](/assets/uploads/2016/09/vs-add-nuget-server-3.png)

En "Name" pondremos el nombre con el que queremos que aparezca nuestro servidor de NuGet. Y En "Source" pondremos la url de nuestro servidor de NuGet con un path a "/nuget". Entonces pulsaremos el botón de "Update" y después al botón de "OK".

## ¿Cómo publico un paquete en mi servidor NuGet?
Si configuramos nuestro servidor de NuGet en Visual Studio, pero no tenemos ningún paquete, pierde sentido todo este escrito. Pero podéis estar tranquilos. Publicar un paquete en nuestro servidor de NuGet es solo un comando:

```bash
> nuget.exe push [My NuGet Package] [My NuGet Server] [My NuGet API Key]
```

Donde:

-**My NuGet Package**: es la ruta a nuestro paquete de NuGet. Por ejemplo: "AGoodDayToDieHard.nupkg".

-**My NuGet Server**: es la url de nuestro servidor de NuGet. Por ejemplo: "http://nuget.nakatomi.com".

-**My NuGet API Key**: es el token que escribimos en las configuraciones del portal. En el archivo web.config. Por ejemplo: "yippee-ki-yay".

## Bonus: almacenar los paquetes en una Storage Account de Azure
No os voy a desvelar todas los detalles, pero yo me fijaría en dos archivos del código fuente que os habéis descargado: NuGet.Server.Infrastructure.IServerPackageStore y NuGet.Server.IServiceResolver.

## Conclusiones
No hay mucho más que añadir. NuGet es fácil. No es el mejor. Pero tampoco malo. Es útil. Y esto último no se puede decir de todas las herramientas que hay.

Quien no tiene uno, es porque no quiere...


![Bricomanía - Briconsejo](/assets/uploads/2016/09/CncpsOKXEAAZ7VC.jpg)
