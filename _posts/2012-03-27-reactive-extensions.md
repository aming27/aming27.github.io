---
ID: 156
title: 'Reactive Extensions (#codemotion)'
author: fernandoescolar
post_date: 2012-03-27 09:30:32
post_excerpt: ""
layout: post
---
El pasado fin de semana <a title="@Quiqu3" href="https://twitter.com/quiqu3" target="_blank">@quiqu3</a> y <a title="@fernandoescolar" href="https://twitter.com/fernandoescolar" target="_blank">@fernandoescolar</a> estuvieron en Madrid, en la <strong>codemotion</strong>, en representación de <strong>programando en .net</strong>. Además tuvieron el placer de impartir una pequeña charla de 45 minutos acerca de las reactive extensions. Aprovechando este hecho, nos gustaría cerrar de una forma más o menos elegante la serie de artículos sobre rx, aportando un índice de los artículos, un breve resumen basado en la charla y varios programas de ejemplo (incluida la red social de moda: <strong>BeerToBeer</strong>).
<!--break-->
<h2>Reactive extensions</h2>
Las reactive extensions es el nombre que recibe <strong>una framework</strong> que nos ayudará a desarrollar de una forma novedosa y cercana al lenguaje natural. Fueron creadas por<strong> Eric Meijer</strong>, el <strong>padre de Linq</strong>. Y basa su forma de trabajar en esta herramienta.

Cuando hablamos de <strong>Linq</strong> (<strong>L</strong>anguage <strong>I</strong>ntegrated <strong>Q</strong>uery) nos referimos a una librería de la<strong> framework .net de Microsoft</strong> que nos ayuda a operar con colecciones, listas, diccionarios,... en resumen: <strong>enumeraciones </strong>mediante un lenguaje de interfaces <em>fluent</em>.

Cuando hablamos de<strong> interfaces fluent</strong> (nombre acuñado por el propio Eric Evans y Martin Fowler), es hablar de un tipo de implementación de la programación orientada a objetos que nos ayuda a crear código fuente más legible. Se basa en crear métodos dentro de objetos que nos devuelven al propio objeto que las usa. De esta forma podemos encadenar varias llamadas encadenadas por puntos. Pero mejor vamos a ver un ejemplo:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public class FluentClass
{
    private int value;

    public FluentClass WithValue(int value) { this.value = value; return this; }

    public FluentClass AddOne() { this.value += 1; return this; }

    public FluentClass SubstractTwo() { this.value -= 2; return this; }

    public FluentClass MultiplyThree() { this.value *= 3; return this; }

    public FluentClass DrawValue() { Console.WriteLine(this.value); return this; }
}

static void Main(string[] args)
{
    var fluent = new FluentClass()
                        .WithValue(9)
                        .DrawValue()
                        .AddOne()
                        .DrawValue()
                        .SubstractTwo()
                        .DrawValue()
                        .MultiplyThree()
                        .DrawValue();

    Console.ReadLine();
}</pre>
</div>
Como se puede observar en este ejemplo, cada función del objeto fluent, después de operar devuelve el propio objeto. Esto unido con nombre de función muy descriptivos, hacen que podamos crear una serie de llamadas encadenadas, cuyo significado es muy legible.

Una vez hemos visto esto, podemos entonces acercarnos a cómo Linq, usando esta forma de programar, nos ayuda a realizar búsquedas, filtrados, ordenaciones y demás operaciones; con conjuntos de valores en .net:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">static void Main()
{
    var lista = new List&lt;int&gt; {3, 4, 5, 78, 89, 98, 123, 2, 3};

    var listaFiltrada = lista
                            .OrderByDescending(x =&gt; x) // ordena de forma inversa
                            .Where(x =&gt; x &lt; 50) // filtra los valores menores de 50
                            .Take(2); // coge los dos primeros

    // este código dibujará en pantalla un 5 y un 4
    foreach (var item in listaFiltrada)
    {
        Console.WriteLine(item);
    }

    Console.ReadLine();
}</pre>
</div>
En este otro ejemplo podemos ver como aplicamos algoritmos de ordenación, de filtrado y selección usando este Linq.

