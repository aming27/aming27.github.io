---
published: true
ID: 202307121
title: 'Asp.Net: Routing'
author: fernandoescolar
post_date: 2023-07-12 01:04:36
layout: post
tags: routing aspnet aspnetcore dotnet csharp
background: '/assets/uploads/bg/route.jpg'
---

No se me ocurre una mejor forma de explicar el routing que con un ejemplo basado en una cervecería. Imagina "The Router's Brew", el pub donde todo desarrollador es bienvenido para tomarse una refrescante cerveza. Aquí hay un camarero cuya misión es escuchar las solicitudes de los clientes y servirles la cerveza que han pedido. El camarero sería el enrutador, y el cliente es el navegador web<!--break-->.

- [Middleware de enrutamiento](#middleware-de-enrutamiento)
- [Enrutamiento basado en convenciones](#enrutamiento-basado-en-convenciones)
- [Atributos de enrutamiento](#atributos-de-enrutamiento)
- [Minimal API](#minimal-api)
- [Route Data](#route-data)
- [Constraints](#constraints)
  - [Custom Constraints](#custom-constraints)
- [Conclusiones](#conclusiones)


## Middleware de enrutamiento

El middleware de enrutamiento es un sistema a nivel de Asp.Net Core que determina cómo se responde una solicitud HTTP. Se puede usar para enrutar una solicitud a un controlador y una acción o a una función delegada, en dependencia de si se usa *MVC* o *Minimal API*. Su uso es muy sencillo:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseRouting(); // add routing middleware
app.Run();
```

O si usamos una clase `Startup`:

```csharp
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseRouting();
    }
}
```

Por defecto, este middleware no contiene ninguna ruta configurada. Así que tendremos que configurarlas. Si quisieramos configurar los controladores de *MVC* tendríamos:

```csharp
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllersWithViews(); // add MVC
    }

    public void Configure(IApplicationBuilder app)
    {
        app.UseRouting();
        app.UseEndpoints(endpoints => // add MVC endpoints
        {
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
        });
    }
}
```

o si usamos un solo archivo de inicio:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();

var app = builder.Build();
app.UseRouting();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.Run();
```

Mientras que si queremos usar *endpoints* como los de *Minimal API* deberíamos definir las rutas de la siguiente forma:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseRouting();
app.MapGet("/", () => "Hello World!"); // add routing
app.Run();
```

## Enrutamiento basado en convenciones

El enrutamiento basado en convenciones es el enfoque predeterminado para el enrutamiento en ASP.NET Core MVC. Se basa en el nombre de la clase y el nombre de la acción para determinar la ruta de la solicitud. El enrutamiento basado en convenciones se puede usar con o sin atributos de enrutamiento:

```csharp
public class BeersController : Controller
{
    public IActionResult Index()
    {
        return Ok("ola k ase");
    }
}
```

Si nos fijamos bien, cuando decimos:

```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

Estamos añadiendo un patrón de enrutamiento por defecto. Donde pone `controller` se sustituye con el nombre de la clase de tipo controlador borrando el sufijo `Controller` de la misma. Donde pone `action` se sustituye con el nombre del método que responde con tipo `IActionResult`. Y donde pone `id` se sustituye con el valor de la variable de ruta `id` si existe. Y además se asignan unos valores por defecto: `Home` para el controlador, `Index` para la acción y `null` para el `id`, ya que es opcional (el símbolo `?` hace que no se requiera).

Así, si queremos llamar a nuestro controlador `BeersController` y a su método `Index` deberíamos llamar a la ruta `/Beers/Index`. Pero si omitimos el nombre de la acción, usará por omisión `Index`, por lo que podríamos llamar a `/Beers`.

Si enrutaramos de la siguiente forma:

```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Beers}/{action=Index}/{id?}");
```

Entonces podríamos llamar a `/` y nos redirigiría a `/Beers/Index`.

Y si tuviéramos más de un método que responde con `IActionResult` en nuestro controlador:

```csharp
public class BeersController : Controller
{
    public IActionResult Index()
    {
        return Ok("ola k ase");
    }

    public IActionResult About()
    {
        return Ok("about");
    }
}
```

Entonces podríamos llamar a `/Beers/About` para que nos devolviera `about`. Pero si no especificáramos el nombre del controlador, `/About`, entonces el sistema de enrutamiento buscaría un controlador con el nombre `AboutController` y una acción con el nombre `Index` dentro de él. Si no lo encontrara, devolvería un error `404`.

Y si quisieramos enviar un parámetro `id` en la ruta, podríamos hacerlo de la siguiente forma:

```csharp
public class BeersController : Controller
{
    public IActionResult Edit(int id)
    {
        return Ok($"ola k ase {id}");
    }
}
```

Así podríamos llamar a `/Beers/Edit/1` y nos devolvería `ola k ase 1`, porque el parámetro `id` es obligatorio. Si no lo especificáramos, nos devolvería un error `404`. Pero si lo especificáramos como opcional:

```csharp
public class BeersController : Controller
{
    public IActionResult Edit(int? id)
    {
        return Ok($"ola k ase {id ?? -1}");
    }
}
```

Entonces podríamos llamar a `/Beers/Edit` y nos devolvería `ola k ase -1`, porque el parámetro `id` es opcional.


## Atributos de enrutamiento

Los atributos de enrutamiento se pueden usar para configurar las rutas de una acción de controlador y para especificar los requisitos de las variables de ruta. Los atributos de enrutamiento se pueden colocar en el controlador o en la acción. Los atributos de enrutamiento en el controlador se aplican a todas las acciones del controlador. Los atributos de enrutamiento en la acción anulan los atributos de enrutamiento en el controlador:

```csharp
[Route("api/[controller]")]
[ApiController]
public class BeersController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("ola k ase");
    }
}
```

En este caso, hemos especificado en el controlador que la ruta base para usar es `api/[controller]`, donde `[controller]` se sustituye por el nombre del controlador. Sería `/api/Beers`. En el método `Get` hemos especificado un atributo `HttpGet` sin parámetros. Esto quiere decir que cuando usemos el verbo `GET` en la ruta `/api/Beers` nos devolverá `ola k ase`.

Si quisiéramos especificar un parámetro en la ruta, podríamos hacerlo de la siguiente forma:

```csharp
[Route("api/[controller]")]
[ApiController]
public class BeersController : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult Get(int id)
    {
        return Ok($"ola k ase {id}");
    }
}
```

Al espeficicar el parámetro `id` entre dos llaves, indicamos de que esta parte de la ruta es un parámetro de la acción llamado `id`. Esto quiere decir que cuando usemos el verbo `GET` en la ruta `/api/Beers/1` nos devolverá `ola k ase 1`.

Si quisiéramos cambiar las rutas por defecto, podríamos hacerlo de la siguiente forma:

```csharp
[Route("api/cervezas")]
[ApiController]
public class BeersController : ControllerBase
{
    [HttpGet("obtener/{id}")]
    public IActionResult Get(int id)
    {
       return Ok($"ola k ase {id}");
    }
}
```

En este caso, hemos especificado en el controlador que la ruta base para usar es `api/cervezas`. Sería `/api/cervezas`. En el método `Get` hemos especificado un atributo `HttpGet` con el parámetro `obtener/{id}`. Esto quiere decir que cuando usemos el verbo `GET` en la ruta `/api/cervezas/obtener/1` nos devolverá `ola k ase 1`.

Podríamos especificar más de un parámetro en la ruta:

```csharp
[Route("api/cervezas")]
[ApiController]
public class BeersController : ControllerBase
{
    [HttpGet("obtener/{id}/{nombre}")]
    public IActionResult Get(int id, string nombre)
    {
        return Ok($"ola k ase {id} {nombre}");
    }
}
```

Cuando usemos el verbo `GET` en la ruta `/api/cervezas/obtener/1/estrella` nos devolverá `ola k ase 1 estrella`.

Y también podríamos especificar más de una ruta para una acción:

```csharp
[Route("api/cervezas")]
[Route("api/beers")]
[ApiController]
public class BeersController : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult Get(int id)
    {
        return Ok($"ola k ase {id}");
    }
}
```

Podríamos usar tanto `/api/cervezas/1` como `/api/beers/1` para obtener `ola k ase 1`.

Además del atributo `HttpGet`, existen otros atributos de enrutamiento para otros verbos: `HttpPost`, `HttpPut`, `HttpDelete` y `HttpPatch`. Y en adición a `Route`, podemos encontrar: `RoutePrefix`, `RouteArea`, `NonAction` y `ActionName`.

## Minimal API

Cuando usamos *Minimal API* el sistema de rutas viene configurado al arrancar la aplicación y con cada *endpoint* que definamos, pero el *middleware* de enrutamiento es el mismo.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

En este caso, al usar el método `MapGet` estamos indicando que cuando se haga una petición `GET` a la ruta `/` se devuelva `Hello World!`. Si quisiéramos especificar un parámetro en la ruta, podríamos hacerlo de la siguiente forma:

```csharp
app.MapGet("/hello/{name}", (string name) => $"Hello {name}!");
```

Al espeficicar el parámetro `name` entre dos llaves, indicamos de que esta parte de la ruta es un parámetro de la acción llamado `name`. Esto quiere decir que cuando usemos el verbo `GET` en la ruta `/hello/pepe` nos devolverá `Hello pepe!`.

Si quisieramos usar un verbo diferente a `GET`, podríamos hacerlo de la siguiente forma:

```csharp
app.MapPost("/hello", () => "Hello World!");
app.MapPut("/hello", () => "Hello World!");
app.MapDelete("/hello", () => "Hello World!");
app.MapPatch("/hello", () => "Hello World!");
// or
app.MapMethods("/hello", new[] { "GET", "POST", "PUT", "DELETE", "PATCH" }, () => "Hello World!");
```

## Route Data

Cuando se hace una petición a una ruta, se puede acceder a los datos de la ruta a través de la propiedad `RouteData` de la clase `HttpContext`. Esta propiedad es un diccionario que contiene los datos de la ruta. Por ejemplo, si quisiéramos obtener el valor del parámetro `id` de la ruta `/api/Beers/1` podríamos hacerlo de la siguiente forma:

```csharp
app.MapGet("/api/Beers/{id:int}", (HttpContext context) =>
{
    var id = context.Request.RouteValues["id"];
    return Results.Ok($"ola k ase {id}");
});
```

## Constraints

Los *constraints* son restricciones que se pueden aplicar a las variables de ruta. Se activan usando el carácter `:` a continuación del nombre de un parámetro de ruta, dentro de las llaves. Por ejemplo, si quisiéramos especificar que el parámetro `id` de la ruta `/api/Beers/1` fuera un número, podríamos hacerlo de la siguiente forma:

```csharp
app.MapGet("/api/Beers/{id:int}", (int id) => $"ola k ase {id}");
```

Estos *constraints* también se pueden usar en los atributos de enrutamiento:

```csharp
[Route("api/[controller]")]
[ApiController]
public class BeersController : ControllerBase
{
    [HttpGet("{id:int}")]
    public IActionResult Get(int id)
    {
        return Ok($"ola k ase {id}");
    }
}
```

La gracia de lso *constraints* es que si no se cumplen, la ruta no se encontrará y devolverá un error `404`. Así nos ahorramos si quiera tener que validar los parámetros que vienen de la ruta si no se cumplen nuestras condiciones.

Los diferentes *constraints* de tipo de variable de los que disponemos actualmente son:

- `alpha`: El parámetro debe ser una cadena que contenga solo caracteres alfabéticos: a-z y A-Z.
- `bool`: El parámetro debe ser un valor booleano.
- `datetime`: El parámetro debe ser una fecha y hora.
- `decimal`: El parámetro debe ser un número decimal.
- `double`: El parámetro debe ser un número doble de coma flotante.
- `float`: El parámetro debe ser un número de coma flotante.
- `guid`: El parámetro debe ser un identificador único global (GUID).
- `int`: El parámetro debe ser un número entero.
- `long`: El parámetro debe ser un número entero largo.

```csharp
app.MapGet("/api/beers/{id:guid}/{number:long}", (Guid id, long number) => $"ola k ase {id} {number}");
```

Si buscamos *constraints* que nos ayuden a evaluar el tamaño:

- `length(len)`: El parámetro debe ser una cadena que tenga una longitud específica `len`.
- `length(min, max)`: El parámetro debe ser una cadena que tenga una longitud entre `min` y `max` (inclusive).
- `max(val)`: El parámetro debe ser un número entero que sea menor que `val`.
- `min(val)`: El parámetro debe ser un número entero que sea mayor que `val`.

```csharp
app.MapGet("/api/beers/{id:length(36)}/{number:min(1)}", (Guid id, long number) => $"ola k ase {id} {number}");
```

En este caso, por cuestiones de ruta, podríamos aceptar cualquier cadena de texto que tuviera una longitud de 36 caracteres y cualquier número entero que fuera mayor o igual que `1`. Pero si el parámetro `id` no fuera convertible a `Guid`, tendríamos una excepción en tiempo de ejecución. Para evitar esto lo ideal sería poder combinar *constraints*:

```csharp
app.MapGet("/api/beers/{id:guid:length(36)}/{number:long:min(1)}", (Guid id, long number) => $"ola k ase {id} {number}");
```

Si por el contrario buscamos un rango de valores numéricos:

- `range(min, max)`: El parámetro debe ser un número entero que esté entre `min` y `max` (inclusive).

```csharp
app.MapGet("/api/beers/{id:range(1, 10)}", (int id) => $"ola k ase {id}");
```

Aquí solo aceptaremos valores entre 1 y 10: `/api/beers/1`, `/api/beers/2`, ..., `/api/beers/10`.

Y para casos especiales siempre podremos usar expresiones regulares:

- `regex(pattern)`: El parámetro debe ser una cadena que coincida con la expresión regular `pattern`.

```csharp
app.MapGet("/api/beers/{id:regex(^\\d{{3}}-\\d{{2}}-\\d{{4}}$)}", (string id) => $"ola k ase {id}");
```

Aquí solo aceptaremos valores que coincidan con el patrón `^\d{3}-\d{2}-\d{4}$`: `/api/beers/123-45-6789`.

> Como podemos ver, si usamos caracteres especiales en las expresiones regulares, tendremos que escaparlos usando `\`. Y si se trata de una llave `{` o `}`, tendremos que escaparlas usando el mismo caracter dos veces: `{{` o `}}`.

### Custom Constraints

Si los *constraints* que nos proporciona ASP.NET Core no son suficientes, siempre podemos crear los nuestros propios. Para ello, tendremos que crear una clase que implemente la interfaz `IRouteConstraint`:

```csharp
public class BeerConstraint : IRouteConstraint
{
    public bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
    {
        if (values.TryGetValue(routeKey, out var value) && value is string str)
        {
            return !str.Contains("cruzcampo", StringComparison.OrdinalIgnoreCase);
        }

        return true;
    }
}
```

Para registrar nuestro *constraint* personalizado, tendremos que añadirlo al mapa de *constraints* de las `RouteOptions`:

```csharp
builder.Services.Configure<RouteOptions>(routeOptions =>
{
    routeOptions.ConstraintMap.Add("beer", typeof(BeerConstraint));
});
```

Y luego usarlo dentro de una ruta:

```csharp
app.MapGet("/api/beers/{name:beer}", (string name) => $"ola k ase {name}");
```

Lo que hará este *constraint* es que si el parámetro `name` contiene la palabra `cruzcampo`, la ruta no se encontrará y devolverá un error `404`.

## Conclusiones

En este artículo hemos visto cómo podemos crear rutas en ASP.NET Core. Hemos visto cómo podemos crear rutas con parámetros y cómo podemos aplicar *constraints* a esos parámetros para que se validen automáticamente.

No hay que subestimar el poder del sistema de enrutamiento de ASP.NET Core. Es muy potente y nos permite crear rutas muy complejas. Nos puede ahorrar mucho código a la hora de validar los parámetros de entrada de nuestras acciones. Nos permite mantener la seguridad devolviendo un error genérico como `404` en vez de devolver información sensible de por qué la ruta no se encontró. Y nos permite crear rutas muy limpias y fáciles de leer.

Si quieres profundizar más en el sistema de enrutamiento de ASP.NET Core, puedes consultar la [documentación oficial](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-7.0) o también puedes contribuir a su desarrollo en [GitHub](https://github.com/dotnet/aspnetcore/tree/main/src/Http/Routing).