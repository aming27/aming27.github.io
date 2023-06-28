---
ID: 23
title: 'Patrones de diseño: Singleton'
author: fernandoescolar
post_date: 2012-09-10 13:06:17
post_excerpt: ""
layout: post
---
<p>Cuando hablamos de un <strong>patr&oacute;n de dise&ntilde;o nos referimos a una soluci&oacute;n a un problema concreto en el desarrollo de software</strong>. Pero no cualquier soluci&oacute;n, s&oacute;lo aquellas que se ha desmostrado que <span style="text-decoration: underline;">son eficientes en diferentes escenarios</span> y&nbsp;<span style="text-decoration: underline;">reutilizables en gran cantidad de contextos</span> de aplicaciones. Por lo tanto, aunque los ejemplos que podamos dar est&eacute;n en un lenguaje de programaci&oacute;n concreto, la idea ser&aacute; extrapolable a diferentes lenguajes de programaci&oacute;n orientada a objetos.</p>
<!--break-->
<h2>Singleton</h2>
<p>El patr&oacute;n singleton consiste en crear una instancia de un objeto y solo una, para toda nuestra aplicaci&oacute;n. Ser&iacute;a como una especie de variable global que almacena nuestro objeto.</p>
<p>En un primer momento esta definici&oacute;n puede sonar muy extra&ntilde;a. Por lo general, siempre se recomienda no usar variables globales en una aplicaci&oacute;n, y mucho menos en programaci&oacute;n orientada a objetos. Pero cuando hablamos de singleton, estamos jugando a crear una especie de variable global de forma encubierta. &iquest;C&oacute;mo puede ser esto un patr&oacute;n?</p>
<p>Para responder a esta pregunta vamos a proponeros dos escenarios diferentes:</p>
<ul>
<li>Piensa en una aplicaci&oacute;n Web, que almacena en un objeto una serie de valores tipo par&aacute;metros de configuraci&oacute;n. Estos par&aacute;metros son comunes para toda la aplicaci&oacute;n. Se guardan en una base de datos y si son modificados por un administrador, quedan modificados para todos los usuarios que acceden a la p&aacute;gina.</li>
</ul>
<ul>
<li>Ahora vamos a imaginar que tenemos un recurso compartido como puede ser un fichero en el que escribimos un log de la aplicaci&oacute;n. Este log puede ser accedido desde cualquier parte de la aplicaci&oacute;n. Pero sabemos que un fichero no se puede abrir si otro proceso lo abri&oacute; anteriormente y a&uacute;n no lo ha cerrado.</li>
</ul>
<p>Para ambos problemas podemos encontrar una soluci&oacute;n usando el patr&oacute;n singleton. Crearemos una especie de variable global, pero con unas caracter&iacute;sticas concretas:</p>
<ul>
<li>solo se puede instanciar una vez (single-instance)</li>
<li>no se debe instanciar si nunca fue utilizada&nbsp;</li>
<li>es thread-safe, que quiere decir que sus m&eacute;todos son accesibles desde diferentes hilos de ejecuci&oacute;n, sin crear bloqueos ni excepciones debido a la concurrencia</li>
<li>no tiene un constructor p&uacute;blico, luego el objeto que la usa no puede instanciarla directamente</li>
<li>posee un mecanismo para acceder a la instancia que se ha creado (mediante una propiedad est&aacute;tica, por ejemplo)</li>
</ul>
<p>Teniendo en cuenta estas caracter&iacute;sticas vamos a desarrollar una clase singleton:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public sealed class Singleton
{
    private static Singleton instance;

    private Singleton()
    {
    }

    public static Singleton Instance
    {
        get
        {
            if (instance == null) instance = new Singleton();
            return instance;
        }
    }
}</pre>
</div>
<p>En esta peque&ntilde;a porci&oacute;n de c&oacute;digo hemos conseguido realizar una &uacute;nica instancia en el momento en el que se llama por primera vez. Adem&aacute;s hemos creado un constructor con acceso privado para que nadie pueda instanciar la clase. Y para terminar hemos creado una propiedad de solo lectura con la que se puede acceder a la instancia creada. Pero &eacute;sta no ser&aacute; Thread-safe. Para conseguirlo podr&iacute;amos modificar la clase de la siguiente forma:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public sealed class Singleton
{
    private static readonly Singleton instance = new Singleton();

    private Singleton() { }

    public static Singleton Instance { get { return instance; } }
}</pre>
</div>
<p>Al crear el atributo que almacena la instancia como readonly, y al ser est&aacute;tica, se instanciar&aacute; al arrancar la aplicaci&oacute;n. As&iacute; conseguiremos que sea una clase thread-safe. Es decir, que no habr&aacute; problemas si varios procesos acceden a esta clase al mismo tiempo. No obstante, si quisieramos respetar que solo se instanciara el objeto bajo demanda, deber&iacute;amos usar bloqueos:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public sealed class Singleton
{
    private static readonly object locker = new object();
    private static volatile Singleton instance;

    private Singleton() { }

    public static Singleton Instance
    {
        get
        {
            if (instance == null)
            {
                lock (locker)
                {
                    if (instance == null) instance = new Singleton();
                }
            }

            return instance;
        }
    }
}</pre>
</div>
<p>Gracias al bloqueo ya podremos ejecutar nuestra clase singleton en un contexto multihilo, instanci&aacute;ndola s&oacute;lo cuando se ha solicitado la primera vez. A este efecto de carga en diferido se le denomina en ingl&eacute;s "Lazy Loading". Y desde la versi&oacute;n 4.0 de la framework .net se nos provee un objeto que nos ayuda a realizarla: Lazy. Por lo que podr&iacute;amos simplificar nuestro ejemplo us&aacute;ndolo:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public sealed class Singleton
{
    private static readonly Lazy&lt;Singleton&gt; instance = new Lazy&lt;Singleton&gt;(() =&gt; new Singleton());

    private Singleton() { }

    public static Singleton Instance
    {
        get
        {
            return instance.Value;
        }
    }
}</pre>
</div>
<p>El objeto Lazy ya es de por si thread-safe y en su declaraci&oacute;n simplemente debemos indicarle de qu&eacute; forma se debe instanciar el objeto que contiene. Por esta raz&oacute;n es posiblemente la mejor implementaci&oacute;n del patr&oacute;n singleton.</p>
<p>Si por ejemplo estuvieramos desarrollando la herramientas de log de nuestra aplicaci&oacute;n, bastar&iacute;a con que a&ntilde;adieramos las funciones necesarias para escribir en el log a nuestra clase singleton:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public sealed class Logger
{
    private static readonly Lazy&lt;Logger&gt; instance = new Lazy&lt;Logger&gt;(() =&gt; new Logger());

    private Logger() { }

    public static Logger Current
    {
        get
        {
            return instance.Value;
        }
    }

    public void WriteInformation(string message)
    {
       // ...
    }

    public void WriteWarning(string message)
    {
       // ...
    }

    public void WriteError(string message)
    {
       // ...
    }
}</pre>
</div>
<p>Viendo este c&oacute;digo en nuestra aplicaci&oacute;n, est&aacute; claro que para poder escribir en el log desde cualquier punto de la misma s&oacute;lo tendremos que hacer esta llamada:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">Logger.Current.WriteInformation("Una informaci&oacute;n");
Logger.Current.WriteWarning("Un aviso");
Logger.Current.WriteError("Un error");</pre>
</div>
<p>Al pararnos a pensar las consecuencias de escribir este c&oacute;digo, caeremos en la cuenta de que singleton nos est&aacute; creando una dependencia en todo el programa donde queramos tener informaci&oacute;n del proceso en forma de logs (eso es a lo largo de toda la aplicaci&oacute;n). Algo que comunmente conocemos como <strong>acoplamiento entre clases</strong>.</p>
<p>El acoplamiento puede dar varios problemas a lo largo del ciclo de vida de un software. Como por ejemplo a la hora de realizar pruebas unitarias. Pero no es objeto de este art&iacute;culo centrarse en este problema. Aunque si lo es proponer soluciones de implementaci&oacute;n del patr&oacute;n singleton que se adapten a un desarrollo s&oacute;lido.</p>
<p>Si quisieramos evitar este acoplamiento, es recomendable usar un IoC Container (Inversion Of Control Container) para respetar la "D" de los pincipios <strong>SOLID</strong>: <strong>Dependency Inversion Principle</strong>. Esta, por as&iacute; llamarla, norma nos dice que<strong> debemos depender de las abstraciones (las interfaces, los contratos) no de las concreciones (clases que implementan esas interfaces</strong>).&nbsp;</p>
<p>En las frameworks de inversi&oacute;n de control m&aacute;s conocidas se han implementado mecanismos que nos permiten crear objetos singleton desde el propio contenedor. Esto quiere decir que simplemente tendr&iacute;amos que crear una interfaz y una implementaci&oacute;n de la misma, sin preocuparnos de como se intancia. Visto en forma de c&oacute;digo ser&iacute;a esto:</p>
<div id="CodeDiv" dir="ltr">
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public interface ILogger
{
    void WriteInformation(string message);
    void WriteWarning(string message);
    void WriteError(string message);
}

