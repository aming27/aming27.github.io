---
ID: 90
title: 'Rx II &#8211; Observables: los sujetos'
author: fernandoescolar
post_date: 2011-12-19 10:00:06
post_excerpt: ""
layout: post
---
<p>Hace <a href="/2011/12/12/rx-i-que-son-las-reactive-extensions" title="Rx I - &iquest;Qu&eacute; son las Reactive eXtensions?">unos d&iacute;as empezamos a hablar de las <strong>Reactive eXtensions</strong></a>. Estudiamos su contexto y las bases te&oacute;ricas en las que se fundamentan. Adem&aacute;s expusimos la&nbsp;f&oacute;rmula&nbsp;creada por los <strong>Microsoft Live Labs</strong> para definirla. Y terminamos el art&iacute;culo comentando que resolver&iacute;amos esta f&oacute;rmula en futuras publicaciones. Hoy es el d&iacute;a de resolver el primer par&aacute;metro: <strong>Observables</strong>.&nbsp;</p>
<!--break-->
<center><img src="/assets/uploads/2012/09/rx-II-0.gif" alt="" width="380" height="150" /></center>
<p>Pero antes, vamos a ver c&oacute;mo podemos instalar y referenciar las <strong>Rx</strong> en nuestro proyecto.</p>
<h2>Instalando Rx</h2>
<p>Existen dos formas b&aacute;sicas de distribuci&oacute;n de las extensiones reactivas. La primera es desde la propia web de microsoft, mediante&nbsp;<a href="http://msdn.microsoft.com/en-us/data/gg577610">este enlace</a>. Aqu&iacute; te podr&aacute;s descargar un paquete con los ensamblados principales, adem&aacute;s de los espec&iacute;ficos para cada distribuci&oacute;n.</p>
<p>La segunda opci&oacute;n es utilizar nuget, desde donde podr&aacute;s descargarte los diferentes ensamblados (en su versi&oacute;n estable o en la experimental) haciendo una b&uacute;squeda de "rx" en su interfaz de gesti&oacute;n de paquetes:</p>
<center><img src="/assets/uploads/2012/09/rx-II-1.gif" alt="" width="437" height="250" /></center>
<p>Dentro del &aacute;mbito de este art&iacute;culo, bastar&aacute; con crear un proyecto nuevo de consola e instalar desde nuget el paquete "<em>Rx-Main</em>". O si ya descargamos todos los ensamblados, deber&iacute;amos a&ntilde;adir la referencia a "<em>System.Reactive</em>".</p>
<p>Una vez tenemos esto, ya podemos remangarnos y empezar a trabajar:</p>
<h2>Observables</h2>
<p>Cuando decimos "<em>observables</em>" en la f&oacute;rmula que define las reactive extensions, nos referimos a los objetos del patr&oacute;n observable: <strong>Observador</strong> y <strong>Observable</strong>. Y dentro de la framework 4.0, en el namespace <em>System</em>, podremos encontrar los <em>contratos</em> que nos exponen su comportamiento:</p>
<center><img src="/assets/uploads/2012/09/rx5.gif" alt="" width="483" height="179" /></center>
<p>Por lo tanto ya tenemos las "normas" para empezar a trabajar. Como prueba, vamos a crear una clase base gen&eacute;rica que implemente la interfaz IObservable:</p>
<pre class="brush: c#">public class Observable&lt;T&gt; : IObservable&lt;T&gt;
{
   private readonly IList&lt;IObserver&lt;T&gt;&gt; observers;

   protected Observable()
   {
      this.observers = new List&lt;IObserver&lt;T&gt;&gt;();
   }

   public IDisposable Subscribe(IObserver&lt;T&gt; observer)
   {
      if (!observers.Contains(observer))
      {
         observers.Add(observer);
      }
   }
}</pre>
<p>Con el fin de implementar la interfaz <em>IObservable</em>, hemos creado el m&eacute;todo de suscripci&oacute;n del contrato. Ah&iacute; almacenaremos en una lista privada de observadores, a todos los que se han suscrito a nuestro objeto observable. Pero para poder completar esta clase, deber&iacute;amos ser capaces de enviar notificaciones a nuestros observadores. Y &iquest;qu&eacute; notificaciones esperar&aacute; un observador? Si nos detenemos a estudiar la interfaz de <em>IObserver</em>, veremos que un observador estar&aacute; atento a 3 tipos de sucesos:</p>
<ul>
<li><strong>OnComplete</strong>: que se lanzar&aacute; cuando se termine de observar</li>
<li><strong>OnError</strong>: que se lanzar&aacute; cuando ocurra un error mientras se observa</li>
<li><strong>OnNext</strong>: que nos avisa de que haya ocurrido alg&uacute;n/otro acontecimiento dentro de la tarea de observaci&oacute;n</li>
</ul>
<p>Por lo que sabiendo esto podemos a&ntilde;adir una serie de m&eacute;todos en nuestra clase Observable para que ya tenga implementada la notificaci&oacute;n/llamada a todos los observadores suscritos:</p>
<pre class="brush: c#">public void OnNext(T value)
{
   foreach(var observer in observers)
   {
      observer.OnNext(value);
   }
}

