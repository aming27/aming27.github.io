---
published: true
ID: 201903051
title: 'Método Kanban con Azure DevOps (y 2)'
author: fernandoescolar
post_date: 2019-03-05 07:58:14
layout: post
tags: azure devops kanban best-practices
background: '/assets/uploads/bg/agile2.jpg'
---

Si ya tienes claro qué es el Método Kanban, pero no tienes del todo claro cómo aplicarlo en una metodología; si ya aplicas este método, pero te interesan las experiencias de otros equipos; o si por el contrario, tu objetivo en la vida es demostrarle a todo el mundo lo equivocado que está: te va a encantar lo que viene a continuación.<!--break-->

Como ya comentamos en [el artículo anterior](/2019/02/26/azure-devops-kanban/), llevo como cinco años detrás de la metodología perfecta basada en el Método Kanban. Sé que estoy persiguiendo una quimera, que lo que hoy consideras un valor para tu cliente, mañana puede convertirse en un _waste_ a eliminar del proceso. Soy consciente de que hay políticas propuestas por la mayoría, que no les gustan a todos los miembros del equipo. Y por supuesto, he sido el primero que cuando los tiempos aprietan se ha saltado el límite del WIP.

La mejora continua consiste en aceptar que cometemos errores e intentar ponerles solución. Por lo tanto, lo que hoy vamos a repasar no es más que un proceso sin terminar y ni mucho menos definitivo. Pero si andas perdido en el mundo del desarrollo ágil usando el método Kanban, puede servirte de punto de partida.

## Inicio del proyecto

El principio de todo es la idea: el concepto de un nuevo proyecto.

Los proyectos en los que suelo colaborar por lo general carecen de una figura de _Product Owner_ involucrado en el proyecto más allá de, como mucho, una reunión semanal. Así que el facilitador tiene que realizar tareas de _proxy_ con el _Owner_. Por eso, podréis notar que el tono general de la explicación del proceso es desde el punto de vista del facilitador.

Lo primero que haremos será crear un nuevo proyecto en Azure DevOps, recordando seleccionar el proceso "Agile":

![Nuevo proyecto de Azure DevOps](/assets/uploads/2019/02/kanban-new-project.png)

Una vez tenemos una idea inicial, empezamos a pensar en las características que nos gustaría tener. Aquí es donde nosotros empezamos a usar el _backlog_ a nivel de _features_. Iremos a la opción del menú de la izquierda de "Boards", después al submenú "Backlogs" y en el selector de arriba a la derecha elegiremos "Features":

![Añadiendo Features](/assets/uploads/2019/03/kanban-backlog-features.png)

Aquí podremos hacer clic en el botón de "New WorkItem" y empezar a escribir las características que consideremos. Este trabajo se suele realizar junto con el _Product Owner_ y los _Stakeholders_, o en el caso de ser un proyecto de servicio, leyendo el alcance del pliego, del RFP o de la oferta que se ha realizado.

![Listado de Features](/assets/uploads/2019/03/kanban-features-list.png)

Es posible que algunas características no se lleguen a desarrollar nunca de la forma que se planeaba inicialmente, o incluso que surjan nuevas a mitad del desarrollo. Por eso, el listado de _features_ no es algo estático en nuestro proyecto y podrá/deberá ser revisado constantemente. Lo único que tenemos que tener en cuenta es que, al finalizar cada edición, lo ideal es ordenarlas por prioridad para nuestro negocio.

## Planeando

Tener un listado de características generales nos va a ayudar a mantener el foco en las necesidades del cliente y en el objetivo del proyecto, pero no es demasiado genérico como para empezar a desarrollar. Por esta razón, añadiremos unos nuevos _WorkItems_ hijos de las _features_, que en Azure DevOps son de tipo _user story_.

Una _user story_, en nuestro modelo, pertenece a una _feature_ y tiene una plantilla que a los no neófitos en el tema seguro que os suena:

_As a **[type of user]**, I want **[some goal]** so that **[some reason]**_.

