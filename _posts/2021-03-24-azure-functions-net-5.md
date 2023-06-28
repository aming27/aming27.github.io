---
published: true
ID: 202103241
title: 'Azure Functions con .NET 5'
author: fernandoescolar
post_date: 2021-03-24 02:21:02
layout: post
tags: azure-functions azure functions net5 dotnet
background: '/assets/uploads/bg/thunder.jpg'
---

Ha tardado más de lo que esperábamos, pero ya está aquí. Después de meses de espera y escondiendo el [anuncio](https://techcommunity.microsoft.com/t5/apps-on-azure/net-on-azure-functions-roadmap/ba-p/2197916) dentro de un roadmap de las próximas versiones de *.Net*, las *dotnet Isolated Functions* pasan a RTM<!--break-->. Y con ellas llega el soporte de .Net 5.0 en Azure Functions. Pero esta vez, la migración no va a ser tan sencilla como, simplemente, subir la versión del runtime.

Para conseguir compatibilidad con *.Net 5* se ha cambiado la estrategia. En lugar de actualizar todos los paquetes y crear una nueva versión de *Azure Functions*, se ha creado un nuevo *worker* llamado *dotnet-isolated*. Esto es una suerte de *host* que lanza nuestro ensamblado de funciones como un proceso aislado. Para la comunicación entre el proceso del *host* y el de las funciones se ha utilizado un canal *gRPC*. La idea es que, con este modelo podremos incluir todo lenguaje y framework para trabajar con *Azure Functions*. Aunque la realidad es que, hoy en día solo soporta *.Net 5*.

Este nuevo modelo de desarrollo nos va a suponer unos cuantos cambios en nuestros desarrollos. Vamos a echar un vistazo:

* TOC
{:toc}

## Quick Start

Para empezar a trabajar con *Azure Functions* para *.Net 5* tendremos que crear o adaptar un proyecto ya existente.

Necesitaremos un archivo `host.json`:

```json
{
    "version": "2.0"
}
```

Si ya tenemos el archivo `local.settings.json` tendremos que reemplazar el tipo de *worker* a `dotnet-isolated`:

```diff
{
    "IsEncrypted": false,
    "Values": {
-       "FUNCTIONS_WORKER_RUNTIME": "dotnet",
+       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
        "AzureWebJobsStorage": "UseDevelopmentStorage=true"
    },
    "disabled": false
}
```

O bien crear un archivo nuevo.

Sobre el tipo de proyecto nos servirá uno de tipo consola de *.Net 5* añadiendo las referencias necesarias:

```diff
 <Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net5.0</TargetFramework>
    <OutputType>Exe</OutputType>
+   <AzureFunctionsVersion>v3</AzureFunctionsVersion>
+   <_FunctionsSkipCleanOutput>true</_FunctionsSkipCleanOutput>
  </PropertyGroup>
  <ItemGroup>
+   <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.0.0" />
+   <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.0.1" OutputItemType="Analyzer" />
  </ItemGroup>

  <ItemGroup>
    <None Update="host.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="local.settings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <CopyToPublishDirectory>Never</CopyToPublishDirectory>
    </None>
  </ItemGroup>
 </Project>
```

Aquí definiremos la versión 3 de *Azure Functions* y una serie de paquetes de *nuget* que nos proveerán del entorno necesario para ejecutar nuestro proyecto al amparo del proceso anfitrión de las funciones:
- `Microsoft.Azure.Functions.Worker`
- `Microsoft.Azure.Functions.Worker.Sdk`

Finalmente, tendremos que añadir o bien editar el archivo `Program.cs` para crear el *host* de las *Isolated Functions* y ejecutarlo:

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .Build();

  await host.RunAsync();
}
```

Para añadir funciones, lo primero que tenemos que saber es que los paquetes de atributos han cambiado. Ahora lo que se usa es `Microsoft.Azure.Functions.Worker.Extensions.xxxxx` don la *xxxxx* es el nombre o tipo de servicio queremos usar: Http, Timer, ServiceBus, EventHubs, Storages...

Puedes encontrar un listado completo [aquí](https://www.nuget.org/packages?q=Microsoft.Azure.Functions.Worker.Extensions).

Para nuestro ejemplo vamos a añadir una referencia al paquete `Microsoft.Azure.Functions.Worker.Extensions.Http`. De esta forma tendremos disponibles los *bindings* para el protocolo *HTTP* y podremos crear nuestra primera función:

```csharp
public static class HttpFunction
{
  [Function(nameof(HttpFunction))]
  public static HttpResponseData Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
    HttpRequestData req,
    FunctionContext context)
  {
      var logger = context.GetLogger("HttpFunction");
      logger.LogInformation("request arrived");

      var response = req.CreateResponse(HttpStatusCode.OK);
      response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
      response.WriteString("Mis jugadores han corrido hoy por el campo como pollos sin cabeza. (John Toshack)");

      return response;
  }
}
```

A primera vista encontraremos nuevos tipos para definir un desencadenador *HTTP*:
- El tipo de resultado de la función ya no es `IActionResult`. Ahora es un objeto de tipo `HttpResponseData`.
- El tipo de objeto que recibe el *trigger* ya no es `HttpRequest`. Ahora es un nuevo objeto acorde con el tipo de respuesta: `HttpRequestData`.
- El parámetro de tipo `FunctionContext`. Desde este parámetro vamos a tener acceso al contexto de ejecución de la función. De esta manera, si por ejemplo necesitamos el `ILogger` para escribir unas trazas, podemos recogerlo de ahí.

Para ver cómo podemos definir *bindings* de salida vamos a usar el paquete `Microsoft.Azure.Functions.Worker.Extensions.Storage` que, entre otras cosas, nos permitirá acceder a colas de *Azure Storage Account*:

```csharp
public static class QueueFunction
{
  [Function(nameof(QueueFunction))]
  [QueueOutput("outqueue", Connection = "StorageConnectionString")]
  public static string Run(
    [QueueTrigger("inqueue", Connection = "StorageConnectionString")]
    string message,
    FunctionContext context)
  {
    return "Estoy tan feliz como uno puede estar. Pero he estado más feliz. (Ugo Ehiogu)";
  }
}
```

Como podemos ver en el código anterior:
- El parámetro de salida de la función irá redirigido a una cola llamada *"outqueue"*.
- El desencadenador es un mensaje que viene de una cola llamada *"inqueue"*.

Por lo tanto, basta con añadir el *out* *binding* a la función para que el valor que se devuelve sea redirigido a un lugar concreto. Pero ¿qué hago para tener más de un parámetro de salida?

Para obtener más de un *out* *binding* tendremos que crear una clase nueva donde definiremos los diferentes tipos de *outputs* usando los mismos atributos:

```csharp
public class FunctionResult
{
    [QueueOutput("outqueue", Connection = "StorageConnectionString")]
    public string Message { get; set; }

