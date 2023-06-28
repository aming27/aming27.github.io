---
published: true
ID: 201905021
title: 'Azure Functions: custom triggers'
author: fernandoescolar
post_date: 2019-05-02 07:59:43
layout: post
tags: azure-functions azure functions csharp triggers
background: '/assets/uploads/bg/thunder4.jpg'
---

Si ya sé que soy un vago. Es el tercer artículo más o menos igual que escribo. Este es sobre cómo crear _triggers_ personalizados de _Azure Functions_. Y antes ya tuvimos los de los bindings de [_out_](/2019/04/15/azure-functions-custom-out-bindings/) y de [_in_](/2019/04/23/azure-functions-custom-in-bindings/). Tenéis que entender que tengo otra vida más allá de este blog. Además, creo que al final queda mucho mejor separado<!--break-->. De cualquier forma, si no os gusta así, hago un cuarto artículo juntando el contenido de todos ;).

Hoy vamos a tratar los _custom triggers_ para _Azure Functions_. Y como ejemplo tomaremos el sistema Pub/Sub que viene incluido en _redis_. Este sistema nos permite crear suscripciones a un canal donde recibiremos los mensajes que sean publicados en él.

El funcionamiento es bastante simple, si tenemos dos consolas de _redis_ abiertas, bastará con que en la primera nos suscribamos al canal "test" y quedemos a espera:

```bash
> SUBSCRIBE test
Reading messages... (press ENTER to quit)
```

Y en la otra tendremos que publicar un mensaje:

```bash
> PUBLISH test "ola k ase"
(integer) 1
```

Entonces veremos que en la primera consola escribe la información que le ha llegado sobre dicho mensaje:

```bash
1) "subscribe"
2) "test"
3) (integer) 1
1) "message"
2) "test"
3) "ola k ase"
```

Para programar esto en dotnet core podríamos recurrir a una librería llamada `StackExchange.Redis` y tener un código semejante a este:

```csharp
var connection = ConnectionMultiplexer.Connect(redisConnectionString);
var subscriber = connection.GetSubscriber();
await subscriber.SubscribeAsync(channel, (channel, value) => { Console.WriteLine($"Message arrive: {value}"); });
```

A partir de ahora, y para variar, vamos a convertir esto en un _custom trigger_ que desencadene la ejecución de una _Azure Function_:

## Proyecto del _trigger_

Con el fin de desarrollar nuestro _custom trigger_, vamos a crear un nuevo proyecto de tipo librería de .net standard 2.0. A este proyecto le añadiremos referencias a los siguientes paquetes de NuGet:

- `Microsoft.Azure.WebJobs.Extensions` es donde encontramos los artefactos necesarios para crear nuestra extensión.
- `StackExchange.Redis` este paquete contiene una implementación cliente de _redis_.

Después definiremos nuestro atributo de _trigger_. Ese que podemos ver en los parámetros de la _Azure Function_ entre corchetes. Así que buscaremos un nombre que defina correctamente lo que queremos hacer y le añadiremos "Attribute":

```csharp
[AttributeUsage(AttributeTargets.Parameter)]
[Binding]
public class RedisSubTriggerAttribute : Attribute
{
    public string Connection { get; set; }

    public string Channel { get; set; }
}
```

Los parámetros que pediremos serán:

- `Connection`: donde almacenaremos la cadena de conexión a _redis_.
- `Channel`: el nombre del canal al que nos vamos a suscribir.

Para facilitar la captura del valor de la cadena de conexión desde los AppSettings o las variables de entorno añadiremos una función que nos ayude con la tarea:

```csharp
internal string GetConnectionString()
{
    return Environment.GetEnvironmentVariable(Connection);
}
```

Ahora que tenemos definido nuestro _trigger_, si queremos que desencadene una _Azure Function_, deberíamos definir un artefacto que implemente la interfaz genérica `IListener`:

```csharp
public class RedisSubListener : IListener
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
    }

    public void Cancel()
    {
    }

    public void Dispose()
    {
    }
}
```

Esta implementación nos permitirá definir la operación para empezar a escuchar mensajes, la de parar de escuchar mensajes, la de cancelar la escucha de mensajes y por último `Dispose` donde limpiaremos los recursos que hemos usado. Para escuchar mensajes de _redis_ podríamos tener algo parecido a esto:

