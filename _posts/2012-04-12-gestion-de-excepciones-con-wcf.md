---
ID: 162
title: Gestión de excepciones con WCF
author: fernandoescolar
post_date: 2012-04-12 15:45:34
post_excerpt: ""
layout: post
---
Hace unos días en los <a title="Cual es la diferencia entre Faults y Exception " href="http://social.msdn.microsoft.com/Forums/es-ES/wcfes/thread/fa88fa15-fe22-42a8-98ef-85f260a8c97b" target="_blank">foros de Windows Communication Foundation de MSDN</a> un usuario preguntaba por la diferencia entre <strong>Faults</strong> y <strong>Exceptions</strong> dentro de esta plataforma. La respuesta me llevó a escribir una pequeña introducción a la <strong>gestión de excepciones para los servicios WCF</strong> que me gustaría ampliar en este artículo. Para los más experimentados resultará un texto algo básico. Para los demás sin embargo, les puede ayudar a programar siguiendo las buenas prácticas en el desarrollo de sus servicios.
<!--break-->
Para empezar lo que vamos a necesitar es crear un servicio WCF que nos sirva como prueba. Este servicio tendrá que cumplir el siguiente contrato:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">[ServiceContract]
public interface IMyService
{
    [OperationContract]
    int Operation(int a);
}</pre>
</div>
Y para implementarlo vamos a crear una lógica que lance diferentes excepciones según el valor del parámetro que se le pasa al método. O lo que es lo mismo: vamos a desarrollar un método que si le pasas '0' devuelva un ArgumentException, si le pasas un número negativo lance una InvalidOperationException y si no devuelva el propio número que se le envía. Así que vamos allá:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">[ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
public class MyService : IMyService
{
    public int Operation(int a)
    {
        if (a == 0)
            throw new ArgumentException("Cannot be zero");

        if (a &lt; 0)
            throw new InvalidOperationException("The parameter must be greater than zero");

        return a;
    }
}</pre>
</div>
Hasta aquí todos podemos ver que estamos desarrollando como siempre lo hemos hecho. Lanzamos las excepciones en nuestro código para informar del error que se ha producido. Por lo que, con el fin de probarlo, vamos a crear una función en una aplicación cliente, que sea capaz de llamar a este servicio:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public int CallOperation(int i)
{
   using (var factory = new ChannelFactory&lt;IMyService&gt;("MyServiceEndPointName"))
   {
      var proxy = factory.CreateChannel();
      return proxy.Operation(i);
   }
}</pre>
</div>
Con este código, crearemos un canal de conexión con nuestro servicio (siempre y cuando todo esté configurado correctamente en el app.config o web.config) y llamaremos mediante un proxy al método "<em>Operation</em>".

Ahora, teniendo en cuenta las excepciones que podemos lanzar vamos a probar nuestro código:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public void SafeCallOperation(int numero)
{
   try
   {
      var result = CallOperation(numero);
      System.Console.WriteLine("El resultado es: " + result);
   }
   catch(ArgumentException aex)
   {
      System.Console.WriteLine("Has introducido 0: " + aex.Message);
   }
   catch(InvalidOperationException iex)
   {
      System.Console.WriteLine("Has introducido un número menor de cero: " + iex.Message);
   }
   catch(Exception ex)
   {
      System.Console.WriteLine("Error desconocido: " + ex.Message);
   }
}</pre>
</div>
Lo llamamos de tres formas diferentes para obtener los resultados diferentes que esperamos:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">SafeCallOperation(0);
SafeCallOperation(-1);
SafeCallOperation(2);</pre>
</div>
Pero al ejecutar estas llamadas nos encontramos con una salida inesperada:
<pre style="color: white; font-size: 12px; background-color: black;">Error desconocido: Cannot be zero
Error desconocido: The parameter must be greater than zero
El resultado es: 2</pre>
Las dos primeras dan como resultado "<em>Error desconocido: ...</em>" y la última si que responde con el resultado como esperábamos. ¿Por qué no ha respondido capturando las excepciones que hemos lanzado desde el servicio?

Si analizamos la ejecución en modo debug, nos daremos cuenta de que enviemos la excepción que enviemos, siempre recibimos en el cliente una de tipo "<strong><em>FaultException&lt;ExceptionDetail&gt;</em></strong>". De esto deducimos que WCF convierte las excepciones en FaultException y cuando las queremos usar, estamos perdiendo información importante para diferenciarlas.

Esto ocurre porque una excepción cualquiera no es serializable. Lo que quiere decir que no es <em>materializable</em> (solo puede existir en memoria) y por lo tanto tampoco se puede enviar por un canal de comunicación ni tampoco guardar en un fichero. Para eso existen <em><strong>FaultException</strong></em> y <em><strong>FaultException&lt;T&gt;</strong></em>.
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">[SerializableAttribute]
public class FaultException&lt;TDetail&gt; : FaultException</pre>
</div>
Ambas excepciones son serializables y representan un error en el protocolo SOAP (que es el protocolo que usan para comunicarse los servicios web). Al tener esta característica se pueden enviar por el canal de comunicación entre el servidor y el cliente. Y además nos ayudarán a enviar información personalizada gracias a que <em><strong>FaultException&lt;T&gt; </strong></em>es una clase genérica, que puede transportar cualquier información siempre que esta sea un DTO (<strong>D</strong>ata <strong>T</strong>ransfer <strong>O</strong>bject).

