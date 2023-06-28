---
ID: 152
title: 'Rx V &#8211; Schedulers y Linq2Events'
author: fernandoescolar
post_date: 2012-03-26 15:30:57
post_excerpt: ""
layout: post
---
Hoy os vamos a proponer el último artículo teórico acerca de las <strong>reactive extensions</strong>. Una vez hemos <a title="Rx I - Qué son las Reactive eXtensions" href="/2011/12/12/rx-i-que-son-las-reactive-extensions">definido las rx</a>, sabemos <a title="Rx II - Observables: los sujetos" href="/2011/12/19/rx-ii-observables-los-sujetos">qué son los <strong>sujetos</strong></a> y las operaciónes de <a title="Rx III - Linq: crear objetos observables" href="/2012/01/02/rx-iii-linq-crear-objetos-observables">creación</a> y <a title="Rx IV - Linq: operaciones con observables" href="/2012/02/15/rx-iv-linq-operaciones-con-observables"><strong>Linq</strong></a>, ya podemos hablar de el último parámetro de la fórmula que definimos en su día: los <strong>Schedulers</strong>.
<!--break-->
<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/rx-schedulers.png" alt="Rx Schedulers" width="450" height="182" align="middle" />

Es muy normal en el contexto actual de aplicaciones hablar de hilos de ejecución (<strong>Thread</strong>), de las <strong>Task Parallel Library</strong> o de <strong>sincronismo/asincronismo</strong>. Y es aquí donde vamos a encontrar la utilidad de los <strong>schedulers</strong> de las<strong> reactive extensions</strong>:
<h2>Schedulers</h2>
La traducción al castellano de esta palabra inglesa podría significar "programadores" o "planificadores". Su función en este contexto es decidir dónde se van a ejecutar las operaciones. En Rx diferenciamos dos tipos de operaciones:
<ul>
	<li>Cuando Observamos (<strong>OnObserve</strong>): Esta es la forma de referirnos al momento el que llega una iteración o notificación (<em>OnNext()</em>).</li>
	<li>Cuando nos Suscribimos (<strong>OnSubscribe</strong>): Aquí nos referimos al momento en el que se ejecuta el proceso de suscripción (<em>Subscribe()</em>).</li>
</ul>
Para entender la diferencia entre estas dos operaciones vamos a crear una sentencia que nos lea cada una de las líneas de un fichero:
<pre class="brush: csharp">var filePath = "c:\mifichero.txt";
var observableLines = Observable.Create&lt;string&gt;(observer =&gt;
{
    using (var reader = new StreamReader(filePath))
    {
        while (!reader.EndOfStream)
        {
            string line = reader.ReadLine();
            observer.OnNext(line);
        }
    }

    observer.OnCompleted();

     return () =&gt; { };
});</pre>
Como podemos ver, hemos creado un <strong><em>IObservable</em></strong> de <strong><em>string</em></strong>, en el que abriremos un <em>StreamReader</em> que apunta a un fichero de nuestro ordenador. Entonces empezamos a leer línea a línea y enviamos notivicaciones mediante un sujeto. Si ahora quisieramos suscribirnos a este observable, para que nos escriba en pantalla todas las líneas:
<pre class="brush: csharp">observableLines.Subscribe(line =&gt; Console.WriteLine);</pre>
Encontraremos que al ejecutar esta línea de código el programa se queda congelado en ella hasta que no termina de leer todo el archivo. Esto se debe a que estamos leyendo de forma síncrona en el momento de suscribirnos. Para solucionarlo tendríamos que ejecutar esta operación en otro contexto como por ejemplo <strong>un nuevo thread</strong> (hilo de ejecución):
<pre class="brush: csharp">observableLines
   .SubscribeOn(Scheduler.NewThread)
   .Subscribe(line =&gt; Console.WriteLine);</pre>