public void OnError(Exception error)
{
   foreach(var observer in observers)
   {
      observer.OnError(error);
   }
}

public void OnCompleted()
{
   foreach(var observer in observers)
   {
      observer.OnCompleted();
   }
}</pre>
<p>Una vez la hemos completado, nos damos cuenta de que los m&eacute;todos que hemos creado satisfacen el contrato de la interfaz&nbsp;<em>IObserver</em>. Por lo que podr&iacute;amos estar hablando de que para poder implementar estas interfaces necesitaremos un objeto que indirectamente sea a la vez&nbsp;<em>IObservable</em>&nbsp;e&nbsp;<em>IObserver</em>.</p>
<p>Dentro de <strong>reactive extensions</strong>&nbsp;se ha creado una interfaz que nos define este nuevo contrato:&nbsp;<strong><em>ISubject</em></strong>.&nbsp;</p>
<pre class="brush: c#">public interface ISubject&lt;T&gt; : ISubject&lt;T, T&gt;
{
}

public interface ISubject&lt;T, S&gt; : IObservable&lt;T&gt;, IObserver&lt;S&gt;
{
}</pre>
<p>Y adem&aacute;s encontraremos, de serie, cuatro implementaciones base de esta interfaz:</p>
<ul>
<li><strong>Subject</strong>&lt;T&gt;: la implementaci&oacute;n base</li>
<li><strong>ReplaySubject</strong>&lt;T&gt;: recuerda todas las publicaciones para cualquier subscriptor</li>
<li><strong>BehaviorSubject</strong>&lt;T&gt;: recuerda solo la &uacute;ltima publicaci&oacute;n para los subscriptores</li>
<li><strong>AsyncSubject</strong>&lt;T&gt;: es as&iacute;ncrono que publica solo el &uacute;ltimo valor una vez se ha completado</li>
</ul>
<h2>Sujetos</h2>
<p>Dentro de todas las traducciones que tiene&nbsp;<em>Subjects</em>&nbsp;en nuestro idioma, es probable que la que se nos haga m&aacute;s simple sea <em>sujetos</em>. Como dec&iacute;amos un sujeto ser&aacute; un objeto observable, que con el fin de poder notificar de una forma simple a los observadores, implementara tambi&eacute;n la interfaz de <em>IObserver</em>.</p>
<p>La funcionalidad de un sujeto se puede resumir como que puede notificar a sus observadores, una serie de acontecimientos en forma de iteraci&oacute;n:</p>
<pre class="brush: c#">ISubject&lt;int&gt; subject;
IObserver&lt;int&gt; observer;

subject.Subscribe(observer); // se suscribe un observador

subject.OnNext(1); // notificamos la iteraci&oacute;n 1
subject.OnNext(2); // notificamos la iteraci&oacute;n 2
// subject.OnError(new Exception()); // podemos interrumpir la iteraci&oacute;n con una excepci&oacute;n
subject.OnNext(3); // notificamos la iteraci&oacute;n 3
subject.OnCompleted(); // notificamos que ya no hay m&aacute;s iteraciones</pre>
<p>Pero adem&aacute;s Rx nos va a proveer de una serie de extensiones para facilitarnos la suscripci&oacute;n, que nos van a ayudar a crear din&aacute;micamente observadores:</p>
<pre class="brush: c#">// Type: System.ObservableExtensions
// Assembly: System.Reactive, Version=1.0.10621.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35
// Assembly location: System.Reactive.dll
public static class ObservableExtensions
{
	public static IDisposable Subscribe&lt;TSource&gt;(this IObservable&lt;TSource&gt; source);

	public static IDisposable Subscribe&lt;TSource&gt;(this IObservable&lt;TSource&gt; source, Action&lt;TSource&gt; onNext);

	public static IDisposable Subscribe&lt;TSource&gt;(this IObservable&lt;TSource&gt; source, Action&lt;TSource&gt; onNext, Action&lt;Exception&gt; onError);

