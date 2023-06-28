---
ID: 281
title: 'Patrones de dise&ntilde;o: Mediator'
author: fernandoescolar
post_date: 2012-10-18 09:32:22
post_excerpt: ""
layout: post
---
En el mundo de la programación orientada a objetos una de las máximas que debemos cumplir, si queremos desarrollar un código de calidad, es que debemos buscar una elevada cohesión con bajo acoplamiento. Y con el fin de ayudarnos en esta ardua tarea, aparece el patrón Mediator.
<!--break-->

La <strong>cohesión</strong> es una de las características más importantes de la OOP (<em>Object Oriented Programming</em>). Se refiere a que hay que dotar a las clases de un solo ámbito de desarrollo, y que a su vez, todo lo referente a ese ámbito, quede encapsulado dentro de una sola clase. Si hemos conseguido esto, diremos que tenemos una alta cohesión. Es un concepto semejante al primer principio de SOLID, el principio de responsabilidad única: una clase solo debe tener una, y solo una, razón para se modificada.

Para poder exponerlo claramente vamos a desarrollar un ejemplo de una aplicación cualquiera de escritorio:

<a href="/assets/uploads/2012/10/mediator-mockup.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="mediator-mockup" src="/assets/uploads/2012/10/mediator-mockup_thumb.png" alt="mediator-mockup" width="420" height="284" border="0" /></a>

En este <em>mockup</em> podemos observar que nuestra aplicación va a constar de tres controles de usuario. Con un recuadro rojo representamos el control encargado de pedir los datos al usuario para realizar las búsquedas. En azul un panel en el que se mostrará un listado de resultados de las búsquedas. Y para terminar en verde, mostraremos los detalles del resultado de la búsqueda que seleccionemos. El código de los controles podría ser algo parecido a esto:
<pre class="brush: csharp">public class SearchControl
{
    public void OnSearch(string text)
    {
        // search in repository
    }
}

public class ResultControl
{
    public void OnItemSelected(Item item)
    {
        // on item selected method
    }

    public void ShowSearch(IEnumerable&lt;Item&gt; items)
    {
        // show the items in the UI
    }
}

public class DetailControl
{
    public void ShowDetails(Item item)
    {
        // show the details of the item in the UI
    }

    public void ShowEmpty()
    {
        // clear the UI
    }
}</pre>
Quizá esta no sea la mejor implementación, pero si que sirve para hacernos a la idea de la responsabilidad única de cada una de las clases y cómo esto nos lleva a que todo lo referente a esa responsabilidad esté encapsulado dentro de la propia clase. Es decir, “SearchControl” realizará la búsqueda según el texto introducido por el usuario, “ResultControl” solo mostrará el listado de resultados y “DetailControl” tiene como única responsabilidad mostrar los detalles de un “Item” seleccionado. Así que podemos decir que nuestro código goza de una alta cohesión.

El código que acabamos de desarrollar no tiene implementado el comportamiento completo que deben tener estos controles. El control de búsqueda deberá indicarle al de resultados los elementos que tiene que mostrar y a su vez el de resultados debe comunicar al control de detalles cual es el elemento que está seleccionado para mostrar sus detalles. Por lo que vamos a completar nuestro código:
<pre class="brush: csharp">public class SearchControl
{
    private ResultControl resultControl;
    private DetailControl detailControl;

    public void SetRelatedControls(ResultControl resultControl, DetailControl detailControl)
    {
        this.detailControl = detailControl;
        this.resultControl = resultControl;
    }

    public void OnSearch(string text)
    {
        // search in repository
        resultControl.ShowSearch(listOfItems);
        detailControl.ShowEmpty();
    }
}

public class ResultControl
{
    private DetailControl detailControl;

    public void SetRelatedControl(DetailControl detailControl)
    {
        this.detailControl = detailControl;
    }

    public void OnItemSelected(Item item)
    {
        detailControl.ShowDetails(item);
    }

    public void ShowSearch(IEnumerable&lt;Item&gt; items)
    {
        // show the items in the UI
    }
}

public class DetailControl
{
    public void ShowDetails(Item item)
    {
        // show the details of the item in the UI
    }

    public void ShowEmpty()
    {
        // clear the UI
    }
}</pre>
Hemos añadido una serie de funciones para referenciar los controles relacionados con cada clase y luego realizamos llamadas de uno a otro para que tenga coherencia el comportamiento de la pantalla. El problema es que haciendo esto acabamos de acoplar las clases de nuestra aplicación.

