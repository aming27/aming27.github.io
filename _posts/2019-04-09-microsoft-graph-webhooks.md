---
published: true
ID: 201904091
title: ' Microsoft Graph: Webhooks'
author: fernandoescolar
post_date: 2019-04-09 07:58:12
layout: post
tags: azure microsoft graph webhooks
---

Es el día en el que salen a la venta las entradas de la [Comic-Con](https://www.comic-con.org/), o cualquier evento grande, de semejante calado, como el Global Azure Bootcamp (en [Madrid](https://azurebootcamp.es/), [Barcelona](https://catazurebootcamp.azurewebsites.net/) o incluso en Seattle). Cuando publicas un nuevo _post_ en tu blog y todavía no se ha actualizado. Si estás usando autenticación de doble factor y aun no ha llegado el email de verificación. El caso es que toda situación semejante, acaba igual: aporreando la tecla F5<!--break-->.

![Martillo neumático en tecla F5](/assets/uploads/2019/04/jackhammerf5.gif)

Así nacieron los [ataques DDoS](https://media.giphy.com/media/1zSz5MVw4zKg0/giphy.gif).

Porque estamos en una sociedad que está acostumbrada a tener todo de forma inmediata. Internet nos ha abierto a un mundo de servicios creados para, en apariencia, hacernos más felices. Hemos olvidado los modales en un mundo cada vez más egocentrista, en el que "quiero" y "ahora", han sustituido palabras tan elegantes como "podrías" y "por favor".

Esta forma de pensar también ha cambiado nuestra forma de programar. Ya no dudamos en realizar llamadas continuas a un servicio hasta obtener una respuesta. No nos preocupa machacar una API desde un bucle infinito en código cliente. Y eso de los _WebSockets_ es que no los implementa casi nadie.

En este grosero mundo de los _Thin Clients_, de las páginas Web pesadas, de _APIs Rest_ y de los servicios distribuidos que interactúan unos con otros, los Webhooks son la **cortesía**.

Es lo más parecido a decirle a un cliente que te alegra mucho su interés, pero que aún no tienes lo que está buscando. No obstante, no tiene por qué preocuparse debido a que le avisarás tan pronto esté disponible. Y tan pronto tengas lo que te pedían, acercarte por su casa para avisarle.

## Webhook

El término de Webhook fue originariamente propuesto por [Jeff Lindsay](https://twitter.com/progrium) en 2007, en un [artículo de su blog](https://web.archive.org/web/20180630220036/http://progrium.com/blog/2007/05/03/web-hooks-to-revolutionize-the-web/), como una propuesta para un prototipo en el que estaba trabajando.

La idea era que, basándose en las tecnologías que existían (en esa época no se habían definido los WebSockets), crear un sistema de callbacks web. De alguna forma, un cliente enviaría una petición indicando que tipo de eventos quiere "escuchar" y una URL. Después, el sistema enviaría peticiones POST indicando detalles de los eventos con forme estos ocurrieran.

De esta forma surgieron las implementaciones que podemos encontrar hoy en día de Webhooks, donde no hay un estándar definido, pero más o menos todos los proveedores están haciendo implementaciones parecidas:

- Primero se crea una suscripción en la que indicaremos la URL que va a recibir los Webhooks, los tipos de evento a los que se suscribe y una contraseña.
- Antes de crearse la suscripción, se valida que esa URL responde a una llamada tipo "echo": Se envía una cadena de texto y la URL debería devolver esa misma cadena.
- Cuando suceden eventos, el sistema original envía peticiones POST a la URL indicada con los detalles de estos.
- A esa petición, se le añade la contraseña que se especificó en la creación de la suscripción. De esta forma, podemos validar que es una llamada válida.

![Your Webhool is going to be legen... wait fo it to be approved... dary!](/assets/uploads/2019/04/webhook-legendary.jpg)

## Webhooks en Microsoft Graph

Microsoft Graph, como toda buena API contemporánea, nos propone una relación basada en la amabilidad y la educación. Así que, tiene implementado un sistema de Webhooks que podremos encontrar en su documentación con el nombre de [notificaciones](https://docs.microsoft.com/en-us/graph/api/resources/webhooks?view=graph-rest-1.0).

Para poder usar los Webhooks, antes tendremos que tener acceso al Microsoft Graph, con un _token_ válido (puedes leer acerca de esto en [el artículo anterior](/2019/04/02/microsoft-graph/)). Y antes de poder recibir notificaciones tendremos que crear una suscripción:

### Subscriptions

Para crear una suscripción tendremos que tener permiso de lectura sobre el recurso acerca del que deseamos recibir notificaciones. Por ejemplo,  si es un email, necesitaremos el permiso de "Mail.Read", o si es un usuario, el "User.Read".

Después tendremos que realizar una petición POST a la URL de las suscripciones con unos datos en formato JSON:

```http
POST https://graph.microsoft.com/v1.0/subscriptions
Content-type: application/json
Authorization: Bearer ...

{
   "changeType": "updated",
   "notificationUrl": "https://mydomain.com/webhook-handler",
   "resource": "groups",
   "expirationDateTime":"2019-04-10T18:23:45.9356913Z",
   "clientState": "my-secret-text"
}
````

Donde:

- `changeType`: puede tener valores "created", "updated" or "deleted". No obstante, un `resource` raíz (como por ejemplo "groups" o "users") no pueden tener el tipo "created".

- `notificationUrl`: es la URL donde se aloja nuestro capturador de eventos.

- `resource`: es el tipo de recurso del que se quieren recibir eventos de cambio. Se corresponde con el _path_ del recurso en el propio Graph. Por ejemplo si quiero recibir cambios de usuarios, la URL es "https://graph.microsoft.com/v1.0/users" y el _path_ será "users". O si deseo recibir cambios en mi inbox, cuya URL es "https://graph.microsoft.com/v1.0/me/mailFolders('Inbox')/messages", entonces pondré como valor "me/mailFolders('Inbox')/messages".

- `expirationDateTime`: es la fecha y la hora en la que la suscripción caducará. Para Mail, Calendar, Contacts y elementos raíz no podrá ser mayor de 4230 minutos (menos de 3 días). Y para alertas de seguridad, 43200 (menos de 30 días).

- `clientState`: es la contraseña o secreto que será enviado a nuestra URL para validar la autenticidad del mensaje.

Como hemos visto, los tiempos de expiración de una suscripción son bastante cortos, por lo que podría ser interesante realizar una Azure Function que cada cierto tiempo comprobara que existe la suscripción y en caso negativo, la creara. De esta forma, siempre estaríamos suscritos.

Un ejemplo sería el siguiente:

```csharp
#r "Newtonsoft.Json"

using System;
using System.Net;
using System.Net.Http.Headers;
using Newtonsoft.Json;

const string tenantId = "....";
const string clientId = "....";
const string clientSecret = "....";

const string notificationUrl = "https://mywebhooks.com/webhook-handler";
const string notificationSecret = "MySuperSecretValueYouNeverWillKnow";

public static async Task Run(TimerInfo myTimer, ILogger log)
{
    log.LogInformation("Checking if subscription exists");
    var auth = await GetTokenAsync(tenantId, clientId, clientSecret);
    await CreateSubscriptionIfNotExits(log, auth, notificationUrl, notificationSecret);
    log.LogInformation("Done");
}
````

Aquí declararíamos las variables que necesitamos para funcionar. Lo primer sería definir el _tenant_, el *client_id* y el *client_secret* para solicitar el _token_. Y después definiríamos la URL y la contraseña de el capturador de eventos.

Para obtener un _token_:

```csharp
class AuthResponse
{
    [JsonProperty("access_token")]
    public string AccessToken { get; set; }

    [JsonProperty("token_type")]
    public string Type { get; set; }

    [JsonProperty("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonProperty("ext_expires_in")]
    public int ExtExpiresIn { get; set; }

    public AuthenticationHeaderValue AsHeader()
    {
        return new AuthenticationHeaderValue(Type, AccessToken);
    }
}

static async Task<AuthResponse> GetTokenAsync(string tenantId, string clientId, string clientSecret)
{
    var url = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token";
    var data = new Dictionary<string, string>();
    data.Add("grant_type", "client_credentials");
    data.Add("client_id", clientId);
    data.Add("client_secret", clientSecret);
    data.Add("scope", "https://graph.microsoft.com/.default");

    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        var response =  await client.PostAsync(url, new FormUrlEncodedContent(data));
        var json = await response.Content.ReadAsStringAsync();
        var res = JsonConvert.DeserializeObject<AuthResponse>(json);
        return res;
    }
}
```

Y finalmente validaríamos si existe o no la suscripción. En caso negativo la crearemos:

```csharp
class Response<T>
{
    [JsonProperty("value")]
    public IEnumerable<T> Value { get; set; }
}

class Subscription
{
    [JsonProperty("resource")]
    public string Resource { get; set; }

    [JsonProperty("changeType")]
    public string ChangeType { get; set; }

    [JsonProperty("clientState")]
    public string ClientState { get; set; }

    [JsonProperty("notificationUrl")]
    public string NotificationUrl { get; set; }

    [JsonProperty("expirationDateTime")]
    public string ExpirationDateTime { get; set; }
}

static async Task CreateSubscriptionIfNotExits(ILogger log, AuthResponse auth, string url, string secret)
{
    var subscriptionsUrl = "https://graph.microsoft.com/v1.0/subscriptions/";
    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Authorization = auth.AsHeader();

        var response = await client.GetAsync(subscriptionsUrl);
        var json = await response.Content.ReadAsStringAsync();
        var res = JsonConvert.DeserializeObject<Response<Subscription>>(json);
        var exists = res.Value.Any(x => x.NotificationUrl == url);
        log.LogInformation("exists: " + exists);

        if (!exists)
        {
            var subscription = new Subscription
            {
                ChangeType = "updated,deleted",
                NotificationUrl = url,
                Resource = "groups",
                ExpirationDateTime = DateTime.UtcNow.AddMinutes(4200).ToString("o"),
                ClientState = secret
            };
            var content = new StringContent(JsonConvert.SerializeObject(subscription).ToString(), System.Text.Encoding.UTF8, "application/json");
            var resp = await client.PostAsync(subscriptionsUrl, content);
            var text = await resp.Content.ReadAsStringAsync();
            log.LogInformation(text);
        }
    }
}
```

En este caso, nos hemos suscrito a modificaciones y borrados que se observen en el tipo de recursos "groups".

### Webhook handler

Antes de poder crear una suscripción tendremos que tener creado nuestro Webhook. No hace falta una implementación completa, simplemente una implementación que responda a la validación tipo "echo". Esta validación consiste en enviar de vuelta el valor del parámetro `validationToken` que podremos encontrar en la URL de solicitud, con código de estado 200:

```csharp
public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    log.LogInformation("WebHook handled:");

    var validationToken = req.Query["validationToken"].FirstOrDefault();

    if (!string.IsNullOrWhiteSpace(validationToken))
    {
        log.LogInformation("  validationToken: " + validationToken);
        return new OkObjectResult(validationToken);
    }
    return new AcceptedResult(GetRawUrl(req), "Notification received");
}

static string GetRawUrl(HttpRequest request)
{
    var httpContext = request.HttpContext;
    return $"{httpContext.Request.Scheme}://{httpContext.Request.Host}{httpContext.Request.Path}{httpContext.Request.QueryString}";
}
```

En caso de ser una notificación, el parámetro `validationToken` no existirá o lo encontraremos vacío. Entonces, para indicar que hemos recibido el evento correctamente, responderemos con el código de estado 202.

En cada notificación se nos pueden enviar uno o varios eventos que se almacenan en una propiedad llamada `value` del JSON que nos llega:

```csharp
public class Webhook<T> where T : ResourceData
{

    [JsonProperty("value")]
    public IEnumerable<Event<T>> Events { get; set; }
}
```

Cada evento tiene una serie de propiedades que nos hablan de la suscripción y del evento que se ha producido. Incluyendo una propiedad llamada `resourceData` donde encontraremos detalles específicos del evento:

```csharp
public class Event<T> where T: ResourceData
{
    [JsonProperty("changeType")]
    public string ChangeType { get; set; }

    [JsonProperty("clientState")]
    public string ClientState { get; set; }

    [JsonProperty("resource")]
    public string Resource { get; set; }

    [JsonProperty("resourceData")]
    public T ResourceData { get; set; }

    [JsonProperty("subscriptionExpirationDateTime")]
    public DateTime SubscriptionExpirationDateTime { get; set; }

    [JsonProperty("subscriptionId")]
    public string SubscriptionId { get; set; }

    [JsonProperty("tenantId")]
    public string TenantId { get; set; }
}
```

Un `ResourceData` tiene una serie de propiedades por defecto, pero el resto son específicas de cada sistema:

```csharp
public class ResourceData
{

    [JsonProperty("@odata.type")]
    public string ODataType { get; set; }

    [JsonProperty("@odata.id")]
    public string ODataId { get; set; }
}
```

Por ejemplo, si estamos hablando de un usuario que se añade a un grupo existente:

```csharp
public class GroupMemberData : ResourceData
{
    [JsonProperty("id")]
    public string Id { get; set; }

    [JsonProperty("organizationId")]
    public string OrganizationId { get; set; }

    [JsonProperty("sequenceNumber")]
    public object SequenceNumber { get; set; }

    [JsonProperty("members@delta")]
    public IEnumerable<MembersDelta> MembersDelta { get; set; }
}

public class MembersDelta
{

    [JsonProperty("id")]
    public string Id { get; set; }
}
```

Una vez tenemos definidos estos tipos, seremos capaces de deserializar la petición y comprobar que se envía en `ClientState` el secreto que mandamos en la suscripción:

```csharp
public static async Task<IActionResult> Run(HttpRequest req, ILogger log)
{
    var validationToken = req.Query["validationToken"].FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(validationToken))
    {
        log.LogInformation("Validating Webhook handler: " + validationToken);
        return new OkObjectResult(validationToken);
    }

    log.LogInformation("WebHook handled:");

    var json = await new StreamReader(req.Body).ReadToEndAsync();
    var webhook = JsonConvert.DeserializeObject<Webhook<ResourceData>>(json);
    if (!webhook.Events.All(x => x.ClientState == notificationSecret))
    {
        log.LogInformation("Bad Client State");
        return new BadRequestResult();
    }

    // Do something

    return new AcceptedResult(GetRawUrl(req), "Notification received");
}
```

Y a partir de aquí tan solo quedaría tratar la respuesta para realizar algún tipo de actividad u otro.

Un detalle muy importante para la primera vez que estéis esperando un Webhook de Microsoft Graph: estos pueden tardar en llegar hasta un minuto después de haber realizado una acción. Así que lo mejor es tranquilizarse, tener paciencia y ser educados.

## Conclusión

Los Webhooks se están extendiendo cada día más por Internet. Su uso es complementario al de las _APIs Rest_ más conocidas y aportan un valor añadido muy importante como es el poder recibir notificaciones sin necesidad de tener que hacer constantes peticiones a un servicio. Además, usan protocolos ya conocidos y muy comunes, que nos facilitan su programación en prácticamente cualquier entorno.

Lo mejor es que se usa en los servicios más conocidos y se está adoptando como un estándar de facto. Así que ya solo queda que la IETF tomen nota de ello y añadan un RFC ex profeso a su librería.

Y en el contexto de Microsoft Graph nos aporta la funcionalidad necesaria para poder realizar actividades automatizadas a partir de eventos que ocurren en nuestros servicios en la nube. Algo casi indispensable a la hora de realizar integraciones hoy en día.

Una solución simple, elegante y fácil de implementar, que nació para cubrir un problema bastante más complejo.

![Yo dawg, I heard you like Webhooks... So I added a Webhook to your Webhook](/assets/uploads/2019/04/webhook-meme.jpg)