Al ejecutar este código, nos daremos cuenta de que la operación de leer el archivo se realiza en un nuevo hilo y esto hace que nuestro programa no se quede a la espera de que se termine de leerse hasta el final. Pero si estuvieramos en un programa <strong>WPF</strong> y en lugar de quererlo escribir por consola lo añadieramos a un control tipo <strong>TextBox</strong>, nos encontraríamos con un nuevo problema.

Cuando ejecutamos una aplicación tipo WPF o WinForms, las ventanas y controles son dibujadas por un hilo especial que se encarga de todo lo gráfico. La consecuencia de esto es que no se puede modificar un control gráfico desde otro hilo diferente a ese. Por lo que si ejecutamos este código:
<pre class="brush: csharp">observableLines
   .SubscribeOn(Scheduler.NewThread)
   .Subscribe(line =&gt; txtContent.Text += line);</pre>
En cuanto se lea (desde el nuevo hilo) la primera línea y la intente añadir a la propiedad Text de nuestro control de Texto, nos saltará una excepción debido a que es una operación invalida. Este momento en el que se evalúa cada una de las iteraciones es lo que antes hemos definido como "<strong>cuando observamos</strong>". Para ello podríamos indicarle a nuestra sentencia que la operación de observar se ejecute en el contexto del hilo que trabaja con los gráficos. En WPF a este hilo se le conoce como el Dispatcher:
<pre class="brush: csharp">observableLines
   .ObserveOnDispatcher()
   .SubscribeOn(Scheduler.NewThread)
   .Subscribe(line =&gt; txtContent.Text += line);</pre>
Así podremos conseguir que nuestro código ejecute de forma asíncrona la lectura del fichero, pero que añada cada una de las líneas usando el hilo de ejecución de los gráficos.

Pero no solo existen dos contextos para poder planificar las operaciones de rx. Encontraremos (en dependencia de la plataforma):
<ul>
	<li><strong>Dispatcher</strong>: El hilo de ejecución principal de las aplicaciones WPF y Silverlight (<em>ObserveOnDispatcher()</em>, <em>SubscribeOnDispatcher()</em>).</li>
	<li><strong>NewThread</strong>: Nuevo hilo de ejecución (<em>ObserveOn(Schedulers.NewThread)</em>, <em>SubscribeOn(Schedulers.NewThread)</em>).</li>
	<li><strong>TaskPool</strong>: Nueva tarea de la TPL (Task Parallel Library)(<em>ObserveOn(Schedulers.TaskPool)</em>, <em>SubscribeOn(Schedulers.TaskPool)</em>)</li>
	<li><strong>ThreadPool</strong>: Encola la operación en la ThreadPool (<em>ObserveOn(Schedulers.ThreadPool)</em>, <em>SubscribeOn(Schedulers. ThreadPool)</em>).</li>
	<li><strong>CurrentThread</strong>: La ejecutará, tan pronto como sea posible, en el thread actual  (<em>ObserveOn(Schedulers.CurrentThread)</em>, <em>SubscribeOn(Schedulers.CurrentThread)</em>).</li>
	<li><strong>Immediate</strong>: Se ejecuta inmediatamente en el thread actual (<em>ObserveOn(Schedulers.Immediate)</em>, <em>SubscribeOn(Schedulers.Immediate)</em>) .</li>
</ul>
&nbsp;

Gracias a todos estos schedulers, tendremos un control total de nuestro programa, terminamos de explicar la fórmula de las reactive extensions y por tanto cerramos la explicación general de esta framework. Pero prácticamente todos los ejemplos que hemos visto hasta ahora van relacionados con lógica interna o llamadas asincronas y servicios.

Así que ahora vamos a tratar la última característica de las reactive extensions: su interacción con eventos.
<h2>Linq To Events</h2>
La primera vez que nos referimos a los sujetos, hablamos de sus semejanzas con la gestión de eventos. Podríamos compararlos de la siguiente forma:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/rx-vs-events.png" alt="rx vs. events" width="600" height="288" />

Ambos tienen su declaración, su suscripción, publicación y la forma de dejar de "escuchar" los acontecimientos. Y es gracias a esta característica que las reactive extensions nos proporcionarán una forma de gestionar los eventos con linq.

