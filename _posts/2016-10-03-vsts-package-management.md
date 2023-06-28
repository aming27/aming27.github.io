---
published: true
ID: 820096
author: fernandoescolar
post_date: 2016-10-03 00:00:00
layout: post
title: 'VSTS: Package Management'
tags: nuget-server nuget dotnet azure devops
background: '/assets/uploads/bg/diehard3.jpg'
---
¿Os acordais de John McClane? Lo dejamos salvando la navidad en Los Ángeles. Ahora está en Nueva York. Feliz. Hasta que Simon, el hermano de Hans, aparece con ganas de bronca. Quiere robar el oro de los Estados Unidos de America. Pero esta vez John McClane cuenta con la ayuda de Samuel L. Jackson. ¿Podrán superar juntos el juego de "Simon dice"?<!--break-->

Han sido pocos los que me han pedido la segunda parte de [La Jungla de Cristal](http://fernandoescolar.github.io/2016/09/08/quiero-mi-propio-nuget/ "Quiero mi propio NuGet"). En realidad ninguno. No obstante aquí la tenéis. Una historia semejante. Tenemos un cliente (_Holly_). Con un nuevo problema (_Simon_). Pero se parece mucho al de los proyectos que tienen una librería compartida y diferentes versiones de la misma (_Hans_). Y esta vez queremos usar Visual Studio Team Services (_Samuel L. Jackson_). Es nuestra herramienta preferida. Por qué íbamos a necesitar instalar algo nuevo. Afortunadamente contamos con la extensión [Package Management](https://marketplace.visualstudio.com/items?itemName=ms.feed "Package Management in the Visual Studio MarketPlace") (_John McClane_).

## Un paseo por Harlem
Package Management llegó sin hacer demasiado ruido. Al menos no tanto como debería. Como cuando la policía tiene que buscar a _John McClane_ para cumplir los deseos de un psicopata que se hace llamar _Simon_.

La idea es poder integrar dentro de Visual Studio Team Services un servidor de paquetes. En un principio soportan NuGet. Porque es una versión "preview". Pero a futuro les gustaría integrar otros tipos de paquetes, como npm. También a futuro esperan tener la extensión disponible para TFS on-premises.

La forma de organizar que se ha diseñado consiste en Feeds. Cada Feed podría contener sus propios paquetes, su propia seguridad y por su puesto, su propio endpoint.

Instalar esta extensión en nuestra cuenta de VSTS es relativamente sencillo. Tendremos que ir a la [Marketplace de Visual Studio Team Services](https://marketplace.visualstudio.com/ "Visual Studio Marketplace"). Allí buscar "Package Management". Y nos encontraremos con [este resultado](https://marketplace.visualstudio.com/items?itemName=ms.feed "Package Management").

![Package Management in Visual Studio Marketplace](/assets/uploads/2016/10/package-management-1.png)

Entonces presionamos instalar y listo. Al dirigirnos a nuestro site veremos que ha aparecido una nueva opción en la toolbar: "Packages".

![Packages option](/assets/uploads/2016/10/package-management-2.png)

Esto significará que todo ha ido correctamente.

## El metro descarrila
A partir de aquí la cosa se complica. Si queremos usar este servicio tendremos que crear un nuevo Feed:

![Create new feed](/assets/uploads/2016/10/package-management-3.png)

Un dialogo nos dará la opción de poner un nombre, una descripción y de elegir los permisos. En un principio hemos seleccionado que todos los usuarios de la cuenta puedan acceder. Además de decirle que solo el sistema de builds pueda subir paquetes.

Después pulsaremos el botón de "Connect to feed":

![Connect to feed](/assets/uploads/2016/10/package-management-4.png)

De la pantalla emergente copiaremos el valor de "Package source URL". Esto nos servirá para dos cosas: subir los paquetes a nuestro feed y para poderlos descargar después con Visual Studio.

En este punto VSTS (_Samuel L. Jackson_) ya es capaz de servirnos paquetes de NuGet (ha llegado al teléfono de la estación de metro). Pero aún no hemos publicado ningún paquete dentro del feed (_John McClane_ llega tarde).

Así que vamos a intentar publicar unas librerías propias. Para ello crearemos una nueva build. Si es que no tenemos una ya.

Iremos a la sección de "builds", pulsaremos sobre "+ New" y elegiremos la de tipo "Visual Studio".

![New Build Definition](/assets/uploads/2016/10/package-management-5.png)

Cuando nos aparezca el panel de edición, añadiremos dos nuevos build steps: "NuGet Packager" y "NuGet Publisher".

![Add NuGet Packager and NuGet Publisher steps](/assets/uploads/2016/10/package-management-6.png)

El "Packager" lo colocaremos detrás de los tests y el "Publisher" al final del todo.

Entonces editaremos las opciones del "NuGet Packager" y marcaremos el checkbox de "Include referenced projects".

![NuGet Packager step configuration](/assets/uploads/2016/10/package-management-7.png)

Después editaremos las opciones del "NuGet Publisher". Marcaremos la opción de "Internal NuGet Feed". Y añadiremos la URL de nuestro feed.

![NuGet Publisher step configuration](/assets/uploads/2016/10/package-management-8.png)

Para finalizar, guardaremos y encolaremos una nueva build.

Al terminar el proceso y si todo ha ido bien, si volvemos a la pestaña de "Packages", encontraremos nuestros nuevos paquetes de NuGet. Además podremos ver los detalles de los mismos:

![Published Packages in feed](/assets/uploads/2016/10/package-management-9.png)

Con ello habremos conseguido sobrevivir a esta difícil prueba. Pero el final aún no está cerca...


## El problema de las garrafas y los galones de agua

El problema es que tenmos una garrafa de 5 galones, otra de 3 galones, una fuente para llenar las garrafas de agua y una báscula con detonador. Si no pesamos en la báscula 4 galones exactos, estamos muertos.

He pensado mucho en este problema y he llegado a alcanzar dos soluciones posibles:

- Llenamos la de 3, la pasamos a la de 5. Volvemos a llenar la de 3 y volvemos a pasar el contenido a la de 5. Esta vez no cabe todo. Así que vacíamos la de 5. Volcamos en la de 5 lo que sobraba de la de 3. Volvemos a llenar la de 3 y lo pasamos a la de 5. Prácticamente 4 galones. Siempre que no se nos caiga nada por el camino.

- Llenamos la garrafa de 5 y pasamos su contenido a la de 3. Vaciamos la de 3 y la rellenamos con los dos galones que quedaban en la de 5. Llenamos la de 5 de nuevo, rellenamos el galon que quedaba en la de 3 y ya tenemos 4 galones. Quizá con menos probabilidad de que se nos haya caído tanto por el camino.

El problema con VSTS Package Management es que es preview y puede pasar que derramemos mucho líquido en el proceso sin darnos cuenta. Y si no que le pregunten a [Alex Casquete](https://twitter.com/acasquete "Alex Casquete"), que el otro día me comentaba que a algunos de su equipo les iba y a otros no...

De cualquier forma, nos dirigiremos a Visual Studio. Allí abriremos la opción de "Manage NuGet Packages for solution".

![Manage NuGet Packages for solution](/assets/uploads/2016/10/package-management-10.png)

Seleccionaremos la "ruedita dentada" de la parte superior derecha.

![NuGet options](/assets/uploads/2016/10/package-management-11.png)

Allí añadiremos una nueva fuente de paquetes. Le pondremos un nombre. Copiaremos la URL de VSTS que utilizamos anteriormente. Pulsaremos "Update". Y la cerraremos dándole a "Ok".

![Add new package source](/assets/uploads/2016/10/package-management-12.png)

Al terminar podremos seleccionar nuestro VSTS como fuente de paquetes. Entonces nos debería pedir las credenciales. Tendremos que utilizar las mismas que usamos en el portal. Si todo va bien, podremos instalar esos paquetes que acabamos de generar en la nube.

## Conclusiones
_John McClane_ ha vuelto a salvar el día. ¡Muchas gracias _John McClane_!

Una de las cosas que más se echaban en falta en VSTS era la gestión de paquetes. Muchas herramientas semejantes ya lo tienen desde hace tiempo (como Team City). Así que siempre es de agradecer que nos den acceso a esta versión preview.

Personalmente me ha ido bien, pero hay gente que está experimentando diferentes errores. Bien por autentificación de los usuarios. Por temas de permisos. Y también por la versión de NuGet que usa. Esta versión aun no tiene compatibilidad con netcore. Esto puede causar diversos problemas a la hora de empaquetar ciertos paquetes con dependencias de la standard library...

De cualquier forma, es una muy buena solución. Integrada con una herramienta que mucha gente usamos para gestionar el ALM. Aunque será mejor, previsiblemente, a finales de este año. Así que aunque no sea nuestro repositorio principal de paquetes, merece la pena ir acostumbrandonos.

> ¡yippee-ki-yay! hijo de puta...
