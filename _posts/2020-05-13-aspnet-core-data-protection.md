---
published: true
ID: 202005201
title: 'Asp.Net core data protection'
author: fernandoescolar
post_date: 2020-05-13 07:00:41
layout: post
tags: aspnetcore data protection dotnet
background: '/assets/uploads/2020/05/hogwarts.jpg'
---

Cuando encontré en [stackoverflow](https://stackoverflow.com/search?q=c%23+encrypt+data) mi primer algoritmo para encriptar datos, fue como entrar por primera vez en Hogwarts, la escuela de magia y hechicería. No entendía muy bien que era eso, pero podía copiar el código y hacer lo mismo en mis aplicaciones<!--break-->.

![Hogwarts](/assets/uploads/2020/05/hogwarts.jpg)

La criptografía, a pesar de ser una ciencia que resulta muy divertida, es también muy complicada. Cada algoritmo, las claves públicas, las privadas, los saltos, base64, los certificados y sus movidas.

Menos mal que Microsoft ha sacado una librería para hacer toda esta mierda sin tener que copiar código y entiendo más o menos lo mismo acerca de qué es lo que pasa por dentro.

## Quick start

Cuentan las leyendas que existe un paquete de *nuget* llamado `Microsoft.AspNetCore.DataProtection` que puedes instalar en tus aplicaciones.

Ese paquete contiene el conjuro necesario para evitar que los mortífagos se hagan con el libro de hechizos de Dumbledore. Esto es importante, si no, la batalla del bien contra el mal se decantaría del lado de *El-Que-No-Debe-Ser-Nombrado*.

Para usar este conjuro solo necesitamos sacar nuestras varitas:

```csharp
public void ConfigureServices(IServiceCollection services)
{
  // ...
  services.AddDataProtection();
}
```

Realizar un leve gesto de izquierda a derecha:

```csharp
public class SecureUserRepository
{
  private readonly IDataProtector _protector;

  public SecureUserRepository(IDataProtectionProvider protectionProvider)
  {
    _protector = protectionProvider.CreateProtector(nameof(SecureUserRepository));
  }
}
```

Y recitar los hechizos de `Protect`o `Unprotect` según la necesidad:

```csharp
public IEnumerable<UserListItem> LoadUsers()
{
  var users = ...;
  foreach(var user in users)
  {
      user.Id = _protector.Protect(user.Id);
      user.Email = _protector.Protect(user.Email);
      user.Phone = _protector.Protect(user.Phone);

      yield return user;
  }
}

public UserDetails LoadUser(string encryptedId)
{
    var id = _protector.Unprotect(encryptedId);
    var user = ...;

    return user;
}
 ```

> Wingardium Leviosa

![Wingardium Leviosa](/assets/uploads/2020/05/wingardium-leviosa.gif)

## More in depth

El secreto de su eficacia se basa en la función `CreateProtector(string)`. Según el nombre que especifiquemos, podremos llegar a desproteger un dato o no.

Vamos a preparar unas pociones para sacar lo mejor de estos hechizos:

```csharp
private readonly IDataProtectionProvider _provider;

public DataProtectionTests()
{
  var services = new ServiceCollection();
  services.AddDataProtection();
  var serviceProvider = services.BuildServiceProvider();
  _provider = _serviceProvider.GetService<IDataProtectionProvider>();
}
```

Como ya hemos visto, podríamos proteger y desproteger una cadena de texto:

```csharp
[Fact]
public void ProtectsString()
{
  const string expected = "this is a random string";

  var protector = _provider.CreateProtector(nameof(ProtectsString));
  var unreadable = protector.Protect(expected);

  var unprotector = _provider.CreateProtector(nameof(ProtectsString));
  var readable = unprotector.Unprotect(unreadable);

  Assert.NotEqual(expected, unreadable);
  Assert.Equal(expected, readable);
}
```

Y también podemos proteger `arrays` de `bytes`:

```csharp
[Fact]
public void ProtectsByte()
{
  const string expected = "this is a random string";

  var byteArray = Encoding.UTF8.GetBytes(expected);
  var protector = _provider.CreateProtector(nameof(ProtectsByte));
  var protectedBytes = protector.Protect(byteArray);

  var unprotector = _provider.CreateProtector(nameof(ProtectsByte));
  var unprotectedBytes = protector.Unprotect(protectedBytes);
  var actual = Encoding.UTF8.GetString(unprotectedBytes);

  Assert.NotEqual(protectedBytes, unprotectedBytes);
  Assert.Equal(expected, actual);
}
```

Pero si cambiamos el nombre, entonces nos encontraremos con una excepción:

```csharp
[Fact]
public void CanNotUnprotectWithDiferentProtectors()
{
  const string expected = "this is a random string";

  var protector = _provider.CreateProtector(nameof(CanNotUnprotectWithDiferentProtectors));
  var unreadable = protector.Protect(expected);

  var unprotector = _provider.CreateProtector(nameof(ProtectsString));

  Assert.Throws<CryptographicException>(() => unprotector.Unprotect(unreadable));
}
```

> Expecto Patronum

![Expecto Patronum](/assets/uploads/2020/05/expecto-patronum.gif)

## Time limited

Si añadimos el paquete de *nuget* llamado `Microsoft.AspNetCore.DataProtection.Extensions` añadimos una funcionalidad muy interesante: crear datos encriptados con fecha de caducidad, a partir de la cual, ya no se pueden desencriptar.

Para ello necesitamos añadir al leve gesto de varita de izquierda a derecha, otro movimiento de arriba a abajo:

```csharp
public class SecureTokenProvider
{
  private readonly ITimeLimitedDataProtector _protector;

  public SecureUserRepository(IDataProtectionProvider protectionProvider)
  {
    var parentProtector = protectionProvider.CreateProtector(nameof(SecureTokenProvider));

    _protector = parentProtector.ToTimeLimitedDataProtector();
  }
}
```

Y cuando recitemos el hechizo `Protect` podremos añadir el tiempo que pasará hasta que ya no podamos realizar el `Unprotect`:

```csharp
public string CreateToken()
{
  var text = ...;
  var token = _protector.Protect(text, TimeSpan.FromDays(7));

  return token;
}
```

Y podríamos probar con otra pócima, cómo al caducar la información, nos da una excepción:

```csharp
[Fact]
public void CanNotUnprotectExpiredInformation()
{
  const string expected = "this is a random string";

  var protector = _provider.CreateProtector(nameof(CanNotUnprotectExpiredInformation));
  var timeLimitedProtector = protector.ToTimeLimitedDataProtector();
  var unreadable = timeLimitedProtector.Protect(expected, TimeSpan.FromSeconds(1));

  Thread.Sleep(1001);

  var unprotector = _provider.CreateProtector(nameof(CanNotUnprotectExpiredInformation));
  var timeLimitedUnprotector = unprotector.ToTimeLimitedDataProtector();

  Assert.Throws<CryptographicException>(() => timeLimitedUnprotector.Unprotect(unreadable));
}
```

> Expelliarmus

![Expelliarmus](/assets/uploads/2020/05/expelliarmus.gif)

## Key ring

A la hora de la verdad toda esta movida es muy segura. Para proteger el libro de hechizos de Dumbledore, no solo estamos usando un movimiento de varita específico (*name*) en el método `CreateProtector`. Además, esta librería usa internamente un juego de varitas (*keys* de cifrado). Cada varita está habilitada para diferentes ocasiones y se gestionan internamente en un almacén al que llamamos *key ring*. Una suerte de tienda de Ollivander, donde ir almacenando las varitas antiguas y las nuevas, en local o de forma distribuida y de una forma segura.

Este *key ring* nos proporciona un lugar donde a pesar de que pase el tiempo, podremos ir a buscar las claves criptográficas. Nos protegerá en caso de que se generen nuevas. Y hará que todo el sistema se comporte perfectamente, incluso cuando usemos diferentes instancias o aplicaciones.

Para ello se nos permitirá definir:

### Aplicación

Por defecto, el sistema buscará el nombre de la aplicación según las dll's y el contenido que estamos ejecutando. Pero para estar seguros de que usamos el mismo *key ring* (incluso entre diferentes aplicaciones), lo mejor es poner un nombre en la configuración para nuestra aplicación:

```csharp
services.AddDataProtection()
        .SetApplicationName("shared app name");
```

### Persistencia

Podemos especificar un lugar donde almacenar las claves criptográficas. Podríamos llegar a usar una unidad local o compartida:

```csharp
services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(@"\\shared\protection\"));
```

O instalando diferentes paquetes adicionales, como por ejemplo `Microsoft.AspNetCore.DataProtection.AzureStorage`, almacenarlas en un **Azure Storage**, en **AWS**, **Redis**, ...:

```csharp
services.AddDataProtection()
        .PersistKeysToAzureBlobStorage(new Uri("<blobUriWithSasToken>"));
```

### Protección

Otro detalle que tenemos que tener en cuenta es la protección de las claves de cifrado. La librería nos provee de una serie de facilidades con las que podremos añadir una protección de estas claves por certificado:

```csharp
services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(@"\\shared\protection\"))
        .ProtectKeysWithCertificate("thumbprint");
```

O, por ejemplo, usando un **Azure Key Vault**:

```csharp
services.AddDataProtection()
        .PersistKeysToAzureBlobStorage(new Uri("<blobUriWithSasToken>"))
        .ProtectKeysWithAzureKeyVault("<keyIdentifier>", "<clientId>", "<clientSecret>");;
```

### Rotación de claves

Si no especificamos lo contrario, se irán generando nuevas claves en el *key ring* cada 90 días. Pero puede ser que esta periodicidad no nos venga bien. Pero podremos especificar cada cuantos días queremos rotarlas:

```csharp
services.AddDataProtection()
        .SetDefaultKeyLifetime(TimeSpan.FromDays(14));
```

### No generar claves automáticamente

Por último, se podría dar el caso de que no queramos que una aplicación o una instancia esclava de nuestro sistema creara claves, para ello podríamos usar la siguiente configuración:

```csharp
services.AddDataProtection()
        .DisableAutomaticKeyGeneration();
```

Básicamente, nos encontraremos con un poder absoluto sobre el comportamiento de este **key ring**. Aunque personalmente, lo que recomendaría por mi experiencia sería usar:

- Nombre de aplicación

- Azure Storage como almacenamiento

- Azure Key Vault como protección

Con estas 3 configuraciones, tendríamos un sistema de protección escalable, seguro y distribuido.

> Avada Kedavra

![Avada Kedavra](/assets/uploads/2020/05/avada-kedavra.gif)

## Otras configuraciones

Otras posibilidades de **Asp.Net Data Protection** es la personalización de el algoritmo a usar para encriptar la información:

```csharp
services.AddDataProtection()
        .UseCryptographicAlgorithms(
        new AuthenticatedEncryptorConfiguration()
        {
            EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
            ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
        });
```

Pero si esta configuración nos parece insuficiente, siempre podemos implementar un algoritmo propio:

```csharp
services.AddDataProtection()
        .UseCustomCryptographicAlgorithms(...);
```

> Alohomora

![Alohomora](/assets/uploads/2020/05/alohomora.gif)

## Conclusiones

Es genial tener este libro de magia. Nos aporta un nuevo punto de vista de la protección de la información dentro de nuestras aplicaciones en Asp.Net Core. Un estándar. Además, tienen otras aplicaciones, como podría ser la generación de tokens de validación y otras cosas relacionadas con la seguridad.

En mis proyectos lo estamos usando ya, así que...

> Obliviate

![Obliviate](/assets/uploads/2020/05/obliviate.gif)