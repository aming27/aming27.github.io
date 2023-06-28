---
published: true
ID: 202305311
title: 'Timers en .Net'
author: fernandoescolar
post_date: 2023-05-31 01:04:36
layout: post
tags: dotnet csharp net7 timer
background: '/assets/uploads/bg/time.jpg'
---

Si te preguntas cuántas implementaciones de `Timer` hay en C#, te diré que hay un montón. ¡Es un locurón! Y lo mejor de todo es que cada uno tiene su propio estilo, forma de programar y funcionalidad. Así que, si necesitas un temporizador en tu proyecto, tienes muchas opciones para elegir. ¡Es hora de poner en marcha esa cuenta regresiva!<!--break-->

![Timers, timers everywhere](/assets/uploads/2023/05/timers-timers-everywhere.jpg)

- [System.Windows.Forms.Timer](#systemwindowsformstimer)
- [System.Windows.Threading.DispatcherTimer](#systemwindowsthreadingdispatchertimer)
- [System.Web.UI.Timer](#systemwebuitimer)
- [System.Threading.Timer](#systemthreadingtimer)
- [System.Timers.Timer](#systemtimerstimer)
- [System.Threading.PeriodicTimer](#systemthreadingperiodictimer)
- [Conclusión](#conclusión)

## System.Windows.Forms.Timer

Empecemos con el `System.Windows.Forms.Timer`, que está diseñado especialmente para aplicaciones de interfaz de usuario enriquecidas. Si eres un desarrollador con pereza y no quieres complicarte mucho, puedes arrastrarlo a un formulario como un control no visual y ajustar el comportamiento desde la ventana de Propiedades. Fácil, ¿no?

Pero si te interesa programar el temporizador desde el código, puedes hacerlo de la siguiente manera:

```csharp
var timer = new System.Windows.Forms.Timer();
timer.Tick += new EventHandler(TickEventHandler);
timer.Interval = 5000;
timer.Start();

// ...

void TickEventHandler(object source, EventArgs eventArgs)
{
    timer.Stop();

    if(MessageBox.Show("¿Seguimos?", "", MessageBoxButtons.YesNo) == DialogResult.Yes)
    {
        timer.Enabled = true;
    }
}
```

Como puedes ver, el `System.Windows.Forms.Timer` funciona a base de lanzar eventos. En este caso, el evento `Tick` se lanza cada 5 segundos. Y esto se gestiona con la propiedad `Interval`, que especifica el intervalo de tiempo, en milisegundos, entre los eventos `Tick`. Además, puedes detener el temporizador con la propiedad `Enabled`, que especifica si el temporizador debe generar eventos `Tick`.

La gracia de este temporizador es que siempre se ejecuta en un hilo que puede interactuar con la interfaz de usuario. Así que, si necesitas actualizar la interfaz de usuario desde el evento `Tick`, no tendrás que preocuparte por la excepción que se lanza cuando se intenta acceder a un control de interfaz de usuario desde un subproceso que no es el que creó el control.

## System.Windows.Threading.DispatcherTimer

De este estilo tenemos el `System.Windows.Threading.DispatcherTimer`, que es una envoltura para el `System.Windows.Forms.Timer` que te permite programar el temporizador desde el código. Pero, ¿qué es lo mejor de todo? Puedes utilizarlo en aplicaciones de interfaz de usuario cliente enriquecidas, aplicaciones de interfaz de usuario de línea de comandos, aplicaciones de interfaz de usuario de Windows Presentation Foundation (WPF) y aplicaciones de interfaz de usuario de Windows Forms. ¡Es como un temporizador universal!

```csharp
var dispatcherTimer = new System.Windows.Threading.DispatcherTimer();
dispatcherTimer.Tick += new EventHandler(TickEventHandler);
dispatcherTimer.Interval = new TimeSpan(0,0,1);
dispatcherTimer.Start();

void TickEventHandler(object sender, EventArgs e)
{
}
```

En este caso, el evento `Tick` se lanza cada segundo. Y esto se gestiona con la propiedad `Interval`, que especifica el intervalo de tiempo entre los eventos `Tick`. Además, puedes detener el temporizador con la propiedad `IsEnabled`, que especifica si el temporizador debe generar eventos `Tick`.

Al igual que el `System.Windows.Forms.Timer`, el `System.Windows.Threading.DispatcherTimer` siempre se ejecuta en un hilo que puede interactuar con la interfaz de usuario. Pero en este caso el evento `Tick` se ejecuta se ejecuta en el contexto del objecto `Dispatcher` del la aplicación. Por lo que podremos acceder y modificar los controles de la interfaz de usuario sin problemas.

## System.Web.UI.Timer

Luego está el `System.Web.UI.Timer`, que se utiliza en aplicaciones web ASP.NET y puede realizar *postbacks* de páginas web en intervalos definidos, ya sea de forma asíncrona o síncrona. Esto es útil si quieres crear una visualización en tiempo real de información en tu aplicación web.

```html
<%@ Page Language="C#" AutoEventWireup="true" %>
<html>
<head runat="server">
    <title>Timer Example Page</title>
    <script runat="server">
        protected void Page_Load(object sender, EventArgs e)
        {
            OriginalTime.Text = DateTime.Now.ToLongTimeString();
        }

        protected void TickEventHandler(object sender, EventArgs e)
        {
            UpdateTime.Text = DateTime.Now.ToLongTimeString();
        }
    </script>
</head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server" />
        <asp:Timer ID="Timer1" OnTick="TickEventHandler" runat="server" Interval="10000" />

        <asp:UpdatePanel ID="UpdatePanel1" runat="server" UpdateMode="Conditional">
            <Triggers>
                <asp:AsyncPostBackTrigger ControlID="Timer1" />
            </Triggers>
            <ContentTemplate>
                Updated at <asp:Label id="UpdateTime" runat="server"></asp:Label>
            </ContentTemplate>
        </asp:UpdatePanel>
        <div>
        Created at <asp:Label ID="OriginalTime" runat="server"></asp:Label>
        </div>
    </form>
</body>
</html>
```

Este `Timer` es probablemente el más loco de todos, ya que se utiliza en aplicaciones web ASP.NET y puede realizar *postbacks* de páginas web en intervalos definidos. Para esto necesitamos poner en funcionamiento una serie de artefactos de *WebForms*, como el `ScriptManager`, el `UpdatePanel` y el `AsyncPostBackTrigger`. Pero no te preocupes, que no es tan complicado como parece.

Funciona igual que los anteriores temporizadores, pero su ciclo de vida está gestionado de la misma forma que un control web de servidor.

## System.Threading.Timer

¿Y qué hay del `System.Threading.Timer`? Esta clase te permite programar una única llamada de retorno en un subproceso de fondo, ya sea de forma asíncrona o síncrona. Además, es seguro para subprocesos. ¡Genial!

```csharp
var state = new State();
var timer = new System.Threading.Timer(TimerHandler, state, 1000, 250);

Console.WriteLine("Press the Enter key to exit the program.");
Console.ReadLine();

void TimerHandler(object state)
{
    var s = (State)state;
    s.Counter++;
    Console.WriteLine("In TimerHandler: {0} {1}", DateTime.Now, s.Counter);
}

class State { public int Counter { get; set; } }
```

En este ejemplo, el evento `TimerHandler` se lanza cada 250 milisegundos. Y esto se gestiona con la propiedad `dueTime`, que especifica el número de milisegundos que hay que esperar antes de que se llame al método especificado en el parámetro `state`, y la propiedad `period`, que especifica el número de milisegundos que hay que esperar antes de que se llame al método especificado en el parámetro `state`. Además, puedes detener el temporizador con el método `Dispose()`, que libera todos los recursos utilizados por la instancia actual de la clase `Timer`.

El `System.Threading.Timer` es un temporizador de subprocesos que se ejecuta en un subproceso de fondo. Por lo tanto, el evento `TimerHandler` se ejecuta en un subproceso de fondo. Esto significa que no podemos acceder a los controles de la interfaz de usuario desde el evento `TimerHandler`.

Su ciclo de vida se gestiona con el método `Dispose()`, que libera todos los recursos utilizados por la instancia actual de la clase `Timer`. Y cuando el hilo principal de la aplicación finaliza, el temporizador se detiene automáticamente.

## System.Timers.Timer

Pero espera, hay más. Si quieres la mejor opción para implementar un temporizador en C#, entonces necesitas el `System.Timers.Timer`. ¿Por qué? Porque es una envoltura para `System.Threading.Timer` que agrega funcionalidad y abstrae otras. Además, puedes utilizarlo en aplicaciones de contenedor de componentes. ¡Es casi como una navaja suiza para timers!

```csharp
var timer = new System.Timers.Timer(250);
timer.Elapsed += ElapsedHandler;
timer.AutoReset = true;
timer.Enabled = true;

Console.WriteLine("Press the Enter key to exit the program.");
Console.ReadLine();
timer.Stop();

void ElapsedHandler(object sender, ElapsedEventArgs e)
{
    Console.WriteLine("In ElapsedHandler: {0}", DateTime.Now);
}
```

Aquí, el evento `Elapsed` se lanza cada 250 milisegundos. En este caso se especifica el intervalo en el constructor. Puedes detener el temporizador con el método `Stop()`, que además de parar el proceso, establece la propiedad `Enabled` en `false`.


## System.Threading.PeriodicTimer

Por último, en *.Net 6* apareció el `System.Threading.PeriodicTimer`. Este timer es perfecto si necesitas esperar de forma asíncrona los ticks del temporizador. Lo diferencia del resto en un pequeño detalle: hay que esperar proactivamente el siguiente evento del temporizador. Esto significa que hay que realizar llamadas al método `WaitForNextTickAsync` para esperar al siguiente evento del temporizador:

```csharp
var timer = new System.Threading.PeriodicTimer(TimeSpan.FromMilliseconds(250));

while (true)
{
    await timer.WaitForNextTickAsync();
    Console.WriteLine("In WaitForNextTickAsync: {0}", DateTime.Now);
}
```

Si quieres detener el temporizador, puedes llamar al método `Dispose()`:

```csharp
timer.Dispose();
```

## Conclusión

Como has podido ver, hay muchos tipos de temporizadores en C#. Cada uno de ellos tiene sus propias características y funcionalidades. Por lo tanto, es importante que elijas el que mejor se adapte a tus necesidades:

- `System.Threading.Timer` es un temporizador de subprocesos que se ejecuta en un subproceso de fondo.
- `System.Timers.Timer` es una envoltura para `System.Threading.Timer` que agrega funcionalidad y abstrae otras. La opción por defecto para implementar un temporizador en C#.
- `System.Threading.PeriodicTimer` es perfecto si necesitas esperar de forma asíncrona los ticks del temporizador.
- `System.Windows.Forms.Timer` es un temporizador para usar con aplicaciones de *Windows Forms*.
- `System.Web.UI.Timer` cuando quieres ejecutar un proceso en un intervalo de tiempo determinado dentro del contexto de una página web con *WebForms*.
- `System.Windows.Threading.DispatcherTimer` para cuando estamos trabajando con *WPF*.