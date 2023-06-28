---
published: true
ID: 202306281
title: 'El inyector de dependencias de .Net'
author: fernandoescolar
post_date: 2023-06-28 01:04:36
layout: post
tags: di dotnet csharp best-practices
background: '/assets/uploads/bg/inversion-of-control.jpg'
---

Desde la primera versión de .Net Core se ha incluido un inyector de dependencias en el framework. Este inyector forma parte del núcleo de las aplicaciones ASP.NET Core, las basadas en `IHost` y se puede utilizar en cualquier aplicación .Net de forma independiente. De hecho, prácticamente todos los programadores de c# lo estamos usando aun sin saberlo. Pero esto no es excusa para no implementarlo de la mejor forma posible<!--break-->.

- [Introducción](#introducción)
  - [¿Qué es el principio "Dependency Inversion"?](#qué-es-el-principio-dependency-inversion)
  - [¿Qué es la inyección de dependencias?](#qué-es-la-inyección-de-dependencias)
  - [¿Qué es el patrón de inversión de control?](#qué-es-el-patrón-de-inversión-de-control)
  - [¿Cómo funciona el inyector de dependencias de .Net?](#cómo-funciona-el-inyector-de-dependencias-de-net)
- [Ciclo de vida](#ciclo-de-vida)
- [Gestión de `IDisposable`](#gestión-de-idisposable)
- [Configuración en diferido](#configuración-en-diferido)
- [Thread-Safe](#thread-safe)
- [Asincronía](#asincronía)
- [Patrón Service Locator](#patrón-service-locator)
- [Conclusiones](#conclusiones)


## Introducción

El inyector de dependencias de .Net surge como una solución estandarizada a un problema común en el mundo de la programación orientada a objectos: la dependencia entre clases. Históricamente se han utilizado diferentes soluciones de terceros para resolverlo, pero hoy en día, la librería de Microsoft es la más utilizada.

Para entender mejor cómo funciona esta herramienta quizá deberíamos aclarar antes los conceptos teóricos que hay detrás de ella:

### ¿Qué es el principio "Dependency Inversion"?

El principio de inversión de dependencia es un principio de diseño de software que establece que las dependencias de una clase deben ser abstracciones, no implementaciones concretas. Esto significa que las clases de alto nivel no deben depender de las clases de bajo nivel; ambas deben depender de las abstracciones. O lo que es lo mismo: las clases no deben depender de los detalles, deben depender de contratos o interfaces.

```csharp
// clase que no cumple el principio de inversión de dependencia
public class BeerService
{
    // dependencia de una clase concreta
    private readonly BeerRepository _beerRepository;
    // ...
}

// clase que cumple el principio de inversión de dependencia
public class BeerService : IBeerService
{
    // dependencia de una interfaz
    private readonly IBeerRepository _beerRepository;
    // ...
}
```

Este principio es importante porque reduce el acoplamiento entre clases y hace que nuestra implementación sea más sencilla de probar en forma de pruebas unitarias. Además, hace que nuestro código sea más flexible y fácil de mantener.

### ¿Qué es la inyección de dependencias?

La inyección de dependencias es una práctica de programación en la que un objecto o función recibe sus dependencias de una fuente externa en lugar de crearlas. Esto significa que una clase no debe configurar sus dependencias directamente. En su lugar, se deben pasar a la clase desde el exterior. La "inyección" se refiere al hecho de que una dependencia se pasa a la clase, generalmente por medio de un constructor, un método o una propiedad, que luego "inyecta" la dependencia en la clase.

```csharp
public class BeerService : IBeerService
{
    private readonly IBeerRepository _beerRepository;

    // se inyecta la dependencia a través del constructor
    public BeerService(IBeerRepository beerRepository)
    {
        _beerRepository = beerRepository;
    }

    // ...
}
```

### ¿Qué es el patrón de inversión de control?

El patrón de inversión de control es un patrón de diseño de software en el que el control de objetos o partes de un programa se invierte. En lugar de que un desarrollador escriba el código que controla el flujo y ciclo de vida de los objetos, se crea un marco o contexto de ejecución que controla todo.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Hello World!");
app.Run();
```

En .Net, cuando estamos desarrollando usando ASP.NET Core, el objeto `app` (que implementa `IHost`) es el encargado de gestionar el flujo de control de la aplicación. Y por tanto, una implementación del patrón de inversión de control.

Este gestor del flujo de la aplicación es un buen lugar donde desarrollar la inyección de dependencias ya que es el encargado de crear y destruir las instancias de las clases. Así que tiene sentido que gestione también las dependencias entre ellas. Y la forma más simple de hacerlo es a través de la inyección de dependencias.

```csharp
var builder = WebApplication.CreateBuilder(args);
// aquí se configura el inyector de dependencias
builder.Services.AddScoped<IBeerService, BeerService>();
builder.Services.AddScoped<IBeerRepository, BeerRepository>();
var app = builder.Build();
// aquí se inyecta la dependencia IBeerService
app.MapGet("/", (IBeerService service) => /* ... */);
app.Run();
```

### ¿Cómo funciona el inyector de dependencias de .Net?

Dentro de .Net y las aplicaciones que usan implementaciones de `IHost`, el inyector de dependencias se basa en dos piezas: `IServiceCollection` e `IServiceProvider`. El primero sirve para configurar las clases que entran en juego en la aplicación y el segundo para crear las instancias de las clases y gestionar las dependencias entre ellas.

El inyector de dependencias es un contenedor de inversión de control. Es decir, es un contenedor de objetos que se encarga de crear y destruir las instancias de las clases. Y, además, gestiona las dependencias entre ellas. La idea es que el programador configure todas las clases que entran en juego en la aplicación y su ciclo de vida. Después, el contenedor se encarga de crear las instancias de las clases y de inyectar las dependencias entre ellas cuando sea necesario.

Si quisiéramos crear una instancia de la clase `BeerService` usando esta librería, tendríamos que hacerlo de la siguiente forma:

```csharp
// registramos las clases que vamos a utilizar
//  creamos una colección de servicios
var services = new ServiceCollection();
//  añadimos una clase de servicio definida por una interfaz
services.AddTransient<IBeerService, BeerService>();
//  añadimos una clase de repositorio, que es una dependencia de la clase de servicio
services.AddTransient<IBeerRepository, BeerRepository>();

// construimos el contenedor de inversión de control y lo exponemos como un proveedor de servicios
var serviceProvider = services.BuildServiceProvider();

// obtenemos una instancia de la clase de servicio
var beerService = serviceProvider.GetService<IBeerService>();
// aquí ya podemos utilizar la clase de servicio
```

Generalmente nos encontraremos una función llamada `ConfigureServices` dentro de una clase llamada `Startup` en la que se configuran todos los servicios que se van a utilizar en la aplicación. Y la creación del objecto `IServiceProvider` se delega al framework.

```csharp
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddTransient<IBeerService, BeerService>();
        services.AddTransient<IBeerRepository, BeerRepository>();
    }
}
```

O podremos utilizar la propiedad `Services` de la clase `WebApplicationBuilder` para configurar los servicios que se van a utilizar en la aplicación.

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IBeerService, BeerService>();
builder.Services.AddScoped<IBeerRepository, BeerRepository>();
```

Lo importante es que el programador no tiene que preocuparse de crear ni destruir las instancias de las clases y sus dependencias. El contenedor de inversión de control se encarga de todo esto.

## Ciclo de vida

El ciclo de vida de un objecto es el tiempo que transcurre desde que se crea hasta que se destruye. En el caso del inyector de dependencias de .Net, el ciclo de vida de un objecto depende de cómo se registre en la colección de servicios. Hay tres formas de registrar un objecto:

- `Transient`: se crea una nueva instancia cada vez que se solicita.
- `Scoped`: se crea una nueva instancia por ámbito que se crea. En Asp.Net cada petición HTTP crea un ámbito nuevo.
- `Singleton`: se crea una única instancia que se reutiliza en todas las peticiones y vive hasta que la aplicación se cierra.

```csharp
// se crea una nueva instancia cada vez que se solicita
services.AddTransient<ITransientObject, TransientObject>();
// se crea una nueva instancia por ámbito que se crea
services.AddScoped<IScopedObject, ScopedObject>();
// se crea una única instancia que se reutiliza en todas las peticiones
services.AddSingleton<ISingletonObject, SingletonObject>();
```

Hay que tener en cuenta que el ciclo de vida de un objecto depende también del ciclo de vida de sus dependencias. Por ejemplo, si registramos una clase como `Singleton`, pero una de sus dependencias como `Transient`, la dependencia se creará cada vez que se solicite, aunque la clase que la contiene sea `Singleton`.

Por otro lado, si creamos una clase `Singleton` que depende de otra clase registrada como `Scoped`, la dependencia puede dejar de existir cuando el ámbito se destruya. Y podría crear problemas en tiempo de ejecución o *memory leaks*.

Y si creamos clases registradas como `Transient` desde la raíz de la aplicación, podríamos tener problemas de memoria.

Hay que ser cuidadoso con el ciclo de vida de las clases y sus dependencias para evitar problemas en general.


## Gestión de `IDisposable`

Para entender cómo se gestionan los objetos que implementan la interfaz `IDisposable` en el inyector de dependencias de .Net, lo mejor es verlo en acción. Para ello, vamos a crear una clase que implemente la interfaz `IDisposable` y que escriba un mensaje en la consola cuando se cree y otro cuando se destruya:

```csharp
class Disposable : IDisposable
{
    private static int _id = 0;
    private readonly int id;
    private readonly string name;

    public Disposable(string className)
    {
        id = Interlocked.Increment(ref _id);
        name = className;
        Console.WriteLine($" Id {id} - {name} - Created");
    }

    public void Dispose()
    {
        Console.WriteLine($" Id {id} - {name} - Disposed");
    }
}
```

Después, crearemos una serie de objetos `Transient`, `Scoped` y `Singleton` que dependan de esta clase:

```csharp
interface ITransientObject {}
interface IScopedObject {}
interface ISingletonObject {}

class TransientObject : Disposable, ITransientObject
{
    public TransientObject(): base("transient") { }
}

class ScopedObject : Disposable, IScopedObject
{
    public ScopedObject(): base("scoped") { }
}

class SingletonObject : Disposable, ISingletonObject
{
    public SingletonObject(): base("singleton") { }
}
```

Y los registraremos en la colección de servicios:

```csharp
var services = new ServiceCollection();

services.AddTransient<ITransientObject, TransientObject>();
services.AddScoped<IScopedObject, ScopedObject>();
services.AddSingleton<ISingletonObject, SingletonObject>();
```

Para comprobar cómo se comporta:

```csharp
var serviceProvider = services.BuildServiceProvider();
Console.WriteLine("First round");
var transient1 = locator.GetService<ITransientObject>();
var scoped1 = locator.GetService<IScopedObject>();
var singleton1 = locator.GetService<ISingletonObject>();

Console.WriteLine("Second round");
var transient2 = locator.GetService<ITransientObject>();
var scoped2 = locator.GetService<IScopedObject>();
var singleton2 = locator.GetService<ISingletonObject>();

Console.WriteLine("IoC Dispose");
locator.Dispose();
Console.WriteLine("App end");
```

Al ejecutar el código, obtenemos la siguiente salida:

```bash
First round
 Id 1 - transient - Created
 Id 2 - scoped - Created
 Id 3 - singleton - Created
Second round
 Id 4 - transient - Created
IoC Dispose
 Id 4 - transient - Disposed
 Id 3 - singleton - Disposed
 Id 2 - scoped - Disposed
 Id 1 - transient - Disposed
App end
```

Como podemos ver, las instancias `Transient` se crean cada vez que se solicitan y se destruyen cuando se destruye el contenedor de inversión de control. Las instancias `Scoped` se crean una vez y se destruyen cuando se destruye el contenedor también. Y las instancias `Singleton` se crean una vez y se destruyen cuando se destruye el contenedor de inversión de control.

Pero vamos a añadir un ámbito para ver cómo se comportan las diferentes instancias en este caso:

```csharp
var serviceProvider = services.BuildServiceProvider();
Console.WriteLine("First round");
var transient1 = locator.GetService<ITransientObject>();
var scoped1 = locator.GetService<IScopedObject>();
var singleton1 = locator.GetService<ISingletonObject>();

Console.WriteLine("Scope round");
using (var scope = locator.CreateScope())
{
    var transient2 = scope.ServiceProvider.GetService<ITransientObject>();
    var scoped2 = scope.ServiceProvider.GetService<IScopedObject>();
    var singleton2 = scope.ServiceProvider.GetService<ISingletonObject>();
    Console.WriteLine("Scope Dispose");
}

Console.WriteLine("IoC Dispose");
locator.Dispose();
Console.WriteLine("App end");
````

Aquí obtendremos la siguiente salida:

```bash
First round
 Id 1 - transient - Created
 Id 2 - scoped - Created
 Id 3 - singleton - Created
Scope round
 Id 4 - transient - Created
 Id 5 - scoped - Created
Scope Dispose
 Id 5 - scoped - Disposed
 Id 4 - transient - Disposed
IoC Dispose
 Id 3 - singleton - Disposed
 Id 2 - scoped - Disposed
 Id 1 - transient - Disposed
App end
```

Aquí podemos ver que las instancias `Transient` que se crean en un ámbito son destruidas cuando se destruye el ámbito. Mientras que las que se crean en la raíz, se destruyen junto con el contenedor de inversión de control. Las instancias `Scoped` se destruyen cuando se destruye el ámbito. Y las instancias `Singleton` se destruyen solo cuando se destruye el contenedor de inversión de control.

Por lo tanto, podemos decir que:

| Tipo | Creación | Destrucción |
| ---- | -------- | ----------- |
| `Transient` | Cada vez que se solicita | Cuando se destruye el contenedor o el ámbito |
| `Scoped` | Una vez por ámbito | Cuando se destruye el contenedor o el ámbito |
| `Singleton` | Una vez por contenedor | Cuando se destruye el contenedor |

De esto podemos deducir que:

- Es mejor no crear instancias `Transient` que implementen `IDisposable`. Aquí podríamos usar el patrón `Factory`:

```csharp
services.AddSingleton<Func<TransientObject>>(() => new TransientObject());
// ...
var factory = locator.GetService<Func<TransientObject>>()();
using (var transient = factory())
{
    // ...
}
```

- Evitar crear instancias `Scoped` que implementen `IDisposable` en la raíz del contenedor, porque no se destruirán hasta que termine la aplicación.

- Usar ámbitos reduce la posibilidad de que se produzcan fugas de memoria.

- Si recibes una instancia que implementa `IDisposable` como dependencia, no es necesario implementar `IDisposable` en tu clase. Su ciclo de vida lo gestionará el contenedor de inversión de control.

## Configuración en diferido

Cuando estamos registrando nuestras dependencias, es posible que necesitemos datos extra o de configuración. Por ejemplo, una cadena de conexión o un parámetro que incluiremos en una fuente externa como un *Vault*, en el fichero `appsettings.json` o incluso en forma de variable de entorno:

```csharp
public static class BeerExtensions
{
    public static IServiceCollection AddBeers(this IServiceCollection services, string connectionString)
    {
        // ...
    }
}
```

Aquí crearíamos una extensión para registrar `BeerService` añadiendo la cadena de conexión que vamos a usar. Pero esto no es muy flexible ya que no podemos añadir un tipo de cadena de texto al registro. Tendríamos un montón de cadenas de texto y no podríamos diferenciar unas de otras. Además, muchas veces no es solo una cadena, puede tener más variables como número de reintentos o nombre de la base de datos. Para ello podemos usar un objeto de configuración:

```csharp
public class BeerOptions
{
    public string ConnectionString { get; set; }
    public int Retries { get; set; }
    public string DatabaseName { get; set; }
}

public class BeerService : IBeerService
{
    public BeerService(BeerOptions options)
    {
        // ...
    }
}

public static class BeerExtensions
{
    public static IServiceCollection AddBeers(this IServiceCollection services, BeerOptions options)
    {
        services.AddSingleton(options);
        services.AddSingleton<IBeerService, BeerService>();
        return services;
    }
}
```

Aquí hemos creado una clase de opciones que contiene las propiedades que necesitamos. Y hemos creado una extensión que registra las opciones y el servicio. Pero esto nos obliga a tener cargados los datos en el momento de arrancar la aplicación. Si por ejemplo a la cadena de conexión la tenemos en un *Azure Key Vault*, esto es un servicio externo al que tendremos que conectar y acceder antes de que nuestra aplicación haya arrancado si quiera.

Este comportamiento puede generar problemas en el arranque de la aplicación. Por ejemplo, si la cadena de conexión no es correcta, la aplicación no podrá arrancar. O si el servicio externo no está disponible, tres cuartos de lo mismo. Incluso si lo que sucede es que el servicio externo tarda mucho en responder, la aplicación tardará mucho en arrancar o quizá ni si quiera cargue.

Este tipo de errores en tiempo de arranque son una faena. El problema es que por lo general, no hemos cargado sistemas de observabilidad ni gestionamos errores en tiempo de carga de la aplicación. Así que son problemas que muchas veces no sabemos que han sucedido ni tenemos detalles suficientes como para sabers cómo solucionarlos.

Por eso es recomendable usar lo que personalmente denomino como **carga en diferido**:

```csharp
public class BeerService : IBeerService
{
    public BeerService(IOptions<BeerOptions> options)
    {
        // ...
    }

}

public static class BeerExtensions
{
    public static IServiceCollection AddBeers(this IServiceCollection services, Action<BeerOptions> configure)
    {
        services.Configure<BeerOptions>(configure);
        services.AddSingleton<IBeerService, BeerService>();

        return services;
    }
}
```

Aquí hemos cambiado el constructor de `BeerService` para que reciba un `IOptions<BeerOptions>`. Este objeto nos permite acceder a las opciones de configuración en tiempo de ejecución, no en tiempo de arranque. Y hemos cambiado la extensión para que reciba un `Action<BeerOptions>` que es una función que recibe la configuración de la aplicación. De esta forma, podemos cargar la configuración después de que la aplicación haya arrancado:

```csharp
app.Services.AddBeers(op => app.Configuration.GetSection("Beers").Bind(op));
```

Si hay algún error al cargar la configuración, la aplicación devolverá el error en el momento determinado de instanciar la clase `BeerService` y todos los sistemas de observabilidad estarán disponibles para capturar el error y mostrarlo o almacenarlo en el lugar adecuado.

Y si por alguna razón no puedes modificar el constructor de la clase para que acepte un objecto que implemente `IOptions<T>`, siempre puedes usar registrar un objeto especificando un método que instancie la clase:

```csharp
public class BeerService : IBeerService
{
    public BeerService(string connectionString, string database, int retries)
    {
        // ...
    }
}

public static class BeerExtensions
{
    public static IServiceCollection AddBeers(this IServiceCollection services, Action<BeerOptions> configure)
    {
        services.Configure<BeerOptions>(configure);
        services.AddSingleton<IBeerService>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<BeerOptions>>().Value;
            return new BeerService(options.ConnectionString, options.DatabaseName, options.Retries);
        });

        return services;
    }
}
```

Ten en cuenta que siempre existe la posibilidad de realizar una carga en diferido de la configuración, solo hay que ser un poco creativo ;)

> Nota: Se puede usar `ActivatorUtilities.CreateInstance<BeerService>` que nos devolverá una instancia de `BeerService` intentando instanciarla usando los parámetros que le pasemos y si no resolviendo las dependencias del contenedor. Esta implementación podría protegernos de posibles cambios en el constructor de `BeerService` en el futuro. Aunque, por otro lado, si cambia el constructor de `BeerService` es posible que también cambie la forma en la que se configura, por lo que es posible que tengamos que cambiar la forma en la que se configura. Por eso hemos usado el constructor de la clase directamente.

## Thread-Safe

Siempre que creas un servicio (sobre todo si jugamos mezclando ciclos de vida de tipo *singleton* y *transient*) es muy importante que la resolución de las dependencias sea *thread-safe*. En este sentido puedes estar tranquilo y no hace falta que implementes bloqueos en las *factories* que crean esos objetos y sus dependencias. El contenedor de inversión de control de .Net te garantiza que todos los procesos de creación e inyección de dependencias son seguros desde un punto de vista de multihilo.

## Asincronía

No existe actualmente (.Net 7.0) soporte para creación asíncrona de servicios y sus dependencias dentro del paquete de `Microsoft.Extensions.DependencyInjection`. El siguiente código daría error:

```csharp
services.AddSingleton<IBeerService>(async _ =>
{
    var dependency = await CreateDependencyAsync();
    return new BeerService(dependency);
});
```

Y si lo adaptáramos para convertir una llamada asíncrona en síncrona, podríamos terminar con *deadlocks* en nuestro código:

```csharp
services.AddSingleton<IBeerService>(_ =>
{
    var dependency = CreateDependencyAsync().Result;
    return new BeerService(dependency);
});
```

La forma correcta sería usar el patrón *factory* registrando una función que crea nuestra instancia:

```csharp
services.AddSingleton<Func<Task<IBeerService>>>(_ => async () => {
    var dependency = await CreateDependencyAsync();
    return new BeerService(dependency);
});
// ...
var factory = provider.GetRequiredService<Func<Task<IBeerService>>>();
var service = await factory();
```

## Patrón Service Locator

El patrón *Service Locator* es un patrón de diseño que permite resolver dependencias de forma dinámica. Si estamos usando un contenedor de inversión de control, podemos usar el propio contenedor como una implementación de este patrón.

```csharp
var services = new ServiceCollection();
services.AddSingleton<IBeerService, BeerService>();

var serviceLocator = services.BuildServiceProvider();
var service = serviceLocator.GetRequiredService<IBeerService>();
```

Como podemos ver el objeto `IServiceProvider` es una implementación del patrón *Service Locator*. Aunque internamente lo que contiene es el contenedor de inversión de control. Pero no es recomendable usarlo de esta forma.

Debemos evitar usar este patrón fuera de las *factories* que instancian objetos y sus dependencias. E incluso es muy poco recomendable usarlo en este ámbito. La idea es no usarlo si no es absolutamente necesario.

Y otro anti-patrón muy comun es construir el contenedor de inversión de control para poder usar este patrón (*Service Locator*) en cualquier momento de la ejecución o arranque de nuestra aplicación. Esto es un error, ya que el contenedor de inversión de control no está pensado para ser usado de esta forma. El contenedor de inversión de control está pensado para ser usado en el momento de la construcción de la aplicación, no en tiempo de ejecución ni de arranque.

Si creamos diferentes contenedores, podemos tener diferentes configuraciones de la aplicación. Y esto puede ser un problema, ya que no podemos garantizar que la configuración de la aplicación sea la misma en todos los contenedores. Por lo que podemos tener comportamientos diferentes en función de la configuración de la aplicación.

Por lo tanto, si usamos aplicaciones que usan `IHost` debemos evitar llamar al método `BuildServiceProvider`. Porque esta llamada la gestiona el propio `IHost` y no debemos interferir en su funcionamiento. Y si no, debemos solo llamarlo una vez y usar el mismo contenedor de inversión de control en toda la aplicación.

## Conclusiones

En este artículo hemos visto cómo usar el contenedor de inversión de control de .Net para resolver dependencias en nuestra aplicación. Cómo registrar dependencias y  usarlas en nuestra aplicación. Además de los diferentes ciclos de vida para nuestras dependencias. Y hemos visto cómo usar el patrón *factory* para resolver dependencias que no se pueden resolver directamente por el contenedor de inversión de control.

Resumiendo:
- Usa el contenedor de inversión de control de .Net para resolver dependencias en tu aplicación.
- Analiza el ciclo de vida de tus dependencias y usa el adecuado para cada una de ellas.
- Usa ámbitos o `scopes` para agrupar ejecuciones de un solo proceso y así limpiar correctamente sus dependencias.
- Configura en diferido.
- Usa el patrón *factory* para resolver dependencias que no se pueden resolver directamente por el contenedor de inversión de control.
- Evita el patrón *Service Locator* y llamar al método `BuildServiceProvider`.