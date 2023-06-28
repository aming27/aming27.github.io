---
published: true
ID: 202111161
title: 'Novedades Asp.Net Core 6.0'
author: fernandoescolar
post_date: 2021-11-16 01:05:31
layout: post
tags: aspnet novedades net6 dotnet
background: '/assets/uploads/bg/programming2.jpg'
---

La semana pasada asistimos a una vorágine de eventos de Microsoft en los que pudimos ver desde la presentación de Visual Studio 2022 hasta un evento plagado de sesiones de desarrollo llamado [.NET Conf 2021](https://www.dotnetconf.net/). El resultado: nueva versión de todo y un montón de cosas para probar<!--break-->. Y como es imposible analizarlo todo de una sola vez, hoy nos centraremos en Asp.Net Core 6.0: el nuevo framework para el desarrollo de aplicaciones web de Microsoft.

Como ya somos unos *expertos* en Asp.Net Core, no necesitamos una guía de cómo programar. Será mejor usar estas dos guías que referenciamos a continuación y que nos esclarecerán cómo han cambiado las cosas desde la anterior versión:

- [La guía de oficial migración](https://docs.microsoft.com/en-us/aspnet/core/migration/50-to-60?view=aspnetcore-6.0&tabs=visual-studio)

- [El listado oficial de Breaking Changes](https://docs.microsoft.com/en-us/aspnet/core/migration/50-to-60?view=aspnetcore-6.0&tabs=visual-studio%C2%BA)

Después de leerlas a fondo nos damos cuenta de que no nos hemos enterado de nada. Así que lo mejor que podemos hacer es instalar [la última versión del SDK de .Net 6](https://dotnet.microsoft.com/download/dotnet/6.0) y crear un nuevo proyecto de Asp.Net Core MVC:

```bash
dotnet new mvc
```

Una de las primeras cosas que vamos a encontrar es que las clases que heredan de `Controller`, usan la asignación del `namespace` en una sola línea (sin abrir un bloque que contiene las clases):

```csharp
namespace MyFirstAspNet6App;
```

Y, por si fuera poco, si hemos abierto la solución con *Visual Studio Code* es posible que el sistema que colorea de la sintaxis de c# se haya vuelto un poco loco con este nuevo formato. Para corregirlo solo tendremos que seguir [esta solución propuesta en el repositorio oficial de *vscode*](https://github.com/OmniSharp/omnisharp-vscode/issues/4884#issuecomment-965652712): añadir a nuestro archivo "*settings.json*" estas dos líneas:

```json
"editor.semanticHighlighting.enabled": true,
"csharp.semanticHighlighting.enabled": true
```

Después reiniciaremos la ventana de *vscode* y ya podremos ver bien coloreado el código de nuevo.

Tras un exhaustivo análisis del código, lo que más nos va a llamar la atención es el contenido del archivo "*Program.cs*":

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

Y es que han resumido mucho el código necesario para arrancar nuestra aplicación. El secreto está en usar el objeto `WebApplication` y llamar al método estático `CreateBuilder`. Esto nos devolverá un constructor de aplicaciones Web con una configuración base y un acceso a todas las interfaces que hubiéramos referenciado en el archivo "*Startup.cs*" de las versiones anteriores. Además, este `WebApplicationBuilder` tendrá por defecto un contexto de Asp.Net *Routing* y traerá por defecto el capturador de excepciones, que se suele usar en "Development", ya configurado. Con lo que se reduce más si cabe el contenido de este.

Pero este uso tan simple, también nos trae una pequeña pérdida de algunos factores de arranque, por lo que podemos seguir usando la forma antigua sin problemas. De hecho, si quisiéramos convertir las pocas líneas que acabamos de ver a este modelo de hacer las cosas que viene de las versiones anteriores tendríamos algo así:

```csharp
namespace MyFirstAspNet6App;

public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddRouting();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseRouting();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
```

Otra gran novedad que no viene en el proyecto por defecto, pero que nos resulará muy útil, es el tema de poder crear un archivo ("*Imports.cs*" por ejemplo) donde podremos añadir una referencia a las librerías de Asp.Net Core MVC para todo nuestro proyecto:

```csharp
global using Microsoft.AspNetCore.Mvc;
```

Y así podremos borrar esta claúsula `using` de todos nuestros archivos, ganando bastante en limpieza de código.

Para finalizar, las más grande de las novedades tiene nombre propio: *Minimal APIs*. El problema es que es una característica que engloba tantas cosas, que necesita su propia sección para poderla describir con detalle:

## Minimal APIs

La idea detrás de una *Minimal API* es tener una forma de crear una API escribiendo muy poco código. De la misma forma que podríamos hacerlo en otras plataformas como *nodejs*.

Gracias al artefacto `WebApplication` se simplifica sobre manera la inicialización de Asp.Net Core 6, y si a esto le sumamos una nueva forma de declarar *endpoints*, podríamos tener un "hola mundo" en tan solo 4 líenas de código:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Hello World!");

app.Run();
```

Añadir "Swagger" a esta API, como pudimos ver en el ejemplo anterior, tampoco implicará muchos cambios:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => "Hello World!");

// add here the endpoints bellow

app.Run();
```

Y una vez tenemos "Swagger" podríamos añadir un *endpoint* equivalente al que teníamos en la aplicación plantilla de MVC. Uno que nos sirva la predicción del tiempo:

```csharp
app.MapGet("/WeatherForecast", () => {
    var summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };
    var rng = new Random();
    return Enumerable.Range(1, 5).Select(index => new WeatherForecast (
        Date: DateTime.Now.AddDays(index),
        TemperatureC: rng.Next(-20, 55),
        Summary: summaries[rng.Next(summaries.Length)]
    )).ToArray();
});
```

Si ejecutamos ahora el código, podremos ver que tenemos "Swagger" y que este detecta el tipo devuelto en nuestro [José Antonio Maldonado](https://es.wikipedia.org/wiki/Jos%C3%A9_Antonio_Maldonado) particular.

Pero ¿qué pasa si queremos usar un servicio externo en nuestros *endpoints*?

Vamos a crear (al final del archivo si estamos usando solo el Program.cs) un servicio y una interfaz de este:

```csharp
interface IMyService
{
    ValueTask<string> GetStringAsync();
}

class MyService : IMyService
{
    public ValueTask<string> GetStringAsync()
        => ValueTask.FromResult("Hello World!");
}
```

Luego lo registramos en el `IServiceCollection`:

```csharp
builder.Services.AddSingleton<IMyService, MyService>();
```

Añadimos, al principio del archivo, una referencia a la librería de MVC:

```csharp
using Microsoft.AspNetCore.Mvc;
```

Y así podremos usar el atributo `FromServices` para recoger el servicio como si tratara de un parámetro más en nuestra aplicación:

```csharp
app.MapGet("/test", async ([FromServices]ILogger<IMyService> logger, [FromServices]IMyService service) => {
    logger.LogInformation("'test' endpoint called");
    var message = await service.GetStringAsync();
    return new { message };
});
```

E inyectará correctamente todas las referencias. Si no usamos el atributo, al ser el primer parámetro un objeto, interpretará que viene del *body* de nuestra petición *HTTP*. Así que en algunos casos será obligatorio ponerlo, pero en otros, podremos omitirlo.

Vamos a hacer otra prueba:

```csharp
app.MapGet("/test2", async (HttpContext ctx) => {
    var service = ctx.RequestServices.GetRequiredService<IMyService>();
    var message = await service.GetStringAsync();
    return new { message };
});
```

Aquí la idea ha sido inyectar solo el `HttpContext`, y a partir de ahí acceder a los servicios. Algo que también funcionará sin problemas.

Pero vamos un punto más allá: en lugar de usar el mapeo automático a objetos, vamos a imitar a *nodejs* y usar el objeto `HttpRequest`y `HttpResponse` como parámetros.

```csharp
app.MapGet("/test3", async (HttpRequest req, HttpResponse res) => {
    var service = req.HttpContext.RequestServices.GetRequiredService<IMyService>();
    var message = await service.GetStringAsync();
    res.StatusCode = 200;
    await res.WriteAsJsonAsync(new { message });
});
```

Y veremos que funciona sin problemas.

¿Qué pasaría si acto seguido añadimos un servicio?

```csharp
app.MapGet("/test4", async (HttpRequest req, HttpResponse res, IMyService service) => {
    var message = await service.GetStringAsync();
     res.StatusCode = 201;
    await res.WriteAsJsonAsync(new { message });
});
```

La respuesta es que también funciona y que esta vez no tenemos que usar el atributo `FromServices` ya que interpreta, gracias a los parámetros anteriores que así es.

Y si estuviéramos usando código asíncrono y nos interesara un `CancellationToken` de la petición actual, solo tendríamos que añadir otro parámetro con este tipo:

```csharp
app.MapGet("/test5", async (HttpRequest req, HttpResponse res, IMyService service, CancellationToken cancellationToken) => {
    var isTheSame = cancellationToken == req.HttpContext.RequestAborted;
    var message = await service.GetStringAsync();
     res.StatusCode = 200;
    await res.WriteAsJsonAsync(new { message });
});
```

Para asegurar que es el mismo `CancellationToken`que estamos usando en versiones anteriores (`RequestAborted`) hemos añadido el parámetro `isTheSame`. Al comprobar su valor con un depurador, veremos que es `true`.

Por último, qué tal si probamos a usar un nuevo objeto como cuerpo del mensaje en formato `json`:

```csharp
app.MapPost("/test", async ([FromBody]Request request, [FromServices]ILogger<IMyService> logger, [FromServices]IMyService service) => {
    logger.LogInformation("'test' endpoint called");
    var message = await service.GetStringAsync() + " " + request.Name;
    return new { message };
});

record Request(string Name);
```

El resultado será que todo funciona.

La verdad es que hemos encontrado que es muy versátil este modo de declarar *endpoints* en nuestras aplicaciones. Muy al estilo de *nodejs*, pero también, a su vez, se puede usar con el formato de Asp.Net Core MVC.

Quizá no sea un gran avance, pero sí una gran utilidad.

Si quieres ver el vídeo donde lo probamos en directo, lo encontrarás aquí:

<iframe class="youtube" src="https://www.youtube.com/embed/BU8_8u1HPl8" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>