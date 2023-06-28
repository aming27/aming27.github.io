---
ID: 95
title: 'Rx III &#8211; Linq: crear objetos observables'
author: fernandoescolar
post_date: 2012-01-02 12:30:10
post_excerpt: ""
layout: post
---
<p>A&ntilde;o nuevo art&iacute;culo nuevo. Despu&eacute;s de dos art&iacute;culos cargados de conceptos te&oacute;ricos y pruebas, ha llegado el momento de empezar a sacarle partido de verdad a la <strong>reactive framework</strong>. Hasta ahora hemos visto <a href="/2011/12/12/rx-i-que-son-las-reactive-extensions">cuales son los principios en los que se fundamenta Rx</a>,<a href="/2011/12/19/rx-ii-observables-los-sujetos"> los objetos que vamos a tener que utilizar (los sujetos)</a> e incluso introdujimos el uso de una clase llamada <em><strong>Observable</strong></em> que contiene m&eacute;todos y extensiones para que todo esto sea m&aacute;s sencillo.</p>
<!--break-->
<p>Si mediante el navegador de objetos o cualquier otra herramienta de estudio de ensamblados, abrimos el archivo "<em>System.Reactive.dll</em>", en el namespace "<em>System.Reactive.Linq</em>" encontramos una clase est&aacute;tica cargada de m&eacute;todos y extensiones llamada <em><strong>Observable</strong></em>. Dentro de este objeto se encuentra definido el segundo par&aacute;metro de la f&oacute;rmula que define las <strong>reactive extensions</strong>: <strong>Linq</strong>.</p>
<p><img src="/assets/uploads/2012/09/rx-III-0.gif" alt="" width="370" height="150" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>Para empezar Observable contiene extensiones con, si no todos, la mayor&iacute;a de los operadores que ya conocemos de Linq. Pero, en este caso los encontraremos aplicados a objetos tipo&nbsp;<em>IObservable&lt;T&gt;</em>.&nbsp;</p>
<pre class="brush: csharp">var observable = new ReplaySubject&lt;int&gt;();
observable .OnNext(1);
observable .OnNext(2);
observable .OnNext(3);
observable .OnCompleted();</pre>
<p>Como pudimos ver en el anterior art&iacute;culo tambi&eacute;n encontraremos m&eacute;todos para crear estos objetos&nbsp;<em>IObservable&lt;T&gt;</em>. Podr&iacute;amos poner un ejemplo r&aacute;pido con la extensi&oacute;n "<em>ToObservable()</em>", m&eacute;todo que sirve para crear un observable a partir de un <em>IEnumerable</em> (como listas o colecciones). Para generar un c&oacute;digo semejante al anterior deber&iacute;amos hacer algo as&iacute;:</p>
<pre class="brush: csharp">var enumerable = new List&lt;int&gt; { 1, 2, 3 };
var observable = enumerable.ToObservable();</pre>
<p>Usando cualquiera de los dos objetos que hemos creado podr&iacute;amos aplicar funciones de Linq como "Where" o "Sum":</p>
<pre class="brush: csharp">observable
    .Where(i =&gt; i &lt; 3)
    .Sum()
    .Subscribe(Console.WriteLine);</pre>
<p>Con este c&oacute;digo estar&iacute;amos filtrando las iteraciones menores de '<em>3</em>'. Y adem&aacute;s sumar&iacute;amos sus valores (<em>1+2 = 3</em>). Para terminar escribimos en la consola el valor final.</p>
<p>&nbsp;</p>
<p>A estos operadores que podr&iacute;amos definir como est&aacute;ndares de Linq se les a&ntilde;aden muchos otros propios de Rx. Para poder echar un vistazo a los m&aacute;s importantes vamos a intentar dividirlos entre creadores y operadores. En este art&iacute;culo trataremos los primeros, ya que es un tema suficientemente extenso. Y los categorizaremos en:&nbsp;<em>create</em>, rango, tiempo, as&iacute;ncrono y eventos.</p>
<h2>Creadores</h2>
<p>Como m&eacute;todos para crear objetos observables podemos encontrar las cuatro funciones que mencionamos en el art&iacute;culo anterior:</p>
<pre class="brush: csharp">var neverObservable = Observable.Never&lt;int&gt;();

// igual que
var s = new Subject&lt;int&gt;();</pre>
<p>La funci&oacute;n "<em>Never</em>" genera un observable en el que nunca hay una iteraci&oacute;n ni termina y se diferencia de "<em>Empty</em>" en que este &uacute;ltimo si que termina la tarea:</p>
<pre class="brush: csharp">var emptyObservable = Observable.Empty&lt;int&gt;();

