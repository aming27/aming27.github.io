---
published: true
ID: 202304191
title: 'Trabajos en segundo plano en .Net'
author: fernandoescolar
post_date: 2023-04-19 01:04:36
layout: post
tags: csharp dotnet aspnet aspnetcore best-practices
background: '/assets/uploads/bg/programming5.jpg'
---

Hace ya un tiempo que me preguntaron cómo podríamos hacer un servicio de *Windows* usando los nuevos *framework open source* de **.Net**. En ese momento no pensé en los `BackgoundService` ni conocía la existencia de los tipos de proyecto *"Worker Service"*. Hoy, después de haber investigado más sobre el tema y haberlo usado en diferentes ámbitos, creo ya estoy listo para escribir sobre el tema:<!--break-->

Vamos a hablar de cómo lanzar tareas de segundo plano en .Net.

Para ello vamos a ver los siguientes conceptos:


- [Hosts](#hosts)
  - [IHostedService](#ihostedservice)
  - [IHostApplicationLifetime](#ihostapplicationlifetime)
  - [IHostLifetime](#ihostlifetime)
  - [IHostEnvironment](#ihostenvironment)
- [Tipos de `IHost`](#tipos-de-ihost)
  - [Asp.Net Core](#aspnet-core)
  - [Worker Service](#worker-service)
- [BackgoundService](#backgoundservice)
  - [Continuo](#continuo)
  - [Scoped](#scoped)
  - [Timers](#timers)
  - [Queues](#queues)
- [Conclusiones](#conclusiones)


## Hosts

`IHost` es una interfaz proporcionada por la dependencia `Microsoft.Extensions.Hosting` que representa el contexto de ejecución de una aplicación de servicios **.Net Core** o **.Net 5**, **6** y **7**.

Al crear una instancia de `IHost`, se establece el contexto de la aplicación y se inicia el proceso de configuración y ejecución de los servicios registrados en ella. A través de `IHost`, se pueden obtener servicios registrados en la aplicación y configurar su comportamiento. Además, esa interfaz encapsula el ciclo de vida de la aplicación y proporciona un punto de entrada para la configuración y ejecución de los servicios que se registran en ella. Estos servicios incluyen:

- `IHostApplicationLifetime`:
- `IHostLifetime`
- `IHostEnvironment`

Para ejecutar una tarea en segundo plano, necesitaremos registrar un servicio de tipo `IHostedService` en el contenedor de inyección de dependencias de un `IHost`. A partir de aquí, el *host* controlará el ciclo de vida del sevicio, arrancandolo al inicio y parándolo al terminar el proceso.

### IHostedService

La interfaz `IHostedService` es la base para todos los servicios que se ejecutan en segundo plano. Esta interfaz define dos métodos:

```csharp
public interface IHostedService
{
    Task StartAsync(CancellationToken cancellationToken);
    Task StopAsync(CancellationToken cancellationToken);
}
```

El método `StartAsync` se ejecuta cuando el servicio se inicia y el método `StopAsync` cuando se detiene. En ambos casos se le pasa un `CancellationToken` que se puede usar para cancelar la tarea.

Un ejemplo de implementación de esta interfaz es la siguiente:

```csharp
public class Worker : IHostedService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Worker stopped at: {time}", DateTimeOffset.Now);
        return Task.CompletedTask;
    }
}
```

Para poder usar este servicio tendremos que registrarlo al inicio de nuestra aplicación, en el contenedor de inyección de dependencias de tipo `IServiceCollection`:

```csharp
services.AddHostedService<Worker>();
```

### IHostApplicationLifetime

Esta interfaz se registra por defecto cuando ejecutamos nuestros procesos dentro del contexto de un `IHost`. Proporciona información extra sobre el ciclo de vida de la aplicación, como el inicio y el final de la aplicación:

```csharp
public sealed class Worker : IHostedService
{
    private readonly ILogger _logger;

    public Worker(IHostApplicationLifetime appLifetime, ILogger<ExampleHostedService> logger)
    {
        appLifetime.ApplicationStarted.Register(OnStarted);
        appLifetime.ApplicationStopping.Register(OnStopping);
        appLifetime.ApplicationStopped.Register(OnStopped);

        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("1. StartAsync has been called.");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("4. StopAsync has been called.");
        return Task.CompletedTask;
    }

    private void OnStarted()
    {
        _logger.LogInformation("2. OnStarted has been called.");
    }

    private void OnStopping()
    {
        _logger.LogInformation("3. OnStopping has been called.");
    }

    private void OnStopped()
    {
        _logger.LogInformation("5. OnStopped has been called.");
    }
}
```

### IHostLifetime

Esta interfaz define el contrato para un tipo que controla el ciclo de vida de la aplicación. La interfaz define un método `WaitForStartAsync` que se ejecuta cuando la aplicación se inicia y un método `StopAsync` que se ejecuta para indicar a la aplicación que se debe detener.

Lo cierto es que, si quieres parar la aplicación, lo que siempre funciona es enviar una señal de tipo interrupción (*SIGINT*, con *ctrl*+*c*).

### IHostEnvironment

Esta interfaz proporciona información sobre el entorno de ejecución de la aplicación. Esta interfaz define las siguientes propiedades:

- `ApplicationName`: Nombre de la aplicación.
- `EnvironmentName`: Nombre del entorno de ejecución.
- `ContentRootPath`: Ruta de la carpeta raíz de la aplicación.
- `ContentRootFileProvider`: Proveedor de archivos de la carpeta raíz de la aplicación.

## Tipos de `IHost`

Actualmente y que conozca, existen dos tipos de *hosts* que podemos usar en nuestras aplicaciones:

### Asp.Net Core

En el caso de las aplicaciones **Asp.Net Core**, el *host* que usaremos es un `IWebHost`. Este *host* se encarga de arrancar el servidor web y ejecutar la aplicación. Por lo general, este *host* se crea en el archivo `Program.cs` de la aplicación.

Si estamos trabajando con *Minimal API* o aplicaciones de inicio en un solo archivo, este se crea dentro del `WebApplicationBuilder`:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHostedService<Worker>(); // aquí añadimos nuestro servicio

var app = builder.Build();
```

Aquí crearíamos una aplicación de *Asp.Net Core* y añadiríamos nuestro servicio de tipo `IHostedService`. La creación del *host* se realiza en el método `Build` del `WebApplicationBuilder`.

Si estamos trabajando con aplicaciones de tipo *Startup*, el *host* se crea dentro del método `ConfigureWebHostDefaults`:

```csharp
// Program.cs
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>();
        });

// Startup.cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddHostedService<Worker>(); // aquí añadimos nuestro servicio
    }
}
```

En este ejemplo vemos que el *host* se crea en el método `CreateHostBuilder` y que lo vamos a usar como un `IWebHost` al llamar al método `ConfigureWebHostDefaults`. Después, el servicio se registra en el método `ConfigureServices` de la clase `Startup`.

### Worker Service

Este tipo de proyectos es lo más parecido a un servicio de Windows de toda la vida. En el caso de las aplicaciones de tipo *Worker Service*, el *host* que usaremos es un `IHost`. Este *host* se encarga de ejecutar la aplicación en segundo plano. Por lo general, este *host* se crea en el archivo `Program.cs` de la aplicación.

```csharp
// Program.cs
var host = Host
            .CreateDefaultBuilder(args)
            .ConfigureServices(services =>
            {
                services.AddHostedService<Worker2>();
            })
            .Build();

host.Run();
```

En este ejemplo vemos que el *host* se crea en el método `CreateDefaultBuilder` y que lo vamos a usar como un `IHost`. Después, el servicio se registra en el método `ConfigureServices` y se ejecuta en el método `Run`.

Este tipo de aplicaciones se ejecutan igual que las aplicaciones de tipo *Asp.Net Core*, constantemente hasta que se envia una señal de interrupción o parada.

## BackgoundService

En el mundo real, para implementar servicios en segundo plano dentro de nuestras aplicaciones, independencientemente de si es web o no, usaremos la clase base `BackgroundService`. Esto es una implementación de la interfaz `IHostedService` que proporciona una base segura para los servicios que se ejecutan en segundo plano. Esta clase proporciona un mecanismo para iniciar el servicio y un método para realizar tareas en bucle de forma asíncrona en segundo plano. La clase `BackgroundService` se encarga de gestionar el ciclo de vida del servicio, incluyendo la inicialización, la ejecución y el cierre del servicio.

Al crear un *Worker Service* en **.Net**, se debe heredar de la clase `BackgroundService` y sobrescribir el método `ExecuteAsync` para definir el comportamiento del servicio. Esto permite que el servicio realice tareas en segundo plano de forma asíncrona y que se ejecute continuamente mientras la aplicación esté en ejecución:

```csharp
public sealed class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected async override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Test 1");
        await Task.Delay(1000, stoppingToken);
        _logger.LogInformation("Test 2");
    }
}
```

### Continuo

Si queremos que nuestro servicio se ejecute continuamente, podemos usar un bucle `while`:

```csharp
public sealed class ContinuousBackgroundService : BackgroundService
{
    private readonly ILogger<ContinuousBackgroundService> _logger;

    public ContinuousBackgroundService(ILogger<ContinuousBackgroundService> logger)
    {
        _logger = logger;
    }

    protected async override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Test");
            await Task.Delay(1000, stoppingToken);
        }
    }
}
```

### Scoped

Si queremos que nuestro servicio tenga acceso a los servicios de la aplicación, podemos usar el método `CreateScope` para crear un nuevo alcance de servicio. Esto nos permite usar los servicios de la aplicación dentro del servicio:

```csharp
public sealed class ScopedBackgroundService : BackgroundService
{
    private readonly ILogger<ScopedBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public ScopedBackgroundService(ILogger<ScopedBackgroundService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected async override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var scopedProcessingService = scope.ServiceProvider.GetRequiredService<IMyScopedService>();

        await scopedProcessingService.DoWork(stoppingToken);
    }
}
```

### Timers

Si queremos que nuestro servicio se ejecute cada cierto tiempo, podemos usar un `Timer`:

```csharp
public sealed class TimerBackgroundService : BackgroundService
{
    private readonly ILogger<TimerBackgroundService> _logger;
    private Timer? _timer;

    public TimerBackgroundService(ILogger<TimerBackgroundService> logger)
    {
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));

        return Task.CompletedTask;
    }

    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Timer is stopping.");
        if (_timer is not null)
        {
            await _timer.DisposeAsync();
            _timer = null;
        }
    }

    private void DoWork(object? state)
    {
        _logger.LogInformation("Test 1");
    }
}
```

### Queues

Si queremos que nuestro servicio se ejecute cuando se añada un elemento a una cola, lo primero que necesitaremos es la cola. En este ejemplo, vamos a usar una concurrente:

```csharp
public class Queue
{
    private readonly ConcurrentQueue<string> _queue = new();

    public void Enqueue(string item)
    {
        _queue.Enqueue(item);
    }

    public bool TryDequeue(out string? item)
        => _queue.TryDequeue(out item);
}
```

Después, vamos a crear un servicio que se encargue de añadir elementos a la cola:

```csharp
public sealed class EnqueueBackgroundService : BackgroundService
{
    private readonly ILogger<EnqueueBackgroundService> _logger;
    private readonly Queue _queue;

    public EnqueueBackgroundService(ILogger<EnqueueBackgroundService> logger, Queue queue)
    {
        _logger = logger;
        _queue = queue;
    }

    protected async override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var count = 0;
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(2000, stoppingToken);
            _queue.Enqueue($"Test {count++}");
            _logger.LogInformation("Enqueued: Test {Count}", count);
        }
    }
}
```

Y por último, vamos a crear un servicio que se encargue de procesar los elementos de la cola:

```csharp
public sealed class QueueBackgroundService : BackgroundService
{
    private readonly ILogger<QueueBackgroundService> _logger;
    private readonly Queue _queue;

    public QueueBackgroundService(ILogger<QueueBackgroundService> logger, Queue queue)
    {
        _logger = logger;
        _queue = queue;
    }

    protected async override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_queue.TryDequeue(out var item))
            {
                _logger.LogInformation($"Dequeued: {item}");
            }

            await Task.Delay(1000, stoppingToken);
        }
    }
}
```

Para probarlo, vamos a crear una aplicación de consola y añadir los servicios:

```csharp
services.AddSingleton<Queue>();
services.AddHostedService<QueueBackgroundService>();
services.AddHostedService<EnqueueBackgroundService>();
```

## Conclusiones

En este artículo hemos visto cómo crear servicios en segundo plano en **.Net**. Hemos visto qué artefactos podemos usar y qué intervinientes nos vamos a encontrar a la hora de crear servicios en segundo plano. También hemos repasado algunos ejemplos de *workers* que podrían ser útiles en nuestra aplicación. Incluso combinando las diferentes propuestas.

A partir de aquí, ya dispondríamos de toda la información necesaria para crear este tipo de procesos en nuestra aplicación, incluso si se trata de una web.

Así que, si me vuelven a preguntar sobre cómo montar servicios de Windows usando **.Net 7**, tendré una respuesta muy buena ;)