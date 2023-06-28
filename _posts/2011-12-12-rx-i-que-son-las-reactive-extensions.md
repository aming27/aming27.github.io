---
ID: 68
title: 'Rx I &#8211; Qué son las Reactive eXtensions'
author: fernandoescolar
post_date: 2011-12-12 10:15:01
post_excerpt: ""
layout: post
---
<p>Dentro de las librer&iacute;as de moda para .net la, posiblemente, m&aacute;s dif&iacute;cil de explicar tiene el nombre de <strong>Reactive eXtensions</strong> o <strong>Rx</strong>. Una idea que nace en el contexto actual de aplicaciones distribuidas. Donde la informaci&oacute;n se encuentra en la nube, y mediante llamadas as&iacute;ncronas podemos procesarla usando clientes que interaccionan con el usuario bas&aacute;ndose en eventos.</p>
<!--break-->
<center><img src="/assets/uploads/2012/09/rx1.gif" alt="" align="middle" width="500" height="209" /></center>
<p>Encontramos ejemplos de esto en cualquiera de las aplicaciones m&aacute;s comunes que usamos. Por ejemplo el cliente de Whatsapp de nuestro tel&eacute;fono m&oacute;vil, el TweetDeck para ver el twitter o el widget del escritorio que nos informa del tiempo.</p>
<p>Todas estas aplicaciones recogen datos de una serie de servicios que se encuentran en internet. Y mediante la interacci&oacute;n con el usuario los tratan. Adem&aacute;s, como en la mayor parte de las tecnolog&iacute;as y APIs para interfaces gr&aacute;ficas, para entender que quiere hacer el usuario, se basan en eventos como un "onClick" del rat&oacute;n sobre un bot&oacute;n concreto.</p>
<p>Entonces llegamos, al igual que un f&iacute;sico en busca de una teor&iacute;a unificada, al origen de las <strong>reactive extensions: la creaci&oacute;n de un lenguaje com&uacute;n para gestionar llamadas as&iacute;ncronas a un servicio y los eventos que ocurren en la interfaz gr&aacute;fica</strong>.</p>
<p>Es posible que esto que estamos hablando a muchos os suene, ya que gracias a <a href="http://www.secondnug.com/">Second Nug</a> hicimos un <a href="http://www.secondnug.com/EventosDesarrollo/tabid/57/Default.aspx">WebCast</a> sobre el tema hace unos meses. A lo largo de la serie de art&iacute;culos, con la que comenzamos hoy, intentaremos extender esa charla, adem&aacute;s de abordar los diferentes temas con m&aacute;s calma y perspectiva.</p>
<h3>Programaci&oacute;n reactiva</h3>
<p>Si estudiamos detenidamente el nombre de la librer&iacute;a que nos ocupa, encontramos dos palabras:</p>
<ul>
<li><strong>Reactive</strong>: que hace referencia a la programaci&oacute;n reactiva.</li>
<li><strong>Extensions</strong>: implica que son extensiones para la framework de .net.</li>
</ul>
<p><i>Reactive programming</i> es un paradigma de programaci&oacute;n basado en los flujos de datos y la propagaci&oacute;n de los cambios. Esto significa que deber&iacute;amos poder crear flujos de datos con facilidad (usando el propio lenguaje de programaci&oacute;n), y nuestro propio entorno de ejecuci&oacute;n deber&iacute;a ser capaz de propagarse a trav&eacute;s de los cambios que se producen en estos flujos de datos.</p>
<p>Ahora par&eacute;monos un momento a coger aire... Vamos a ver un ejemplo pr&aacute;ctico para entender todo esto: imaginemos un contexto de programaci&oacute;n secuencial tradicional.</p>
<pre class="brush: c#">int a, b, c;
b = 10;
c = 2;
a = b + c; // a = 12
c = 4; // a = 12
b = 3; // a = 12</pre>
<p>Como vemos, una vez asignamos el valor de la variable 'a' como una suma de 'b' m&aacute;s 'c', se eval&uacute;a esa suma. Y aunque cambiemos el valor de 'b' o 'c', el valor de 'a' ya ha sido evaluado y sigue siendo el mismo que la primera vez (<em>12</em>).</p>
<p>La <strong>programaci&oacute;n reactiva</strong> propone un comportamiento diferente. Algo parecido a una tabla de excel donde nosotros asignamos a la celda 'A1' para que calcule el valor de 'B1' m&aacute;s 'C1'. Aqu&iacute;, si cambiamos el valor de la columna 'B1' o 'C1' el valor de 'A1' se actualiza (eval&uacute;a) autom&aacute;ticamente.</p>
<center><img src="/assets/uploads/2012/09/rx2.gif" alt="" width="452" height="98" /></center>
<p>Ahora ya podemos decir que<strong>&nbsp;Rx</strong> es ese conjunto de herramientas que<strong> extienden el lenguaje secuencial tradicional</strong> que conocemos, para poder <strong>crear c&oacute;digo de programaci&oacute;n reactiva</strong>.</p>
<p>Vamos a ver c&oacute;mo lo hace :).</p>
<h3>Reactive Framework</h3>
<p>La Reactive Framework ha sido desarrollada en los <b>Microsoft Live Labs</b> y es otra de las creaciones de <b>Erik Meijer</b>, el padre de <b>Linq</b>.</p>
<p>Como hemos visto el objetivo de Rx es unir y simplificar la programaci&oacute;n basada en eventos complejos y la as&iacute;ncrona proporcion&aacute;ndonos un nuevo modelo de programaci&oacute;n para estos escenarios. Para conseguirlo, se propuso un principio fundamental: crear la dualidad entre el patr&oacute;n <b>iterator</b> y el patr&oacute;n <b>observer</b>.</p>
<p>La propia gente de los Microsoft Live Labs la define as&iacute;:</p>
<center><img src="/assets/uploads/2012/09/rx3.gif" alt="" width="400" height="162" /></center>
<p>Donde <em>observables</em>&nbsp;hace referencia al patr&oacute;n observer. <em>Linq</em>&nbsp;lo usamos para gestionar de una forma sencilla el patr&oacute;n iterator. Y <em>schedulers</em> se refiere a la planificaci&oacute;n de estas tareas en diferentes contextos de ejecuci&oacute;n.</p>
<p>Para empezar, en este art&iacute;culo trataremos los dos patrones base de la f&oacute;rmula para en futuras publicaciones poder dar una explicaci&oacute;n de cada uno de sus par&aacute;metros.</p>
<h4>Iterator</h4>
<p>Comenzamos con los conceptos base refrescando el<strong> patr&oacute;n iterator</strong>, que nos provee de una forma de acceso a los elementos de un objeto agregado, de forma secuencial, sin exponer su representaci&oacute;n interna.</p>
<center><img src="/assets/uploads/2012/09/rx4.gif" alt="" width="351" height="335" /></center>
<p>En todas las versiones de la framework de .net se implementa este patr&oacute;n usando el contrato <em>IEnumerable</em>. Y normalmente cada una de las iteraciones de un enumerable la gestionamos con el bucle <i>foreach:</i></p>
<pre class="brush: c#">var iterable = new List&lt;int&gt; { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
foreach (var iterator in iterable)
{
   if (iterator &lt; 10)
   {
      System.Console.WriteLine(iterator);
   }
}

System.Console.ReadLine();</pre>
<p>Gracias a Linq se ha encontrado una sintaxis c&oacute;moda y r&aacute;pida para trabajar con este tipo de objetos. Por lo que una forma de hacer lo mismo mediante esta tecnolog&iacute;a ser&iacute;a:</p>
<pre class="brush: c#">var query = iterable.Where(iterator =&gt; iterator &lt; 10).Select(iterator =&gt; { System.Console.WriteLine(iterator); return iterator; });

// tengo que 'compilar' la query para que se ejecute.
query.ToArray();

System.Console.ReadLine();</pre>
<h4>Observer</h4>
<p>El otro concepto base es el <strong>patr&oacute;n observador</strong>, tambi&eacute;n conocido como publicaci&oacute;n/subscripci&oacute;n o modelo-patr&oacute;n. Este surge de una serie de sencillos conceptos: Un objeto observable puede ser vigilado por objetos observadores. De esta forma, un observable almacena referencias sus observadores y tendr&aacute; la capacidad de notificarles cambios.</p>
<center><img src="/assets/uploads/2012/09/rx5.gif" alt="" width="483" height="179" /></center>
<p>Gracias a este patr&oacute;n podemos crear una especie de referencias d&eacute;biles entre objetos. Ya que los observadores no guardan ninguna relaci&oacute;n con el observado.</p>
<p>Para ver un ejemplo de como funciona este patr&oacute;n, vamos a crear una clase que observar&aacute; el estado del stock de un almac&eacute;n. La llamaremos StockObserver:</p>
<pre class="brush: c#">public class StockObserver
{
   public string Name { get; set; }

   public void Notify(Stock sender, int units)
   {
      Console.WriteLine("[{0}] The stock {1} has now {2} units", this.Name, sender.Name, units);
   }
}</pre>
<p>Esta clase nos notificar&aacute; de los cambios en el stock. Pero no vale nada si no creamos objetos observables a los que suscribirse. En este caso haremos una clase para cada tipo de stock que sea observable y nos podamos suscribir a ella:</p>
<pre class="brush: c#">public class Stock
{
   private readonly IList&lt;StockObserver&gt; observers;

   private int units;

   public Stock()
   {
      this.observers = new List&lt;StockObserver&gt;();
   }

   public string Name { get; set; }

   public int Units
   {
      get
      {
         return this.units;
      }

      set
      {
         if (this.units != value)
         {
            this.units = value;
            this.NotifyObservers();
         }
      }
   }

   public void Subscribe(StockObserver observer)
   {
      System.Console.WriteLine(observer.Name + " suscrito a " + this.Name);
      this.observers.Add(observer);
   }

   public void Unsubscribe(StockObserver observer)
   {
      if (this.observers.Contains(observer))
      {
         this.observers.Remove(observer);
      }
   }

   private void NotifyObservers()
   {
      foreach (var observer in this.observers)
      {
         observer.Notify(this, this.units);
      }
   }
}</pre>
<p>Una vez tenemos nuestros objetos observador y observable, podemos crear un peque&ntilde;o programa que los utilice:</p>
<pre class="brush: c#">// creamos stocks
var manzanas = new Stock { Name = "Manzanas" };
var peras = new Stock { Name = "Peras" };
var armarios = new Stock { Name = "Armarios" };

// creamos observadores
var fruteria = new StockObserver { Name = "Fruter&iacute;a" };
var almacen = new StockObserver { Name = "Almac&eacute;n" };

manzanas.Subscribe(fruteria);
manzanas.Subscribe(almacen);

peras.Subscribe(fruteria);
peras.Subscribe(almacen);

armarios.Subscribe(almacen);

Console.WriteLine("Inicializa manzanas y peras a 20 unidades");
manzanas.Units = 20;
peras.Units = 20;

for (int i = 0; i &lt; 5; i++)
{
	if (i % 2 == 0)
	{
		Console.WriteLine("Resto una manzana");
		manzanas.Units--;
	}
	else
	{
		Console.WriteLine("Resto una pera");
		peras.Units--;
	}

	Thread.Sleep(1000);
}

Console.WriteLine("Inicializa armarios a 3 unidades");
armarios.Units = 3;

Thread.Sleep(1000);

Console.WriteLine("Suma un armario");
armarios.Units = 4;

System.Console.WriteLine("pulsa intro...");
System.Console.ReadLine();</pre>
<p>En este peque&ntilde;o programa veremos como creamos diferentes stocks de algunas frutas y armarios. Entonces crearemos dos observadores uno que observa el stock de las frutas y otro que observa el stock de todo el almac&eacute;n (incluidas las frutas). Suscribiremos los stocks a los observadores que proceda y jugamos con los valores para ver como son los observadores quienes nos informaci&oacute;n de los cambios en su zona de actuaci&oacute;n.</p>
<p>&nbsp;</p>
<p>Y hasta aqu&iacute; este cap&iacute;tulo introductorio a las <strong>reactive extensions</strong>. En pr&oacute;ximas publicaciones intentaremos hablar m&aacute;s de ellas y resolver uno a uno todos los operadores que forman parte de la f&oacute;rmula que la define. Por lo que espero que no os perd&aacute;is <a href="/2011/12/19/rx-ii-observables-los-sujetos" title="Rx II - Observables: los sujetos">el siguiente cap&iacute;tulo de <b>Observables</b> (<i>Subjects</i>)</a>.</p>