// igual que
var s = new Subject&lt;int&gt;();
s.OnComplete();</pre>
<p>Cuando usemos "<em>Return</em>" tendr&aacute; lugar la iteraci&oacute;n que digamos y se terminar&aacute; el proceso:</p>
<pre class="brush: csharp">var returnObservable = Observable.Return(1);

// igual que
var s = new ReplaySubject&lt;int&gt;();
s.OnNext(1);
s.OnComplete();</pre>
<p>Y dentro de estos cuatro m&eacute;todos simples el &uacute;ltimo es "<em>Throw</em>" que lanzar&aacute; un error que le especificamos:</p>
<pre class="brush: csharp">var throwObservable = Observable.Throw&lt;int&gt;(new Exception());

// igual que
var s = new ReplaySubject&lt;int&gt;();
s.OnError(new Exception());</pre>
<h3>Create</h3>
<p>La funci&oacute;n por excelencia para crear cualquier tipo de objeto observable es "Create". Tiene tanta versatilidad que el resto de creadores se pueden implementar (con mayor o menor dificultad) usando esto. Un ejemplo claro ser&iacute;a el de la enumeraci&oacute;n que se convierte en observable:</p>
<pre class="brush: csharp">// un sujeto
var subject = new ReplaySubject&lt;int&gt;();
subject.OnNext(1);
subject.OnNext(2);
subject.OnCompleted();

// lo mismo que una enumeraci&oacute;n a observable
var enumerable = new List&lt;int&gt; { 1, 2 };
var observableEnumeration = enumerable.ToObservable();

// y tambi&eacute;n podemos hacerlo con 'Create'
var created = Observable.Create&lt;int&gt;(observable =&gt;
	{
		observable.OnNext(1);
		observable.OnNext(2);
		observable.OnCompleted();

		return () =&gt; { };
	});</pre>
<p>Como podemos ver, cuando utilizamos "<em>Create</em>" se nos solicita una funci&oacute;n que como par&aacute;metro de entrada usa un <em>IObserver&lt;T&gt;</em> (que no es m&aacute;s que la parte observadora de un sujeto) y tiene que devolver una acci&oacute;n. En este caso devolvemos una acci&oacute;n vac&iacute;a, pero lo ideal ser&iacute;a devolver una acci&oacute;n que realizara la tarea de desuscripci&oacute;n. Para ello se nos provee del objeto <em>Disposable</em>.</p>
<h3>Rango</h3>
<p>Otra forma de crear este tipo de objetos observables es especificando un rango. Para esta tarea la funci&oacute;n m&aacute;s simple que encontraremos es "<em>Range</em>". En este ejemplo crearemos iteraciones del 0 al 9:</p>
<pre class="brush: csharp">var rangeObservable = Observable.Range(0, 10);</pre>
<p>Como dec&iacute;amos anteriormente, podr&iacute;amos crear este mismo objeto usando el m&eacute;todo "Create":</p>
<pre class="brush: csharp">var createObservable = Observable.Create&lt;int&gt;(observable =&gt;
										{
											for (var i = 0; i &lt; 10; i++)
											{
												observable.OnNext(i);
											}

											observable.OnCompleted();
											return () =&gt; { };
										});