Decimos que existe <strong>acoplamiento</strong> cuando clases relacionadas necesitan conocer detalles sobre comportamiento interno, unas de otras, para poder desempeñar correctamente su función. De esta forma, los cambios se irán propagando de unas clases a otras y como resultado tendremos un código difícil de seguir, leer y por lo tanto mantener.

&nbsp;
<blockquote><strong><em><span style="font-size: large;">Debemos buscar un bajo acoplamiento y una alta cohesión</span></em></strong></blockquote>

Existen varias formas de evitar el acoplamiento entre clases. Pero cuando en nuestro escenario nos encontramos una gran cantidad de clases que necesitan interactuar entre si, para funcionar correctamente; podríamos crear un mecanismo para facilitar la comunicación y así evitar que unas clases tengan que conocer la existencia de otras.

Con el fin de desarrollar esta solución vamos a crear dos interfaces nuevas: una para definir que la clase es un control que se puede comunicar con otros, a la que llamaremos “ICommunityControl”. Y otra que servirá como facilitador de la comunicación, que por su labor llamaremos “IMessageBoard”:
<pre class="brush: csharp">public interface ICommunityControl
{
    IMessageBoard MessageBoard { get; }
}

public interface IMessageBoard
{
    void Register(ICommunityControl control);
    void NotifySearchResult(IEnumerable&lt;Item&gt; items);
    void NotifyItemSelected(Item item);
}</pre>
La idea es que un control pueda comunicarse con el resto usando el “MessageBoard”, quien será el encargado de enviar los mensajes correspondientes al resto de los controles. Por esta razón requeriremos dos métodos para notificar los diferentes acontecimientos y otro para registrar los controles que están en funcionamiento. La implementación bien podría ser esta:
<pre class="brush: csharp">public class MessageBoard : IMessageBoard
{
    private ResultControl resultControl;
    private DetailControl detailControl;

    public void Register(ICommunityControl control)
    {
        if (control is ResultControl)
            this.resultControl = (ResultControl) control;

        if (control is DetailControl)
            this.detailControl = (DetailControl)control;
    }

    public void NotifySearchResult(IEnumerable&lt;Item&gt; items)
    {
        this.detailControl.ShowEmpty();
        this.resultControl.ShowSearch(items);
    }

    public void NotifyItemSelected(Item item)
    {
        this.detailControl.ShowEmpty(item);
    }
}</pre>
De esta forma bastará con implementar el contrato "ICommunityControl" en cada uno de nuestras clases y enviar notificaciones a la "MessageBoard" en lugar de al resto de clases:
<pre class="brush: csharp">public class SearchControl : ICommunityControl
{
    public IMessageBoard MessageBoard { get; private set; }

    public SearchControl(IMessageBoard messageBoard)
    {
        this.MessageBoard = messageBoard;
        this.MessageBoard.Register(this);
    }

    public void OnSearch(string text)
    {
        // search in repository
        this.MessageBoard.NotifySearchResult(listOfItems);
    }
}

public class ResultControl : ICommunityControl
{
    public IMessageBoard MessageBoard { get; private set; }

    public ResultControl(IMessageBoard messageBoard)
    {
        this.MessageBoard = messageBoard;
        this.MessageBoard.Register(this);
    }

    public void OnItemSelected(Item item)
    {
        this.MessageBoard.NotifyItemSelected(item);
    }

    public void ShowSearch(IEnumerable&amp;lg;Item&gt; items)
    {
        // show the items in the UI
    }
}

public class DetailControl : ICommunityControl
{
    public IMessageBoard MessageBoard { get; private set; }

    public DetailControl(IMessageBoard messageBoard)
    {
        this.MessageBoard = messageBoard;
        this.MessageBoard.Register(this);
    }

    public void ShowDetails(Item item)
    {
        // show the details of the item in the UI
    }

    public void ShowEmpty()
    {
        // clear the UI
    }
}</pre>
Y como podemos observar, hay cierto comportamiento común entre los controles, por lo que crearemos una base común para reaprovechar código:
<pre class="brush: csharp">public abstract class CommunityControlBase : ICommunityControl
{
    public IMessageBoard MessageBoard { get; private set; }

    protected CommunityControlBase(IMessageBoard messageBoard)
    {
        this.MessageBoard = messageBoard;
        this.MessageBoard.Register(this);
    }
}

public class SearchControl : CommunityControlBase
{
    public SearchControl(IMessageBoard messageBoard) : base(messageBoard)
    {
    }

    public void OnSearch(string text)
    {
        // search in repository
        this.MessageBoard.NotifySearchResult(listOfItems);
    }
}

public class ResultControl : CommunityControlBase
{
    public ResultControl(IMessageBoard messageBoard): base(messageBoard)
    {
    }