    public HttpResponseData HttpReponse { get; set; }
}
```

Después solo tendremos que devolver una nueva instancia de este objeto que hemos creado:

```csharp
public static class HttpMultiOutputFunction
{
  [Function(nameof(HttpMultiOutputFunction))]
  public static FunctionResult Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
    HttpRequestData req,
    FunctionContext context)
  {
      var response = req.CreateResponse(HttpStatusCode.OK);
      response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
      response.WriteString("Sólo hay una posibilidad: victoria, derrota o empate. (Franz Beckenbauer)");

      return new FunctionResult
      {
        Message = "Si llega a entrar el balón es gol. (Míchel González)",
        HttpReponse = response
      };
  }
}
```

## Debugging

Una vez tenemos nuestras funciones creadas, nos interesará probarlas. Para ejecutar este nuevo tipo de aplicación no vamos a poder usar los típicos comandos de ejecución de *Visual Studio* o el *dotnet run* de siempre. Necesitaremos descargar, si no la tenemos ya, una *tool* llamada [Azure Funcions Core Tools](https://github.com/Azure/azure-functions-core-tools). Una vez instalada, nos tendremos que dirigir a la ruta de nuestro proyecto y ejecutar el siguiente comando:

```bash
func start
```

Al usar nuestro navegador para dirigirnos a una de nuestras funciones *HTTP* encontraremos:

![Vista en el navegador](/assets/uploads/2021/03/functions-net5.png)

## Dependency Injection

Una de las cosas más engorrosas relacionadas con *Azure Functions* es la de añadir la inyección de dependencias de *dotnet core*. Hay que añadir un paquete especial y forzar una clase de arranque de la aplicación donde entonces creas todo lo necesario...

La buena noticia es que en este nuevo modelo de aplicación ya tenemos la capacidad de usar el `IServiceProvider` de serie.

Para probarlo vamos a crear la interfaz de un servicio:

```csharp
public interface IQuotesService
{
  string GetQuoteOfTheDay();
}
```

La idea es que nos devuelva la frase del día, así que vamos a crear una implementación con varias frases y que nos devuelva una aleatoria:

```csharp
public class QuotesService : IQuotesService
{
  private static readonly string[] _quotes = new []
  {
    "Gaste mucho dinero en coches, alcohol y mujeres. El resto lo he malgastado. (George Best)",
    "A medida que uno va ganando cosas, se hamburguesa. (Carlos Tévez)",
    "Como todo equipo africano, Jamaica será un rival difícil. (Edinson Cavani)",
    "Perdimos porque no ganamos. (Ronaldo Nazário)",
    "El fútbol es como el ajedrez, pero sin dados. (Lukas Podolski)",
    "No hay nada entre medio, o eres bueno o eres malo. Nosotros estuvimos entre medio. (Gary Lineker)",
    "Jugamos como nunca y perdimos como siempre. (Alfredo Di Stefano)",
    "A veces, en fútbol, tienes que marcar goles. (Thierry Henry)",
    "El problema es que no ha entrado el balón. (Sergio Ramos)"
  };