	public static IDisposable Subscribe&lt;TSource&gt;(this IObservable&lt;TSource&gt; source, Action&lt;TSource&gt; onNext, Action onCompleted);

	public static IDisposable Subscribe&lt;TSource&gt;(this IObservable&lt;TSource&gt; source, Action&lt;TSource&gt; onNext, Action&lt;Exception&gt; onError, Action onCompleted);
}</pre>
<p>Que se podr&aacute;n explotar mediante expresiones lambda:</p>
<pre class="brush: c#">subject.Subscribe(
	iterator =&gt; Console.WriteLine("Iterator: " + iterator));

subject.Subscribe(
	iterator =&gt; Console.WriteLine("Iterator: " + iterator),
	() =&gt; Console.WriteLine("Complete"));

subject.Subscribe(
	iterator =&gt; Console.WriteLine("Iterator: " + iterator),
	exception =&gt; Console.WriteLine("Exception: " + exception.Message),
	() =&gt; Console.WriteLine("Complete"));</pre>
<p></p>
<p>Como vemos, el comportamiento final de un sujeto observable, resulta semejante en funcionalidad a lo que podr&iacute;a ser un evento. Partiendo de este c&oacute;digo:</p>
<pre class="brush: c#">ISubject&lt;string&gt; Changed= new Subject&lt;string&gt;(); // un sujeto
event Action&lt;string&gt; Loaded; // un evento

Action&lt;string&gt; onNotified = s =&gt; Console.WriteLine(s); // creamos nuestro handler</pre>
<p>Por un lado podemos suscribirnos a un sujeto o adjuntarnos a un evento:</p>
<pre class="brush: c#">var disposable = Changed.Subscribe(onNotified); // nos suscribimos al sujeto
Loaded += onNotified; // nos atachamos al evento</pre>
<p>Tambi&eacute;n podemos lanzar un evento o publicar en un sujeto:</p>
<pre class="brush: c#">Changed.OnNext("hello"); // publicamos
Loaded("hello"); // lanzamos el evento</pre>
<p>Y para terminar, podemos desuscribirnos para no volver a tener notificaciones:</p>
<pre class="brush: c#">disposable.Dispose(); // "eliminamos" el resultado de la suscripci&oacute;n
Loaded -= onNotified; // nos des-adjuntamos del evento</pre>
<p>&nbsp;</p>
<p>Una vez hemos aclarado su funcionamiento, podemos ver el comportamiento de esos sujetos que encontramos en las <strong>reactive extensions</strong>.</p>
<h3>Subject</h3>
<p>Como dec&iacute;amos anteriormente un objeto <i>Suject&lt;T&gt;</i> es la implementaci&oacute;n base de un sujeto de Rx. Su funcionamiento es simple, notifica de todas las iteraciones una vez nos hemos suscrito. Por ejemplo, si hacemos esto:</p>
<pre class="brush: c#">var subject = new Subject&lt;int&gt;();

subject.OnNext(1);

subject.Subscribe(iterator =&gt; Console.WriteLine("Iterator: " + iterator));

subject.OnNext(2);
subject.OnNext(3);</pre>
<p>Esperaremos que la salida sea:</p>
<pre class="brush: plain">Iterator: 2
Iterator: 3
</pre>
<p>Es decir, que no tiene ning&uacute;n tipo de memoria, simplemente se dedica a notificar a los suscriptores actuales las iteraciones que ocurren en ese momento.</p>
<h3>ReplaySubject</h3>
<p>El tipo <i>ReplaySubject&lt;T&gt;</i> es un sujeto que recuerda las iteraciones para todos los suscriptores:</p>
<pre class="brush: c#">var replaySubject = new ReplaySubject&lt;int&gt;();
replaySubject.OnNext(1);
replaySubject.OnNext(2);

replaySubject.Subscribe(iterator =&gt; Console.WriteLine("Iterator: " + iterator));

replaySubject.OnNext(3);</pre>
<p>En este c&oacute;digo, a pesar de suscribirnos una vez se han ejecutado dos iteraciones, la salida por consola ser&aacute; esta:</p>
<pre class="brush: plain">Iterator: 1
Iterator: 2
Iterator: 3
</pre>
<h3>BehaviorSubject</h3>
<p>Un tipo de sujeto muy especial es el <i>BehaviorSubject&lt;T&gt;</i>, que tiene la propiedad de recordar solo la &uacute;ltima iteraci&oacute;n acontecida, por lo que si realizamos un ejemplo semejante al anterior:</p>
<pre class="brush: c#">var behaviorSubject = new BehaviorSubject&lt;int&gt;(0);
behaviorSubject.OnNext(1);
behaviorSubject.OnNext(2);