    public void OnItemSelected(Item item)
    {
        this.MessageBoard.NotifyItemSelected(item);
    }

    public void ShowSearch(IEnumerable&lt;Item&gt; items)
    {
        // show the items in the UI
    }
}

public class DetailControl : CommunityControlBase
{
    public DetailControl(IMessageBoard messageBoard): base(messageBoard)
    {
    }

    public void ShowDetails(Item item)
    {
        // show the details of the item in the UI
    }

    public void ShowEmpty()
    {
        // clear the UI
    }
}</pre>
Así que hemos conseguido que nuestros controles tengan una alta cohesión, con un bajo acoplamiento y a que a su vez, se comuniquen unos con otros. Pero si estudiamos detenidamente este nuevo código nos daremos cuenta de que no hemos eliminado el acoplamiento, solo lo hemos desplazado a la clase “MessageBoard”.

La idea es que nuestro objeto de comunicación no esté acoplado tampoco con el resto de las clases, por lo que vamos a cambiar la filosofía de notificaciones. En lugar de tener dos métodos con diferentes parámetros que realizan acciones directamente en los controles, vamos a crear un método genérico que envíe notificaciones de cualquier tipo. Y en lugar de registrar un control completo para luego gestionarlo, vamos a crear acciones genéricas que respondan a un tipo de datos:
<pre class="brush: csharp">public interface IMessageBoard
{
    void Register&lt;TData&gt;(Action&lt;TData&gt; handler);
    void Notify&lt;TData&gt;(TData data);
}

public class MessageBoard : IMessageBoard
{
    private readonly List&lt;object&gt; handlers = new List&lt;object&gt;();

    public void Register&lt;TData&gt;(Action&lt;TData&gt; handler)
    {
        this.handlers.Add(handler);
    }

    public void Notify&lt;TData&gt;(TData data)
    {
        foreach (var handler in this.handlers)
        {
            var action = handler as Action&lt;TData&gt;;
            if (action != null)
                action(data);
        }
    }
}</pre>
Y para adaptar los controles a este nuevo “MessageBoard”, tendremos que modificar algo nuestro código:
<pre class="brush: csharp">public abstract class CommunityControlBase : ICommunityControl
{
    public IMessageBoard MessageBoard { get; private set; }

    protected CommunityControlBase(IMessageBoard messageBoard)
    {
        this.MessageBoard = messageBoard;
    }
}
public class SearchControl : CommunityControlBase
{
    public SearchControl(IMessageBoard messageBoard) : base(messageBoard)
    {
    }

    public void OnSearch(string text)
    {
        // search in repository
        this.MessageBoard.Notify(listOfItems);
    }
}

public class ResultControl : CommunityControlBase
{
    public ResultControl(IMessageBoard messageBoard): base(messageBoard)
    {
        this.MessageBoard.Register&lt;IEnumerable&lt;Item&gt;&gt;(ShowSearch);
    }

    public void OnItemSelected(Item item)
    {
        this.MessageBoard.Notify(item);
    }

    public void ShowSearch(IEnumerable&lt;Item&gt; items)
    {
        // show the items in the UI
    }
}

public class DetailControl : CommunityControlBase
{
    public DetailControl(IMessageBoard messageBoard): base(messageBoard)
    {
        this.MessageBoard.Register&lt;IEnumerable&lt;Item&gt;&gt;(l =&gt; ShowEmpty());
        this.MessageBoard.Register&lt;Item&gt;(ShowDetails);
    }

    public void ShowDetails(Item item)
    {
        // show the details of the item in the UI
    }

    public void ShowEmpty()
    {
        // clear the UI
    }
}</pre>
Básicamente lo que hemos hecho es añadir en el constructor unas funciones de "Register", que lo que hacen es decirle al "MessageBoard" que cuando se notifique algo del tipo que indicamos en la función, realice esa acción lambda. Así logramos que los controles solo tengan un comportamiento especial para unos datos específicos y liberamos de esta responsabilidad al "MessageBoard".

Con estas últimas modificaciones por fin hemos conseguido desacoplar nuestros controles y también la clase "MessageBoard". Y a esto se le conoce comúnmente como patrón Mediador (<em>Mediator Pattern</em>).

<a href="/assets/uploads/2012/10/mediator-pattern.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="mediator-pattern" src="/assets/uploads/2012/10/mediator-pattern_thumb.png" alt="mediator-pattern" width="565" height="205" border="0" /></a>