Para adaptar nuestro código, vamos a crear dos DTOs que manejen las excepciones del servidor. Para que un objeto se convierta en transportable, basta con añadir los atributos <strong>DataContract</strong> al objeto y <strong>DataMember</strong> a todas las propiedades que se quieran enviar. Como nota,<strong> las propiedades decoradas con DataMember deben ser de lectura y escritura</strong>. Vamos a crear entonces nuestros nuevos objetos:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">[DataContract]
public class ArgumentFault
{
   [DataMember]
   public string Argument { get; set; }

   [DataMember]
   public string Message { get; set; }
}

[DataContract]
public class InvalidOperationFault
{
   [DataMember]
   public string Message { get; set; }
}</pre>
</div>
Con <strong><em>ArgumentFault</em></strong> gestionaremos las excepciones tipo <em><strong>ArgumentException</strong></em> y con <strong><em>InvalidOperationFault</em></strong>, las de <strong><em>InvalidOperationException</em></strong>. Entonces el código de nuestro servicio cambiará, para gestionar excepciones de tipo <strong><em>FaultException</em></strong> que contengan los objetos <em>Fault</em> que hemos creado. Algo parecido a esto:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">[ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
public class MyService : IMyService
{
    public int Operation(int a)
    {
        if (a == 0)
        {
            var argumentFault = new ArgumentFault { Argument = "a", Message = "Cannot be zero" };
            throw new FaultException&lt;ArgumentFault&gt;(argumentFault);
        }

        if (a &lt; 0)
        {
            var operationFault = new InvalidOperationFault { Message = "The parameter must be greater than zero" };
            throw new FaultException&lt;InvalidOperationFault&gt;(operationFault);
        }

        return a;
    }
}</pre>
</div>
Además, como estamos usando el contrato <em>IMyService</em>, deberemos adaptarlo para que "conozca" las excepciones/faltas que puede lanzar. Esto se hace usando el atributo FaultContract, mediante el cual especificaremos los DTOs que pueden ser enviados dentro de una FaultException:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">[ServiceContract]
public interface IMyService
{
    [OperationContract]
    [FaultContract(typeof(ArgumentFault))]
    [FaultContract(typeof(InvalidOperationFault))]
    int Operation(int a);
}</pre>
</div>
Con estos pasos ya hemos adaptado nuestro servicio para que pueda enviar excepciones más descriptivas que puedan ser recogidas mediante diferentes bloques <em>catch</em>. Así que para terminar con nuestro desarrollo, solo quedaría modificar el cliente de tal forma que sea capaz  de reconocer las diferentes excepciones/faltas que provengan del servidor:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">public void SafeCallOperation(int numero)
{
   try
   {
      var result = CallOperation(numero);
      System.Console.WriteLine("El resultado es: " + result);
   }
   catch(FaultException&lt;ArgumentFault&gt; aex)
   {
      System.Console.WriteLine("Has introducido 0: " + aex.Detail.Message);
   }
   catch(FaultException&lt;InvalidOperationFault&gt; iex)
   {
      System.Console.WriteLine("Has introducido un número menor de cero: " + iex.Detail.Message);
   }
   catch(Exception ex)
   {
      System.Console.WriteLine("Error desconocido: " + ex.Message);
   }
}</pre>
</div>
Se pueden apreciar dos diferencias con respecto el código original. La primera es que ahora capturamos siempre excepciones de tipo <strong><em>FaultException</em></strong>. Y la segunda es que la información significativa que hemos creado, la podemos encontrar en la propiedad <strong><em>Detail</em></strong> de la <strong><em>FaultException</em></strong> genérica que hemos capturado.

Al ejecutar de nuevo estas tres llamadas:
<div id="CodeDiv" dir="ltr">
<pre class="brush: csharp">SafeCallOperation(0);
SafeCallOperation(-1);
SafeCallOperation(2);</pre>
</div>
Podremos ver que esta vez si que la salida es como estábamos esperando.
<pre style="color: white; font-size: 12px; background-color: black;">Has introducido 0: Cannot be zero
Has introducido un número menor de cero: The parameter must be greater than zero
El resultado es: 2</pre>
&nbsp;

Así que ya no hay excusas para no gestionar correctamente las excepciones en WCF. Podremos desarrollar más esta solución. Por ejemplo creando un objeto base para gestión de las diferentes excepciones, o incluso desmarcarnos haciendo un "serializador" de excepciones genérico para todas nuestras aplicaciones...

Aquí solo exponemos el comportamiento básico y su por qué. Explorarlo e implementarlo mejor, corre a cargo del cada uno :)