---
published: true
ID: 202305031
title: 'Seguridad mTLS en ASP.NET Core'
author: fernandoescolar
post_date: 2023-05-03 01:04:36
layout: post
tags: aspnet aspnetcore mtls tls ssl
background: '/assets/uploads/bg/security3.jpg'
---

¡Hey! ¿Te preocupa la seguridad de tus conexiones? ¿Quieres que tus datos sean privados y confidenciales? Seguro que conoces SSL/TLS. Esto está bastante bien para proteger conexiones. Pero quizá te pueda parecez insuficiente y te interese conocer el protocolo de autenticación de transporte mutuo, o mTLS para los amigos ¡Sigue leyendo!<!--break-->

El SSL/TLS es un protocolo de seguridad de comunicaciones que proporciona autenticación, confidencialidad e integridad de los datos transmitidos entre dos dispositivos. Básicamente, funciona cifrando los datos transmitidos para que solo puedan ser descifrados por el destinatario legítimo, y autenticando la identidad de dicho destinatario a través de un certificado digital emitido por una autoridad de certificación confiable.

Es decir, el servidor envía su certificado al cliente durante el proceso de negociación SSL/TLS, y el cliente utiliza este certificado para verificar la identidad del servidor. Después de esta verificación, se establece el canal SSL/TLS y se encripta el tráfico entre el cliente y el servidor.

Este protocolo se utiliza para proteger conexiones en línea, como las transacciones comerciales, la navegación web y el correo electrónico, entre otros. Podrás reconocer una conexión segura porque los navegadores muestran un candado al lado de la dirección web y porque se añade una `s` al esquema: `ftps`, `https`, etc.

Cuando hablamos de una conexión mTLS (mutual Transport Layer Security), la capa de seguridad mutua implica que tanto el cliente como el servidor presentan sus certificados propios antes de establecer el canal SSL/TLS. Esto significa que el servidor debe verificar el certificado del cliente y el cliente debe verificar el certificado del servidor antes de que se pueda establecer la conexión entre ambos puntos.

Al final es un proceso de autenticación por parte de cliente hacia el servidor y por parte del servidor hacia el cliente antes de empezar a comunicarse. Una autenticación mutua. Una capa adicional de seguridad, que podemos añadir al protocolo SSL/TLS, y que puede ayudar a proteger nuestros servicios contra ataques maliciosos como la suplantación de identidad y el espionaje.

## Crear cetificados

Para poder probar el protocolo mTLS, necesitamos crear un certificado para el servidor y otro para el cliente. Para ello, vamos a utilizar el comando `openssl` que viene instalado por defecto en la mayoría de sistemas operativos.

Crearemos un certificado de autoridad de certificación (CA) y, en base a este, crearemos un certificado para el servidor y otro para el cliente:

1. Genera la clave privada de la CA:

```bash
openssl genrsa -out ca.key 2048
```

2. Crea la solicitud de firma de certificado (CSR) de la CA:

```bash
openssl req -new -key ca.key -out ca.csr
```

3. Crea el certificado autofirmado de la CA:

```bash
openssl x509 -req -days 365 -in ca.csr -signkey ca.key -out ca.crt
```

4. Genera la clave privada del primer servicio:

```bash
openssl genrsa -out service1.key 2048
```

5. Crea la solicitud de firma de certificado (CSR) del primer servicio:

```bash
openssl req -new -key service1.key -out service1.csr
```

6. Firma el CSR del primer servicio con el certificado de la CA para crear el certificado del primer servicio:

```bash
openssl x509 -req -days 365 -in service1.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out service1.crt
```

7. Genera la clave privada del segundo servicio:

```bash
openssl genrsa -out service2.key 2048
```

8. Crea la solicitud de firma de certificado (CSR) del segundo servicio:

```bash
openssl req -new -key service2.key -out service2.csr
```

9. Firma el CSR del segundo servicio con el certificado de la CA para crear el certificado del segundo servicio:

```bash
openssl x509 -req -days 365 -in service2.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out service2.crt
```

