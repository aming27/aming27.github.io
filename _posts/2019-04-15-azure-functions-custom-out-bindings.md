---
published: true
ID: 201904151
title: 'Azure Functions: custom out bindings'
author: fernandoescolar
post_date: 2019-04-15 07:59:45
layout: post
tags: azure-functions azure functions csharp bindings
background: '/assets/uploads/bg/thunder2.jpg'
---

La gran ventaja en de Azure Functions frente a otra tecnología es que escribes muy poco código, ya que solo debes gestionar como fluyen los datos usando unos _bindings_ de entrada y salida. El propio SDK nos aporta un buen conjunto por defecto de _bindings_ que nos ayudarán a tratar con peticiones HTTP, Azure Storage Account (Blob, Queue y Table), Service Bus o Cosmos DB. Pero ¿y si quiero integrarme con otro sistema no soportado?<!--break-->

Afortunadamente en la v2 de Azure Functions, basadas en dotnet core, podemos encontrar un sistema de extensión en el que podremos crearnos todo tipo de _bindings_ y _triggers_ personalizados.

En este artículo vamos a crear un _out binding_ que nos ayudará a realizar un simple envío de emails basándonos en una conexión SMTP.

Generalmente, cuando queramos enviar un email usando el protocolo SMTP desde dotnet core, usaremos un código muy semejante a este:

```csharp
var smtp = new SmtpClient(host, port);
smtp.EnableSsl = useSsl;
smtp.Credentials = new NetworkCredential(user, password);

var fromAddress = new MailAddress(from);
var toAddress = new MailAddress(to);
var message = new MMessage(fromAddress, toAddress);
message.Subject = subject;
message.Body = body;

await smtp.SendMailAsync(message);
```

Lo que vamos a hacer es crear un nuevo proyecto con un _binding_ que nos facilitará esta tarea. Para ello, crearemos una nueva solución de tipo librería de .net standard 2.0 y añadiremos una referencia al paquete de NuGet `Microsoft.Azure.WebJobs.Extensions`, que es donde encontramos todo lo necesario para crear nuestra extensión.

Después definiremos nuestro atributo de _binding_. Ese que podemos ver en los parámetros de la _Azure Function_ entre corchetes. Así que buscaremos un nombre que defina correctamente lo que queremos hacer y le añadiremos "Attribute":

```csharp
[AttributeUsage(AttributeTargets.ReturnValue | AttributeTargets.Parameter)]
[Binding]
public class MailSendAttribute : Attribute
{
    public string Host { get; set; }

    public int Port { get; set; }

    public string User { get; set; }

    public string Password { get; set; }

    public bool UseSsl { get; set; }
}
```

Le hemos añadido ciertas características para delimitar el uso de este atributo solo como valor devuelto por una función o como parámetro de esta. Y hemos añadido una serie de propiedades que nos ayudan a definir una conexión SMTP.

Pero quizá encontremos demasiado tedioso ir definiendo propiedad por propiedad y nos puede resultar más sencillo usar un `AppSetting` que contenga una especie de cadena de conexión a nuestro servidor. Para ello vamos a añadir una propiedad llamada `Connection` y la vamos a decorar con el atributo `AppSetting` para que el sistema interprete que este valor lo debe leer de las variables de entorno o del archivo `local.settings.json`:

```csharp
[AppSetting]
public string Connection { get; set; }
```

Y para rellenar todas las propiedades de `MailSendAttribute`, vamos a añadir una función que nos ayude a transformar esa cadena de conexión:

```csharp
internal void Autofill()
{
    if (string.IsNullOrEmpty(Connection)) return;

    var values = Connection.Split(';').ToDictionary(x => x.Split('=')[0].Trim().ToLowerInvariant(), x => x.Split('=')[1].Trim());

    if (values.ContainsKey("host"))
    {
        Host = values["host"];
    }

    if (values.ContainsKey("port") && int.TryParse(values["port"], out int port))
    {
        Port = port;
    }

    if (values.ContainsKey("user"))
    {
        User = values["user"];
    }

    if (values.ContainsKey("password"))
    {
        Password = values["password"];
    }

    if (values.ContainsKey("usessl") && bool.TryParse(values["usessl"], out bool useSsl))
    {
        UseSsl = useSsl;
    }

    if (string.IsNullOrEmpty(Host) || Port <= 0)
    {
        throw new ArgumentException("You should specify 'Host' and 'Port' SMTP connection parameters.");
    }
}
```

