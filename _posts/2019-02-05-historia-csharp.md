---
published: true
ID: 201902051
title: 'Historia de C#'
author: fernandoescolar
post_date: 2019-02-05 05:08:11
post_excerpt: ""
layout: post
tags: csharp dotnet history
background: '/assets/uploads/bg/programming4.jpg'
---

Dicen que la historia la escriben siempre los vencedores. Aunque en mi opinión, la historia la ha escrito siempre el que tenía un medio para hacerlo. Esta afirmación puede demostrarse hoy en día echando un vistazo a un medio al que todo el mundo tiene acceso: internet. Una plataforma donde todos podemos escribir _nuestra propia historia_. Así pues, al igual que cualquier otro ignorante de la red, os voy a dar mi versión de la historia de C#. Y además os aseguro que esta sí cuenta lo que sucedió de verdad de la buena.<!--break-->

La historia prohibida que nunca nadie se atrevió a contar comienza en una tierra muy lejana, al otro lado del charco. Con una empresa llamada Sun Microsystems.

## Los orígenes

Nuestra protagonista desarrolló una plataforma de desarrollo basada en virtualizar el lenguaje máquina. La máquina virtual, conocida como Java Virtual Machine (aka JVM), era capaz de interpretar unos archivos llamados _bytecode_. Estos archivos eran el resultado de compilar programas realizados en un nuevo lenguaje de programación de alto nivel llamado Java. Y para conseguir que esta máquina virtual interactuara con el hardware existente se diseñaron un conjunto de librerías que recibieron el nombre de Java Runtime Environment (aka JRE).

![Sun Microsystems logo](/assets/uploads/2019/02/sun-microsystems.png)

El lenguaje de programación Java empezó a tener éxito. Y como la JVM y el JRE eran open source, no tardaron en unirse _3rd parties_ a la carrera por desarrollar su propia máquina virtual privada. Con muchas más funcionalidades que la original, pero partiendo de las implementaciones open source. La más conocida y extendida de estas era la implementación propia de IBM (la versión de hoy en día se conoce como J9). Pero otras empresas como Hewlett-Packard, SAP, Novell o Microsoft, también implementaron las suyas.

![Java logo](/assets/uploads/2019/02/old-java-logos.png)

Entre tanto, también se estaba desarrollando una dura batalla por implementar el _Integrated Development Environment_ (IDE) preferido por los desarrolladores. Sun Microsystems decidió comprar a unos estudiantes universitarios el IDE Netbeans. Aunque esto en realidad fue una débil respuesta contra una serie de IDEs que eran muy superiores y ya estaban asentados en el mercado. JBuilder, producto de Borland, escrito en el propio lenguaje de Java, era un producto muy avanzado y extendido. Mientras que Eclipse empezaba a mostrarse como la plataforma dominante open source, de la mano de IBM.

Todo este lío de máquinas virtuales, versiones de _Runtimes_ e IDEs creaba bastante confusión en los desarrolladores. Potenciados por el acceso a internet, comenzó a ser más sencillo compartir código fuente. Pero cada porción del mismo necesitaba tener instalada una máquina virtual diferente.

De cualquier forma, a Sun Microsystems no pareció importarle esto. A menos no le importó hasta que Microsoft publicó Visual J++.

![Visual J++ case](/assets/uploads/2019/02/visual-j.gif)

Una herramienta basada en Visual Studio de Microsoft junto con una máquina virtual de Java totalmente integrada con las librerías win32 de Windows. Añadiendo creación de formularios nativos mediante un editor gráfico semejante al que existía para Visual Basic, que más tarde nos encontraríamos con el nombre de Windows.Forms. Pero Microsoft se olvidó de un pequeño detalle: dejó de lado un tema explicitó de la licencia de Java, la compatibilidad entre las diferentes versiones.

> Porque es evidente que la máquina virtual de IBM sí que era compatible con todo lo anterior… clarooo… pero bueno, no vamos a entrar mucho más en esta disputa...

El caso es que a Sun Microsystems no le gustó la maniobra de Microsoft y decidió denunciar a la compañía en 1997. En vista del largo proceso judicial que comenzaba, en 1998 Microsoft empezó a desarrollar su propio lenguaje basado en premisas de Java. Este lenguaje era mucho más cercano a otro con el que mucha gente se sentía cómoda en esa época: C++. Además, correría sobre una nueva plataforma llamada .Net Framework.

En 2001 hubo sentencia en contra de Microsoft y lo que pasó a partir de 2002 ya es historia.

## El nombre