En nuestro caso particular, el “Mediator” sería el “MessageBoard” y los “Colleagues” estarían representados por los “CommunityControls”. La idea de este patrón es comunicar diferentes clases que implementan “IColleague” usando un “IMediator”. Y aunque aquí hemos expuesto una implementación del mismo, existen unas cuantas variaciones sobre cómo tiene lugar la comunicación.

A muchos, después de ver este código, les vendrá a la cabeza un artefacto llamado EventAggregator que podemos encontrar en varias frameworks de desarrollo MVC y MVVM. Y eso es porque no es ni más ni menos que una implementación del patrón Mediator.

&nbsp;
<blockquote><strong><em><span style="font-size: large;">Un patrón de comportamiento y muy útil en UI</span></em></strong></blockquote>
Tanto el <a title="Patrones de diseño: Strategy" href="/2012/10/03/patrones-de-diseno-strategy/">Strategy Pattern</a> como el Mediator son lo que se llaman patrones de diseño de comportamiento, ya que definen una forma de comunicación entre clases. Remarcamos esta característica porque es sencillo caer en el error de pensar que este patrón está destinado en exclusiva a acompañar a la interfaz gráfica de usuario.

Un ejemplo muy común que podemos encontrar por la red es la gestión de una aplicación de chat. Aquí se implementa el patrón Mediator al convertir a los “Speakers” en “Colleagues” y la “ChatRoom” en el “Mediator” del sistema, que se dedicará a realizar broadcast de los mensajes a todos los usuarios conectados.
<pre class="brush: csharp">public interface IChatRoom
{
    void Register(ISpeaker speaker);
    void Send(string message);
}

public interface ISpeaker
{
    IChatRoom ChatRoom { get; set; }
    void OnReceive(string message);
    void OnSend(string message);
}

public class ChatRoom : IChatRoom
{
    private readonly List&lt;ISpeaker&gt; speakers = new List&lt;ISpeaker&gt;();

    public void Register(ISpeaker speaker)
    {
        speakers.Add(speaker);
        speaker.ChatRoom = this;
    }

    public void Send(string message)
    {
        speakers.ForEach(speaker =&gt; speaker.OnReceive(message));
    }
}

public class Speaker : ISpeaker
{
    public IChatRoom ChatRoom { get; set; }

    public void OnReceive(string message)
    {
        // write message on UI
    }

    public void OnSend(string message)
    {
        this.ChatRoom.Send(message);
    }
}</pre>
Aunque queda claro, que es un patrón que resulta muy útil a la hora de conectar artefactos en UI, y más usando patrones como MVVM, MVC o cualquier derivación del Model Presenter.

Por esta razón mediator se ha convertido en uno de los patrones de diseño básicos para programar en javascript. Si quisiéramos implementar la solución en formato js, podríamos tener un código parecido a este:
<pre class="brush: js">var mediator = (function() {

    var handlers = {};

    function register(handler, fn) {
        if (!handlers[handler]) handlers[handler] = [];
        handlers[handler].push({ context: this, callback: fn });
    }

    function notify(handler) {
        if (!handlers[handler]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = handlers[handler].length; i &lt; l; i++) {
            var subscription = handlers[handler][i];
            subscription.callback.apply(subscription.context, args);
        }
    }

    return {
        register: register,
        notify: notify
    };
}());</pre>
Usando este mediador podríamos comunicarnos por ejemplo entre ViewModels de KnockOut, Widgets de APIs de terceros o cualquier otro tipo de artefacto que podemos usar en javascript. La forma de hacerlo sería algo parecido a esto:
<pre class="brush: js">var myListenerWidget = function (mediator) {
    mediator.register('notification', function (data) { alert(data + ' - received!'); });
    return { };
};
var myNotifierWidget = function(mediator) {
    var sendNotification = function(data) {
        mediator.notify('notification', data);
    };

    return {
        sendNotification: sendNotification
    };
};

var widget1 = new myListenerWidget(mediator);
var widget2 = new myNotifierWidget(mediator);

widget2.sendNotification('Hi mediator');</pre>
<h3>Conclusiones</h3>
El uso del patrón Mediator va hacer nuestro código mucho más legible, ya que favorece la cohesión. Su uso ayudará a crear clases desacopladas, y por lo tanto nuestro código será más fácil de probar usando tests unitarios. Además va a simplificar los protocolos de comunicación, al estar centralizados en un solo artefacto.

Pero hay que saber que Mediator es un patrón difícil de implementar. Lo más recomendable es usarlo como pasarela de comunicación sin lógica interna, porque podemos caer en el antipatrón de acoplar todas nuestras clases con un mediador de lógica bastante compleja. Algo que nos puede dar más de un quebradero de cabeza.