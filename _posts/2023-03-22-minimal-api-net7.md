---
published: true
ID: 202303221
title: 'Minimal API en .NET 7'
author: fernandoescolar
post_date: 2023-03-22 01:04:36
layout: post
tags: aspnet aspnetcore dotnet csharp
background: '/assets/uploads/bg/programming4.jpg'
---

**ASP.NET** es un framework desarrollado por Microsoft para construir aplicaciones web y servicios web. Lleva muchos años en el mercado y es una solución muy robusta. Con la aparición de **.Net Core**, se creó **Asp.Net Core**. Una versión moderna y más ligera, diseñada para ser multiplataforma y compatible con una variedad de sistemas operativos, incluyendo *Windows*, *MacOS* y *Linux*. Pero su gran robusted sigue vinculada a cierta complejidad a la hora de programarla. Aquí es donde entra **Minimal API**.<!--break-->

- [Introducción](#introducción)
- [Características](#características)
- [Cómo empezar](#cómo-empezar)
- [Routing](#routing)
- [Verbos](#verbos)
- [Bindings](#bindings)
  - [Attributes](#attributes)
  - [Optionals](#optionals)
  - [Dependency Injection](#dependency-injection)
  - [Constants](#constants)
- [BindAsync](#bindasync)
  - [AsParameters](#asparameters)
- [Response Codes](#response-codes)
  - [Multi Result](#multi-result)
  - [Annotate](#annotate)
- [Open API](#open-api)
  - [Annotations](#annotations)
  - [WithOpenApi](#withopenapi)
- [Validation](#validation)
- [Filters](#filters)
- [RouteGroups](#routegroups)
- [Conclusiones](#conclusiones)

## Introducción

Pongamos cierto contexto: tradicionalmente, para crear una aplicación web con **Asp.Net Core** siempre ha sido abligatorio crear dos archivos de código: *"Program.cs"* y *"Startup.cs"*. En el primero, se configura el host y en el segundo, se configuran los servicios y el pipeline de la aplicación. Su contenido sería parecido a esto:

```csharp
// Program.cs
public class Program
{
  public static void Main(string[] args)
  {
    CreateHostBuilder(args).Build().Run();
  }

  public static IHostBuilder
    CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
          webBuilder.UseStartup<Startup>();
        });
}
```

Y en el archivo *"Startup.cs"*:

```csharp
// Startup.cs
public class Startup
{
  public Startup(IConfigurationRoot configuration)
  {
    Configuration = configuration;
  }

  public IConfigurationRoot Configuration { get; }

  public void ConfigureServices(IServiceCollection services)
  {
    services.AddControllers();
  }

  public void Configure(IApplicationBuilder app)
  {
    if (env.IsDevelopment())
    {
      app.UseDeveloperExceptionPage();
    }

    app.UseHttpsRedirection();
    app.UseRouting();
    app.UseAuthorization();
    app.UseEndpoints(x => x.MapControllers());
  }
}
```

Esto es así porque **Asp.Net Core** es un framework muy flexible y permite configurar todo lo que necesitemos. Pero esto también puede ser un problema, ya que puede ser complejo para un desarrollador que no está familiarizado con el framework. Por eso, **Minimal API** viene a simplificar este proceso. En lugar de tener que crear dos archivos, ahora solo necesitamos uno. Y en lugar de tener que configurar todo, solo necesitamos configurar lo que necesitemos. Veamos un ejemplo:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

Pero esto no es **Minimal API**. Esto es **Asp.Net Core MVC** simplificando los archivos de inicio. El verdadero *Hola Mundo* de **Minimal API** podría ser un archivo con el siguiente contenido:

 ```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Hello World!");
app.Run();
```

En estas 4 líneas de código inicializamos una aplicación **Asp.Net Core** por defecto, y usando las nuevas características de **Minimal API**, creamos un servidor web que responde a la ruta raíz con el texto *"Hello World!"*. ¿No es genial?. Algunos diréis que esto ya lo hacía **node.js** con **Express**. Y es cierto. Pero en el mundo de **Asp.Net Core** esto es una revolución. Y es que **Minimal API** es mucho más que un *Hello World*. Es una nueva forma de programar aplicaciones web en **Asp.Net Core**. Una forma más sencilla, más rápida y más flexible. Y todo sin perder la robustez de **Asp.Net Core** o la flexibilidad de **Asp.Net Core MVC**.

## Características

Por qué debería interesarnos esto de **Minimal API** o por qué deberíamos aprenderlo, son preguntas que se responden fácilmente si conocemos sus características:

- 🔳 **Minimalista**: es una forma de programar aplicaciones web que se centra en lo esencial. Es decir, en lo que realmente necesitamos para crear una aplicación web. Esto nos permite crear aplicaciones web de forma rápida y sencilla.
- 👨‍👩‍👧‍👦 **Se siente familiar**: utiliza conceptos y mecanismos que ya conocemos de otros *frameworks* y lenguajes de programación. Por lo que si tenemos experiencia programando una **API REST** en cualquier lenguaje, aprender **Minimal API** será muy sencillo.
- 📚 **Fácil de aprender**: al ser sencilla, minimalista y parecida a otras plataformas, aprender **Minimal API** es muy sencillo.
- 🌳 **Crece contigo**: aunque es una forma de programar aplicaciones web minimalista, esto no será una limitación. Es una forma de programar aplicaciones web que se puede ir ampliando y mejorando a medida que crece la aplicación. Además, es compatible con cualquier arquitectura que nos propongamos.
- ⚡️ **Incrediblemente rápida**: programar una *API* con esta herramienta es muy rápido. Pero es que los *benchmarks* de los resultados nos dicen que es mucho más rápida que **Asp.Net Core MVC**. Y no solo eso, ponemos a la plataform *.Net* tan solo un escalón por debajo de *API* programadas en lenguajes nativos como *C*, *C++* o *rust*.

## Cómo empezar

Para empezar a programar una **Minimal API** tan solo necesitamos tener instalado el SDK de *.Net 7* ([aquí](https://dotnet.microsoft.com/download/dotnet/7.0)) y abrir un terminal en la carpeta donde queramos crear el proyecto:

```bash
dotnet new webapi -minimal -o BeersApi
```

Vamos a crear nuesta *API* de cerveza.

## Routing

El *routing* es la forma en la que **Asp.Net Core** decide qué código ejecutar cuando recibe una petición. En **Minimal API** podemos definir la ruta de una petición al definirla:

```csharp
app.MapGet("/beers", () => { /* ... */ });
```

En este ejemplo estamos definiendo una ruta que responde a la petición **GET** a la ruta **/beers**.

Y también podemos definir parámetros en la ruta:

```csharp
app.MapGet("/beers/{id}", (int id) => { /* ... */ });
```

Aquí estamos definiendo una ruta que responde a la petición **GET** a la ruta **/beers/{id}**, donde `id` es un valor entero.

## Verbos

Podemos definir el verbo de una petición en el momento de definirla usando los métodos `MapGet`, `MapPost`, `MapPut`, `MapPatch` y `MapDelete`:

```csharp
app.MapGet("/beers", () => { /* ... */ });
app.MapPost("/beers", () => { /* ... */ });
app.MapPut("/beers/{id}", (int id) => { /* ... */ });
app.MapPatch("/beers/{id}", (int id) => { /* ... */ });
app.MapDelete("/beers/{id}", (int id) => { /* ... */ });
```

## Bindings

Entendemos por *binding* la forma en la que se obtiene los valores de los parámetros de una petición. En **Minimal API** podemos definir los *bindings* de los parámetros de una petición de varias formas:

```csharp
app.MapPut("/beers/{id}", (int id, BeerRequest value) => { /* ... */ });
```

En este ejemplo estamos definiendo un *binding* que recoje de la *URL* un tipo `int` para el parámetro `id` y un *binding* de tipo `BeerRequest` que recoge un valor *json* del *body* de la petición para el parámetro `value`.

El sistema de *bindings* es bastante inteligente y nos permitirá no ser explícitos en el tipo de *binding* que queremos usar. Si no especificamos un tipo de *binding* explícito, el sistema intentará deducirlo por nosotros.

Pero también podemos ser explícitos en el tipo de *binding* que queremos usar:

### Attributes

Mediante el uso de *attributes* podemos definir el tipo de *binding* que queremos usar y algunas de sus características:

```csharp
app.MapPut("/beers/{id}",
  (int id,
  [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] BeerRequest value)
=>
{
  /* ... */
});
```

Usando `FromBody` estamos indicando que queremos usar un *binding* de tipo *json* para el parámetro `value`. Además, con `EmptyBodyBehavior = EmptyBodyBehavior.Allow` estamos indicando que queremos permitir que el *body* de la petición esté vacío.

### Optionals

Si no especificamos un tipo complejo (una `class`, `struct` o `record`) y no aparece en el *URL* de la petición, el sistema interpretará que viene del *query string* de la petición. Y en este caso, si especificamos que es un tipo opcional, el sistema no requerirá que esté presente en la petición:

```csharp
app.MapPut("breweries/{id}/beers",(int id, int? page, int? pageSize) =>
{
  if (!page.HasValue) page = 1;
  if (!pageSize.HasValue) pageSize = 10;
  /* ... */
});
```

Si queremos usar el sistema de opcionales con valor por defecto que nos ofrece *C#*, tendremos que usar un método a parte para definir el delegado que se ejecutará cuando se reciba la petición:

```csharp
app.MapGet("breweries/{id}/beers", GetBeersInBrewery);

static IResult GetBeersInBrewery(int id, int page = 1, int pageSize = 10)
{
  /* ... */
}
```

### Dependency Injection

Otra forma de *binding* es inyectar dependencias definidas en el *container* de *DI* de **Asp.Net Core**:

```csharp
app.MapPut("beers/{id}/beers",(int id, BeerDbContext db) =>
{
  /* ... */
});
```

En este caso, el sistema intentará resolver una dependencia de tipo `BeerDbContext` y si la encuentra, la inyectará en el parámetro `db`.

### Constants

Y también podemos recoger valores constantes para el ámbito de la petición:

```csharp
app.MapGet("/hello", (ClaimsPrincipal user) => {
  return "Hello " + user.FindFirstValue("sub");
});
```

Aquí estamos recogiendo el valor del *claim* `sub` del usuario autenticado en la petición.

Los tipos de constantes que podemos recoger son:

- `HttpContext`
- `HttpRequest`
- `HttpResponse`
- `ClaimsPrincipal` *(User)*
- `CancellationToken` *(RequestAborted)*

### TryParse

Pero quizá queramos crear un tipo de *binding* personalizado que recoja valores de la *URL* o del *query string* de la petición. Para ello podemos usar el método `TryParse`:

```csharp
app.MapGet("/point", (Point point) => $"Point: {point}");

record Point(double X, double Y) // Format is "12.3,10.1"
{
  public override string ToString() => $"{X},{Y}";

  public static bool TryParse(
          string? value,
          out Point point)
  {
    var segments = value?.Split(',');
    if (segments?.Length == 2
        && double.TryParse(segments[0], out var x)
        && double.TryParse(segments[1], out var y))
    {
      point = new Point(x, y);
      return true;
    }

    point = new Point(0, 0);
    return false;
  }
}
```

En este ejemplo, estamos creando un tipo `Point` que representa un punto en el espacio. El formato de la cadena que queremos parsear es `12.3,10.1`. El método `TryParse` es el que se encarga de parsear la cadena y crear el objeto `Point`. El ejemplo de petición sería:

```http
GET /point?value=12.3,10.1
```

## BindAsync

Para poder usar *binding* personalizado más complejos, siempre podremos recurrir a `BindAsync`:

```csharp
app.MapGet("/search", (SearchParams? search) => search); // Echo the response back for demo purposes

record SearchParams(string? Term, int Page, int PageSize)
{
  public static ValueTask<SearchParams> BindAsync(
          HttpContext httpContext,
          ParameterInfo parameter)
  {
    int.TryParse(httpContext.Request.Query["page"], out var page);
    int.TryParse(httpContext.Request.Query["pagesize"], out var pageSize);

    return ValueTask.FromResult<SearchParams>(
      new SearchParams(
        httpContext.Request.Query["term"],
        page == 0 ? 1 : page,
        pageSize == 0 ? 10 : pageSize
      )
    );
  }
}
```

Este método nos da acceso al conexto y por tanto a todos los detalles de la petición. Podemos usarlo para crear un *binding* personalizado que recoja valores de la *URL*, del *query string*, del cuerpo de la petición o incluso de las cabeceras.

### AsParameters

Y el último método de *binding* es `AsParameters`. Este atributo nos permite inyectar en el parámetro de la acción un objeto que recoge valores de cualquier fuente de la petición:

```csharp
app.MapGet("/search", ([AsParameters] SearchParams search) => search);

record struct SearchParams(string? Term, int Page, int PageSize);
```

En este caso recogesmos los valores `term`, `page` y `pagesize` del *query string* de la petición.

Pero podríamos hacer algo más complejo:

```csharp
app.MapGet("/search", ([AsParameters] SearchParams search) => search);

record struct SearchParams(
  BeerDbContext db,
  string? Term,
  int Page,
  int PageSize,
  CancellationToken cancellationToken);
```

Aquí estaríamos recogiendo `db` del inyector de dependencias, los valores `term`, `page` y `pagesize` del *query string* y el `CancellationToken` de las constantes de la petición actual.

## Response Codes

Tan importante como el *binding* de los parámetros de la acción es el modo de responder en una *API*. Como bien sabemos, una *API* debe responder con un código de estado HTTP adecuado a la acción que se está realizando. Y en **Minimal API** podemos ayudarnos del objeto `Results` para obtener los código de respuesta adecuados:

```csharp
app.MapGet("/beers/{id}", GetBeerById);

async Task<IResult> GetBeerById(int id, BeerDbContext db)
{
  return await db.Beers.FindAsync(id)
    is Beer beer
      ? Results.Ok(beer)
      : Results.NotFound();
};
```

### Multi Result

Si nuestra acción puede devuelve un tipo `IResult` cuando intentemos sacar una definición de la *API* usando, por ejemplo, *swagger* no tendremos detalles para los diferentes valores de respuesta. Para solucionar esto podemos usar el objeto `TypedResults` y  `Results` compuestos:

```csharp
app.MapGet("/beers/{id}", GetBeerById);

async Task<Results<Ok<Beer>, NotFound>> GetBeerById(int id, BeerDbContext db)
{
  return await db.Beers.FindAsync(id)
    is Beer beer
      ? TypedResults.Ok(beer)
      : TypedResults.NotFound();
};
```

### Annotate

Pero para conseguir el mismo resultado, quizá sea más recomendable usar las anotaciones de *swagger* y el método `Produces`:

```csharp
app.MapGet("/beers/{id}", GetBeerById)
  .Produces<Beer>(StatusCodes.Status200OK)
  .Produces(StatusCodes.Status404NotFound);

async Task<IResult> GetBeerById(int id, BeerDbContext db)
{
  return await db.Beers.FindAsync(id)
    is Beer beer
      ? Results.Ok(beer)
      : Results.NotFound();
};
```

Todo esto nos lleva al siguiente punto: **Open API**.

## Open API

**Open API** es un estándar para especificar *APIs* que se ha convertido en el estándar de facto para describir *APIs* en *swagger*. **Minimal API** nos permite usar *Open API* para describir nuestras *APIs* de una forma muy sencilla.

### Annotations

Para describir una *API* podemos usar las anotaciones a la hora de definir la acción:

```csharp
app.MapGet("/beers/{id}", GetBeerById)
  .Produces<Beer>(StatusCodes.Status200OK)
  .WithName("GetBeerById")
  .WithTags("beer")
  .WithDescription("Gets a beer by id")
  .WithSummary("Gets a beer by id")
  .WithDisplayName("GetBeerById");
```

Y de hecho podríamos usar parte de estas anotaciones para generar resultados y redirecciones:

```csharp
app.MapGet("/beers/{id}", GetBeerById)
   .WithName("GetBeerById")

app.MapPost("/beers",  () => {
  /* ... */
  return Results.CreatedAtRoute("GetBeerById", new { id = beer.Id }, beer);
});
```

En este ejemplo estamos usando la anotación `WithName` para generar una redirección a la acción `GetBeerById` cuando creamos una nueva cerveza.

### WithOpenApi

Pero si queremos ir más allá podemos usar el método `WithOpenApi` para generar la definición de la *API*:

```csharp
app.MapPut("/beers/{id}", async (int id, BeerRequest beer, BeersDbContext db) =>
{
  /* ... */
})
.WithOpenApi(generatedOperation =>
{
  var parameter = generatedOperation.Parameters[0];
  parameter.Description = "The ID associated with the Beer to update or create";
  return generatedOperation;
});
```

En este método podemos modificar la definición de la *API* generada a bajo nivel.

## Validation

Otro aspecto importante de las *APIs* es la validación de los datos de entrada. En **Minimal API** no existe un mecanismo de validación automático, así que tocará hacerlo a mano.

Lo que si que encontraremos es el objeto `ValidationProblemDetails` que se usa para devolver un código de estado `400` con los errores de validación:

```csharp
app.MapPost("/beers", (BeerRequest request) => {
  if (request.Name is null || request.Name.Length < 3 || request.Name.Length > 100)
  {
    return Results.BadRequest(new ValidationProblemDetails
    {
      Errors = { { "Name", new[] { "Name is required and must be between 3 and 100 characters" } } }
    });
  }
  /* ... */
});
```

Si quisieramos crear un mecanismo automático de validación podríamos usar los filtros para extender la funcionalidad por defecto.

## Filters

Los filtros nos permiten extender la funcionalidad de las acciones. Podemos usarlos para añadir validación, logging, etc. Todo aquello que nos parezca necesario y que no esté incluido en la lógica de negocio de la acción. La forma de hacerlo es muy sencilla, usando `AddEndpointFilter`:

```csharp
app.MapPost("/beers", (BeerRequest request) => { /* ... */ })
  .AddEndpointFilter(async (efiContext, next) =>
  {
      app.Logger.LogInformation("Before filter");
      var result = await next(efiContext);
      app.Logger.LogInformation("After filter");
      return result;
  })
```

Y si queremos realizar una validación de los datos de entrada podríamos hacerlo de la siguiente forma:

```csharp
app.MapPost("/beers", (BeerRequest request) => { /* ... */ })
  .AddEndpointFilter((context, next) =>
  {
      var tdparam = context.GetArgument<BeerRequest>(0);
      var validationError = Utilities.IsValid(tdparam);
      if (!string.IsNullOrEmpty(validationError))
      {
          return Results.BadRequest(validationError);
      }

      return next(context);
  });
```

## RouteGroups

Por último, **Minimal API** nos permite agrupar rutas de forma muy sencilla, usando `MapGroup`:

```csharp
app.MapGroup("/public/beers").MapBeersApi();
app.MapGroup("/private/beers").MapBeersApi().RequireAuthorization();

public static class BeersApi
{
  public static RouteGroupBuilder MapBeersApi(this RouteGroupBuilder group)
  {
      group.MapGet("/", GetAllBeers);
      group.MapGet("/{id}", GetBeer);
      group.MapPost("/", CreateBeer);
      group.MapPut("/{id}", UpdateBeer);
      return group;
  }
  /* ... */
}
```

Esta funcionalidad nos permitirá agrupar acciones y añadir funcionalidad común a todas ellas. Como por ejemplo el *path* desde donde se sirven, filtros, anotaciones de *Open API*, etc.

## Conclusiones

**Asp.Net Core MVC** sigue siendo una solución muy fiable, cada vez más sólida y veloz. Es además, más versatil y sirve para multiples propósitos. No solo *APIs* si no también *Web Apps* o *Web Sites* completos.

Si bien es verdad que en *.Net 6* no estaba del todo maduro, con la llegada de *.Net 7* se han introducido una serie de mejoras que hacen que **Minimal API** cubra la mayor parte de los escenarios que nos encontramos relacionados con un *API*. Y por tanto es una opción muy interesante.

Para una *API* nueva que quieres desarrollar, no tendría dudas: **Minimal API** es la mejor opción. Es rápida, sencilla y muy fácil de usar. Pero si tienes una *API* existente, es una opción que deberías considerar, pero no es la única.
