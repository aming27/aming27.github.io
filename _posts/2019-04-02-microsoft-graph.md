---
published: true
ID: 201904021
title: 'Microsoft Graph'
author: fernandoescolar
post_date: 2019-04-02 07:40:40
layout: post
tags: azure microsoft graph
---

Toda buena película adolescente de los 80, comienza con un pelele al que todo el mundo margina. Este personaje esconde algo en su interior de lo que, al principio, solo se notan pequeños y casuales atisbos. Después de una gran aventura de autoconocimiento y superación personal, el protagonista consigue dominar este poder oculto y convertirse en un verdadero héroe<!--break-->. Esto es lo que le pasa a ~~Naruto~~ Microsoft Graph, que es como Daniel Larusso.

Todos llegamos a esta API por lo que parece que promete, por esos atisbos de poder que nos dejan vislumbrar las demos que Microsoft nos presenta. Luego, cuando llega la hora de utilizarla a fondo, nos damos cuenta de sus problemas, de lo _crazy_ de algunas decisiones de su modelado. Entonces, la marginamos. Nos metemos con ella. Ya no la invitamos a nuestros meetups. Una vez superado este duro camino plagado de frustración, la aceptamos y nos damos cuenta de todas las posibilidades que nos aporta, llegando finalmente, a un idilio llano y sincero.