  public string GetQuoteOfTheDay()
  {
      var index = new Random()
                      .Next(0, _quotes.Length);

      return _quotes[index];
  }
}
```

Si quisiéramos inyectar este servicio a una función haríamos algo parecido a esto:

```csharp
public class QuoteOfTheDayFunction
{
  private readonly IQuotesService _service;
  private readonly ILogger _logger;

  public QuoteOfTheDayFunction(IQuotesService service, ILogger<QuoteOfTheDayFunction> logger)
  {
    _service = service;
    _logger = logger;
  }

  [Function(nameof(QuoteOfTheDayFunction))]
  public HttpResponseData Run(
      [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]
      HttpRequestData req
  )
  {
    _logger.LogInformation("getting quote of the day");

    var response = req.CreateResponse(HttpStatusCode.OK);
    response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
    response.WriteString(_service.GetQuoteOfTheDay());

    return response;
  }
}
```

Pasamos las dependencias como parámetros de entrada de la función. Como detalle especial, hemos quitado las referencias al `FunctionContext` y hemos añadido el `ILogger` en el constructor.

Para añadir los servicios al `IServiceCollection` usaremos el método extensor `ConfigureServices` en la creación del *host* en el archivo `Program.cs`:

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .ConfigureServices(services =>
                  {
                      services.AddScoped<IQuotesService, QuotesService>();
                  })
                  .Build();

  await host.RunAsync();
}
```

Ahora podremos volver a lanzar nuestra aplicación:

```bash
func start
```

Y comprobaremos que hemos llamado correctamente al servicio de frases del día:

![Vista en el navegador](/assets/uploads/2021/03/functions-net5-2.png)

## Middlewares

Otra de las sorpresas que traen consigo las *dotnet-isolated* es la posibilidad de usar *middlewares* de una forma semejante a como los usamos en una aplicación de *aspnet core*.

Para ello crearemos un simple *middleware* implementando la interfaz `IFunctionsWorkerMiddleware`:

```csharp
public class DummyMiddleware : IFunctionsWorkerMiddleware
{
  public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
  {
    var logger = context.GetLogger<DummyMiddleware>();
    logger.LogInformation($"My Funcion: {context.FunctionDefinition.Name}");

    await next(context);
  }
}
```

Desde el `Invoke` de un *middleware* tendremos acceso a `FunctionContext` y al delegado de la próxima ejecución.

