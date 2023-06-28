---
published: true
ID: 202112071
title: 'Cache Service para .net6'
author: fernandoescolar
post_date: 2021-12-07 01:05:31
layout: post
tags: aspnet cache net6 dotnet
background: '/assets/uploads/bg/circuit.jpg'
---

Un día estábamos tomando una cerveza con [Jorge Turrado](https://twitter.com/JorgeTurrado) y salió a colación un servicio que desarrollamos en el trabajo. Algo que nos permite relajar el consumo de nuestras bases de datos, asegurarnos un plan de contingencia contra las caídas de servicio y en definitiva, algo que nos hace la vida más fácil<!--break-->. El problema es que este servicio no es *open source*. Así que, la idea era desarrollarlo nosotros mismos y en directo. El objetivo: un servicio de caché de doble capa. Tanto en memoria local, como en un servidor de caché distribuida. Y he aquí el resultado:

------------
La idea principal es tener una caché en memoria y una caché distribuida, ambas gestionadas por un único servicio: ICacheService.

Este servicio tiene el método GetOrSetAsync() y debería

Leer de MemoryCache (si existe devuelve el valor leído)
Leer de DistributedCache (si existe devuelve el valor de lectura) y luego establecerlo en MemoryCache
Leer de la fuente (si no existe devuelve null) y luego establecerlo en MemoryCache y DistributedCache.
Y todos los valores leídos de cualquier fuente o caché deben ser refrescados automáticamente en segundo plano a una hora determinada.

Antes de utilizar esta biblioteca, es necesario instalar el paquete NuGet:

```bash
dotnet add package CacheService
```

```csharp
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.StackExchangeRedis;

// dependencies
services.AddLogging();
services.AddMemoryCache();
services.AddDistributedMemoryCache();
```

```csharp
services.AddStackExchangeRedisCache(op => ...);
```

```csharp
// register cache service
services.AddCacheService();
```

```csharp
var cache = serviceProvider.GetRequiredService<ICacheService>();
var myCachedValue = cache.GetOrSetAsync("some-key", ct => GetValueFromDatabaseAsync(ct), cancellationToken);
```

```csharp
public WeatherForecastController(ICacheService cache)
{
    _cache = cache;
}

[HttpGet(Name = "GetWeatherForecast")]
public async Task<IActionResult> GetAsync()
{
    var model = await _cache.GetOrSetAsync("forecast", ct => GetFromDatabaseAsync(ct), HttpContext.RequestAborted);
    return Ok(model);
}
```

```csharp
ValueTask<T> GetOrSetAsync<T>(string key, CacheServiceOptions options, Func<CancellationToken, ValueTask<T>> getter, CancellationToken cancellationToken = default);
```

```csharp
services.AddLogging();
services.AddMemoryCache();
services.AddDistributedMemoryCache();
services.AddCacheService(op =>
{
    op.DefaultOptions.Memory.RefreshInterval = TimeSpan.FromSeconds(10);
    op.DefaultOptions.Distributed.RefreshInterval = TimeSpan.FromSeconds(10);

    // `HostedService` for Asp.Net Core or `Timer` for console app
    op.BackgroundJobMode = BackgroundJobMode.HostedService;
    op.BackgroundJobInterval = TimeSpan.FromSeconds(10);
});
```


https://github.com/fernandoescolar/CacheService


Si quieres ver el vídeo donde lo probamos en directo, lo encontrarás aquí:

<iframe class="youtube" src="https://www.youtube.com/embed/videoseries?list=PLrGdTMV_c2z38yU4DUthKerZZaWLaVF4w" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>