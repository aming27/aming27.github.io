---
ID: 16021600
title: Por qué odio Git
author: fernandoescolar
post_date: 2016-02-16T09:52:03.000Z
post_excerpt: ""
layout: post
tags: git best-practices
background: '/assets/uploads/bg/hate.jpg'
---

El sistema de control de versión que más se ha extendido en los últimos años posiblemente sea Git. Algo que no ha pasado desapercibido para los desarrolladores de Microsoft. Así que han decidido integrarlo en todas sus herramientas. Y este hecho... Me ha destrozado la vida.
<!--break-->

Como en muchas empresas, en la mía usamos para la gestión del ALM, Visual Studio Team Services. El antiguo Visual Studio Online. A su vez el antiguo TFServices. O también conocido como TFS Online. Y es que poner nombres es muy dificil. El caso es que a lo largo de 2013, tanto en esta herramienta como en el IDE Visual Studio, se añadió soporte para Git. Así que no tardaron los early-adopters en pedir una migración a este tipo de repositorios de código fuente. Y hace unos seis meses que todos estamos funcionando con este sistema.

Estoy cansando de que todos hablen siempre bien de Git. Llevan así desde que apareció ahí por 2002. Concebido como open source por Linus Torvalds. Posiblemente porque se aburría. Cuentan las leyendas que lo hizo en un fin de semana y ahora ya no trabaja en ello. Quizá esto le debería hacer perder credibilidad a la herramienta. Pero por lo visto causa el efecto contrario. Según comenta el propio señor Torvalds, lo diseñó pensando en sus necesidades. Esas que no le aportaban otros SCM. Su idea era que fuera distribuido, fácil, rápido y poco pesado. Esto me recuerda a un paseo por el Gran Bazar de Estambul. Allí todo cumple con la norma de las 3 "B's": Bueno, Bonito y Barato. No me fie cuando estuve en Turquía, de la misma forma que no me fío de este producto. Y es que no me gustan los cambios. Pero no soy un tipo cerrado que solo esté disgustado porque le han sacado de su zona de confort. Hay más...

Voy a contaros mis experiencias:

## Adiós a irse pronto a casa
Antiguamente usábamos un sistema centralizado en el un servidor. Cuando no funcionaba internet, no podías trabajar. Visual Studio te daba problemas. Lo único que podías hacer era trabajar offline. Y las vueltas a online solían ser bastante dolorosas. La única solución razonable era irte a casa o tomar unas cervezas.

Pero Git es distribuido. Esto se traduce a que cuando te "clonas" un repositorio en tu ordenador, automáticamente estás creando un repositorio como el del servidor. Pero de forma local. Así trabajas en tu máquina hasta que decides sincronizar con el servidor todas las modificaciones que has realizado. Las consecuencias de esto son nefastas: ya no te puedes ir a casa. Aunque no tengas conexión, puedes seguir trabajando. Ya sincronizarás más tarde.

```bash
# este comando lo usamos para conectarnos con un repositorio de git
$ git clone my-remote http://my-git.com/repository
```

La única satisfacción que aún conservamos, es al menos poder quejarnos de la empresa que nos provee la conexión.

## El código es mío
En este punto, supongo que más de uno se estará preguntando: ¿Qué es eso de que los cambios los guardas en local? ¿Cómo que subes cuando quieres? ¿Un desarrollador puede tener un cambio y no subirlo hasta final de mes? ¿No tiene por qué guardar directamente los cambios en el servidor?. Es evidente que quien desarrolló Git no tiene claro el concepto de Continuous Integration...

Dentro de estas funcionalidades absurdas, encontramos que un repo Git puede tener varios "remote". Un "remote" es un servidor con el que sincronizar el repositorio local. Y un mismo repositorio que tienes en local puede estar vinculado con varios servidores diferentes.

```bash
# con esto añadimos otro repositorio servidor con alias "tokiota" a nuestro repositorio local
$ git remote add tokiota https://tokiota.com/gits/repo.git
# así listamos todos los servidores que tenemos asociados
$ git remote -v
```

Ahora me imagino a un proveedor diciendo que guardan en sus servidores el código que están escribiendo para nosotros. Y que nos digan que ya sincronizarán con nuestros servidores de vez en cuando... De eso nada. Les estamos pagando. Por lo que ese código es nuestro. No queremos que lo tengan en sus servidores.

## ¿Y mi café?
Mi rutina diaria siempre ha sido muy normal. Me gusta llegar a trabajar por la mañana, encender el ordenador y le darle a descargar la última versión del código. Mientras, me acerco a la cafetera y me tomo un *ristretto*. Para cuando vuelvo a mi puesto, terminan de descargarse los últimos datos.

Git me ha robado el momento *zen* del café matutino. Internamente maneja un tamaño de paquetes diferenciales (snapshots) que imagino que serán bastante pequeños. Espero que no pierda cambios por ello. El resultado es que las descargas no dan tiempo a ese café. Y me dejan sin excusa para tomarlo.

```bash
# comando para recoger los cambios del servidor
$ git pull my-remote
```

Otro café que ya no me puedo tomar es el de cuando te descargas una branch. Mientras se descargaba podías tener una conversación interesante con los compañeros. Eso también lo hemos perdido. Git maneja un sistema de branches totalmente diferente. Para este sistema una rama es solo un punto en el camino. Marca una posición en la que se aplican solo una serie de cambios. No todos. Así que cuando sincronizas el código ya te descargas todas las ramas.

```bash
# así creamos una rama
$ git checkout -b my-branch
# así cambiamos a esa rama
$ git checkout my-branch
```

Parece que a los programadores de Git no les gusta el café. No me fío de las personas a las que no les gusta el café.