Y así vamos llegando hasta el contexto actual de aplicación:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/app-context.png" alt="contexto de aplicación actual" width="650" height="349" />

Lo que nos podemos encontrar actualmente son aplicaciones distribuidas. Pongamos el ejemplo de twitter, donde encontramos unos servicios que están alojados en la nube y una serie de clientes diferentes según sean plataformas móviles, páginas web o aplicaciones de escritorio.

Todas estas aplicaciones usan los mismos servicios que son quienes manejan los datos. Para comunicarse con ellos se utiliza un tipo de comunicación asíncrona, con lo que conseguimos que nuestra aplicación no se quede congelada esperando una respuesta del servidor. Y para gestionar la interacción con el usuario se utilizan los eventos.

Es decir, nuestras aplicaciones convierten eventos en llamadas a servicios. Pero la forma de manejar unos y otros es muy diferentes y es justo en este punto en el que aparecen las reactive extensions y encontramos su objetivo: <strong>unificar la forma de gestionar eventos y las llamadas a servicios</strong>.

Para conseguir esta compleja tarea se recurre a la <strong>programación reactiva</strong>. Un nuevo paradigma de programación que podemos decir que se diferencia de la programación tradicional en que es un sistema <strong>Push</strong> y no <strong>Pull</strong>. Es decir el código en la forma de programación tradicional se maneja bajo demanda (cada vez que escribimos una línea) y en la programación reactiva, se evalúa código cuando un acontecimiento que tiene relación con él ocurre (como las <strong>notificaciones Push</strong> del móvil).

Y es aquí cuando llegamos a una nueva problemática, la de programar de forma reactiva usando un lenguaje secuencial. La solución nos la aporta esta función que definen las reactive extensions y que nos brindan desde los <strong>Microsoft Live Labs</strong>:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/09/rx3.gif" alt="Formula de las reactive extensions" width="400" height="162" />

Para poder explicar esta formula de una forma cercana a la programación hemos creado una aplicación: <strong>BeerToBeer</strong>, que ya mostramos en la <strong>codemotion</strong>. Una red social (tipo twitter) en la que puedes enviar mensajes a propósito de la cerveza que estás bebiendo en ese momento.

El ejemplo está compuesto de una serie de servicios WCF (con netTcp, http y REST) y unos clientes para tres plataformas diferentes: HTML 5, Windows Phone 7 y Windows (WPF).
<h2>Descargas de material</h2>
Entre los materiales de la charla se encuentra la presentación que mostramos y la aplicación de ejemplo BeerToBeer con el código de servicios y los clientes. Además también podréis encontrar otros ejemplos que no mostramos como un EventAggregator reactivo, el típico ejemplo de Drag 'n Drop o un mini cliente twitter.

<a href="https://skydrive.live.com/redir?resid=5EC9B8BAE659AAF3!248" target="_blank">Descargar el ejemplo</a>

<a href="https://skydrive.live.com/redir?resid=5EC9B8BAE659AAF3!247" target="_blank">La presentación que mostramos</a>

&nbsp;

Y si crees que las reactive extensions pueden serte de utilidad en tu trabajo o simplemente quieres saber más sobre las mismas, no olvides que en esta misma web tenemos una serie de cinco artículos donde se trata a fondo esta framework.
<h2>Índice de artículos</h2>
<ol>
	<li><a title="Rx I - Qué son las Reactive eXtensions" href="/2011/12/12/rx-i-que-son-las-reactive-extensions">Qué son las reactive extensions</a></li>
	<li><a title="Rx II - Observables: los sujetos" href="/2011/12/19/rx-ii-observables-los-sujetos">Observables (los sujetos)</a></li>
	<li><a title="Rx III - Linq: crear objetos observables" href="/2012/01/02/rx-iii-linq-crear-objetos-observables">Linq: crear objetos observables</a></li>
	<li><a title="Rx IV - Linq: operaciones con observables" href="/2012/02/15/rx-iv-linq-operaciones-con-observables">Linq: operaciones con observables</a></li>
	<li><a title="Rx V - Schedulers y Linq2Events" href="/2012/03/26/rx-v-schedulers-y-linq2events">Schedulers y Linq2Events</a></li>
</ol>