Dentro de las extensiones de rx encontramos dos específicas para crear observables a partir de eventos:
<ul>
	<li><em>FromEvent</em>: donde especificaremos el proceso de suscripción (evento += handler) y desuscripción (evento -= handler).</li>
	<li><em>FromEventPattern</em>: donde solo tendremos que especificar el objeto y el nombre del evento que queremos observar.</li>
</ul>
Una vez podemos observar un evento, obtendremos una gran facilidad para gestionarlo mediante sentencias linq. Característica que cuando exponemos mediante un ejemplo queda muy clara.

Buscando un tipo de aplicación que se base en eventos, nos hemos encontrado con un programa de dibujo, en el que pulsando con el ratón podemos dibujar lo que queramos. Así que vamos a desarrollar un pequeño proyecto a tal fin.

Nos hemos decidido por usar WPF como plataforma y el objetivo es crear un programa de dibujo en el que mientras pulsemos con el ratón sobre él, se irá dibujando en rojo la traza de nuestros movimientos de ratón. Por lo que el primer paso que tendremos que dar es crear un <strong>nuevo proyecto WPF en nuestro Visual Studio</strong>.

Automáticamente nos va a generar una ventana de inicio (<em>MainWindow</em>) sobre la que podremos trabajar. En WPF el control gráfico que nos deja dibujar se denomina <strong>Canvas</strong> (como en <strong>HTML5</strong>). Así pues, abriremos el archivo MainWindow.xaml y añadiremos un control de este tipo:
<pre class="brush: xml">&lt;Window x:Class="ReactiveDraw.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MainWindow" Height="350" Width="525"&gt;
    &lt;Grid&gt;
        &lt;Canvas Loaded="Canvas_Loaded" Background="White" /&gt;
    &lt;/Grid&gt;
&lt;/Window&gt;</pre>
A nuestro control le hemos capturado el evento "<em>Loaded</em>" para que una vez esté cargado en pantalla se ejecute la función "<em>Canvas_Loaded</em>" en nuestro code-behind. Es por eso que el siguiente paso será trabajar en esta función. Si abrimos el archivo "<em>MainWindow.cs</em>" podremos empezar a programar.

Lo primero que deberíamos hacer en nuestra función es especificar el control con el que trabajamos:
<pre class="brush: csharp">private void Canvas_Loaded(object sender, RoutedEventArgs e)
{
    var canvas = (Canvas)sender;
}</pre>
Ahora crearemos eventos observables de nuestro ratón, según se pulse el botón, se deje de pulsar o se mueva por pantalla:
<pre class="brush: csharp">private void Canvas_Loaded(object sender, RoutedEventArgs e)
{
    var canvas = (Canvas)sender;

    var mouseDown = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseLeftButtonDown");

    var mouseUp = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseLeftButtonUp");

    var mouseMove = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseMove")
                        .Select(ev =&gt; ev.EventArgs.GetPosition(this));
}</pre>
Como podemos ver capturaremos el evento de presionar el botón izquierdo del ratón (<em>MouseLeftButtonDown</em>), el de cuando lo levantamos (<em>MouseLeftButtonUp</em>) y para cuando movemos el ratón (<em>MouseMove</em>), recogeremos la posición del mismo.

Ahora tendríamos que decirle a nuestro programa que desde que se pulsa el botón, hasta que se deja de pulsar, recoga el movimiento del ratón:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">var drawingPoints = from start in mouseDown
                        from move in mouseMove.TakeUntil(mouseUp)
                        select new Point
                                    {
                                        X = move.X,
                                        Y = move.Y
                                    };</pre>
</div>
Creo que la sentencia habla por si sola...

Por último solo tendríamos que suscribirnos al observable resultante de la sentencia y hacer que dibuje por ejemplo un punto en pantalla:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">drawingPoints
    .Subscribe(point =&gt;
                    {
                       var ellipse = new Ellipse
                                         {
                                             Stroke = Brushes.Red,
                                             StrokeThickness = 5
                                         };
                       canvas.Children.Add(ellipse);
                       Canvas.SetLeft(ellipse, point.X);
                       Canvas.SetTop(ellipse, point.Y);
                    });</pre>