Esto generará un certificado de autoridad de certificación (CA) y dos certificados derivados para tus dos servicios. Los archivos ca.key y ca.crt son los archivos de la clave privada y el certificado de la CA, respectivamente. Los archivos service1.key y service1.crt son los archivos de la clave privada y el certificado del primer servicio, respectivamente. Los archivos service2.key y service2.crt son los archivos de la clave privada y el certificado del segundo servicio, respectivamente.

Ten en cuenta que estos certificados se han generado con una duración de 365 días. Puedes ajustar la duración de los certificados cambiando el valor de la opción -days en los comandos openssl x509. Además, si deseas agregar más información a los certificados, como nombres alternativos de dominio, puedes agregar opciones adicionales al comando openssl req.


## Configurar Asp.Net Core

Para configurar el protocolo mTLS en ASP.NET Core, necesitamos añadir un middleware de autenticación y configurar el servicio de autenticación para que utilice el esquema de autenticación de certificado de cliente.

Para ello, vamos a crear un proyecto de ASP.NET Core 3.1 y vamos a añadir el middleware de autenticación y el servicio de autenticación.

1. Crea un proyecto de ASP.NET Core:

```bash
dotnet new web -o DemoServer
```

2. Añade el paquete de autenticación de certificado de cliente:

```bash
dotnet add package Microsoft.AspNetCore.Authentication.Certificate
```

3. Configuramos Kestrel para que utilice el certificado del servicio 1 y para que consuma certificados de cliente. Pero evitaremos cualquier validación de estos ya que delegaremos su validación en el middleware de autenticación:

```csharp
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.ConfigureHttpsDefaults(options => {
        // Utilizamos el certificado del servicio 1
        options.ServerCertificate = X509Certificate2.CreateFromPemFile("service1.crt", "service1.key");
        // Configuramos el protocolo mTLS
        options.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
        // Aceptamos cualquier certificado de cliente porque relaizaremos la autenticación en el middleware de autenticación
        options.AllowAnyClientCertificate();
    });

});
```

4. Configuramos autenticación de tipo certificado de cliente. En este caso, vamos a utilizar el certificado de la CA para validar los certificados que nos lleguen. De esta forma validaremos que sean certificados creados por nosotros. Además, como son certificados creados por nosotros, no necesitaremos comprobar la su revocación, pero sí que comprobaremos que no estén caducados:

```csharp
builder
    .Services
    .AddAuthorization(options =>
    {
        // requiere autenticación para acceder a cualquier endpoint
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    })
    .AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        // ignoramos la revocación de los certificados
        options.RevocationMode = X509RevocationMode.NoCheck;
        // validamos la fecha de caducidad
        options.ValidateValidityPeriod = true;
        // validamos que el certificado sea de tipo chained
        options.AllowedCertificateTypes = CertificateTypes.Chained;
        // le indicamos que la cadena de confianza la vamos a especificar nosotros
        options.ChainTrustValidationMode = X509ChainTrustMode.CustomRootTrust;
        // añadimos la CA como raíz de confianza
        var rootcert = new X509Certificate2("ca.crt");
        options.CustomTrustStore.Clear();
        options.CustomTrustStore.Add(rootcert);
    });
```

5. Añadimos el middleware para requerir HTTPS, el de autenticación, autorización y un *endpoint* de prueba:

```csharp
var app = builder.Build();
app.UseHttpsRedirection(); // Añadimos el middleware de redirección HTTPS
app.UseAuthentication(); // Añadimos el middleware de autenticación
app.UseAuthorization(); // Añadimos el middleware de autorización
app.MapGet("/", () => "Hello World!");
app.Run();
```

6. Ejecutamos el proyecto:

```bash
dotnet run
```

7. Accedemos a la URL `https://localhost:5001` y veremos que ni siquiera establece la conexión SSL/TLS:

```bash
$ curl -k https://localhost:5001/
curl: (52) Empty reply from server
```

8. Ahora vamos a añadir el certificado del servicio 2 a la petición y veremos que responde correctamente:

```bash
$ curl -k --cert service2.crt --key service2.key https://localhost:5001/
Hello World!%
```