```csharp
public class RedisSubListener : IListener
{
    private readonly ITriggeredFunctionExecutor _executor;
    private readonly RedisSubTriggerAttribute _attribute;
    private readonly ConnectionMultiplexer _connection;
    private ISubscriber _subscriber = null;

    public RedisSubListener(ITriggeredFunctionExecutor executor, RedisSubTriggerAttribute attribute)
    {
        _executor = executor;
        _attribute = attribute;
        _connection = ConnectionMultiplexer.Connect(attribute.GetConnectionString());
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (_subscriber != null) throw new InvalidOperationException("Redis Pub/Sub listener has alread been started");

        _subscriber = _connection.GetSubscriber();
        return _subscriber.SubscribeAsync(_attribute.Channel, OnMessageArrived);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_subscriber == null) throw new InvalidOperationException("Redis Pub/Sub listener has already been stopped");

        await _subscriber.UnsubscribeAllAsync();
        _subscriber = null;
    }

    public void Cancel()
    {
        if (_subscriber == null) return;

        _subscriber.UnsubscribeAll();
        _subscriber = null;
    }

    public void Dispose()
    {
        _connection.Dispose();
    }

    private void OnMessageArrived(RedisChannel channel, RedisValue value)
    {
        var triggerData = new TriggeredFunctionData
        {
            TriggerValue = value.ToString()
        };
        var task = _executor.TryExecuteAsync(triggerData, CancellationToken.None);
        task.Wait();
    }
}
```

Si observamos el código lo que hacemos es crear y gestionar una suscripción a un canal de _redis_ y cada vez que llegue un mensaje a esta suscripción, le indicamos a un objeto `ITriggeredFunctionExecutor` que ejecute el mensaje.

Con el objetivo de crear nuestro `IListener` y a la vez tratar la información que hemos lanzado, tendremos que crear un artefacto que implemente la interfaz `ITriggerBinding`:

```csharp
public class RedisSubTriggerBinding : ITriggerBinding
{
    public Type TriggerValueType => throw new NotImplementedException();

    public IReadOnlyDictionary<string, Type> BindingDataContract => throw new NotImplementedException();

    public Task<ITriggerData> BindAsync(object value, ValueBindingContext context)
    {
    }

    public Task<IListener> CreateListenerAsync(ListenerFactoryContext context)
    {
    }

    public ParameterDescriptor ToParameterDescriptor()
    {
    }
}
```

Lo primero que haremos será definir la creación del "escuchador" de eventos, para lo que necesitaremos el atributo del parámetro de la función y el objeto `ITriggeredFunctionExecutor`:

```csharp
private readonly ParameterInfo _parameter;

public RedisSubTriggerBinding(ParameterInfo parameter)
{
    _parameter = parameter;
}

public Task<IListener> CreateListenerAsync(ListenerFactoryContext context)
{
    var executor = context.Executor;
    var attribute = _parameter.GetCustomAttribute<RedisSubTriggerAttribute>();
    var listener = new RedisSubListener(executor, attribute);

    return Task.FromResult<IListener>(listener);
}
```

Y con el fin de "bindar" el _trigger_ al parámetro que le pasamos, implementaremos el resto de propiedades y métodos:

```csharp
public Type TriggerValueType => typeof(string);

public IReadOnlyDictionary<string, Type> BindingDataContract => new Dictionary<string, Type>();

public ParameterDescriptor ToParameterDescriptor()
{
    return new TriggerParameterDescriptor
    {
        Name = _parameter.Name,
        DisplayHints = new ParameterDisplayHints
        {
            Prompt = "RedisSub",
            Description = "RedisSub message trigger"
        }
    };
}

public Task<ITriggerData> BindAsync(object value, ValueBindingContext context)
{
    var valueProvider = new RedisSubValueBinder(value);
    var bindingData = new Dictionary<string, object>();
    var triggerData = new TriggerData(valueProvider, bindingData);

    return Task.FromResult<ITriggerData>(triggerData);
}
```

Como podemos observar, hemos creado un nuevo artefacto llamado `RedisSubValueBinder`. Este objeto implementa la interfaz `IValueBinder`, que es necesaria para definir el `TriggerData` que se usará para bindar los datos al parámetro. En nuestro caso estamos gestionando mensajes como cadenas de texto por lo que una implementación simple nos bastará:

```csharp
public class RedisSubValueBinder : IValueBinder
{
    private object _value;

    public RedisSubValueBinder(object value)
    {
        _value = value;
    }

    public Type Type => typeof(string);

    public Task<object> GetValueAsync()
    {
        return Task.FromResult(_value);
    }

    public Task SetValueAsync(object value, CancellationToken cancellationToken)
    {
        _value = value;
        return Task.CompletedTask;
    }

    public string ToInvokeString()
    {
        return _value?.ToString();
    }
}
```