Hay varias fuentes que comentan diferentes versiones del origen del nombre de C#. Así que hemos elegido la que más nos gusta.

En un principio existía C. Cuando este lenguaje fue extendido para soportar el paradigma de la programación orientada a objetos, pasó a llamarse C++.

Para C# se cogió como base C++ intentando hacer un lenguaje totalmente orientado a objetos. Quizá suene muy atrevido denominarlo como una especie de C++ ++. El caso es que al superponer las parejas de "+", se crea una especie de cuadrado. Si le echamos un poco de imaginación, este cuadrado se puede asemejar a una almohadilla "#". C#.

![C# name animation](/assets/uploads/2019/02/c-sharp-name.gif)

## La evolución

### 2002

Como decíamos antes, 2002 fue el año en el que pudimos ver la primera versión de C#, la **1.0**. Aquí se establecieron las bases del lenguaje: el uso de clases, structs, interfaces, modelo de herencia, ciclo de vida, etc. También asistimos al nacimiento de Microsoft .Net Framework.

Un año más tarde y con el fin de solucionar varios problemas, tuvimos la versión 1.2 del lenguaje C#. No obstante, lo más importante de este año fue la versión 1.1 del .Net Framework que la acompañaba. Este _Runtime_ por fin solucionaba los problemas de liberación de memoria del Garbage Collector.

![Visual Studio .Net logo](/assets/uploads/2019/02/visual-studio-net.png)

Hasta aquí todo era muy parecido a Java. Básicamente, si cambiabas los "import" por "using", "java." por "System." y las llamadas en _pascal Case_ por _Camel Case_, todo funcionaba prácticamente igual. Exceptuando esa cosa llamada _region_. Un trucazo, una chama, un pragma del IDE que servía para ocultar cierto código que se autogeneraba al usar los diseñadores visuales de formularios.

### 2005

Con la versión **2.0** se empezó a vislumbrar lo que es hoy en día el lenguaje gracias a los _generics_, iteradores, los métodos anónimos, la covarianza y la contravarianza... Y no nos olvidemos de las clases parciales. Era demasiado evidente que eso de  _region_ era un poco horrible. Así que para dar solución al código generado por los diseñadores de formularios de Windows.Forms y WebForms, en esta versión se añadieron clases que podían ser definidas en varios archivos añadiendo la palabra clave "partial".

![Microsoft .Net logo](/assets/uploads/2019/02/microsoft-net.png)

### 2007

Este año nos encontramos con el que sin duda fue el mayor avance del lenguaje. La versión **3.0** es con la que se consiguió adelantar a Java. De hecho, lo hizo por la derecha y le soltó las chapitas. A partir de aquí desde Java se dieron cuenta de que tenían que empezar a copiar las nuevas características de C#. Los tipos anónimos, junto con las _Lambdas_ y el _ExpresionTree_, nos trajeron _Linq_, posiblemente la mejor utilidad que se ha diseñado para tratar con iteraciones. También se incluyeron algunos detalles estéticos (o _syntax-sugar_), como las _auto-properties_ o la palabra clave _var_, que intentaban dar mayor limpieza al código.

Además, por estas fechas, como habíamos llegado al límite de calor con respecto al precio en los materiales de los procesadores, se empezaron a poner de moda los multi-core. Quedando obsoleto cualquier programa que simplemente utilizara un solo núcleo de nuestro procesador y dejando los demás en _Idle_. De cara a que esto no sucediera, en el .Net Framework 3.5 se introdujo la Task Parallel Library, que nos ayudaría a sacar provecho de estos nuevos procesadores.

También de esta versión salió otra librería llamada Reactive Extensions. Hoy por hoy se utiliza más su port para javascript (en React o Angular), pero la librería original era para C#. Las _Rx_ sacaban el mayor partido de la mezcla de eventos, observables e iteraciones.

![New Microsoft .Net logo](/assets/uploads/2019/02/microsoft-net-new.png)

### 2010

Después de unos años tan interesantes en el mundo del desarrollo de Microsoft, **2010** nos supo un poco descafeinado. Como un año de transición. Era como que tenían que sacar algo y decidieron llamarlo C# **4.0**. Con unos pocos detalles que se habían quedado en el tintero en versiones anteriores. Destacaríamos la covarianza y contravarianza en _generics_, los _named-params_ o los parámetros opcionales.

### 2012

Dos años más tarde nos encontramos con una versión que básicamente solo añadía el _syntax-sugar_ más grande que ha visto un lenguaje de programación en la historia. De hecho, luego fue copiado por javascript. C# **5.0** introdujo _async_ y _await_, dos palabras clave tan útiles como peligrosas. Esta característica esconde una máquina de estado en IL (_Intermediate Language_, el _bytecode_ de .Net) dentro de nuestros ensamblados. Y su funcionalidad es hacer que la programación asíncrona pueda realizarse de la misma forma que la secuencial, acercando un modelo de programación basado en eventos y callbacks, a los pobres programadores que solo saben programar de forma secuencial.

### 2015

Buscando la excelencia de su lenguaje bandera, Microsoft nos dio un montón de _syntax-sugar_ nuevos. La **6.0** era una versión tan dulce que casi nos dio diabetes. _Lambdas_ para hacer métodos, inicializadores de _auto-properties_, "nameof"...

### 2017

La última gran actualización de C#, la versión **7.0**. Lo más destacable de esta versión es que vino de la mano del nuevo _Runtime_ multi plataforma y open source de .Net: dotnet core. Además de un montón de funcionalidades que venían inspiradas de un lenguaje funcional de .Net: F#. _Pattern maching_, tuplas, deconstrucción, _wildcards_... Ahora C# es un lenguaje orientado a objetos y funcional.

![dotNet logo](/assets/uploads/2019/02/dotnet.png)

### 2019

Y para este año lo que todo el mundo espera es la versión **8.0**. Pero eso ya es otra historia...

## ACTUALIZACIÓN 09-02-2019

Después de una serie de comentarios que me han llegado vía Twitter, me veo en la obligación de realizar una actualización al artículo:

### Fe de errores

En la sección de 2007 se menciona la creación de la _Task Parallel Library_ (TPL) y de las _Reactive Extensions_ (Rx). Si bien es verdad que existen implementaciones de ambas para la versión del _Framework_ 3.5, no fue hasta 2010 y 2011 respectivamente, cuando estuvieron disponibles públicamente. Originariamente aparecieron: TPL para versión del _Framework_ 4.0 y Rx para 3.5 y 4.0. Dentro de las Rx para la versión del _Framework_ 3.5 existe un _backport_ de TPL.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="es"><p lang="es" dir="ltr">La TPL no salió con .Net 4? Justo lo estuve mirando el otro día para un proyecto en 3.5 (que “no se puede” migrar) y si me dices que hay forma de usar la TPL en 3.5 me das una alegría gorda gorda</p>&mdash; Adri (@mancku) <a href="https://twitter.com/mancku/status/1093986889504313344?ref_src=twsrc%5Etfw">8 de febrero de 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

¡Muchas gracias [Adri](https://twitter.com/mancku)!

### Notas adicionales

Como bien indica [José Manuel Alarcón](https://twitter.com/jm_alarcon) por si había alguna duda, el _bytecode_ no fue un invento de Sun Microsystem para la plataforma Java. Es un concepto que viene desde (no sé si incluso antes) tiempos de BASIC, y que de hecho Microsoft ya usó hasta en sus implementaciones modernas de Visual Basic.

<blockquote class="twitter-tweet" data-lang="es"><p lang="es" dir="ltr">Con la salvedad de que VB clásico ya usaba bytecode, un gran resumen de la historia de C# y .Network del amigo Fernando. <a href="https://t.co/oF1HzQZBwk">https://t.co/oF1HzQZBwk</a></p>&mdash; JM Alarcón Aguín 🌐 (@jm_alarcon) <a href="https://twitter.com/jm_alarcon/status/1092686977965715456?ref_src=twsrc%5Etfw">5 de febrero de 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Y otro aporte excelente por parte de [Pablo Álvarez Doval](https://twitter.com/PabloDoval) trata sobre cómo Microsoft implementó .Net a partir de una plataforma desarrollada por Colusa Software Inc. Empresa fundada en 1994 y adquirida en 1996, que desarrollaba por aquel entonces una plataforma llamada Omniware, con el fin de ejecutar código en C/C++ en una máquina virtual multiplataforma llamada OmniVM.

<blockquote class="twitter-tweet" data-conversation="none" data-lang="es"><p lang="es" dir="ltr">Muy buen artículo, pero yo le añadiría un detalle importantísimo para lo que fue .NET y C#, y muy poco conocido. .NET hereda directamente de OmniVM, que fue la plataforma de Colusa Omniware que Microsoft adquirió y desarrolló, evitando partir de cero :)</p>&mdash; Pablo Álvarez Doval (@PabloDoval) <a href="https://twitter.com/PabloDoval/status/1093976877780426752?ref_src=twsrc%5Etfw">8 de febrero de 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

¡Muchas gracias a ambos!