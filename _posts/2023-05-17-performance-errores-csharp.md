---
published: true
ID: 202305171
title: 'Top 5: Errores de performance en C#'
author: fernandoescolar
post_date: 2023-05-17 01:04:36
layout: post
tags: net7 aspnet aspnetcore dotnet csharp performance
background: '/assets/uploads/bg/performance.jpg'
---

¿Alguna vez has sentido que tu aplicación .NET se arrastra como un caracol en la nieve? ¿Te has quedado mirando fijamente la pantalla mientras una tarea tardaba minutos en completarse? ¿Te has preguntado si hay algo mal con tu código? o ¿simplemente la máquina se niega a colaborar contigo? Si has respondido "sí" a cualquiera de estas preguntas, podrías estar sufriendo alguno de los típicos problemas derivados de malas prácticas de programación. Pero no te preocupes. No estás solo. En este artículo, te presentamos algunos de los errores más comunes hemos visto en nuestros proyectos. Además, las soluciones para resolverlos. Así que agarra una taza de café, relájate y prepárate para aprender cómo hacer que tu aplicación funcione como un Ferrari<!--break-->.

Te presentamos el top 5 de los errores de programación que cometemos a menudo y que tienen impacto negativo en la performance de nuestras aplicaciones:

- [Lanzar demasiadas excepciones](#lanzar-demasiadas-excepciones)
- [Acceso constante a los mismos datos](#acceso-constante-a-los-mismos-datos)
- [Ignorar el `CancellationToken`](#ignorar-el-cancellationtoken)
- [Instanciar `HttpClient`](#instanciar-httpclient)
- [Concatenar cadenas de texto](#concatenar-cadenas-de-texto)

## Lanzar demasiadas excepciones

En la vida hay dos cosas seguras: la muerte y las excepciones de .NET.

Lanzar excepciones es una práctica común en C# y .NET para manejar errores. Sin embargo, su ejecución tiene un impacto negativo en el rendimiento de una aplicación. Esto se debe a que cada vez que se lanza una excepción, se produce una sobrecarga significativa de la CPU y la memoria.

¿Por qué no lanzar una excepción cada vez que se produce un error en la aplicación? Porque las excepciones son necesarias para manejar errores en la aplicación. Pero no para gestionar errores en el flujo de control normal de la aplicación. Por ejemplo, si se espera que una consulta a la base de datos devuelva un resultado y en su lugar devuelve un valor nulo, lanzar una excepción para informar de este error no es una buena práctica.

En lugar de lanzar una excepción, se recomienda utilizar otro mecanismo para informar de esto, como devolver un resultado de error en la respuesta de la solicitud. Esto no solo reduce la sobrecarga de excepción, sino que también hace que el código sea más fácil de leer y depurar.

Veamos un ejemplo:

```csharp
var brewery = await req.Database.Breweries.FindAsync(new object[] { (int)req.Body.BreweryId }, cancellationToken);
if (brewery is null)
{
    throw new Exception("Unkown Brewery");
}

var style = await req.Database.Styles.FindAsync(new object[] { (int)req.Body.StyleId }, cancellationToken);
if (style is null)
{
    throw new Exception("Invalid beer style");
}
```

En este ejemplo, se lanzan dos excepciones si la consulta a la base de datos no devuelve ningún resultado.

Aquí podríamos gestionar este tipo de errores como respuestas de error de HTTP:

```csharp
var brewery = await req.Database.Breweries.FindAsync(new object[] { (int)req.Body.BreweryId }, cancellationToken);
if (brewery is null)
{
    return Results.BadRequest("Unkown Brewery");
}

var style = await req.Database.Styles.FindAsync(new object[] { (int)req.Body.StyleId }, cancellationToken);
if (style is null)
{
    return Results.BadRequest("Invalid beer style");
}
```

Así que ya sabes, si necesitas lanzar una excepción, piensa antes si es un error de la aplicación o un error de flujo de control. Si es un error de flujo de control, no lanzes una excepción. En su lugar, devuelve un resultado de error que no tenga un impacto negativo en el rendimiento de la aplicación.


## Acceso constante a los mismos datos

Es posible que pienses que acceder a la base de datos cada vez que necesitas información es una buena práctica. Después de todo, ¡no quieres perder ninguna actualización!

Pero la verdad es que esto puede ser una pesadilla para el rendimiento de tu aplicación. ¿Por qué? Porque la base de datos es una de las partes más lentas del sistema. Y si cada vez que necesitas información tienes que ir a buscarla a la base de datos, es posible que estés ralentizando tu aplicación de manera significativa.

Aquí es donde entran en juego las cachés. Una caché es una forma de almacenar datos en memoria para que no tengas que ir a buscarlos cada vez que los necesites. Y si bien las cachés pueden ser un poco más difíciles de configurar que simplemente hacer una consulta a la base de datos, el resultado final valdrá la pena.

Veamos un ejemplo:

```csharp
private void FillBeerStyles(BeerDbContext database, Response resourceList)
{
    foreach (var item in resourceList.Items)
    {
        var style = database.Styles.FirstOrDefault(s => s.Id == item.StyleId);
        if (style != null)
        {
            item.StyleId = style.Id;
            item.StyleName = style.Name;
        }
    }
}
```

En este ejemplo, estamos accediendo a la base de datos para buscar información sobre cada elemento en una lista. Es una dramatización, ya que en la vida real probablemente no tendrías que hacer esto para cada elemento de la lista.

De cualquier manera, ¿y si la información de los estilos de cerveza no cambia con frecuencia? En ese caso, sería mucho más eficiente almacenarla en una caché para que la aplicación no tenga que buscarla en la base de datos cada vez que la necesite.

Aquí está la solución:

```csharp
private void FillBeerStyles(BeerDbContext database, Response resourceList, IMemoryCache cache)
{
    var styles = cache.GetOrSetAsync("styles", () => database.Styles.AsNoTracking().ToListAsync())
    foreach (var item in resourceList.Items)
    {
        var style = styles.FirstOrDefault(s => s.Id == item.StyleId);
        if (style != null)
        {
            item.StyleId = style.Id;
            item.StyleName = style.Name;
        }
    }
}
```

Ahora estamos almacenando los estilos de cerveza en una caché y accediendo a ella cada vez que necesitamos información sobre un estilo. Esto significa que nuestra aplicación ya no tiene que acceder constantemente a la base de datos para buscar esta información, lo que mejora significativamente su rendimiento.

Así que, la próxima vez que estés escribiendo código que acceda constantemente a la base de datos para obtener información que cambia poco, detente un momento y piensa: "¿podría esto ser almacenado en una caché?" Tu aplicación y tus usuarios te lo agradecerán.

## Ignorar el `CancellationToken`

¡Ah, los `CancellationToken`! Esos pequeños amigos que a veces nos olvidamos de incluir en nuestro código asíncrono, como si fueran de adorno.

Pero ¿para qué molestarnos en incluir un `CancellationToken` cuando podemos simplemente dejar que nuestros métodos asíncronos se ejecuten por siempre y para siempre, incluso cuando el usuario ya ha cancelado la solicitud o la tarea se ha vuelto irrelevante?

Mira este ejemplo:

```csharp
protected override async Task<IResult> OnHandleAsync(Request req, CancellationToken cancellationToken)
{
    await LongCallAsync();
    var total = await req.Database.Styles.CountAsync();
    if (total == 0)
    {
        return Results.NoContent();
    }
    // ...
}

private Task LongCallAsync(CancellationToken cancellationToken = default)
{
    // ...
}
```

Aquí, `LongCallAsync` no incluye un `CancellationToken`, así que no importa si el usuario cancela la solicitud o la tarea se vuelve irrelevante, esta tarea se ejecutará hasta el infinito o al menos, hasta que termine. Independientemente de si hay alguien esperando el resultado.

Pero no te preocupes, puedes incluir un `CancellationToken` para que puedas cancelar la ejecución del método asíncrono de manera adecuada y así, parar procesos innecesarios y liberar recursos. Por ejemplo:

```csharp
protected override async Task<IResult> OnHandleAsync(Request req, CancellationToken cancellationToken)
{
    cancellationToken.ThrowIfCancellationRequested();
    await LongCallAsync(cancellationToken);
    var total = await req.Database.Styles.CountAsync(cancellationToken);
    if (total == 0)
    {
        return Results.NoContent();
    }
    // ...
}

private Task LongCallAsync(CancellationToken cancellationToken)
{
    // ...
}
```

Si gestionas adecuadamente los `CancellationToken`, puedes evitar que se produzcan errores de rendimiento y que se consuman recursos innecesariamente. Además, también puedes evitar que se produzcan errores de concurrencia y otros efectos secundarios no deseados.

## Instanciar `HttpClient`

¿Qué podría salir mal al crear un `HttpClient`? Es solo un pequeño artefacto de código que se comunica con otros servidores usando el protocolo `HTTP`, ¿verdad? Pues no tan rápido. Usar `HttpClient` de manera incorrecta puede ser la causa de una gran cantidad de problemas de rendimiento.

Imagínate que tienes el siguiente código:

```csharp
var client = new HttpClient();
```

¿Qué está mal en este código? ¡Todo! Estás creando un nuevo objeto `HttpClient` cada vez que necesitas hacer una llamada, lo que significa que abres un canal de comunicación nuevo cada vez que el código se ejecute. Además es posible que no libreres correctamente la conexión al finalizar.

En lugar de eso, deberías usar `HttpClientFactory`, que te permitirá reutilizar el cliente y configurarlo de manera centralizada. Así es como debería ser:

```csharp
// recoger el IHttpClientFactory del contenedor de dependencias o inyectarlo en el constructor
var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();
var client = httpClientFactory.CreateClient();
```

Ahora sí, esto es mucho mejor. Utilizando `HttpClientFactory`, podrás crear clientes HTTP configurados adecuadamente, que se reutilizan y se administran automáticamente por el framework. Estos clientes creados por `HttpClientFactory` se almacenan en un pool, por lo que no se crean nuevos clientes cada vez que se necesita uno. Además, cuando se termina de usar un cliente, se devuelve al pool y se limpia para que pueda ser reutilizado. Esto significa que no tiene por qué crearse un nuevo canal de comunicación cada vez que se realiza una llamada. Una forma más eficiente de gestionar los recursos de red y de reducir el consumo de memoria.

Recuerda, si necesitas un `HttpClient`, la mejor opción es usar `HttpClientFactory`.

## Concatenar cadenas de texto

¡Ay, el pobre `StringBuilder`! A menudo se le ignora o se le olvida por completo. Y, sin embargo, ¡es tan útil para construir cadenas de manera eficiente!

Veamos un ejemplo:

 ```csharp
var beers = await database.Beers.Where(b => b.Brewery.Id == brewery.Id).ToListAsync(cancellationToken);
var description = string.Empty;
description += "Brewery: " + brewery.Name + Environment.NewLine;
description += "City: " + brewery.City + Environment.NewLine;
description += "Country: " + brewery.Country + Environment.NewLine;
description += "Beers: " + Environment.NewLine;
foreach(var beer in beers)
{
    description += "\t" + beer.Name + Environment.NewLine;
}
```

En este ejemplo, estamos construyendo una cadena de texto que contiene información sobre una cervecería y sus cervezas. La cadena de texto se construye de manera secuencial, concatenando cadenas de texto. Esto significa que cada vez que se concatena una cadena, se crea una nueva cadena de texto en memoria. Esto puede ser muy costoso, especialmente si la cadena de texto es larga.

¿No te gusta cuando tu código es lento y se come toda la memoria? Entonces, deja de crear cadenas utilizando la operación `+`. ¡Porque eso es justo lo que estás haciendo si no usas `StringBuilder`!

 ```csharp
var sb = new System.Text.StringBuilder();
sb.Append("Brewery: ");
sb.AppendLine(brewery.Name);
sb.Append("City: ");
sb.AppendLine(brewery.City);
sb.Append("Country: ");
sb.AppendLine(brewery.Country);
sb.AppendLine("Beers:");
foreach(var beer in beers)
{
    sb.Append("\t");
    sb.AppendLine(beer.Name);
}
```

En este ejemplo, estamos usando `StringBuilder` para construir la cadena de texto. `StringBuilder` es una clase que se puede usar para construir cadenas de texto de manera eficiente. En lugar de crear una nueva cadena cada vez que se concatena una cadena, `StringBuilder` almacena las cadenas en un buffer y las concatena cuando se llama al método `ToString`. Esto significa que solo se crea una cadena de texto al final, lo que es mucho más eficiente.