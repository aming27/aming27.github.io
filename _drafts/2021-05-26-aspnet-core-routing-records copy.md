---
published: true
ID: 202105121
title: 'Asp.Net Core: Routing Records'
author: fernandoescolar
post_date: 2021-05-26 01:05:31
layout: post
tags: aspnet net5 dotnet routing
background: '/assets/uploads/bg/fast.jpg'
---

La vida está plagada de casualidades. Si no preguntadle a [David Heinemeier Hansson](https://en.wikipedia.org/wiki/David_Heinemeier_Hansson). Quién le iba a decir que, en 2005 iba a hacer explotar las mentes de los desarrolladores y poner [Ruby On Rails](https://rubyonrails.org) en boca de todos. Tampoco pensaría que iba a ser la fuente de inspiración de un proyecto en .net llamado [MonoRail](http://www.castleproject.org/projects/monorail/), desarrollado por el grupo de [Castle Project en 2007](https://www.infoq.com/news/2007/09/castleproject/).<!--break--> O quién le iba a decir a [Miguel de Icaza](https://en.wikipedia.org/wiki/Miguel_de_Icaza) que iba a recibir un montón de preguntas sobre este proyecto sin tener nada que ver con él. Quizá que el nombre empezara por [Mono](https://www.mono-project.com) nos llevó a equívocos a más de uno. De lo que estoy seguro es de que los chicos de Castle Project no imaginaban que un grupo de ingenieros de [Redmon](https://en.wikipedia.org/wiki/Redmond,_Washington) copiaría su proyecto y llegarían a tener un éxito que para ellos fue esquivo. Lo cierto es que en 2009 cambió el mundo del desarrollo web con tecnologías Microsoft: se lanzó la primera versión de [Asp.Net MVC](https://weblogs.asp.net/scottgu/asp-net-mvc-1-0).

Cualquiera podría considerar este texto como una pequeña anécdota dentro de la inmensa historia de la programación. O también como un subproducto conspiranoico de una mente enferma...

De cualquier manera, me turboflipa Asp.Net MVC (en adelante solo MVC). Me parece de lo mejor que le ha pasado al desarrollo en el ecosistema Microsoft. Además, desde 2009 hasta hoy, ha mejorado una barbaridad. Se ha convertido en una herramienta que hace el desarrollo de una API REST accesible a casi cualquier programador. Vamos a verlo con un ejemplo.

Partiendo de una entidad cualquiera que llamaremos `Todo`:

```csharp
public record Todo(int Id, string Title, bool IsDone);
```

Podríamos tener un servicio llamado `TodoStore` que nos ayudaría a mantener al día nuestras tareas pendientes:

```csharp
public class TodoStore
{
  public int Counter { get; private set; }

  public IEnumerable<Todo> GetAll() { /*...*/ }

  public Todo GetOne(int id) { /*...*/ }

  public void Insert(Todo todo) { /*...*/ }

  public void Upsert(int id, Todo todo) { /*...*/ }

  public void Delete(int id) { /*...*/ }
}
```

Exponer este comportamiento en una API REST para poder consumirlo por cualquier aplicación sería muy sencillo usando un objeto controlador de MVC:

```csharp
[ApiController]
[Route("[controller]")]
public class TodosController : ControllerBase
{
  private readonly TodoStore _store;

  public TodosController(TodoStore store)
    => _store = store;

  [HttpGet]
  public IActionResult ReadTodos() { /*...*/ }

  [HttpGet("{id:int}")]
  public IActionResult ReadTodo(int id) { /*...*/ }

  [HttpPost]
  public IActionResult CreateTodo([FromBody] Todo todo)  { /*...*/ }

  [HttpPut("{id:int}")]
  public IActionResult UpdateTodo(int id, [FromBody] Todo todo)  { /*...*/ }

  [HttpDelete("{id:int}")]
  public IActionResult DeleteTodo(int id) { /*...*/ }
}
```

Según la estrategia de MVC, un controller contiene acciones que responden a los diferentes verbos HTTP.

- `HttpGet`: para usar el verbo "GET" y devolver tareas.
- `HttpPost`: señalaría el método que responde al verbo "POST" y sirve para añadir nuevas tareas.
- `HttpPut`: en este caso lo vamos a usar para actualizar una tarea ya existe (sí, ya sé que esto no es muy RESTful).
- `HttpDelete`: expondrá la acción de borrado de una tarea.

De esta forma expondríamos un CRUD completo.

Si rellenáramos todos los métodos, quizá podríamos estar ante una clase muy larga, que aglutina mucho comportamiento. Pero MVC nos aporta una solución: podemos crear cada acción en un controlador separado y especificar la ruta completa en el atributo `HttpXXX`. Por ejemplo, obtener todas las tareas podría quedar de esta manera:

```csharp
[ApiController]
public class ReadTodosController : ControllerBase
{
  private readonly TodoStore _store;

  public ReadTodosController(TodoStore store)
    => _store = store;

  [HttpGet("todos")]
  public IActionResult Handle()
  {
    var todos = _store.GetAll();
    if (!todos.Any())
    {
      return NoContent();
    }

    return Ok(todos);
  }
}
```

Supongo que todos entenderemos este código. Si lo piensas detenidamente ¿no estaríamos añadiendo una capa de abstracciones que nos aleja de lo que hace realmente la API? Es una API REST y solo queda patente en el código si conoces cómo funciona MVC:

- ¿Qué respuesta es `NoContent`? ¿Sabes qué número de estado tiene?
- ¿`Ok` en qué formato devuelve? ¿*Xml*, *json*, texto plano?
- ¿Por qué tengo que heredar de `Controller` o `ControllerBase`?

La respuesta a todas estas preguntas es que MVC es así. Se ocupa por nosotros de saber qué formato de API estamos usando. Tiene un *binding* automático de parámetros que hace que sea muy natural trabajar con argumentos de entrada para un programador de C#. Y serializa la respuesta a tipo MIME que espera el cliente que la consume.

Es genial. Pero todo esto es más de lo que suelo necesitar. Mis APIs suelen responder exclusivamente con *json*. Ya no usamos *xml* casi para nada. Además, me estoy olvidando de los códigos de estado de HTTP, ya no recuerdo cual era el de "Conflict". Y para colmo, todo esto que no necesitamos nos añade una carga de proceso adicional que quizá podríamos ahorrarnos.

Vamos a ver cómo resuelven este mismo problema otras plataformas. Por ejemplo, si programáramos en javascript, es muy posible que usáramos [node](https://nodejs.org/) con [express](https://expressjs.com/):

```js
app.get('/todos', (req, res) => {
    const todos = /* get todos */;
    if (todos.length <= 0) {
      res.status(204).send();
      return;
    }

    res.json(todos);
});
```

Este código se entiende muy bien. No hace falta tener un conocimiento especial de la plataforma para saber que se carga un listado de `todos`. Si este listado está vacío devuelve `204` y si no, devuelve el propio listado en formato *json*.

Me gusta mucho este formato. Es explícito porque expone el comportamiento de nuestra API sin ocultar ningún tipo de información. Además, es muy poco código. En javascript puede ser una función suelta dentro de un archivo. Podríamos crear uno por ruta y esto nos ayudaría a organizar nuestro código de una forma intuitiva.

Si intentásemos traducir esto a C# tendríamos, se podría parecer a esto:

```csharp
public class ReadTodos : RouteClass
{
  private readonly TodoStore _store;

  public TodosController(TodoStore store)
    : base("todos")
    => _store = store;

  public void Handle(HttpRequest req, HttpResponse res)
  {
    var todos = store.GetAll();
      if(!todos.Any())
      {
        res.status = 204;
        return;
      }

      res.Json(todos);
  }
}
```

Habría que desarrollar un par de artefactos y extensiones para conseguir que este código funcionase. Pero el resultado es que expone claramente el funcionamiento de la API. Aunque hay casi más líneas para crear una clase con sus dependencias, que de código de ejecución.

La parte buena es que en C# 9 (que viene por defecto con .Net 5) han introducido un nuevo tipo que tiene las características de una clase y se puede declarar *inline*. Sí, me refiero a `record`. Si quisiéramos usarlo en lugar de una clase, tendríamos algo parecido a esto:

```csharp
public record ReadTodos(TodoStore store)
  : Get("todos", (req, res) =>
  {
    var todos = store.GetAll();
    if(!todos.Any())
    {
      res.Status = 204;
      return;
    }

    res.Json(todos);
  });
```

Para que esto funcionara tendríamos que tener un delegado para representar la función que ejecutamos y un `record` donde almacenarla. Además, este objeto al que llamaremos `RouteRecord` contendrá la ruta y el verbo a usar:

```csharp
public delegate Task RouteDelegateAsync(HttpRequest req, HttpResponse res);

public abstract record RouteRecord(string Pattern, string Verb, RouteDelegateAsync RouteDelegate);
```

Para que crear nuestros *endpoints* sea más intuitivo heredaremos de `RouteRecord` y crearemos registros para los verbos que vamos a usar en este ejemplo:

```csharp
public abstract record Get(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Get, RouteDelegate);

public abstract record Put(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Put, RouteDelegate);

public abstract record Post(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Post, RouteDelegate);

public abstract record Delete(string Pattern, RouteDelegateAsync RouteDelegate)
  : RouteRecord(Pattern, HttpMethods.Delete, RouteDelegate);
```

Para que Asp.Net core entienda estos objetos que hemos creado vamos a necesitar algo más de código. Lo primero será imaginar cómo nos gustaría usarlo. Por un lado, crearemos la extensión `AddRouteRecords` que nos buscará todos los objetos de tipo `RouteRecord` de nuestro ensamblado. Y por otro crearemos `MapRouteRecords` para registrar todas las rutas en el módulo Asp.Net Core Routing. El `Startup` quedaría así:

```csharp
public class Startup
{
  public void ConfigureServices(IServiceCollection services)
  {
    services.AddRouteRecords();
  }

  public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
  {
    app.UseRouting();
    app.UseEndpoints(endpoints => endpoints.MapRouteRecords());
  }
}
```

Vamos a implementar el rastreador de objetos tipo `RouteRecord` y lo registraremos dos veces: una como el propio tipo de la ruta y otro como el tipo base, pero referenciando a este primero . La idea es que no si resolviéramos el servicio primero por su tipo y luego por `RouteRecord` se creara solo una instancia del mismo:

```csharp
public static class ServiceCollectionExtensions
{
  public static IServiceCollection AddRouteRecords(this IServiceCollection services)
  {
    Assembly
        .GetEntryAssembly()
        .GetTypes()
        .Where(type => !type.IsAbstract && typeof(RouteRecord).IsAssignableFrom(type))
        .ToList()
        .ForEach(type =>
        {
          services.AddScoped(type);
          services.AddScoped(s => (RouteRecord)s.GetService(type));
        });

    return services;
  }
}
```

Para registrar las rutas buscaremos todos los objetos de tipo `RouteRecord` que registramos en el paso anterior y para cada uno de ellos usaremos el método `MapMethods`. Esto hará que se registren sus rutas:

```csharp
public static class EndpointRouteBuilderExtensions
{
  public static IEndpointRouteBuilder MapRouteRecords(this IEndpointRouteBuilder endpoints)
  {
    using var scope = endpoints.ServiceProvider.CreateScope();
    scope
       .ServiceProvider
       .GetServices<RouteRecord>()
       .ToList()
       .ForEach(route =>
       {
         var type = route.GetType();
         endpoints.MapMethods(
           pattern: route.Pattern,
           httpMethods:new[] { route.Verb },
           requestDelegate: ctx =>
           {
             var r = (RouteRecord)ctx.RequestServices.GetService(type);
             return r.RouteDelegate(ctx.Request, ctx.Response);
           });
       });

    return endpoints;
  }
}
```

Un pequeño detalle: para conseguir que se cree una instancia de nuestro objeto `record` cada vez que se llame a la ruta, vamos a quedarnos con el tipo y a resolverlo antes de llamar a su delegado. Si usáramos directamente la instancia con la que lo estamos registrando, se comportaría como un *singleton*.

Antes de seguir desarrollando vamos a añadir nuestra `TodoStore` a la colección de servicios. Y además, vamos a añadir 100 tareas de inicio para tener datos de prueba:

```csharp
public class Startup
{
  public void ConfigureServices(IServiceCollection services)
  {
      services.AddSingleton<TodoStore>();
      services.AddRouteRecords();
  }

  public void Configure(IApplicationBuilder app, IWebHostEnvironment env, TodoStore store)
  {
    // seed data
    for (var i = 0; i < 100; i++)
      store.Insert(new Todo(default, $"demo task {i}", false));
    ////

    app.UseRouting();
    app.UseEndpoints(endpoints => endpoints.MapRouteRecords());
  }
}
```

Una vez hemos tenemos todos estos artefactos, podríamos escribir una implementación funcional:

```csharp
public record ReadTodos(TodoStore store)
  : Get("todos", async (req, res) =>
  {
      var todos = store.GetAll();
      if (!todos.Any())
      {
          res.StatusCode = StatusCodes.Status204NoContent;
          return;
      }

      await JsonSerializer.SerializeAsync(res.Body, todos);
  });
```

Hay que tener en cuenta dos cosas:

- Por omisión Asp.Net core devolverá el código 200 (Ok).
- Si quieres devolver un código de estado lo más recomendable es que uses la clase `Microsoft.AspNetCore.Http.StatusCodes`, que tiene constantes muy descriptivas de código y mensaje, o que uses `System.Net.HttpStatusCode`, que es un enumerado con el descriptivo. En este caso uso la primera opción. Si usamos la segunda y queremos saber cuál es la cifra, tenemos que hacer uso de intelisense. Mientras que en el primer caso lo leemos directamente.

Vamos a probar nuestro código. Para ello lanzaremos la aplicación, abriremos un terminal y llamaremos a la ruta que hemos creado usando `curl`:

```bash
$ curl -k --request GET https://localhost:5001/todos

[{"Id":100,"Title":"demo task 99","IsDone":false},
{"Id":99,"Title":"demo task 98","IsDone":false},
{"Id":98,"Title":"demo task 97","IsDone":false},
{"Id":97,"Title":"demo task 96","IsDone":false},
...
```

Aquí veremos un pequeño defecto y es que estamos usando *Pascal Case* en lugar de *camel Case* para definir las propiedades del *json*. Esto tiene una fácil solución, basta con añadir unas opciones al método de serialización:

```csharp
await JsonSerializer.SerializeAsync(
  utf8Json: res.Body,
  value: todos,
  options: new JsonSerializerOptions
  {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  });
```

Si volvemos a ejecutar veremos que la respuesta es que esperábamos:

```bash
$ curl -k --request GET https://localhost:5001/todos

[{"id":100,"title":"demo task 99","isDone":false},
{"id":99,"title":"demo task 98","isDone":false},
{"id":98,"title":"demo task 97","isDone":false},
{"id":97,"title":"demo task 96","isDone":false},
...
```

Y esto nos va a llevar a crear un nuevo método extensor para `HttpRequest` que nos ayudará a responder directamente como *json*, lo llamaremos `JsonAsync` (por eso de que es asíncrono):

```csharp
public static class HttpResponseExtensions
{
  private static readonly JsonSerializerOptions _jsonOptions
    = new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
      };

  public static Task JsonAsync<T>(this HttpResponse res, T body)
    => JsonSerializer.SerializeAsync(res.Body, body, _jsonOptions);
}
```

Así pues, el resultado final sería:

```csharp
public record ReadTodos(TodoStore store)
  : Get("todos", async (req, res) =>
  {
      var todos = store.GetAll();
      if (!todos.Any())
      {
          res.StatusCode = StatusCodes.Status204NoContent;
          return;
      }

      await res.JsonAsync(todos);
  });
```

Creo que es un código bastante elegante y muy simple. Define claramente qué va a hacer nuestro método y cómo va a responder en cada caso.

Ahora podríamos implementar la lectura de un solo `Todo`:

```csharp
public record ReadTodo(TodoStore store)
  : Get("todos/{id:int}", async (req, res) =>
  {
    var id = int.Parse((string)req.RouteValues["id"]);
    var todo = store.GetOne(id);
    if (todo == null)
    {
      res.StatusCode = StatusCodes.Status404NotFound;
      return;
    }

    await res.JsonAsync(todo);
  });
```

Aquí la peculiaridad es que estamos recogiendo un valor de ruta que hemos definido. Todos los valores de ruta se almacenan como `string`, así que nos bastará con convertirlo al tipo de datos esperado. Esta funcionalidad podríamos extraerla a un método extensor de `HttpRequest` al que llamaríamos `FromRoute`:

```csharp
public static class HttpRequestExtensions
{
  public static T FromRoute<T>(this HttpRequest req, string name)
  {
    var s = (string)req.RouteValues[name];
    var converter = TypeDescriptor.GetConverter(typeof(T));
    return (T)converter.ConvertFrom(s);
  }
}
```

Y reemplazamos en nuestro objeto `ReadTodo`:

```csharp
var id = req.FromRoute<int>("id");
```

Si probamos nuestro código desde la consola, veremos que todo funciona como esperábamos:

```bash
$ curl -k --request GET https://localhost:5001/todos/2

{"id":2,"title":"demo task 1","isDone":false}
```

Ahora sería el momento de programar la ruta de crear tareas. Y visto lo visto, vamos a necesitar un método para recoger la tarea del cuerpo de la `HttpRequest`. Este dato vendrá en formato *json*, así que vamos a escribir un método extensor, antes de nada:

```csharp
public static class HttpRequestExtensions
{
  private static readonly JsonSerializerOptions _jsonOptions
    = new JsonSerializerOptions
    {
      PropertyNameCaseInsensitive = true
    };

  public static ValueTask<T> FromJsonAsync<T>(this HttpRequest req)
    => JsonSerializer.DeserializeAsync<T>(req.Body, _jsonOptions);
}
```

Aquí hemos añadido una opción para que ignore si es *camel Case* o *Pascal Case* a la hora de deserializar objetos.

Con este método, ya estaríamos en posición de implementar `CreateTodo`:

```csharp
public record CreateTodo(TodoStore store)
    : Post("todos", async (req, res) =>
    {
        var todo = await req.FromJsonAsync<Todo>();
        if (todo == null)
        {
            res.StatusCode = StatusCodes.Status400BadRequest;
            return;
        }

        store.Insert(todo);

        res.StatusCode = StatusCodes.Status201Created;
        await res.JsonAsync(new
        {
          Ref = $"todos/{store.Counter}"
        });
    });
```

Una vez hemos programado las lecturas y la creación, no será demasiado difícil la actualización de una tarea:

```csharp
public record UpdateTodo(TodoStore store)
  : Put("todos/{id:int}", async (req, res) =>
  {
      var id = req.FromRoute<int>("id");
      var todo = await req.FromJsonAsync<Todo>();
      if (todo == null)
      {
          res.StatusCode = StatusCodes.Status400BadRequest;
          return;
      }

      store.Upsert(id, todo);

      await res.JsonAsync(todo);
  });
```

Y finalmente el borrado para tener un CRUD completo:

```csharp
public record DeleteTodo(TodoStore store)
  : Delete("todos/{id:int}", (req, res) =>
  {
      var id = req.FromRoute<int>("id");

      store.Delete(id);

      return Task.CompletedTask;
  });
```

Para probar nuestra API vamos a lanzar unos cuantos comandos `curl` para ver que se comporta como esperamos:

```bash
$ curl -k --request POST --data '{"title":"task 101"}' https://localhost:5001/todos
{"ref":"https://localhost:5001/todos/101"}

$ curl -k --request PUT --data '{"title":"modified"}' https://localhost:5001/todos/101
{"id":0,"title":"modified","isDone":false}

$ curl -k --request GET https://localhost:5001/todos/101
{"id":101,"title":"modified","isDone":false}

$ curl -k -I --request DELETE https://localhost:5001/todos/101
HTTP/1.1 200 OK
Date: Fri, 30 Apr 2021 15:38:39 GMT
Server: Kestrel
Content-Length: 0

$ curl -k -I --request GET https://localhost:5001/todos/101
HTTP/1.1 404 Not Found
Date: Fri, 30 Apr 2021 15:38:42 GMT
Server: Kestrel
Content-Length: 0
```

Y hasta aquí todo correcto.

Hemos realizado una API explicita, con muy poco código, muy sencilla y fácil de seguir para cualquier programador. Y al haber dejado de lado MVC, es posible que hayamos rebajado los tiempos de ejecución. MVC añade una capa de *middlewares* pesados que resuelven los *binders* de modelos y estados...

Así que decidimos comprobar esta supuesta mejora. Para ello nos gastamos unos 0.085 € en una máquina virtual en Azure durante una hora. Un Ubuntu 20.10 de tamaño D2v3. O lo que es lo mismo: 2 vcpus y 8 gb de memoria.

Con la ayuda de `BenchmarkDotnet` comprobamos la API escrita en MVC y el mismo código en base a `RouteRecord`.

```bash
BenchmarkDotNet=v0.12.1, OS=ubuntu 20.10
Intel Xeon CPU E5-2673 v4 2.30GHz, 1 CPU, 2 logical cores and 1 physical core
.NET Core SDK=5.0.202
  [Host]     : .NET Core 5.0.5 (CoreCLR 5.0.521.16609, CoreFX 5.0.521.16609), X64 RyuJIT
  DefaultJob : .NET Core 5.0.5 (CoreCLR 5.0.521.16609, CoreFX 5.0.521.16609), X64 RyuJIT
```

Probamos dos acciones de muestra: leer todas las tareas (un total de 100) y escribir una tarea nueva. Lazamos varias veces la prueba para comprobar que eran datos consistentes. Y estos son los resultados que obtuvimos tomando como línea base el código en MVC:

| Tool              | Method   |     Mean |   %99.9 | Ratio | Allocated |
|--------------     |-------   |---------:|--------:|------:|----------:|
| **Mvc**           |   *POST* | 288.8 us | 8.49 us |  1.00 |  20.04 KB |
| **Route Records** |   *POST* | 167.8 us | 4.72 us |  0.59 |  16.01 KB |
|                   |          |          |         |       |           |
| **Mvc**           |    *GET* | 281.1 us | 5.59 us |  1.00 |  21.27 KB |
| **Route Records** |    *GET* | 257.7 us | 5.12 us |  0.92 |  19.35 KB |

Las conclusiones que podemos sacar son que:

- El nuevo código es mucho más rápido y ligero que el sistema de *binding* de MVC.
- Hay más velocidad en casi cualquier operación debido a que no se han usado los intermediarios de MVC.
- Y, por último, se consume menos memoria en cualquier tipo de operación.

Puedes ver el código completo, con algunas mejoras e incluida la prueba [en este repositorio](https://github.com/fernandoescolar/RoutingRecords/tree/main/samples/FirstApproach).

Evidentemente esta prueba de rendimiento es ventajista. Asp.Net MVC realiza y facilita muchas más tareas de las que aquí figuran. Es una utilidad genial y os invitamos a todos a seguir usándola como hasta ahora. Con todo esto no pretendemos sustituir MVC. Tan solo queríamos exponer que no tenemos que usar siempre las utilidades de Microsoft. A veces, una solución alternativa se podría adaptar mejor a nuestras necesidades. Pero hay que tener en cuenta otras cosas como la documentación, el apoyo de la comunidad o la facilidad para encontrar desarrolladores con experiencia en una herramienta u otra.

La parte buena es que, esta solución son unas pocas líneas de código que representan una pequeña extensión de un comportamiento que ya existe con Asp.Net Core Routing. Lo único que hace es facilitar su uso y simplificar la manera de crear APIs sencillas. Además, unos pocos nanosegundos en millones de peticiones a una API finalmente se traducen en dinero.

Si has llegado leyendo hasta aquí te preguntarás: ¿Es esto una ingeniosa solución que deberíamos aprovechar en nuestros desarrollos o una locura transitoria?

Sí.