[Microsoft Graph](https://docs.microsoft.com/en-us/graph/) es una API con un modelo de datos unificado para poder explotar todas las aplicaciones que forman parte de _Office 365_, _Azure Active Directory_, _Enterprise Mobility_, _Windows 10_ y _Education_. Está basada en [OData](https://www.odata.org) v4, aunque no todos los recursos tienen hoy en día las mismas capacidades. Y podemos encontrar toda la documentación de la versión 1.0 (y beta) [aquí](https://docs.microsoft.com/en-us/graph/api/overview?toc=./ref/toc.json&view=graph-rest-1.0).

Existe [un SDK](https://github.com/microsoftgraph?q=sdk) para, prácticamente, todos los lenguajes y plataformas de programación conocidas, que nos ayudará a autenticarnos y solicitar datos de esta API. No obstante, al ser OData una especificación por encima de REST, resulta simple utilizarla sin necesidad de usar el SDK.

## App registration

Lo primero que tenemos que saber para explotar Microsoft Graph es cómo conseguir acceso. Para ello tendremos que solicitar un _token_ a la API v2 del protocolo de autenticación de Azure Active Directory. Afortunadamente, esta API usa la especificación OIDC que se basa en OAuth 2.0. Así que este paso lo tenemos prácticamente superado. Lo único que tendremos que saber es que hay dos tipos de permisos dentro de Graph que podemos solicitar:

- _Delegated_: es un tipo de permiso que se obtiene al identificarse usando un usuario y una contraseña. De esta forma diremos que se delega un permiso sobre Graph a este usuario. Algunos privilegios específicos pueden exigir que este usuario sea Administrador.
- _Application_: este es el tipo de permiso que tenemos que usar en una aplicación que no requiere de un usuario para que realice ninguna acción. Para estas aplicaciones se requiere que un administrador apruebe previamente el uso de estos permisos.

Para configurar estos permisos tendremos que dirigirnos al [portal de Azure](https://portal.azure.com/) con una cuenta de administrador de nuestro _tenant_. Ahí nos dirigiremos a la opción de menú "Azure Active Directory" dentro de esta opción a "App registrations (Preview)" y al botón de "New registration":

![New app registration](/assets/uploads/2019/04/microsoft-graph-app-registration-1.png)

Después le daremos un nombre al "App registration" comprobaremos que está marcada la opción de permitir solo accesos con cuentas de nuestro directorio y presionaremos el botón "Register":

![New app registration](/assets/uploads/2019/04/microsoft-graph-app-registration-2.png)

Al crearla, podremos observar en el panel de "Overview":

- Application (client) ID: que corresponde con el `client_id`
- Directory (tenant) ID: que se corresponde con el valor de `tenant_id`

![client_id y tenant_id](/assets/uploads/2019/04/microsoft-graph-app-registration-ids.png)

Una vez hemos creado el nuevo registro, podremos generar un nuevo secreto navegando a "Certificates & secrets" y presionando el botón de "New client secret":

![New secret](/assets/uploads/2019/04/microsoft-graph-app-registration-secret.png)

No olvides guardar en un lugar seguro el secreto que se acaba de generar, ya que coincidirá con el valor de `client_secret`.

Ahora vamos a asignar los permisos del registro. Para ello iremos a "API permissions" y dentro de esta opción, pulsaremos "Add a permission":

![Add permissions](/assets/uploads/2019/04/microsoft-graph-app-registration-3.png)

En el nuevo modal que se abrirá lo primero que tendremos que elegir es "Microsoft Graph", para poder elegir los permisos para esta API:

![Select Microsoft Graph](/assets/uploads/2019/04/microsoft-graph-app-registration-4.png)

Después nos dará a elegir entre "Delegated permissions" o "Application permissions". Deberemos elegir una en dependencia de cómo tenemos pensado obtener el _token_. Después tendremos un listado de recursos y al desplegar alguno de ellos encontraremos los permisos específicos que podemos asignar:

![Search your permissions](/assets/uploads/2019/04/microsoft-graph-app-registration-5.png)

Si queremos saber qué permisos deberíamos añadir, todo depende de la operación dentro de Microsoft Graph que queremos realizar. Afortunadamente, en la documentación, en [la referencia a la API](https://docs.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0), podremos encontrar antes de cada acción, qué permisos son necesarios para ejecutarla:

![Microsoft Graph Reference: Action Permissions](/assets/uploads/2019/04/microsoft-graph-permissions.png)

Una vez hayamos añadido los que necesitemos, en el portal de Azure, podemos presionar en "Add Permissions". Y si queremos que ya cuenten con la validación del administrador, en la pantalla de "API permissions", presionaremos el botón de "Grant admin consent for [your directory]".

Ahora ya podremos conectar con Microsoft Graph y jugar con todas las posibilidades que nos ofrece. Para ello proponemos 4 formas:

- [A mano](#a-mano): esta es la que siempre me gusta más para enseñar. Aquí podréis ver cómo funciona internamente.
- [Usando el SDK](#usando-el-sdk): esta es la más recomendada a día de hoy.
- [Usando el futuro SDK](#el-futuro-del-sdk): esta es la que más me gusta, pero tienen que pulir aun ciertos aspectos.
- [Microsoft Graph Explorer](#microsoft-graph-explorer): para que podamos probar nuestras llamadas en un contexto más directo y simple.

## A mano

### Access token

En un [artículo anterior](/2019/03/19/oauth-authentication-grant-types/) vimos las diferentes formas que podríamos usar para pedir este _token_ a un servicio que usara OAuth 2.0. En este caso vamos a usar el más simple, [usando tan solo el _Grant Type_ de "client_credentials"](/2019/03/19/oauth-authentication-grant-types/#client-credentials).

Para ello nos crearemos una clase donde almacenar la respuesta de una petición de _token_:

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
```

Y realizaremos la petición al servidor de la forma que indicábamos:

```csharp
async Task<AuthResponse> GetAuthAsync(string tenantId, string clientId, string clientSecret)
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
        return JsonConvert.DeserializeObject<AuthResponse>(json);
    }
}
```

Donde los valores que le pasamos a la función coincidirán que aquellos que recogimos en el proceso de creación del "App registration" en el portal de Azure. Y el valor de `scope` serán los permisos que queremos solicitar para llamar a la API (que tenemos que haber seleccionado y consentido en el "App registration"); o el valor "https://graph.microsoft.com/.default", que indicará que estamos solicitando todos los permisos que hemos seleccionado en el "App registration" y así evitar estar constantemente indicándolos.

### Llamando a Microsoft Graph

Vamos a usar como ejemplo una llamada al [listado de usuario](https://docs.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0) basándonos en la propia referencia de Microsoft Graph. Para ello tendremos que tener al menos el permiso de aplicación de "User.Read.All" consentido en nuestro "App registration".

Una vez tenemos esto, tendremos que realizar una llamada al endpoint "https://graph.microsoft.com/v1.0/users" usando un _token_ válido y tendremos ese listado.

La respuesta de listados desde Microsoft Graph está envuelta en un objeto que nos indica cual es la siguiente página, así pues, crearemos una estructura compleja para mapear los resultados:

```csharp
class GraphListResponse<T>
{
    [JsonProperty("@odata.context")]
    public string Context { get; set; }
    [JsonProperty("@odata.nextLink")]
    public string NextLink { get; set; }
    [JsonProperty("value")]
    public IEnumerable<T> Value { get; set; }
}
```

De un usuario nos interesaría en un principio el `id`, el `displayName`y el `mail`, por lo que no vamos a crear más propiedades:

```csharp
class User
{
    [JsonProperty("id")]
    public string Id { get; set; }
    [JsonProperty("displayName")]
    public string DisplayName { get; set; }
    [JsonProperty("mail")]
    public string Email { get; set; }
}
```

Por lo que la llamada para listar todos los usuarios, podremos filtrar las propiedades a devolver añadiendo la propiedad `$select` con el valor "id,displayName,mail", quedando el endpoint como: "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail":

```csharp
async Task<IEnumerable<User>> GetUsersAsync(AuthResponse auth, string nextLink = null)
{
    var result = new List<User>();
    var url = "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail";
    using (var client = new HttpClient())
    {
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        client.DefaultRequestHeaders.Authorization = auth.AsHeader();

        GraphListResponse<User> res = null;
        do {
            var response = await client.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();
            res = JsonConvert.DeserializeObject<GraphListResponse<User>>(json);
            if (res != null)
            {
                result.AddRange(res.Value);
                url = res.NextLink;
            }
        } while (res != null && !string.IsNullOrEmpty(res.NextLink));
    }

    return result;
}
```

Así pues, podríamos recoger e imprimir todos los usuarios por pantalla realizando una llamada para recoger el _token_ de acceso y otra para recoger los usuarios:

```csharp
var auth = await Functions.GetAuthAsync(tenant_id, client_id, client_secret);
var users = await Functions.GetUsersAsync(auth);

Console.WriteLine("User List:");
foreach(var user in users)
{
    Console.WriteLine($" - {user.DisplayName} ({user.Email})");
}
```

## Usando el SDK

Si queremos usar el SDK para .Net que nos provee Microsoft, primero tendremos que instalar los paquetes de `Microsoft.Identity.Client` y `Microsoft.Graph`.

En un proyecto de dotnet core se puede realizar mediante consola:

```bash
$ dotnet add MyProject.csproj package Microsoft.Identity.Client
...
$ dotnet add MyProject.csproj package Microsoft.Graph
...
```

Y si estamos en Visual Studio, siempre podemos abrir el panel de "Package Manager Console":

```bash
> Install-Package Microsoft.Identity.Client
...
> Install-Package Microsoft.Graph
...
```

El código es bastante parecido. En un principio usamos los artefactos de `Microsoft.Identity.Client` para poder recoger un _token_ para acceder a Microsoft Graph. Después declaramos un cliente de Graph que use el proveedor de _tokens_ que hemos generado. Finalmente realizamos la llamada a la API y escribimos los resultados por pantalla:

```csharp
var clientCredential = new ClientCredential(clientSecret);
var authClient = new ConfidentialClientApplication(
        clientId,
        $"https://login.microsoftonline.com/{tenantId}/v2.0",
        "urn:ietf:wg:oauth:2.0:oob",
        clientCredential,
        new TokenCache(),
        new TokenCache());
var authProvider = new DelegateAuthenticationProvider(async request =>
    {
        var authResult = await authClient.AcquireTokenForClientAsync(new [] { "https://graph.microsoft.com/.default" });
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authResult.AccessToken);
    });
var graphServiceClient = new GraphServiceClient("https://graph.microsoft.com/v1.0", authProvider);
IGraphServiceUsersCollectionPage page = null;

Console.WriteLine("User List:");
do {
    var task = page != null ? page.NextPageRequest : graphServiceClient.Users.Request().Select(u => new { u.Id, u.DisplayName, u.Mail });
    page = await task.GetAsync();
    foreach(var user in page)
    {
        Console.WriteLine($" - {user.DisplayName} ({user.Mail})");
    }
} while(page != null && page.NextPageRequest != null);
```

## El futuro del SDK

Como el código actual para obtener _tokens_ puede resultar un poco confuso, se está desarrollando un paquete que está actualmente en fase de pruebas (y falla como una escopeta de feria), donde la idea es simplificar esa parte. El paquete en cuestión se llama `Microsoft.Graph.Auth`:

```bash
$ dotnet add MyProject.csproj package Microsoft.Graph
...
$ dotnet add MyProject.csproj package Microsoft.Graph.Auth
...
```
o en Visual Studio:

```bash
> Install-Package Microsoft.Graph
...
> Install-Package Microsoft.Graph.Auth
...
```

El código, que hoy en día no funciona, sería el siguiente:

```csharp
var clientCredential = new ClientCredential(clientSecret);
var clientApplication = ClientCredentialProvider.CreateClientApplication(clientId, clientCredential, tenant: tenantId);
var authenticationProvider = new ClientCredentialProvider(clientApplication);

var graphServiceClient = new GraphServiceClient(authenticationProvider);
IGraphServiceUsersCollectionPage page = null;

Console.WriteLine("User List:");
do {
    var task = page != null ? page.NextPageRequest : graphServiceClient.Users.Request().Select(u => new { u.Id, u.DisplayName, u.Mail });
    page = await task.GetAsync();
    foreach(var user in page)
    {
        Console.WriteLine($" - {user.DisplayName} ({user.Mail})");
    }
} while(page != null && page.NextPageRequest != null);
```

Como podemos observar, quedaría mucho mejor expuesta la obtención del token, simplificando mucho el código anterior.

## Microsoft Graph Explorer

Si queréis conocer bien Microsoft Graph (y así entender un poco mejor lo que significa la palabra frustración), siempre podéis usar una herramienta que Microsoft nos ofrece para que, junto con la documentación, podamos explorar y entender la potencia interior oculta en esta API.

Es muy sencillo de utilizar:

- Vamos a la página web de Microsoft Graph Explorer ([https://developer.microsoft.com/en-us/graph/graph-explorer](https://developer.microsoft.com/en-us/graph/graph-explorer))
- Hacemos login y nos asignamos permisos usando el panel de la izquierda.

Es un funcionamiento de petición/respuesta de HTTP, pero si abrimos unas cuantas ventanas, podremos realizar operaciones más complejas y navegar en los oscuros y desconocidos fondos que ahí se ocultan.

## Conclusiones

Hoy hemos mostrado como utilizar Microsoft Graph, a partir de aquí, si seguís profundizando en el tema, ya no es mi culpa.

![Homer se esconde entre los matorrales](/assets/uploads/2019/04/homer-fadeoff.gif)