La idea es que nosotros sustituyamos el texto entre corchetes por lo que queremos en realidad.

Las _features_ las escribimos en inglés, al igual que las _user stories_, _bugs_ y todo lo que tenga que ver con el proyecto. La programación también se realizará en inglés, usando los mismos nombres y conceptos expuestos en los _WorkItems_. De esta forma conseguimos tener un lenguaje común entre desarrolladores y usuarios (Lenguaje Ubicuo).

![Features con User Stories](/assets/uploads/2019/03/kanban-features-us.png)

Una vez consideramos que tenemos una buena cantidad de _user stories_ (como para dos o tres semanas de trabajo), podemos priorizarlas y clasificarlas. Para ello usaremos el board. En el selector de arriba a la derecha seleccionaremos "Stories" y después presionaremos en el botón de la barra superior que se titula "View as Board":

![Ir al Board](/assets/uploads/2019/03/kanban-features-us-board.png)

Para clasificarlas usaremos el sistema de etiquetas que existe en Azure DevOps. Al hacer clic en una _user story_ se abrirá un formulario de edición. En la parte superior podremos ver un botón que se llama "Add tag". Al pulsarlo nos permitirá añadir una o varias _tags_.

Las etiquetas que usaremos no tienen por qué ser las mismas entre diferentes proyectos. Las tiene que ir definiendo el equipo según se vea que resultan una ayuda. Aunque una etiqueta que sí que creamos en todos los proyectos es la de "blocked", y la usamos cuando una historia está bloqueada.

Lo bueno de las etiquetas es que podemos crear diferentes estilos de tarjeta en dependencia de qué etiquetas tenga. Si nos dirigimos a la rueda dentada de arriba a la derecha, se nos abrirá un formulario con varias opciones de configuración del tablero. En la sección de "Card" la opción "Styles" nos permitirá añadir un color de fondo o poner por ejemplo el texto en negrita cuando se cumplan unas condiciones (como por ejemplo que contenga el _tag_ con nombre "blocked"):

![Configuración para ver en rojo una tarea con tag 'blocked'](/assets/uploads/2019/02/kanban-board-blocked-rule.png)

Una vez hemos clasificado las historias, podremos juntarnos de nuevo con el equipo para priorizarlas. Aquí la misión de nuestro facilitador es ordenar el backlog según las prioridades del cliente. Aunque será el equipo quien tendrá la última palabra, priorizando según dependencias técnicas. Por ejemplo, podría ser que para el _Product Owner_ lo más importante sea mostrar unos datos en pantalla, pero el equipo considere que, para mostrar unos datos, antes se deberían introducir en el sistema.

La parte buena de priorizar es que nos hace pensar en detalles que quizá se nos hayan pasado. Podría ser que surgieran nuevas _user stories_.

Por último, pero no por ello menos importante, pasamos al tema de las estimaciones. La idea es no perder mucho tiempo con esto. Nosotros usamos los _Story Points_ de una forma poco ortodoxa. La idea es llegar rápidamente a un acuerdo teniendo en cuenta que 1 es más o menos medio día de trabajo y 2 es un día completo. Sin cartas ni nada. Todo muy a pelo. Uno dice una cifra y si nadie dice nada se queda así.

Solo he comentado dos cifras 1 y 2, pero en realidad puedes poner cualquiera. En nuestro caso intentamos que todo esté en esas cifras. Si se pasa de 5 (lo que sería aproximadamente más de media semana de trabajo) entonces la consideramos épica y la intentamos dividir en dos. De hecho, puedes crear una norma que ponga el estilo de las tarjetas con más puntos de historia de 5 y así marcar visualmente las que hay que dividir. También es verdad que, si tienes una compleja, que no sabes cómo dividirla, no pasa nada por dejarla. Pero que no todas las historias sean así.

Puedes cambiar los puntos de historia pulsando abajo a la derecha de la tarjeta:

![Cambiando puntos de historia](/assets/uploads/2019/03/kanban-story-points.png)

## Ejecutando

