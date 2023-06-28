---
published: true
ID: 202304051
title: 'Modelo de madurez de Richardson'
author: fernandoescolar
post_date: 2023-04-05 01:04:36
layout: post
tags: rest aspnet aspnetcore dotnet csharp best-practices
background: '/assets/uploads/bg/programming3.jpg'
---

Al *loco* de [Leonard Richardson](https://twitter.com/leonardr) se le ocurrió la feliz idea de que para implementar una *API* en internet solo hacía falta seguir las normas de la *WWW*. Necesitábamos recoger los principios del protocolo *HTTP* y construir un modelo propio basado en 3 pilares: dividir correctamente la información, refactorizar nuestro código y describir el comportamiento de una forma estandarizada<!--break-->. A todo esto se le bautizó como el **Modelo de Madurez de Richardson** en el libro [REST in Practice](https://www.oreilly.com/library/view/rest-in-practice/9781449383312/). Y más tarde fue popularizado por [Martin Fowler](https://twitter.com/martinfowler) en su artículo [Richardson Maturity Model](https://www.martinfowler.com/articles/richardsonMaturityModel.html).

El modelo fue presentado en sociedad en una sesión llamada [Justice Will Take Us Millions of Intricate Moves](https://www.crummy.com/writing/speaking/2008-QCon/) en la [QCon de San Francisco en 2008](https://qconsf.com/sf2008/):

Richardson propone que *WWW* como uno de los protocolos originales de internet y de facto el, si no único, al menos el más usado. A su vez, expone *WWW* como un conjunto de tecnologías: *HTTP* como protocolo de transporte, *URI* (o _**U**nique **R**esource **I**dentifier_) para identificar recursos y *HTML* (o _**H**yper**T**ext **M**arkup **L**anguage_) para mostrarlos de una forma amigable y permitirnos la navegación.

De esta manera, cuando hablamos de *Web Services*, la propuesta es seguir el mismo modelo exitoso que *WWW*, usando como base una arquitectura *REST*. Esto es un acrónimo de *Representational State Transfer*, y que es un modelo de arquitectura de software que se basa en el uso de *HTTP* como protocolo de transporte, utilizar *URI*s para identificar los recursos, los verbos *HTTP* para realizar diferentes acciones y propone hipermedia para permitir la navegación entre recursos.

Y aquí es donde surje el modelo de madurez de Richardson. Una forma de clasificar nuestras *APIs* en base a los conceptos usados en *WWW* y buscando el diseño *RESTFul* ideal.

> **_DISCLAIMER_**: Es importante mencionar que este modelo es solamente una herramienta, una guía, no una norma. En cualquier caso, siempre hay que evaluar cada caso en particular y ver si esto se ajusta a las necesidades del proyecto.

Richardson establece 3 niveles, que en realidad son 4, porque el primero lo considera como un nivel 0, un estado inicial, en el que no se ha empezado a aplicar este modelo. A continuación, describiremos los diferentes niveles del modelo de madurez de Richardson:

- [Nivel 0: HTTP como transporte](#nivel-0-http-como-transporte)
- [Nivel 1: URI](#nivel-1-uri)
- [Nivel 2: Verbos y estados HTTP](#nivel-2-verbos-y-estados-http)
- [Nivel 3: Controles hipermedia](#nivel-3-controles-hipermedia)
- [Conclusiones](#conclusiones)


## Nivel 0: HTTP como transporte

El nivel 0 del modelo de madurez de Richardson se refiere a una *API* que utiliza *HTTP* como mecanismo de transporte, pero utiliza de forma desprecupada los mecanismos de la web, como *URIs*, verbos *HTTP* o códigos de estado. Este es similar al uso de *HTTP* en servicios web *XML-RPC* o *SOAP*.

También sería el caso en el que un *neófito* en el desarrollo de *APIs* *REST* podría crear una *API*, ya que no conocería el modelo de madurez de Richardson y por tanto no aplicaría sus características. Un ejemplo podría ser el siguiente:

```csharp
app.MapPost("beerService", (BeerDbContext db, int? id) => {
    if (id.HasValue)
    {
        var beer = db.Beer.FirstOrDefault(b => b.Id == id.Value);
        return beer;
    }

    var beer = db.Beer.FirstOrDefault();
    return beer;
});
```

En este código, tenemos un *endpoint* con el nombre `beerService` y acepta el método `POST`. Lo que hace es devolver la primera cerveza que encuentre en la base de datos.

## Nivel 1: URI

El nivel 1 se centra en el uso de *URI*. Una URI es un acrónimo de *Uniform Resource Identifier* y es una cadena de caracteres que identifica de forma única un recurso. Consta de 4 partes:

- **Schema**: Es el protocolo que se utiliza para acceder al recurso. Por ejemplo, `http`, `https`, `ftp`, `mailto`, etc.
- **Host**: Es el nombre del servidor que aloja el recurso. Por ejemplo, `www.google.com`.
- **Path**: Es la ruta que se utiliza para acceder al recurso. Por ejemplo, `/search`.
- **Query**: Es la cadena de consulta que se utiliza para filtrar el recurso. Por ejemplo, `?q=api`.
- **Fragment**: Es la parte de la URI que se utiliza para identificar un fragmento de un recurso. Por ejemplo, `#section1`.

En este nivel, se introduce la idea de que una *API* debe estar compuesta por recursos, que son entidades independientes e identificables con una *URI* específica. En este nivel, se comienza a hablar con recursos individuales en lugar de hacer todas las solicitudes a un punto final de servicio único.

También se pueden utilizar verbos *HTTP*, pero se utilizan principalmente como mecanismos de tunelización para canalizar las interacciones a través de este protocolo. Aunque es posible utilizar verbos *HTTP*, su uso correcto no es necesario para alcanzar este nivel.

Aquí, el servicio debe exponer sus recursos usando toda la  potencia que permite la *URI*. Por ejemplo, si tenemos un servicio que nos permite buscar cervezas, podríamos tener un *endpoint* que nos permita buscar cervezas por nombre, otro que nos permita buscar cervezas por país de origen, etc. Cada uno de estos *endpoints* tendría su propia *URI*. Pero al ser todos referentes a cervezas, podrían tener un *path base* similar, por ejemplo `/beers`.

Este ejemplo se podría expresar de la siguiente forma:

```csharp
app.MapGet("beers", (BeerDbContext db) => {
    var beers = db.Beer.ToList();
    return beers;
});
app.MapGet("beers/{id}", (BeerDbContext db, int id) => {
    var beer = db.Beer.FirstOrDefault(b => b.Id == id);
    return beer;
});
app.MapGet("breweries/{id}/beers", (BeerDbContext db, int id) => {
    var beer = db.Beer.Where(b => b.BreweryId == id).ToList();
    return beer;
});
```

En este ejemplo, tenemos 3 *endpoints*:

- `beers`: Devuelve todas las cervezas.
- `beers/{id}`: Devuelve la cerveza con el identificador especificado.
- `breweries/{id}/beers`: Devuelve todas las cervezas de la cervecera con el identificador especificado.

Se puede ver que cada *endpoint* tiene una *URI* única, y que la hemos basado en el concepto de recurso. Además, es fácil de entender, ya que cada *endpoint* tiene una ruta que nos indica a qué recurso estamos accediendo y de qué forma.

A este ejemplo le podríamos añadir paginación a la hora de devolver las cervezas, usando parámetros de consulta:

```csharp
app.MapGet("beers", (BeerDbContext db, int page = 0, int pageSize = 10) => {
    var beers = db.Beer
                  .Skip(page * pageSize)
                  .Take(pageSize)
                  .ToList();

    return beers;
});
```

Este *endpoint* sería invocado usando la *URI* `beers?page=2&pageSize=20`.

En resumen, el nivel 1 del modelo de madurez de Richardson se centra en dividir un servicio en múltiples recursos y usar correctamente los *path* para describirlos. De esta forma, permitirá una mayor facilidad de uso y comprensión de la *API*.

## Nivel 2: Verbos y estados HTTP

Este nivel se centra en el uso de todas las características del protocolo *HTTP*: los verbos y los códigos de estado. Aquí se propone usar los verbos *HTTP* de acuerdo con su uso en el propio *HTTP*. Se utilizan verbos como `GET`, `POST`, `PUT`, `PATCH` y `DELETE` para indicar la acción a realizar en los recursos. Esto ayuda a los desarrolladores a entender mejor las acciones que se están realizando en los recursos y a interactuar con la *API* de manera similar a cómo interactúan con la web:

```csharp
app.MapGet("beers", (BeerDbContext db) => {
    var beers = db.Beer.ToList();
    return beers;
});

app.MapGet("beers/{id}", (BeerDbContext db, int id) => {
    var beer = db.Beer.FirstOrDefault(b => b.Id == id);
    return beer;
});

app.MapPost("beers", (BeerDbContext db, Beer beer) => {
    db.Beer.Add(beer);
    db.SaveChanges();
    return beer;
});

app.MapPut("beers/{id}", (BeerDbContext db, int id, Beer beer) => {
    var entity = db.Beer.FirstOrDefault(b => b.Id == id);
    if (entity == null)
    {
        entity = new Beer { Id = id };
        db.Beer.Add(entity);
    }

    entity.Name = beer.Name;
    // ...

    db.SaveChanges();
    return beer;
});

app.MapPatch("beers/{id}", (BeerDbContext db, BeerName beerName) => {
    var entity = db.Beer.FirstOrDefault(b => b.Id == id);
    entity.Name = beerName.Value;
    db.SaveChanges();
    return beer;
});

app.MapDelete("beers/{id}", (BeerDbContext db, int id) => {
    var beer = db.Beer.FirstOrDefault(b => b.Id == id);
    db.Beer.Remove(beer);
    db.SaveChanges();
    return beer;
});
```

En este ejemplo, tenemos 6 *endpoints* que definiremos como su verbo y su *URI*::

- `GET beers`: Devuelve todas las cervezas.
- `GET beers/{id}`: Devuelve la cerveza con el identificador especificado.
- `POST beers`: Crea una nueva cerveza.
- `PUT beers`: Actualiza una cerveza o crea una nueva si no existe. Esto se debe a que es un verbo *idempotente*.
- `PATCH beers`: Actualiza una propiedad de una cerveza.
- `DELETE beers/{id}`: Elimina la cerveza con el identificador especificado.


Los verbos *HTTP* que tenemos disponibles son más, como se muestran en la siguiente tabla, pero decidimos no representar algunos que serían válidos también en este nivel:

| Verbo | Idempotente | Descripción |
|-------|-------------|-------------|
| **CONNECT** | No | Establece una conexión entre dos puestos, como por ejemplo a través de un proxy. |
| **DELETE** | Sí | Elimina un recurso. |
| **GET** | Sí | Devuelve un recurso o una colección de recursos. |
| **HEAD** | Sí | Devuelve los metadatos de un recurso. No pude devolver "body" en la respuesta. |
| **OPTIONS** | Sí | Devuelve los métodos permitidos para un recurso. Se suele usar para comprobar *CORS*. |
| **POST** | No | Crea un recurso. |
| **PUT** | Sí | Reemplaza un recurso (o lo crea si no existía previamente). |
| **PATCH** | No | Modifica un recurso parcialmente. |
| **TRACE** | Sí | Para realizar pruebas de un *enpoint*. El objetivo es que responda con mensaje recibido. |

> Idenpotencia es la propiedad de una operación que puede ser ejecutada varias veces sin cambiar el resultado. Por ejemplo, la operación de sumar 1 a un número es idempotente, ya que el resultado es siempre el mismo. En cambio, la operación de sumar la fecha actual a un número no es idempotente, ya que el resultado cambia cada vez que se ejecuta.

También se utilizan códigos de estado *HTTP* para indicar el estado de la respuesta. Los códigos de estado *HTTP*:

- **2XX**: Indican que la solicitud se ha procesado correctamente. p.e. `200` (OK), `201` (Created), `204` (No Content).
- **3XX**: Indican que la solicitud se ha procesado correctamente, pero que el cliente debe realizar una acción adicional para completarla. p. e. `301` (Moved Permanently), `302` (Found), `304` (Not Modified).
- **4XX**: Indican que la solicitud no se ha procesado correctamente, y que el cliente debe realizar una acción adicional para completarla. p.e. `400` (Bad Request), `401` (Unauthorized), `404` (Not Found).
- **5XX**: Indican que la solicitud no se ha procesado correctamente, y que el cliente no puede realizar una acción adicional para completarla. p.e. `500` (Internal Server Error), `503` (Service Unavailable).

Esto ayuda a los desarrolladores a entender mejor el estado de la respuesta y a tomar medidas apropiadas en función del código de estado:

```csharp
app.MapGet("beers/{id}", (BeerDbContext db, int id) => {
    var beer = db.Beer.FirstOrDefault(b => b.Id == id);
    if (beer == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(resource);;
});
```

Aquí se puede ver que, si la cerveza no existe, se devuelve un código de estado `404` (Not Found), y si existe, se devuelve un código de estado `200` (OK) con la cerveza.

Otro ejemplo podría ser:

```csharp
app.MapPost("beers", (BeerDbContext db, Beer beer) => {
    if (beer == null)
    {
        return Results.BadRequest();
    }
    if (string.IsNullOrEmpty(beer.Name))
    {
        return Results.BadRequest(new { Message = "The name is required." });
    }

    db.Beer.Add(beer);
    db.SaveChanges();
    return Results.Created($"/beers/{beer.Id}", beer);
});
```

En este ejemplo, si la cerveza es `null`, se devuelve un código de estado `400` (Bad Request). Si el nombre de la cerveza es `null` o vacío, se devuelve un código de estado `400` (Bad Request) con un mensaje de error. Y si la cerveza se crea correctamente, se devuelve un código de estado `201` (Created) con la cerveza.

El cliente sigue conociendo las URIs de los recursos, pero las respuestas contienen información sobre los verbos HTTP permitidos y los códigos de estado de respuesta.

En resumen, el nivel 2 del modelo de madurez de Richardson se centra en introducir un conjunto estándar de verbos y códigos de estado HTTP para manejar situaciones similares de la misma manera, eliminando variaciones innecesarias, mejorando la experiencia de usuario y la facilidad de uso de la API.

## Nivel 3: Controles hipermedia

En este nivel, se utilizan enlaces y controles hipermedia para navegar entre recursos. Los controles hipermedia proporcionan una forma de hacer que un protocolo sea más autodocumentado, ya que indican qué acciones se pueden realizar en un recurso y cómo hacerlo. Esto ayuda a los desarrolladores a entender cómo interactuar con la API sin tener que consultar una documentación específica.

Utilizaremos el acrónimo *HATEOAS* (_**H**ypermedia **A**s **T**he **E**ngine **O**f **A**pplication **S**tate_), que se refiere a la idea de que los enlaces y controles hipermedia son la forma en que un cliente navega y entiende una *API*. En lugar de que el cliente tenga que conocer las *URIs* de los recursos, los controles hipermedia indican qué recursos están disponibles y cómo acceder a ellos.

Los recursos que se devuelven contienen enlaces y controles hipermedia. Por ejemplo, el recurso `BeerWithLinks` prepresentaría una cerveza con enlaces y controles hipermedia:

```csharp
public class BeerWithLinks
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Brewery { get; set; }
    // ...
    public List<Link> Links => new List<Link>
    {
        new Link { Rel = "self",    Href = $"/beers/{Id}" },
        new Link { Rel = "brewery", Href = $"/breweries/{BreweryId}" },
        new Link { Rel = "beers",   Href = $"/beers",      Method = "GET },
        new Link { Rel = "update",  Href = $"/beers/{Id}", Method = "PUT" },
        new Link { Rel = "delete",  Href = $"/beers/{Id}", Method = "DELETE" },
    };
}
```

Y el *endpoint* para obtener una cerveza podría ser:

```csharp
app.MapGet("beers/{id}", (BeerDbContext db, int id) => {
    var beer = db.Beer.FirstOrDefault(b => b.Id == id);
    if (beer == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(new BeerWithLinks(beer));
});
```

En este nivel, el cliente puede descubrir los recursos y las acciones permitidas dinámicamente, lo que hace que la API sea más fácil de usar y escalable.

Aunque los recursos con hipermedia no son valores que se devuelvan por defecto. Generalmente se establece un formato como contrato y un tipo de contenido específico para solicitar los recursos con hipermedia. Por ejemplo, si se utiliza el formato JSON, se puede establecer un tipo de contenido como `application/vnd.beer+json` para solicitar los recursos con hipermedia. Así pues, el código podría ser:

```csharp
app.MapGet("beers/{id}", (BeerDbContext db, int id) => {
    var beer = db.Beer.FirstOrDefault(b => b.Id == id);
    if (beer == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(beer);
}).AddEndpointFilter(async (ctx, next) => {
    var result = await next(ctx);
    if (ctx.HttpContext.Request.Headers.Accept == "application/vnd.beer+json")
    {
        if (result is IValueHttpResult v && v.Value is Beer beer)
        {
            result = new BeerWithLinks(beer);
        }
    }

    return result;
});
```

En el ejemplo anterior, se ha añadido un filtro de *endpoint* que comprueba si el cliente ha solicitado los recursos con hipermedia. Si es así, se devuelve el recurso con hipermedia en lugar del recurso sin hipermedia.

Sobre tipos de hipermedia, no existe un estandar definido. Por lo tanto, se puede utilizar cualquier formato que se desee. Por ejemplo, se puede utilizar [JSON-LD](https://json-ld.org/), [HAL](https://stateless.group/hal_specification.html), [Siren](https://github.com/kevinswiber/siren), [Hydra](https://www.hydra-cg.com/), etc. Y en el ejemplo anterior se ha utilizado un formato personalizado, lo que también es una opción válida.

En resumen, el nivel 3 del modelo de madurez de Richardson se centra en la navegación entre recursos mediante el uso de enlaces y controles hipermedia.

## Conclusiones

Si te planteas cómo podrías mejorar las *APIs* que has desarrollado, el modelo de madurez de Richardson puede ser una buena guía para ello. Va paso a paso, desde el nivel 0 hasta el nivel 3, y te propone cuestiones que te ayudarán a identificar estas mejoras.

Y Cuando en una entrevista técnica de trabajo te pregunten por *API* *REST*, no te quedes en blanco. Aquí tienes un montón de información para dar conversación durante horas.

Todo son ventajas.