</div>
Lo que hacemos es crear un círculo rojo de un tamaño de 5 puntos, lo añadimos a nuestro canvas y al final lo posicionamos.

Al ejecutar nuestro programa veremos que nos dibuja correctamente, pero que si movemos muy rápido el ratón, nos deja espacios. Para solucionar esto, lo que vamos a dibujar en realidad son líneas, de forma que si movemos muy rápido el puntero, tendremos almacenado el último punto y el nuevo, dibujando una recta que los una.

Para esto vamos a crear dos variables:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">var isTheFirst = true; // indica si es el primer punto de la traza
var lastPosition = new Point(); // almacena el punto anterior de la traza</pre>
</div>
Con el fin de poder gestionar diferentes trazas (y no una línea continua), cada vez que levantemos el bottón izquierdo del ratón resetearemos el valor de "isTheFirst":
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">var mouseUp = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseLeftButtonUp")
                        .Do(_ =&gt; isTheFirst = true);</pre>
</div>
Y modificaremos la suscripción del evento de tal manera que dibujemos líneas basandonos en los datos que almacenamos. El código resultante de la función sería:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">private void Canvas_Loaded(object sender, RoutedEventArgs e)
{
    var canvas = (Canvas)sender;
    var isTheFirst = true;
    var lastPosition = new Point();

    var mouseDown = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseLeftButtonDown");

    var mouseUp = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseLeftButtonUp")
                        .Do(_ =&gt; isTheFirst = true);

    var mouseMove = Observable
                        .FromEventPattern&lt;MouseEventArgs&gt;(canvas, "MouseMove")
                        .Select(ev =&gt; ev.EventArgs.GetPosition(this));

    var drawingPoints = from start in mouseDown
                        from move in mouseMove.TakeUntil(mouseUp)
                        select new Point
                                    {
                                        X = move.X,
                                        Y = move.Y
                                    };

    drawingPoints
        .Subscribe(point =&gt;
                       {
                           var ellipse = new Ellipse
                                             {
                                                 Stroke = Brushes.Red,
                                                 StrokeThickness = 5
                                             };
                           canvas.Children.Add(ellipse);
                           Canvas.SetLeft(ellipse, point.X);
                           Canvas.SetTop(ellipse, point.Y);
                                if (isTheFirst)
                                {
                                    isTheFirst = false;
                                    lastPosition = point;
                                    return;
                                }

                                canvas.Children.Add(new Line
                                                        {
                                                            Stroke = Brushes.Red,
                                                            X1 = lastPosition.X,
                                                            X2 = point.X,
                                                            Y1 = lastPosition.Y,
                                                            Y2 = point.Y
                                                        });

                                lastPosition = point;
                            });
}</pre>
</div>
Si volvemos a ejecutar nuestro programa de dibujo, veremos que con un código muy cercano al lenguaje corriente, hemos realizado una operación que antes de conocer las reactive extensions hubiera sido un verdadero lío de funciones, variables y demás.

&nbsp;
<h2>Conclusiones</h2>
Hasta este punto hemos podido explicaros casi todas las características de las reactive extensions. Desde en qué se basan, pasando por sus funciones, hasta cómo usarlas en diferentes contextos.

El resumen de toda la información expuesta en estos últimos meses, es que las reactive extensions son una herramienta muy potente para el desarrollo. Se basa en un paradigma novedoso y útil. Y su función es facilitar las operaciones que ya realizábamos usando un lenguaje más cercano al que usamos para comunicarnos unos con otros.

En unos días y en referencia a este tema, publicaremos el último artículo en el que hablaremos de la codemotion, haremos un resumen de todo lo que contamos allí, crearemos un índice de los artículos y además añadiremos mucho código fuente con ejemplos de todo tipo para que podáis ver las reactive extensions en un ámbito de ejecución.

Permaneced atentos :)