## Encima tengo que hacer TDD
Hace tiempo que dentro del Definition Of Done figura tener pruebas unitarias para todo el código que subamos. Unas cómodas pruebas. Una vez has terminado la funcionalidad, copias el código y cambias un par de detalles. Así consigues una prueba válida rápidamente. Sin esfuerzo. Y eso sin contar con el apoyo de grandes herramientas como Pex.

Pues resulta que ahora como tenemos Git, no hace falta que un "commit" vaya directo al servidor. Ese cambio puede residir en nuestro repositorio local. Ahora resulta que tenemos sincronizar el código con al menos tres cambios bien diferenciados: "red", "green" y "refactor".

```bash
# creamos un conjunto de cambios con el comentario entrecomillado
$ git commit -m "#Tarea - Red"
# otro commit para cuando pasan los tests
$ git commit -m "#Tarea - Green"
# creamos el último conjunto de cambios
$ git commit -m "#Tarea - Refactor"
# enviamos todos los commits locales al servidor
$ git push my-remote
```

Todos los desarrolladores tenemos que pensar primero en una prueba, escribirla y que no pase. Luego hacer el código necesario para que pase ese test. Para finalizar poner todo el código anterior bonito y que las pruebas sigan pasando. Lo que se conoce vulgarmente como Test Driven Development. Que te obliga a pensar más. Y en cualquier momento alguien puede revisar si lo has estado aplicando correctamente. Una verdadera caza de brujas.


## Veo *commits* por todas partes
Los commit se pueden aplicar sueltos. Hay bifurcaciones. Puedes montar un puzzle de cambios sin problemas. Una branch puede tener unos commits totalmente diferentes a los de otra. Además la forma de identificarlos son GUID's. Que no sé si alguno os dice algo un GUID, pero a mi no me aporta ningún valor.

```bash
# así sacamos los commits de la branch actual
$ git log
commit a8a7bfff366350be2e7c21b8de9cc6504678a61b`
Author: Me <me@me.com>
Date:   ...

commit e5e3e4c1ef46ae64aa08e8ab3f988bc917ee1ce4
Author: Me <me@me.com>
Date:   ...

...
```

Un ejemplo gráfico, gracias a una herramienta que nos muestra un mapa de cambios:

![Git Branches Map](/assets/uploads/2016/02/git-branches.png)

Otro ejemplo es uno de twitter: [El GIT-ar Hero](https://twitter.com/HenryHoffman/status/694184106440200192). Si alguien entiende algo de esto, que venga y me lo explique por favor.

## La culpa es mía
La parte buena de tener semejante conjunto de cambios son los merges grandes. Creo que todos hemos vivido ese momento en el que se junta la rama de hotfix con la principal. La persona encargada suele perder algún código importante en la operación. Es la forma ideal de ocultar otros problemas y ganar tiempo en los desarrollos. Además, nadie te va a echar nada en cara porque la culpa ha sido de quien hizo el merge.

En Git esta operación de merge se realiza en el momento que descargas el código del servidor. Lo hace cada uno en local:

```bash
# Esto:
$ git pull my-remote
# Es aproximadamente esto:
$ git fetch my-remote
$ git merge my-branch
```

De esta forma, los administradores de VSTS tiran balones fuera. Que los merge los haga cada desarrollador. Que nos comamos nosotros el marrón. Y lo que es peor, al haber muchos commits, es muy fácil encontrar quien ha metido la pata en el código. Sigue la caza de brujas...

## Es complicado
No sé si os habéis percatado de que voy poniendo code-snippets a lo largo de todo este escrito. Está hecho a posta. Si hay una forma de manejar bien Git y sacarle todo el jugo es usar comandos de consola. Como si estuvieramos en el medievo.

Alguno me dirá que Visual Studio tiene soporte para Git. Pero realmente no tiene todos los comandos implementados. Sí la mayoría. Pero no todos. Para hacer ciertas operaciones al final tienes que abrir la consola. También hay gente que usa Source Tree. Una aplicación de Atlassian. Me niego en rotundo a instalarme más aplicaciones... Aunque la recomiende Martin Fowler.

Dentro del mundo de todos los comandos que tiene Git, encontramos que podemos resolver un mismo problema de muchas formas diferentes. Un ejemplo sería echar para atrás un commit. Tendríamos las siguientes alternativas:


Mover a un commit en concreto de forma temporal:

```bash
# Desatachamos el HEAD, que es lo mismo que no tener ninguna rama desprotegida:
git checkout dd1d7ab32
# si quieres hacer cambios mientras estás en este estado extraño:
git checkout -b old-state dd1d7ab32
```

Si queremos borrar definitivamente un cambio que no hemos llegado a publicar en el servidor:

```bash
# Primero no tendrás que tener nada modificado. Todo en commits.
# Después borramos el cambio:
git reset --hard dd1d7ab32

# Si quieres guardar el código modificado, porque no quieres hacer un commit:
git stash
git reset --hard dd1d7ab32
git stash pop
```

Si queremos borrar un commit que ya esté publicado, tendremos que crear otro commit:

```bash
# Esto crea 3 commits separados que desacen los commits indicados:
git revert a867a4ad 25eff4ca a766c053

# También lo podemos hacer por rango. Borrando los dos últimos commits:
git revert HEAD~2..HEAD

# O podemos tirar para atrás un commit de tipo MERGE:
git revert -m 1 <merge_commit_sha>
```

Todos estos comandos hay que aprenderlos. Son demasiados. Demasiadas casuísticas. No es nada fácil gestionar Git.

## No uses Git
Da igual que no estés alineado con todo el mundo. Eso no es lo importante. No le digas a tus compañeros que Git es estupendo. No le propongas a la gente que migre. Deja de darle publicidad gratuita. En definitiva: No uses Git.

Los desarrolladores de tu empresa lo agradecerán.