Para definir una cadena de conexión válida para tiempo de desarrollo, iremos al archivo `local.settings.json` y en la propiedad `Values` añadiremos:

```json
 "Values": {
    "SmtpConnectionString": "Host=smtp.server.com;Port=587;User=myUser;Password=myPassword;UseSsl=true"
  }
```

Ya tenemos definido nuestro atributo de _binding_, ahora definiremos el tipo de objeto que vamos a manejar. En este caso será un email, para lo que crearemos un nuevo objeto serializable a JSON con los datos necesarios:

```csharp
public class MailMessage
{
    [JsonProperty("from")]
    public string From { get; set; }

    [JsonProperty("to")]
    public string To { get; set; }

    [JsonProperty("subject")]
    public string Subject { get; set; }

    [JsonProperty("body")]
    public string Body { get; set; }
}
```

Ya tenemos un atributo y el objeto que va a utilizar nuestro _binding_, ahora tendremos que definir el recolector, el manejador o como queramos llamar al artefacto que va a gestionar la dirección _out_ del _binding_. Esta clase debe implementar la interfaz genérica `IAsyncCollector<T>`, donde `T` es el objeto manejado. Para este caso `MailMessage`:

```csharp
public class MailAsyncCollector : IAsyncCollector<MailMessage>
{
    public Task AddAsync(MailMessage item, CancellationToken cancellationToken = default)
    {
    }

    public Task FlushAsync(CancellationToken cancellationToken = default)
    {
    }
}
```

Por cuestiones de simplicidad, en lugar de usar nuestro artefacto `IAsyncCollector` como un acumulador, vamos a hacer que envíe directamente los emails con forme los tenga. Aunque esta no es la implementación recomendada, si que la podremos probar y comprobar que funciona correctamente.

para ello, añadiremos un constructor en el que le pasaremos el atributo de _binding_. De este objeto de tipo `MailSendAttribute` vamos a recoger los parámetros de conexión con el servidor SMTP y del objeto `MailMessage` sacaremos los datos necesarios para enviar el email por el servidor ya definido:

```csharp
private readonly MailSendAttribute _binding;

public MailAsyncCollector(MailSendAttribute binding)
{
    _binding = binding;
    _binding.Autofill();
}

public async Task AddAsync(MailMessage item, CancellationToken cancellationToken = default)
{
    using (var smtp = CreateSmtpClient(_binding))
    {
        var message = CreateMailMessage(item);
        await smtp.SendMailAsync(message);
    }
}

public Task FlushAsync(CancellationToken cancellationToken = default)
{
    return Task.CompletedTask;
}

private static SmtpClient CreateSmtpClient(MailSendAttribute binding)
{
    var smtp = new SmtpClient(binding.Host, binding.Port);
    smtp.EnableSsl = binding.UseSsl;

    if (!string.IsNullOrEmpty(binding.User) && !string.IsNullOrEmpty(binding.Password))
    {
        smtp.Credentials = new NetworkCredential(binding.User, binding.Password);
    }

    return smtp;
}

private static System.Net.Mail.MailMessage CreateMailMessage(MailMessage mail)
{
    var from = new MailAddress(mail.From);
    var to = new MailAddress(mail.To);
    var message = new System.Net.Mail.MailMessage(from, to);
    message.Subject = mail.Subject;
    message.Body = mail.Body;

    return message;
}
```

Con estos tres artefactos tendremos definido todo el comportamiento de nuestro _custom binding_ que nos ayuda en el envío de emails. Lo que nos falta es hacerle saber al sistema que vamos a extender el comportamiento de las _Azure Functions_, para lo que tendremos que crear un nuevo artefacto que implemente `IExtensionConfigProvider`:

```csharp
public class MailExtensionConfigProvider : IExtensionConfigProvider
{
    public void Initialize(ExtensionConfigContext context)
    {
        // add json to MailMessage mapper
        context.AddConverter<JObject, MailMessage>(input => input.ToObject<MailMessage>());

        // add output custom binding
        context
            .AddBindingRule<MailSendAttribute>()
            .BindToCollector(attr => new MailAsyncCollector(attr));
    }
}
```

En este proveedor de configuración indicaremos cómo vamos a mapear un `MailMessage`(por si lo quisiéramos usar con otro lenguaje de programación como JavaScript) y definiremos el _out binding_ indicando el atributo y el `IAsyncCollector` que hemos creado.

Finalmente, para que nuestro ensamblado registre por defecto el proveedor de configuración que hemos creado, tendremos que declarar una clase tipo `Startup` donde al arrancar el _host_ de _Azure Functions_ añadiremos nuestra extensión:

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
            builder.AddExtension<MailExtensionConfigProvider>();
        }
    }
}
```

## Probando nuestro binding

Si queremos ver que todo ha funcionado correctamente, podemos crear un nuevo proyecto de _Azure Functions_. Crearemos una función que responda a una petición HTTP y cuyo nivel de acceso sea `Anonymous`:

```csharp
[FunctionName("HelloWorld")]
public static IActionResult Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
    ILogger log)
{
    log.LogInformation("C# HTTP trigger function processed a request.");

    string name = req.Query["name"];

    return name != null
        ? (ActionResult)new OkObjectResult($"Hello, {name}")
        : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
}
```

Ahora añadiremos un parámetro de salida con el binding, indicando el nombre del `AppSetting` de la cadena de conexión. En este caso "SmtpConnectionString". Y en el cuerpo de la función añadiremos los datos necesarios para enviar el email:

```csharp
[FunctionName("HelloWorld")]
public static IActionResult Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
    [MailSend(Connection = "SmtpConnectionString")] out MailMessage message,
    ILogger log)
{
    log.LogInformation("C# HTTP trigger function processed a request.");

    string name = req.Query["name"];

    message = new MailMessage();
    message.From = "noreply@developerro.com";
    message.To = "fernando.escolar@developerro.com";
    message.Subject = "Binding Demo";
    message.Body = $"Deal with it {name}!";


    return name != null
        ? (ActionResult)new OkObjectResult($"Hello, {name}")
        : new BadRequestObjectResult("Please pass a name on the query string or in the request body");
}
```

Para finalizar, dentro del archivo `local.settings.json` y en la propiedad `Values`, añadiremos la cadena de conexión con nuestro servidor SMTP:

```json
 "Values": {
    "AzureWebJobsStorage": "",
    "SmtpConnectionString": "Host=smtp.server.com;Port=587;User=myUser;Password=myPassword;UseSsl=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet"
  }
```

Ahora podemos ejecutar el proyecto, llamar a la función con nuestro browser preferido y ver cómo nos llega un email a la cuenta que hayamos configurado.

## Conclusiones

Las _Azure Functions_ son una herramienta muy potente, que nos permite escribir muy poco código. Cada día que las utilizo me gustan más. Y sabiendo como crear _bindings_ personalizados, podemos conseguir centrarnos aun más, tan solo, en la parte más importante de nuestro código.

Una excelente manera de convertir 10 líneas de código, que podrían ser una función compartida, en cinco clases. Pero, a la vez, molar que te cagas, por lo guapo que queda meter un atributo decorando una propiedad marcada con `out` y que automágicamente realice una acción más o menos compleja.

![Deal with it](/assets/uploads/2019/04/deal-with-it.jpg)

Puedes ver el proyecto completo que hemos utilizado en este artículo en [este repositorio de Github](https://github.com/fernandoescolar/Developerro.AzureFunctions.CustomBindings).