Para poder seguir el flujo correctamente es muy importante configurar las columnas del tablero y establecer el límite del WIP:
- En nuestro caso los nombres de las columnas y su distribución nos parece muy bien como vienen por defecto, como punto de partida. Aunque tal vez, alguna persona considere que es interesante cambiar el de "Active" por "In progress" o de la columna "Resolved" por "In review".
- El límite de WIP para la columna de "Active" o "In progress" lo establecemos al número de miembros del equipo más uno. Esto lo hacemos para que pueda existir una tarjeta bloqueada al mismo tiempo que estamos desarrollando otras. Pero esto es solo el valor inicial recomendable: depende del propio equipo cambiarlo.

![Tablero](/assets/uploads/2019/03/kanban-board.png)

El proceso diario podríamos decir que empieza con la Reunión Kanban por las mañanas (eso que vulgarmente llamamos _daily_, como abreviación de _daily meeting_). Esta reunión, como consecuencia de que los miembros del equipo se encuentran en diferentes ubicaciones, la realizamos vía _Teams_. Y para darle mayor visibilidad, una persona se encarga de compartir su escritorio, donde tiene abierto el _board_. De esta forma, si encontramos algo en el tablero que no está actualizado, se modifica durante el transcurso de la reunión.

Cada integrante del equipo deberá responder a tres sencillas cuestiones:
- ¿Qué hizo desde la última reunión?
- ¿Qué bloqueos se ha encontrado?
- ¿Qué tenía pensado hacer hoy?

Al finalizar la _daily_ suelen surgir otras pequeñas reuniones o incluso nuevas historias de usuario para añadir al tablero. Y como siempre que se añade algo al tablero, hay que volver a priorizarlo.

Después de estas reuniones empieza el desarrollo y aquí la idea es muy simple: el miembro del equipo se autoasigna la primera tarjeta del backlog (o la que haya acordado durante la _daily_), la mueve a la columna "Active" o "In progress" y entonces crea una rama de código fuente a partir de la rama raíz.

Para poner nombre a las ramas utilizaremos los siguientes formatos:
- Si es una historia de usuario: `feature/[short_description]`
- Si es un bug: `hotfix/[short_description]`

La idea es usar descripciones cortas explicativas que el equipo entienda. Y aunque hay personas que prefieren usar el `ID` de la tarjeta, en nuestro caso, este se asocia a cada uno de los _commits_ que se crean. Por lo que tenemos creada una política para que todo _commit_ esté asociado al menos a un _WorkItem_:

![Políticas de código fuente](/assets/uploads/2019/03/kanban-commit-policies.png)

La rama la podremos crear directamente desde Azure DevOps. Para ello hay que dirigirse al menú de la izquierda y seleccionar la opción "Repos", del submenú "Branches", buscar la rama principal (en nuestro caso _master_), darle a los tres puntos que aparecen al lado del nombre y elegir la opción de "New branch":

![Nueva rama](/assets/uploads/2019/03/kanban-new-branch.png)

Una vez hemos terminado el desarrollo y hemos cumplido con el _Definition of Done_, pasamos esta tarjeta a la columna "Resolved" o "In review", y creamos una _Pull Request_ desde nuestra rama a la raíz. Para lo que hay que navegar al menú "Repos", al submenú "Pull requests", presionar el botón que dice "New pull request", elegir como destino la rama raíz y como origen la rama en la que se estaba desarrollando:

![Nueva Pull Request](/assets/uploads/2019/03/kanban-new-pr.png)

Y entonces hay que volver a comenzar con el proceso cogiendo la primera tarjeta del backlog o en su defecto, la que se haya comentado durante la _daily_.

Todas estas políticas que hemos ido mencionando las hacemos explícitas anotándolas en la casilla "Definition of done" de la edición de columnas, con formato _markdown_:

![Políticas de desarrollo](/assets/uploads/2019/03/kanban-policies-1.png)

## Revisando