Con estos dos artefactos ya tendríamos definido todo el comportamiento de nuestro _custom trigger_ que ejecutará una _Azure Function_ al recibir mensajes de un canal de Pub/Sub de _redis_. Lo que nos falta es hacerle saber al sistema que vamos a extender el comportamiento de las _Azure Functions_.

A este fin vamos a crear un nuevo artefacto que implemente `ITriggerBindingProvider`. Este objeto buscará los parámetros de nuestras _Azure Functions_ que tienen el atributo de tipo _trigger_ que creamos al principio. Y cuando lo encuentre instanciará un nuevo `RedisSubTriggerBinding` para ese parámetro:

```csharp
public class RedisSubTriggerBindingProvider : ITriggerBindingProvider
{
    public Task<ITriggerBinding> TryCreateAsync(TriggerBindingProviderContext context)
    {
        var parameter = context.Parameter;
        var attribute = parameter.GetCustomAttribute<RedisSubTriggerAttribute>(false);

        if (attribute == null) return Task.FromResult<ITriggerBinding>(null);
        if (parameter.ParameterType != typeof(string)) throw new InvalidOperationException("Invalid parameter type");

        var triggerBinding = new RedisSubTriggerBinding(parameter);

        return Task.FromResult<ITriggerBinding>(triggerBinding);
    }
}
```

Y por último implementaremos la interfaz `IExtensionConfigProvider` para crear una nueva regla que utilice el objeto `RedisSubTriggerBindingProvider` para resolver los atributos de tipo `RedisSubTriggerAttribute`:

```csharp
public class RedisSubExtensionConfigProvider : IExtensionConfigProvider
{
    public void Initialize(ExtensionConfigContext context)
    {
        var rule = context.AddBindingRule<RedisSubTriggerAttribute>();
        rule.BindToTrigger(new RedisSubTriggerBindingProvider());
    }
}
```

Para terminar y que nuestro ensamblado registre por defecto el proveedor de configuración que hemos creado, tendremos que declarar una clase tipo `Startup` donde al arrancar el _host_ de _Azure Functions_ añadiremos nuestra extensión:

```csharp
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;

[assembly: WebJobsStartup(typeof(CustomBindings.Startup))]

namespace CustomBindings
{
    public class Startup : IWebJobsStartup
    {
        public void Configure(IWebJobsBuilder builder)
        {
            builder.AddExtension<RedisSubExtensionConfigProvider>();
        }
    }
}
```

## Probando nuestro _trigger_

Si queremos ver que todo ha funcionado correctamente, podemos crear un nuevo proyecto de _Azure Functions_. Allí crearemos una nueva función que no devuelva nada, pero que sea lanzada por el _trigger_ que hemos creado:

```csharp
[FunctionName("TestRedisSub")]
public static void TestRedisSub(
    [RedisSubTrigger(Connection = "RedisConnectionString", Channel = "test")] string message,
    ILogger log)
{
    log.LogInformation("C# Redis pub/sub trigger function processed a request.");
    log.LogInformation($"Message arrived: {message}");
}
```

Para finalizar, dentro del archivo `local.settings.json` y en la propiedad `Values`, añadiremos la cadena de conexión del servidor de _redis_:

```json
 "Values": {
    "AzureWebJobsStorage": "",
    "RedisConnectionString": "xxxxx.redis.cache.windows.net:6380,password=xxxxx,ssl=True",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet"
  }
```

Ahora podemos ejecutar el proyecto. Después abrimos una consola de _redis_ y publicamos un mensaje:

```bash
> PUBLISH test "ola k ase"
(integer) 1
```

En el terminal donde se ven los logs de las _Azure Functions_ encontraremos que el mensaje ha sido procesado correctamente:

```bash
C# Redis pub/sub trigger function processed a request.
Message arrived: ola k ase
```

## Conclusiones

Cuidado con los ciclos de vida de los _triggers_.

Y lo demás, pues lo mismo de los otros días con los bindings [_in_](/2019/04/23/azure-functions-custom-in-bindings/) y [_out_](/2019/04/15/azure-functions-custom-out-bindings/). Pero en este caso es un poco más complejo.

![Deal with it](/assets/uploads/2019/04/deal-with-it.jpg)

Puedes ver el proyecto completo que hemos utilizado en este artículo en [este repositorio de Github](https://github.com/fernandoescolar/Developerro.AzureFunctions.CustomBindings).