9. Y si añadimos otro certificado cualquier de otra CA, responderá con el código de error 403:

```bash
$ curl -k -i --cert other.crt --key other.key https://localhost:5001/
HTTP/1.1 403 Forbidden
Content-Length: 0
Date: Sun, 26 Mar 2023 16:52:16 GMT
Server: Kestrel
```

## Configurar HttpClient

Ya hemos visto como configurar el protocolo mTLS en un servidor ASP.NET Core. Ahora vamos a ver como configurar el protocolo mTLS en un cliente que consuma un *endpoint* de ese servidor. Para ello, vamos a utilizar la clase `HttpClient`.

Para configurar el protocolo mTLS en HttpClient, necesitamos realizar dos pasos: configurar el certificado de cliente y configurar la validación del certificado del servidor. Para ello, vamos a crear un proyecto de consola y vamos a realizar las dos configuraciones.

1. Crea un proyecto de consola:

```bash
dotnet new console -o DemoClient
```

2. Creamos un objeto `HttpClientHandler` y le añadimos el certificado del servicio 2:

```csharp
var handler = new HttpClientHandler();
handler.ClientCertificates.Add(X509Certificate2.CreateFromPemFile("service2.crt", "service2.key"));
```

3. Validamos que el certificado del servidor es válido. Para ello, vamos a utilizar el certificado de la CA para validar los certificados que nos lleguen. De esta forma validaremos que sean certificados creados por nosotros. Además, como son certificados creados por nosotros, no necesitaremos comprobar la su revocación, pero sí que comprobaremos que no estén caducados:

```csharp
handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) =>
{
    // creamos una política de validación de certificados
    var chainPolicy = new X509ChainPolicy
    {
        // ignoramos la revocación de los certificados
        RevocationFlag = X509RevocationMode.NoCheck,
        // validamos la cadena de certificados
        RevocationMode = X509RevocationFlag.EntireChain,
        // le indicamos que la cadena de confianza la vamos a especificar nosotros
        TrustMode = X509ChainTrustMode.CustomRootTrust,
        // validamos la fecha de caducidad
        VerificationTimeIgnored = false
    };

    // añadimos la CA como raíz de confianza
    var rootcert = new X509Certificate2("/Users/fernando.escolar/projects/mtls-demo/ca.crt");
    chainPolicy.CustomTrustStore.Clear();
    chainPolicy.CustomTrustStore.Add(rootcert);

    // asignamos la política de validación a la cadena de certificados
    chain ??= new X509Chain();
    chain.ChainPolicy = chainPolicy;

    // validamos el certificado que nos viene del servidor
    var certificateIsValid = chain.Build(cert);
    return certificateIsValid;
};
```

4. Creamos el objeto `HttpClient` y le pasamos el `HttpClientHandler`:

```csharp
var client = new HttpClient(handler);
```

5. Hacemos una petición a la URL del servicio 1:

```csharp
var response = await client.GetAsync("https://localhost:5001/");
Console.WriteLine(response.StatusCode);
Console.WriteLine(await response.Content.ReadAsStringAsync());
```

6. Ejecutamos el proyecto y veremos que nos devuelve el código 200 y el mensaje `Hello World!`:

```bash
$ dotnet run
OK
Hello World!
```

## Conclusiones

El uso de mTLS para el tráfico interno entre servicios es una práctica recomendada para garantizar la seguridad y la integridad de los datos en una aplicación. Un ejemplo sería En una red interna o en un cluster de Kubernetes, donde los servicios se comunican entre sí a través de una red privada pero queremos estar protegidos de ataques externos.

Además en estos escenarios podríamos beneficiarnos del uso de CertManager para la gestión y renovación automática de los certificados. Añadiendo una nueva capa de seguridad a nuestra aplicación.

Pero es importante tener en cuenta que su uso, es muy posible que aumente la complejidad de la infraestructura de la aplicación y que requiera de una mayor gestión. Sin embargo, los beneficios en términos de seguridad suelen compensar estos costos adicionales.