Para usar este middleware nos dirigiremos al método `ConfigureFunctionsWorkerDefaults` del `Main` y lo añadiremos al *pipeline* de ejecución con el método `UseMiddleware`:

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults(app =>
                  {
                    app.UseMiddleware<DummyMiddleware>();
                  })
                  .Build();

  await host.RunAsync();
}
```

## Tips & Tricks

Como presentación todo esto está muy bien, pero seguro que en cuanto empecéis a enredar os entrarán dudas. Entonces, seguro que os vienen bien estos "truquillos":

### Mejorando el debugging

Hemos visto que podemos lanzar la ejecución de nuestras funciones con el comando `func start`. Y si queremos realizar un *debug*, tendremos que *"attachar"* *Visual Studio* al proceso `dotnet` que lanzamos mediante ese comando.

El caso es que nos puede interesar que el proceso se espere a que haya un *debugger* en marcha, para que así no se nos cuele una ejecución fuera de este contexto. Para ello usaremos el parámetro `--dotnet-isolated-debug`.

Y si también tenemos interés en tener más trazas sobre las ejecuciones de nuestras funciones usaremos el parámetro `--verbose`.

Así que la llamada que posiblemente cubra nuestras expectativas a la hora de probar, sería más bien:

```bash
func start --dotnet-isolated-debug --verbose
```

### Añadir variables de entorno

Existe un problema cuando nos llevamos nuestras funciones a Azure y es que no se cargan por defecto las variables de entorno. Este tipo de variables son importantes porque es la forma que usa Azure para cargar la famosa configuración que ponemos desde el portal.

Es de suponer que esto lo cambiarán en un futuro próximo, pero mientras tanto, puedes usar el método `ConfigureAppConfiguration` y dentro de este `AddEnvironmentVariables`, para poder añadirlas:

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .ConfigureAppConfiguration(config =>
                  {
                    config.AddEnvironmentVariables();
                  })
                  .Build();

  await host.RunAsync();
}
```

### Usar la configuración

Muchas veces, cuando estamos configurando el inyector de dependencias de nuestra aplicación queremos que ciertos parámetros los cargue de la configuración. A ese fin, usaremos una de las sobre escrituras del método `ConfigureServices` que vimos anteriormente. Si en lugar de pasarle un solo parámetro, usamos dos, en el primero tendremos el contexto de configuración. Desde ahí no nos costará buscar una sección concreta y usarla como en cualquier otro desarrollo:

```csharp
static async Task Main(string[] args)
{
  var host = new HostBuilder()
                  .ConfigureFunctionsWorkerDefaults()
                  .ConfigureServices((context, services) =>
                  {
                      services.AddQuotes(op => context.Configuration
                                                      .GetSection("Quotes")
                                                      .Bind(op));
                  })
                  .Build();

  await host.RunAsync();
}
```

### Publicar en Azure

Se pueden publicar las *Azure Functions* en *.Net 5* usando la *tool* que usamos para lanzarla. La forma de llamarla sería:

```bash
func azure functionapp publish <my_function_app>
```

También podemos usar métodos tradicionales como el *web deploy*, subir un archivo *zip* o vincular un repositorio.

Pero todo esto no nos garantiza que la función que estamos *deployando* tenga instalado *.Net 5*. Para conseguirlo, podemos ejecutar el siguiente comando de *az-cli*:

```bash
az functionapp config set --net-framework-version v5.0 --name <my_function_app> --resource-group <my_resource_group>
```

## Conclusiones

Creo que más que las *Azure Functions* para *.Net 5*, que es una mejora totalmente esperada, lógica y obvia, la gran noticia es el uso de un proceso aislado para su ejecución.

Tal cual lo veo, en cuanto a las *dotnet-isolated* todo son ventajas:

- Menos conflictos: un proceso aislado te permite tener dependencias diferentes a las del proceso anfitrión.
- Control total del proceso: poder gestionar el inicio, el final y lo que sucede en medio (*middlewares*) de la ejecución de nuestras funciones.
- Inyección de dependencias sin malabarismos.
- Posible compatibilidad futura con cualquier plataforma sin necesidad de cambiar la versión del *host*. Como por ejemplo .Net 6 o lo que esté por venir.

Bienvenidas sean.
