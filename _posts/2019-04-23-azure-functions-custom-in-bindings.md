---
published: true
ID: 201904231
title: 'Azure Functions: custom in bindings'
author: fernandoescolar
post_date: 2019-04-23 07:44:11
layout: post
tags: azure-functions azure functions csharp bindings
background: '/assets/uploads/bg/thunder3.jpg'
---

El otro día veíamos [cómo crear _custom out bindings_ para _Azure Functions_](/2019/04/15/azure-functions-custom-out-bindings), así que hoy me he visto obligado a tratar los _custom in bindings_ o de entrada. Para ello utilizaremos de ejemplo la creación de un _binding_ que lea un valor (secret) del servicio Azure Key Vault<!--break-->.

Una de las formas que tenemos de acceder a una cuenta de Key Vault desde dotnet core, es utilizando una cuenta de acceso tipo _Service Principal_ (o _App Registration_ en el portal de azure) de _Azure Active Directory_. De esta forma tendremos dos parámetros necesarios para recoger un _token_ de acceso: un `client_id` y `client_secret`. Entonces, solo tendríamos que utilizar la clase `AuthenticationContext` que encontraremos en el paquete de NuGet `Microsoft.IdentityModel.Clients.ActiveDirectory`, para realizar la petición:

```csharp
var keyVaultClient = new KeyVaultClient(async (authority, resource, scope) =>
    {
        var authContext = new AuthenticationContext(authority);
        var clientCredential = new ClientCredential(client_id, client_secret);
        var result = await authContext.AcquireTokenAsync(resource, clientCredential).ConfigureAwait(false);
        return result.AccessToken;
    });
```

Una vez tenemos instanciado nuestro objeto de tipo `KeyVaultClient`, solo tendremos que realizar una llama a una función que realizará toda la magia por nosotros:

```csharp
var secret = await keyVaultClient.GetSecretAsync(input.SecretIdentifier, cancellationToken);
Console.WrilteLine(secret.Value);
```

## Proyecto de _binding_

Con el fin de desarrollar nuestro _custom binding_, vamos crear un nuevo proyecto de tipo librería de .net standard 2.0. A este proyecto le añadiremos referencias a los siguientes paquetes de NuGet:

- `Microsoft.Azure.WebJobs.Extensions` es donde encontramos los artefactos necesarios para crear nuestra extensión.
- `Microsoft.Azure.KeyVault` es el paquete que contiene el cliente de Azure Key Vault.
- `Microsoft.IdentityModel.Clients.ActiveDirectory` aquí encontraremos las clases necesarias para obtener un token de Azure Active Directory.

Después definiremos nuestro atributo de _binding_. Ese que podemos ver en los parámetros de la _Azure Function_ entre corchetes. Así que buscaremos un nombre que defina correctamente lo que queremos hacer y le añadiremos "Attribute":

```csharp
[AttributeUsage(AttributeTargets.Parameter)]
[Binding]
public class KeyVaultSecretAttribute : Attribute
{
    public KeyVaultSecretAttribute()
    {
    }

    public KeyVaultSecretAttribute(string key)
    {
        SecretIdentifier = key;
    }

    public string ClientId { get; set; }

    public string ClientSecret { get; set; }

    public string SecretIdentifier { get; set; }
}
```

Con estos parámetros tendríamos todo lo necesario para realizar una petición de un secreto. Además, hemos delimitado el uso de este atributo a parámetros de una función. Y con el decorador `Binding` indicamos que es un atributo que sirve para _bindar_ valores usando el SDK de _Azure WebJobs_.

Una forma de añadir facilidades a esta clase sería crear una propiedad `Connection` decorada con el atributo `AppSetting`, que indica que es un parámetro que se recoge de las variables de entorno o del archivo `local.settings.json`. La idea es que esta propiedad contenga una cadena de conexión con el formato: "client_id=xxxx;client_secret=yyyyy":

```csharp
[AppSetting]
public string Connection { get; set; }
```

Y podríamos añadirle una serie de métodos para convertir la cadena de conxión en los valores que esperamos y para validarlos:

```csharp
internal void Validate()
{
    Autofill();
    if (string.IsNullOrEmpty(ClientId) || string.IsNullOrEmpty(ClientSecret))
    {
        throw new ArgumentException("You should specify 'client_id' and 'client_secret' KeyVaultSecret binding parameters.");
    }

    if (string.IsNullOrEmpty(SecretIdentifier))
    {
        throw new ArgumentException("You should specify 'secret identifier' KeyVaultSecret binding parameters.");
    }
}

private void Autofill()
{
    if (string.IsNullOrEmpty(Connection)) return;

    var values = Connection.Split(';').ToDictionary(x => x.Split('=')[0].Trim().ToLowerInvariant(), x => x.Split('=')[1].Trim());

    if (values.ContainsKey("client_id"))
    {
        ClientId = values["client_id"];
    }

    if (values.ContainsKey("client_secret"))
    {
        ClientSecret = values["client_secret"];
    }
}
```

Ahora que tenemos definido nuestro _binding_, si queremos usarlo como parámetro de entrada, deberíamos definir un artefacto que implmente la interfaz genérica `IConverter<T,S>` o para métodos asíncronos `IAsyncConverter<T,S>`. Donde:

- `T` es el tipo del atributo que usamos para marcar el _binding_. En este caso `KeyVaultSecretAttribute`.
- `S`es el tipo de objeto que va a devolder. En _Azure Key Vault_ un secreto se almacena en formato de cadena de texto, por lo que será un `string`.

```csharp
public class KeyVaultSecretAsyncConverter : IAsyncConverter<KeyVaultSecretAttribute, string>
{
    public async Task<string> ConvertAsync(KeyVaultSecretAttribute input)
    {
    }
}
```

La implementación basada en el código que indicamos al inicio de este documento sería:

```csharp
public async Task<string> ConvertAsync(KeyVaultSecretAttribute input, CancellationToken cancellationToken)
{
    input.Validate();
    using (var client = CreateClient(input.ClientId, input.ClientSecret))
    {
        var secret = await client.GetSecretAsync(input.SecretIdentifier, cancellationToken);
        return secret.Value;
    }
}

private static KeyVaultClient CreateClient(string clientId, string clientSecret)
{
    return new KeyVaultClient(async (authority, resource, scope) =>
    {
        var authContext = new AuthenticationContext(authority);
        var clientCredential = new ClientCredential(clientId, clientSecret);
        var result = await authContext.AcquireTokenAsync(resource, clientCredential).ConfigureAwait(false);
        if (result == null)
        {
            throw new InvalidOperationException("Failed to obtain the JWT token");
        }

        return result.AccessToken;
    });
}
```

Donde validaríamos la información que almacena nuestro _binding_ y acto seguido realizaríamos la petición al cliente, obteniendo así el secreto.

Con estos dos artefactos ya tendríamos definido todo el comportamiento de nuestro _custom binding_ que leerá valores de una cuenta de _Azure Key Vault_. Lo que nos falta es hacerle saber al sistema que vamos a extender el comportamiento de las _Azure Functions_, para lo que tendremos que crear un nuevo artefacto que implemente `IExtensionConfigProvider`:

```csharp
public class KeyVaultExtensionConfigProvider : IExtensionConfigProvider
{
    public void Initialize(ExtensionConfigContext context)
    {
        var rule = context.AddBindingRule<KeyVaultSecretAttribute>();
        rule.AddValidator(ValidateKeyVaultSecretAttribute);
        rule.BindToInput(new KeyVaultSecretAsyncConverter());
    }

    private static void ValidateKeyVaultSecretAttribute(KeyVaultSecretAttribute attribute, Type parameterType)
    {
        attribute.Validate();
    }
}
```

En este proveedor de configuración indicaremos que vamos a crear un nuevo _binding_ usando el atributo `KeyVaultSecretAttribute`. A esta nueva regla le añadiremos una validación que comprobará que los datos del atributo son correctos. Y finalmente, le indicaremos que es un _binding_ de tipo entrada con la función `BindToInput`.

Cuando indicamos que es un _binding_ de entrada de datos, hemos visto que tenemos la variante de devolver una instancia de un objeto de tipo `IConverter`o `IAsyncConverter`, pero en realidad también admite una función. A mi, personalmente, me parece más elegante definir un "converter", pero cuando estamos hablando de poca lógica, es posible que con una simple lambda quede resuelto.

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
            builder.AddExtension<KeyVaultExtensionConfigProvider>();
        }
    }
}
```

## Probando nuestro binding

Si queremos ver que todo ha funcionado correctamente, podemos crear un nuevo proyecto de _Azure Functions_. Crearemos una función que responda a una petición HTTP y cuyo nivel de acceso sea `Anonymous`:

```csharp
[FunctionName("TestKeyVaultSecret")]
public static IActionResult TestKeyVaultSecret(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
    ILogger log)
{
}
```

Ahora añadiremos un parámetro de tipo `string` y lo decoraremos con el atributo `KeyVaultSecret`. Para que esto funcione, especificaremos la URL que identifica nuestro secreto e indicaremos que la conexión que va a usar está en el `AppSetting` con nombre "KeyVaultConnectionString":

```csharp
[FunctionName("TestKeyVaultSecret")]
public static IActionResult TestKeyVaultSecret(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
    [KeyVaultSecret("https://my.vault.azure.net/secrets/MyKey", Connection = "KeyVaultConnectionString")] string secret,
    ILogger log)
{
    log.LogInformation("C# HTTP trigger function processed a request.");
    return new OkObjectResult($"Your secret: {secret}");
}
```

Para finalizar, dentro del archivo `local.settings.json` y en la propiedad `Values`, añadiremos la cadena de conexión con los datos del _Service Principal_ al que dimos acceso:

```json
 "Values": {
    "AzureWebJobsStorage": "",
    "KeyVaultConnectionString": "client_id=xxxx;client_secret=yyyyy",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet"
  }
```

Ahora podemos ejecutar el proyecto, llamar a la función con nuestro browser preferido y ver cómo imprime por pantalla el valor almacenado en un secreto de una cuenta de _Azure Key Vault_.

## Conclusiones

Pues lo mismo del otro día pero con _in_ en lugar de _out_.

![Deal with it](/assets/uploads/2019/04/deal-with-it.jpg)

Puedes ver el proyecto completo que hemos utilizado en este artículo en [este repositorio de Github](https://github.com/fernandoescolar/Developerro.AzureFunctions.CustomBindings).