public class Logger : ILogger
{
    public Logger()
    { 
        // ...
    }
    public void WriteInformation(string message)
    {
        // ...
    }
    public void WriteWarning(string message)
    {
        // ...
    }
    public void WriteError(string message)
    {
        // ...
    }
}</pre>
</div>
<p>De esta forma, delegar&iacute;amos la gesti&oacute;n del ciclo de vida de las instancias al IoC Container que hayamos decidido. A continuaci&oacute;n mostraremos c&oacute;mo podemos configurar una instancia singleton usando las frameworks de inyecci&oacute;n de dependencias (DI) m&aacute;s conocidas:</p>
<ul>
<li>Usando <strong>Structure maps</strong>:</li>
</ul>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">// configurar
ObjectFactory.Initialize(x =&gt;
{
    x.For&lt;ILogger&gt;().Singleton().Use&lt;Logger&gt;();
}
// recoger valor
var x = ObjectFactory.GetInstance&lt;ILogger&gt;();</pre>
</div>
<ul>
<li>Con <strong>Ninject</strong>:</li>
</ul>
<div id="CodeDiv" dir="ltr">
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">// configurar
IKernel ninject = new StandardKernel(new InlineModule(
              x =&gt; x.Bind&lt;ILogger&gt;().To&lt;Logger&gt;(),
              x =&gt; x.Bind&lt;Logger&gt;().ToSelf().InSingletonScope()));
// recoger valor
var x = ninject.Get&lt;ILogger&gt;();</pre>
</div>
</div>
<ul>
<li>Con <strong>Unity</strong>:</li>
</ul>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">// configurar
IUnityContainer container = new UnityContainer();
container.RegisterType&lt;ILogger, Logger&gt;(new ContainerControlledLifetimeManager());
// recoger valor
var x = container.Resolve&lt;ILogger&gt;();</pre>
</div>
<ul>
<li>O con <b>autofact</b>:</li>
</ul>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">var builder = new ContainerBuilder();
builder
   .Register(c =&gt; new Logger())
   .As&lt;ilogger&gt;()
   .SingleInstance();
var container = builder.Build(); 
var x = container.Resolve&lt;ilogger&gt;();</pre>
</div>
<p>Pero esto no quiere decir que no nos sirva la implementaci&oacute;n de singleton que hicimos anteriormente, ya que es posible que no nos fiemos o que nuestro contenedor no tenga ning&uacute;n artefacto que nos facilite la implementaci&oacute;n singleton. Para estos casos, podr&iacute;amos hacer que un contenedor como Unity nos devolviera la instancia singleton que gestiona nuestra clase usando la propiedad est&aacute;tica. Simplemente tendr&iacute;amos que seguir usando una interface, implementarla en nuestra clase singleton y registrar una instancia en lugar de una clase en el contenedor:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public interface ILogger
{
    void WriteInformation(string message);
    void WriteWarning(string message);
    void WriteError(string message);
}

public sealed class Logger : ILogger
{
    private static readonly Lazy&lt;Logger&gt; instance = new Lazy&lt;Logger&gt;(() =&gt; new Logger());

    private Logger() { }

    public static Logger Current
    {
        get
        {
            return instance.Value;
        }
    }

    public Logger()
    { 
        // ...
    }
    public void WriteInformation(string message)
    {
        // ...
    }
    public void WriteWarning(string message)
    {
        // ...
    }
    public void WriteError(string message)
    {
        // ...
    }
}</pre>
</div>
<p>De esta forma, por ejemplo, si usamos el contenedor de <strong>Unity</strong>, tendr&iacute;amos que registrar su valor as&iacute;:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">var container = new UnityContainer();
container.RegisterInstance&lt;ILogger&gt;(Logger.Current);</pre>
</div>
<p>Con este c&oacute;digo ser&iacute;a nuestro singleton Logger quien gestione el ciclo de vida y conseguir&iacute;amos desacoplarnos de la implementaci&oacute;n gracias al IoC.<br /><br />Podr&iacute;amos hacer lo mismo con <strong>Structure maps</strong>:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">ObjectFactory.Initialize(x =&gt;
{
    x.For&lt;ILogger&gt;().Use(Logger.Current);
}

var x = ObjectFactory.GetInstance&lt;ILogger&gt;();</pre>
</div>
<p>Y para finalizar, con <strong>Ninject</strong>:</p>
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">IKernel ninject = new StandardKernel(new InlineModule(
              x =&gt; x.Bind&lt;ILogger&gt;().ToConstant(Logger.Current)));

var x = ninject.Get&lt;ILogger&gt;();</pre>
</div>
<p>&nbsp;</p>
<p>A lo largo de este art&iacute;culo hemos visto diferentes formas de implementar el patr&oacute;n singleton. Un patr&oacute;n de desarrollo sigue siendo vigente y v&aacute;lido. Lo &uacute;nico que tenemos que tener en cuenta, es evitar aplicarlo donde no corresponde o de una forma incorrecta. Algo que conocemos como el <strong>antipatr&oacute;n singletonitis</strong>.<br /><br /><br /></p>
</div>