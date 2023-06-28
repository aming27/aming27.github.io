---
published: true
ID: 201902261
title: 'Método Kanban con Azure DevOps'
author: fernandoescolar
post_date: 2019-02-26 06:35:21
layout: post
tags: azure devops kanban best-practices
background: '/assets/uploads/bg/agile.jpg'
---

Reservar un trozo de pared, dividirlo en columnas con cinta aislante y ponerle post-its de colores; no es Kanban. A eso se le llama guarrear la oficina. Y la idea de este artículo es que aprendas a guarrear Azure DevOps y así puedas dejar las paredes limpias. Todos te lo agradecerán.<!--break-->

> Vosotros diréis "y entonces scrum, scrum, scrum...". Tanto que se escucha a día de hoy, se puede implantar en muchos proyectos, pero no siempre es el mejor proceso para implantar en un proyecto.

> Open IEBS - Cómo desarrollar proyectos de forma ágil [en YouTube](https://youtu.be/IJFBt_2_3IY?t=46)

No podríamos empezar a hablar de cómo aplicar el Método Kanban sin antes realizar un breve resumen de en qué consiste.

## Método Kanban

En contra de los que muchos puedan creer, Kanban no es una metodología<abbr title="[RAE]metodología: f. Conjunto de métodos que se siguen en una investigación científica o en una exposición doctrinal.">*</abbr>, es solo una fracción de una: un método.

El origen del Método Kanban está en una visita que hizo [David J. Anderson](https://edu.leanKanban.com/users/david-anderson) a los Jardines del Palacio Imperial de Tokio. Resulta que al entrar cada visitante recibe una tarjeta de plástico que debe entregar a la salida. De esta forma limitan el aforo y evitan aglomeraciones, haciendo la experiencia mucho más satisfactoria para todos.

![tarjeta de entrada](/assets/uploads/2019/02/kanban-tickets.jpg)

El Método Kanban (a partir de ahora cuando escribamos _Kanban_ nos referiremos al _método Kanban_) tiene como objetivo ayudar a los equipos y empresas a adoptar una cultura de mejora continua. Inicialmente fue diseñado para contextos de desarrollo de software, pero hoy en día ha evolucionado hasta hacerlo aplicable a cualquier ámbito.

![Principios y prácticas de Kanban](/assets/uploads/2019/02/kanban-summary.png)

Kanban se basa en el **respeto** entre los miembros de los equipos. Para conseguirlo nos propone trabajar juntos, compartiendo la información abiertamente, entendiendo todas las opiniones y llegando a acuerdos. Todo ello supeditado a la consecución del objetivo del proyecto y manteniendo un flujo de entrega de valor continuo <abbr title="Es decir: trabajar juntos, no pelearnos y buscar hacer bien, lo que hay que hacer. Muy fácil de decir y difícil de hacer.">*</abbr>.

Al más puro estilo [manifiesto ágil](http://agilemanifesto.org/iso/es/manifesto.html) se nos proponen unos principios a tener en cuenta:
- Para la gestión del cambio:
    - Empezar con lo que estés haciendo ahora. Entender y respetar los procesos y roles tal cual se desempeñan en este momento.
    - Acordar buscar la mejora a través del cambio evolutivo. Una vez entendemos como funcionamos podemos proponer pequeños cambios que ayuden a mejorar y comprobar si realmente lo hacen.
    - Fomentar el liderazgo en todos los niveles.
- Para el despliegue del servicio
    - Entender y focalizarse en las necesidades y expectativas de tus clientes.
    - Gestionar el trabajo: dejar que la gente se autoorganice alrededor de las tareas.
    - Evolucionar las políticas para mejorar los resultados hacia el cliente y del negocio.

> Creí que me habían decorado la oficina con post its pero ya vi que es el Backlog de un proyecto #Agile

> Itza Reyes [en Twitter](https://twitter.com/itzareyesMX/status/1096140433451827200)

El Método Kanban, nos propone el uso del [Sistema Kanban](https://es.wikipedia.org/wiki/Kanban) para gestionar el trabajo y la visibilidad del mismo. Este sistema tiene varias aplicaciones, pero en el mundo del desarrollo de software lo solemos encontrar en su forma de tablero con post-its.

## Practicando Kanban

Azure DevOps, la herramienta de ALM de Microsoft en la nube (producto con el dudoso honor de haber sido nombrado de 5 formas diferentes; a saber _TFS Online_, _Team Foundation Services_, _Visual Studio Online_, _Visual Studio Team Services_ y hoy en día _Azure DevOps_), nos resulta una aplicación muy adecuada y totalmente integrada con los flujos, valores y practicas de Kanban.

> #Jira es una mierda, #Agile no funciona, y sí, hicimos eso de los postits de #Kanban pero daba mucho trabajo.

> Manu [en Twitter](https://twitter.com/ManuCervello/status/1004858688664932355)

Todo comienza a la hora de crear un proyecto nuevo. En el formulario elegimos como plantilla la que se llama "Agile" <abbr title="Y GIT ¡¡elige GIT como repositorio de código fuente!!">*</abbr>:

![Nuevo proyecto de Azure DevOps](/assets/uploads/2019/02/kanban-new-project.png)

Después de esto ya estaremos preparados para aplicar Kanban siguiendo sus prácticas:

### Visualizar

Un tablero Kanban no es la única forma de implementar el sistema Kanban, aunque sí que es una de las más utilizadas. Azure DevOps nos provee de tantos tableros como necesitemos dentro de nuestro proyecto. Para ver el panel por defecto tan solo tendremos que navegar hasta él:

![Ir al board](/assets/uploads/2019/02/kanban-goto-board.png)

Kanban no establece cómo debemos diseñar nuestro tablero, ni tampoco existe un diseño concreto para usar en el sistema. La herramienta de Microsoft nos propone por omisión una clasificación, que seguro que a la mayoría de los proyectos de desarrollo les viene bien, dividida en 4 columnas: _New_, _Active_, _Resolved_ y _Closed_. Pero puedes añadir o quitar columnas según la necesidad. Para hacerlo, tendremos que pulsar en la rueda dentada de la parte superior derecha, dentro de los _Settings_ dirigirnos a la sección _Board_ y dentro de esta sección a _Columns_.

![Editar columnas del board](/assets/uploads/2019/02/kanban-board-edit-columns.png)

Aquí se nos mostrará una herramienta que nos permite modificar el nombre de las columnas, añadir nuevas o borrar las que no necesitemos.

El diseño de la tarjetas también es importante. Puedes elegir qué datos van a aparecer en cada tarjeta para que de un vistazo tengas la información importante. También se les pueden dar colores en dependencia de normas que podremos configurar. Por ejemplo, podríamos destacar una historia que estuviera bloqueada con una pequeña configuración:

![Configuración para ver en rojo una tarea con tag 'blocked'](/assets/uploads/2019/02/kanban-board-blocked-rule.png)

No existe ninguna norma estricta al configurar un tablero. Lo ideal es hacerlo de la forma que más ayude al equipo. Si de buenas a primeras no conseguimos una forma óptima de hacerlo, no nos tenemos que preocupar, dentro del las prácticas de Kanban, existe una para poder modificar lo que hemos configurado en un principio.

![Vista de estilos de un board](/assets/uploads/2019/02/kanban-board-styles.png)

Directamente, cuando elegimos el tipo de proceso ágil, Azure DevOps nos va a mostrar el panel a nivel de _User Stories_ y quedará en nuestra mano si deseamos usar otros paneles a otros niveles. Los niveles que nos va a permitir usar ordenados jerárquicamente son: _Epics_, _Features_ y _Stories_. Las _Tasks_, a diferencia de otro tipo de tableros, quedan relegadas a ser pequeñas anotaciones a nivel de una historia. Lo que tenemos que saber es que podemos configurar todos los niveles independientemente. El objetivo es tener una visibilidad clara y sencilla.


### Limitar WIP

El sistema al que vulgarmente que nos referimos como A Salto de Mata (ASM), es lo que denominamos una estrategia de producción _push_. La idea detrás de esto es realizar el trabajo cuando el cliente lo demanda. Esto provoca que muchas trabajos se queden a medio hacer y que otras caduquen y se cancelen. Tener trabajo no finalizado o parcialmente completado es un desperdicio (_waste_) de tiempo y por tanto de dinero, y su consecuencia es dilatar los tiempos de entrega (_lead time_, tiempo desde que llega una petición hasta que se entrega). Al final, lo que conseguimos es que los clientes estén insatisfechos, los trabajadores también y que el proyecto no progrese como debiera.

Si como consecuencia de la observación, ponemos límites al trabajo que se puede realizar al mismo tiempo (<abbr title="Work In Progress">WIP</abbr>), conseguiremos mejorar los tiempos de entrega y la calidad con la que se hace. A esto le llamaremos usar una estrategia _pull_, donde empezamos una actividad justo después de haber terminado (o cancelado) la que teníamos en marcha antes.

> #GoKanban explicando el #wip caras rarunas, pero creo que lo han entendido. Empezamos sin limitar y vamos madurando #improvement

> Pepe Vazquez Sanchez [en Twitter](https://twitter.com/PepeVazquezS/status/538081775072063488)

Este concepto se basa en la [Ley de Little](https://berriprocess.com/es/2016/01/03/la-ley-de-little/), donde veremos que la forma de entregar lo más rápido posible es tener un número de peticiones en curso (_WIP_) que sea igual a la capacidad del equipo (_throughput_, rendimiento, por ejemplo las personas que trabajan en un proyecto). Por lo que podríamos decir que si hay 3 personas desarrollando, tener más de 3 actividades al mismo tiempo aumenta el tiempo de entrega, y tener menos de 3 actividades, tiene como consecuencia que algunas personas del equipo estén ociosas.

Limitar el WIP en Azure DevOps es muy sencillo, podremos hacerlo en el tablero, en las columnas de trabajo (quedan excluidas la inicial y la final), en las opciones de _Settings_ que vimos anteriormente. De esta forma en a la derecha del nombre de la columna nos aparecerán dos números: el primero indica el número de tarjetas que hay en esa columna, y el segundo el límite que hemos puesto. Si superamos ese límite, el número de tarjetas activas se pondrá en rojo, indicando visualmente que ahí existe un problema.

![Vista del límite del WIP en el tablero](/assets/uploads/2019/02/kanban-board-wip.png)

_Kanban_ es una palabra japonesa (看板) que se traduce como "letrero o valla publicitaria". Esto hace que algunas personas relacionen esta palabra con las tarjetas (o post-its) que usamos en un tablero. En el caso del Método Kanban, una traducción que correspondería más con su uso, sería "señal". Las señales _pull_ que veremos en nuestro tablero son los slots vacíos: esas posiciones de tarjeta que no están ocupadas y que me señalan que ahí falta algo.

### Gestionar el flujo de trabajo

La idea es que el flujo de trabajo maximice la entrega de valor, minimice el _lead time_ y que sea lo más predecible posible. Todo esto se consigue realizando mediciones y ajustando el proceso y el límite del WIP en base a las conclusiones que saquemos. Para ello trabajaremos el límite del WIP para que nuestro sistema de flujo no se convierta en un sistema por lotes:

<iframe class="youtube" src="https://www.youtube.com/embed/JoLHKSE8sfU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Azure DevOps nos aporta varias herramientas para ayudarnos. Por un lado el propio tablero, donde podremos ver si tenemos cuellos de botella, momentos ociosos o bloqueos.

Arriba a la izquierda de nuestro tablero y a la vista de todos encontraremos una gráfica llamada _Cumulative Flow_. El objetivo es que en esta gráfica quede representado un crecimiento y WIP constante. Si vemos que el WIP es muy pequeño, es que no estamos trabajando tanto como podríamos. Si es muy grande, es que estamos bloqueando tareas (quizá una solución sea limitar a un número menor el WIP). Si dos áreas se juntan es posible que indique bloqueo. Y si en lugar de ir hacia arriba, las áreas se quedan horizontales, significa que estamos parados.

![Gráfica de Cumulative Flow](/assets/uploads/2019/02/kanban-cumulative-flow.png)

Y para el cálculo de la velocidad, a parte de esta gráfica, podemos configurar otra llamada _Velocity_ en la que nos dirá los puntos de historia que hemos ido solucionando por iteración. Muy útil para poder predecir el tiempo de entrega y a su vez una métrica que nos ayudará a seguir el movimiento #NoEstimates<abbr title="en contra de lo que pueda parecer, #noestimates propone que estimemos, pero que, por así decirlo, no perdamos demasiado el tiempo en ello...">*</abbr>.

> Hasta el momento lo que he leído y oído de la idea de #noestimates va de la mano de #NoPlanear... y pues ya saben lo que opino de Cero Planeaciones. Así que se va a la pila de todo el bullshit que se está colando en el submundo del agilismo flácido.

> Ramiro González [en Twitter](https://twitter.com/ramgs/status/1051117568713461765)

### Hacer explícitas las políticas

Dentro de Kanban se propone un proceso de flujo de trabajo con unas políticas (o restricciones). Si bien es verdad que se propone que estas políticas sean escasas, simples, bien definidas, que se deban cumplir siempre y se puedan modificar; lo cierto es que por el mero hecho de empezar a trabajar ya tenemos unas políticas de serie. Por ejemplo, el límite del WIP es una. Afortunadamente, en el tablero de Azure DevOps estará visible para todo el equipo.

Otra política que podríamos tener es el _Definition of Done_ (DoD). Que determina cuándo consideramos que una historia está terminada. Este detalle se puede añadir en la edición de columnas y en el tablero se mostrará como un icono de información en el título de la columna. Al pulsarlo aparecerá el detalle de lo que configuramos.

![DoD en el tablero](/assets/uploads/2019/02/kanban-board-dod.png)

Otras políticas podemos representarlas en tarjetas que dejaremos fijas en el tablero, usando esta funcionalidad de DoD, podríamos usar la Wiki que viene asociada a nuestro proyecto o como un _widget_ en el _dashboard_.

![Dashboard, Wiki y Board](/assets/uploads/2019/02/kanban-dashboard.png)


### Feedback Loops

Un método para la mejora continua sin retroalimentación periódica a través del _feedback_ quedaría un poco extraño. Kanban nos propone siete cadencias (u oportunidades de reunión para recoger feedback y alimentar el flujo de trabajo).

- Revisión de la estrategia: donde se definen y seleccionan los servicios a prestar y su dirección. (<abbr title="periodicidad recomendada">p.r</abbr>: trimestralmente).
- Revisión de las operaciones: para maximizar la entrega de valor en consonancia con las necesidades de los clientes (<abbr title="periodicidad recomendada">p.r</abbr>: mensualmente).
- Revisión de los riesgos: evaluar riesgos y tratar asuntos bloqueantes (<abbr title="periodicidad recomendada">p.r</abbr>: mensualmente).
- Revisión de la prestación de servicio (<abbr title="periodicidad recomendada">p.r</abbr>: quincenalmente).
- Reunión de realimentación: para tratar lo que ya se ha hecho y preparar qué se va a hacer (<abbr title="periodicidad recomendada">p.r</abbr>: semanalmente).
- La reunión de Kanban: el equipo de desarrollo se reúne de pie, delante del tablero, donde se intentan desbloquear asuntos y planificación del trabajo (<abbr title="periodicidad recomendada">p.r</abbr>: diaria).
- Reunión de planificación de la entrega (<abbr title="periodicidad recomendada">p.r</abbr>: según periodicidad de la entrega).

> Si un proceso iterativo no converge a una raiz real es porq el problema sta mal, el comando sta mal o simplemente la entropia disminuye xD

> Fatima Ro [en Twitter](https://twitter.com/07Vannero/status/230334083681632257)

### Mejorar y evolucionar

Kanban es un método enfocado a la mejora continua e incremental. Hay que aprovechar las cadencias para mejorar constantemente la metodología, las formas de trabajar, de comunicarse, de enfrentarse al cambio, ... todo el equipo a la vez.

No hay que dar nada por establecido y hay que cuestionarse todo. De esta forma conseguiremos buen feedback. Y si conseguimos un buen feedback, es más fácil ir adaptándose y mejorando.

Eso sí, es importante saber que nunca se llegará a la perfección. Así que lo mejor es focalizarse en la mejora.

> Como informático en estos 20 años he peleado mucho contra los procesos en papel, la mejora continua y esas cosas, pero sin saberlo . Ahora resulta que soy un experto en transformación digital? A dar charlas de “cosas” para ganar dinero? Cuanta tontería!!!!!

> kinomakino [en Twitter](https://twitter.com/kinomakino/status/1004370842455863303)

## Conclusiones

Hoy hemos comentado Kanban desde un punto de vista teórico y además hemos visto como Azure DevOps se perfila como una herramienta muy válida para el trabajo colaborativo, sin ensuciar las paredes y para equipos distribuidos.

Un buen repaso de un método que llevo ya unos 5 años intentando implementar en mi trabajo diario de una forma correcta. La semana que viene os cuento como llevo...