behaviorSubject.Subscribe(iterator =&gt; Console.WriteLine("Iterator: " + iterator));

behaviorSubject.OnNext(3);</pre>
<p>La salida ser&aacute; esta:</p>
<pre class="brush: plain">Iterator: 2
Iterator: 3
</pre>
<p>Un detalle a tener en cuenta en este sujeto es que requiere de inicio un valor que ser&aacute; la primera iteraci&oacute;n que recuerde. En el c&oacute;digo anterior lo en el constructor le hemos pasado como par&aacute;metro le valor '0', por lo que si nos llegamos a suscribir al principio, hubi&eacute;ramos recibido la l&iacute;nea "<em>Iterator: 0</em>".</p>
<h3>AsyncSubject</h3>
<p>El &uacute;ltimo de los sujetos que vienen con Rx es el <i>AsyncSubject&lt;T&gt;</i>. Como su nombre indica, este es un sujeto as&iacute;ncrono. Esto implica que no notifica nada hasta que no se ha completado (OnComplete). Y una vez esto ocurre, solo notifica del &uacute;ltimo iterador. Si lanzamos este c&oacute;digo:</p>
<pre class="brush: c#">var asyncSubject = new AsyncSubject&lt;int&gt;();

asyncSubject.Subscribe(iterator =&gt; Console.WriteLine("Iterator: " + iterator));

asyncSubject.OnNext(1);
asyncSubject.OnNext(2);
asyncSubject.OnNext(3);</pre>
<p>No obtendremos ninguna informaci&oacute;n en la consola de salida. Pero en el momento que a&ntilde;adamos a este c&oacute;digo la llamada:</p>
<pre class="brush: c#">asyncSubject.OnCompleted();</pre>
<p>Obtendremos en la consola la notificaci&oacute;n de la &uacute;ltima iteraci&oacute;n dentro del proceso total:</p>
<pre class="brush: plain">Iterator: 3</pre>
<p>&nbsp;</p>
<p>Podemos ver que es muy interesante el uso que se le puede dar a estos objetos, y como algunos nos dan pistas sobre los diferentes escenarios donde aplicarlos. Pero lo que es verdaderamente &uacute;til, es utilizar las extensiones que nos ofrece Rx para crear estos sujetos:</p>
<h2>Creando sujetos</h2>
<p>La forma m&aacute;s r&aacute;pida de crear un sujeto es convertirlo desde un enumerable.</p>
<pre class="brush: c#">public static IObservable&lt;TSource&gt; ToObservable&lt;TSource&gt;(this IEnumerable&lt;TSource&gt; source);</pre>
<p>Usando la extensi&oacute;n "<i>ToObservable</i>" podremos convertir cualquier iteraci&oacute;n en un sujeto observable de reactive extensions, y al suscribirnos, podremos recibir la publicaci&oacute;n de cada una de las iteraciones.</p>
<pre class="brush: c#">var subject = new ReplaySubject&lt;int&gt;();
subject.OnNext(1);
subject.OnNext(2);
subject.OnCompleted();

// esto es lo mismo que el anterior sujeto
var enumerable = new List&lt;int&gt; { 1, 2 };
var observableEnumeration = enumerable.ToObservable();</pre>
<p>Esta extensi&oacute;n es tan solo la punta del iceberg de Rx. Existe un objeto llamado <b><i>Observable</i></b> que contiene extensiones y m&eacute;todos que nos ayudar&aacute;n a crear y operar con sujetos. Por ejemplo:</p>
<pre class="brush: c#">var neverObservable = Observable.Never&lt;int&gt;(); // var s = new Subject&lt;int&gt;();
var emptyObservable = Observable.Empty&lt;int&gt;(); // var s = new Subject&lt;int&gt;(); s.OnComplete();
var returnObservable = Observable.Return(1); // var s = new ReplaySubject&lt;int&gt;(); s.OnNext(1); s.OnComplete();
var throwObservable = Observable.Throw&lt;int&gt;(new Exception()); // var s = new ReplaySubject&lt;int&gt;(); s.OnError(new Exception());</pre>
<p>Pero comentar todo lo que nos ofrece este objeto pertenece al siguiente art&iacute;culo sobre reactive extensions, que esperamos que le&aacute;is dentro de unos d&iacute;as.</p>