El caso más común que suelo encontrar en los proyectos que participo es que, cuando se acaba la fase de desarrollo, entonces solo queda revisar con el cliente. Pero hay equipos y proyectos en los que existen más estados para las tarjetas y, por tanto, más columnas en el tablero.

Semanalmente programamos una reunión de realimentación junto con el _Product Owner_ y los _stakeholders_. Para esa reunión preparamos una "Release" del proyecto. Para ello solemos usar una rama llamada "production", un _Pipeline_ para realizar una _Build_ y una _Release_ que despliega el proyecto en un entorno de desarrollo en Azure.

Durante la reunión semanal, realizamos una demo de la aplicación en el entorno de desarrollo y vamos recorriendo todas las tarjetas marcadas como "Resolved". De esta revisión sacamos nuevas historias y seguro que algún bug. Para la redacción de un bug usamos un formato fijo:

_When **[steps to reproduce]**  It **[actual behavior]** And it should **[expected behavior]**_

Conforme vamos revisando, movemos las tarjetas de "Resolved" a "Done", indicando que ha terminado el flujo. Y a la vez, alimentamos el backlog con nuevas _user stories_ o _features_ que se van comentando durante la reunión.

El entorno queda congelado hasta la semana siguiente por si algún _stakeholder_ está interesado en seguir probando la aplicación.

Para aprovechar la convocatoria, al terminar con las tarjetas del tablero, realizamos la reunión de planificación de entrega. En ella decidimos la prioridad del backlog desde el punto de vista de negocio y estimamos muy a ojo hasta donde se podría llegar en la próxima revisión.

Para finalizar la fase de revisión, después de realizar este combo de dos reuniones seguidas como si fuera una, realizamos la reunión de realimentación con el equipo. Allí comentamos el _feedback_ del cliente, dejamos que se comuniquen inquietudes, proponemos mejoras al proceso y descartamos las actividades que pensamos que no funcionan. Todo en consenso.

Todo este proceso termina donde empezó, volviendo a la fase de planificación, priorización y estimación del backlog. Donde, si notamos algún cambio de planificación, nos pondremos en contacto con el _Product Owner_ lo antes posible para informarle.

## Final del proyecto

En todo el proceso invitamos a cualquier persona del equipo a proponer funcionalidades, a hacerse preguntas (las preguntas las guardamos en el tablero con unos estilos propios y si se responden con historias de usuario, las relacionamos), a ir un poco más allá. A veces al _Product Owner_ pueden interesarle y darles máxima prioridad. Otras veces simplemente las deja para más tarde. Y muy pocas veces, terminan descartándose.

Pero todo proyecto tiene un fin. Y esto no quiere decir que esté terminado.

Por la modalidad de desarrollo basada en el Método Kanban, es más que probable que tengamos historias de usuario sin empezar si quiera. Y tenemos que aceptar que es así es como funciona. Las ideas son infinitas, pero no así el dinero que cuesta ejecutarlas.

Aunque el producto final no sea perfecto, sí que habremos conseguido que sea todo lo que nuestro cliente necesita. Y en ese momento decidirá cortar el flujo de desarrollo.

![Cumulative Flow](/assets/uploads/2019/03/kanban-cumulative-flow.png)

Lo que sí os puedo decir es que, si observáis detenidamente la gráfica del "Cumulative Flow", podréis llegar a predecir cuando el proyecto se empieza a poner más horizontal y, por tanto, hay una bajada de flujo del WIP. Lo que en muchas ocasiones puede avisarnos de una parada cercana.

## Resumen

Podríamos resumir todo el proceso que hemos descrito con la siguiente gráfica:

![Proceso ágil basado en método kanban](/assets/uploads/2019/03/kanban-process.png)

Como bien decía al principio, es un proceso de desarrollo incompleto e imperfecto. Ni mucho menos puede cubrir la mejora continua de toda la empresa. Es un proceso para la ejecución de procesos que hay que ir mejorando y adaptando a las necesidades del equipo iteración a iteración.

La parte buena es que, todo lo descrito, en mi humilde opinión, es una base sólida para empezar a trabajar.