</pre>
<p>O tambi&eacute;n podr&iacute;amos usar otra funci&oacute;n como "<em>Generate</em>":</p>
<pre class="brush: csharp">var forObservable = Observable.Generate(0, i =&gt; i &lt; 10, i =&gt; i + 1, i =&gt; i);</pre>
<p>"<em>Generate</em>" es una funci&oacute;n muy parecida a un bucle "<em>for</em>". El primer par&aacute;metro es el valor inicial, el segundo una expresi&oacute;n que siempre que ocurra se ir&aacute; al siguiente paso. La tercera es el m&eacute;todo que se realiza en cada uno de los pasos y por &uacute;ltimo usaremos una expresi&oacute;n para devolver el objeto que itera. Lo podr&iacute;amos traducir as&iacute;:</p>
<pre class="brush: csharp">// Generate(0 , i =&gt; i &lt; 10, i =&gt; i + 1, i =&gt; i)
for(var i = 0; i &lt; 10, i = i + 1)
{
   yield return i;
}</pre>
<h3>Tiempo</h3>
<p>Tambi&eacute;n podemos crear observables dependiendo del tiempo. Una forma b&aacute;sica, que nos crear&iacute;a un observable con iteraciones cada una unidad espec&iacute;fica de tiempo es "<em>Interval</em>":</p>
<pre class="brush: csharp">var timeObserver = Observable.Interval(TimeSpan.FromSeconds(1));</pre>
<p>Con este c&oacute;digo crearemos una iteraci&oacute;n cada un segundo. Adem&aacute;s esta iteraci&oacute;n ser&aacute; incremental: empezando desde 0, cada vez que ocurra se le sumar&aacute; uno.</p>
<p>Otra posibilidad es usar "<em>Timer</em>", que a las personas que hayan trabajado con el "<em>Timer</em>" de "<em>System.Threading</em>" se les har&aacute; familiar. Aqu&iacute; podremos asignar el momento en el que queremos que empiece adem&aacute;s de su intervalo:</p>
<pre class="brush: csharp">var timerObserver = Observable.Timer(TimeSpan.FromMinutes(1), TimeSpan.FromSeconds(1));</pre>
<p>Aqu&iacute; crear&iacute;amos un observable que empezar&aacute; a iterar dentro de un minuto. Y a partir de entonces, cada segundo tendr&aacute; lugar una nueva iteraci&oacute;n.</p>
<h3>As&iacute;ncrono</h3>
<p>Las reactive extensions traen una gran variedad de creadores de observables as&iacute;ncronos. Por ejemplo "<em>ToAsync</em>" es una funci&oacute;n que convertir&aacute; cualquier c&oacute;digo en as&iacute;ncrono y observable:</p>
<pre class="brush: csharp">var asyncObservable = Observable.ToAsync&lt;string, int&gt;(this.FuncionQueTardaMucho)("parametro de entrada");</pre>
<p>Como vemos podremos podemos incluso llamar a funciones con par&aacute;metros.</p>
<p>Otra forma de crear observables as&iacute;ncronos ser&aacute; llamando a funciones que ya son as&iacute;ncronas. Un ejemplo podr&iacute;a ser recogiendo la respuesta de una petici&oacute;n web:</p>
<pre class="brush: csharp"> var asyncObservable = Observable.FromAsyncPattern&lt;WebResponse&gt;(request.BeginGetResponse, request.EndGetResponse)();</pre>
<p>En este c&oacute;digo llamaremos a la funci&oacute;n de "<em>GetResponse</em>" as&iacute;ncrona y recibiremos un observable de "<em>WebResponse</em>", que ser&aacute; la respuesta de la petici&oacute;n de la web.</p>
<p>La forma m&aacute;s simple de crear observables as&iacute;ncronos es el uso de la funci&oacute;n "Start":</p>
<pre class="brush: csharp">var startObservable = Observable.Start(() =&gt; ProcedimientoQueTardaMucho());</pre>
<p>Y para terminar con este apartado, podr&iacute;amos recoger tareas del TPL (Task Parallel Library) y convertirlas en observables as&iacute;ncronos. Siempre y cuando usemos el namespace "<em>System.Reactive.Threading.Tasks</em>":&nbsp;</p>
<pre class="brush: csharp">var parallelObservable = Task.Factory.StartNew(() =&gt; ProcedimientoQueTardaMucho()).ToObservable();</pre>
<h3>Eventos</h3>
<p>Como &uacute;ltima subcategor&iacute;a dentro de los creadores de observables, encontrar&iacute;amos crearlos a partir de eventos. Es decir se adjuntan/attachan a un evento y devuelven sus publicaciones en forma de observables. Para esta tarea tendremos la funci&oacute;n "<em>FromEventPattern</em>":</p>
<pre class="brush: csharp">var clicks = Observable.FromEventPattern&lt;RoutedEventHandler, RoutedEventArgs&gt;(
                        routedHandler =&gt; MyButton.Click += routedHandler,
                        routedHandler =&gt; MyButton.Click -= routedHandler);</pre>
<p>El c&oacute;digo anterior nos mostrar&iacute;a como recoger las pulsaciones de un bot&oacute;n en WPF (o Silverlight) mediante <strong>Rx</strong>. La versatilidad de estas ser&iacute;a poder operar con los clicks. Por ejemplo podr&iacute;amos hacer que en cada pulsaci&oacute;n de las 10 primeras se incremente en uno el contenido:</p>
<pre class="brush: csharp">int counter = 0;
clicks.Take(10).Subscribe(e =&gt;
                {
                    counter++;
                    MyButton.Content = counter.ToString();
                });</pre>
<p>&nbsp;</p>
<p>La mayor parte de estas funciones para crear observables tienen sobrecargas que nos aportar&aacute;n mayor funcionalidad. Adem&aacute;s no son las &uacute;nicas herramientas de las que disponemos, aunque si probablemente las m&aacute;s significativas. Como siempre a partir de aqu&iacute; os invitamos a que explor&eacute;is que otros m&eacute;todos de creaci&oacute;n existen o incluso a ensayar con la funci&oacute;n "<em>Create</em>" para encontrar diferentes resultados.</p>
<p>En el siguiente art&iacute;culo seguiremos explicando los temas referentes a <em>Linq</em> y trataremos los operadores propios de <strong>reactive extensions</strong>.&nbsp;Adem&aacute;s&nbsp;conoceremos los <em>Marble diagrams,</em>&nbsp;as&iacute; que esperamos que no os lo perd&aacute;is.</p>