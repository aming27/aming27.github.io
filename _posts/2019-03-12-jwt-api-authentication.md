---
published: true
ID: 201903121
title: 'Autenticando una API con JWT'
author: fernandoescolar
post_date: 2019-03-12 05:26:33
layout: post
tags: oauth csharp jwt
background: '/assets/uploads/bg/security1.jpg'
---

Uno de los grandes problemas de ser programador hoy en día es que, tenemos tantas librerías y tantas facilidades, que resulta muy sencillo ignorar el funcionamiento interno de las cosas que utilizamos. Supongo que el caso de la autenticación+autorización de una API, al ser un factor importante dentro de una aplicación, no será uno de estos casos. No obstante, y solo por prevenir, vamos a describirlo<!--break--> [guiño][guiño].

Lo más común dentro de una API moderna, es exponerla públicamente siguiendo (o intentando seguir) las premisas de [REST](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) y el [modelo de madurez de Richardson](https://martinfowler.com/articles/richardsonMaturityModel.html). Así pues, usaremos el [protocolo HTTP](https://tools.ietf.org/html/rfc2616) para realizar la comunicación. Y la forma más común de solicitar autorización y autenticarse con este protocolo es utilizar las cabeceras de las peticiones. Concretamente se suele usar una llamada "[Authorization](https://tools.ietf.org/html/rfc7235#section-4.2)" y como valor solemos encontrar dos textos: uno que dice "Bearer" y otro indescifrable que suele coincidir con el _token_ que hemos solicitado a otro servicio.

## Bearer

Seguro que más de uno se ha preguntado por qué tiene que poner "Bearer" delante del _token_. ¡Vaya chorrada! Podemos poner directamente el _token_ y listo.

Está claro que somos libres de hacer lo que queramos. Por eso somos programadores. Por esa extraña y enfermiza adicción que tenemos a la sensación de poder hacer lo que queramos con una máquina. Esa sensación de que, de alguna manera, somos los dioses de nuestro ordenador.

Pero el mundo de los estándares, la mantenibilidad y las APIs, no está hecho para personas diferentes. Es un mundo para que todos sigamos las mismas normas y mantengamos una relación de simbiosis con el todo que, al final, haga desaparecer nuestra propia identidad pasando a formar parte de un conjunto más extenso. Es decir: que no reinventéis la rueda ~~¡coño ya!~~

Dentro del RFC del protocolo HTTP existen dos esquemas de autenticación:

- Primero está el "[Basic](https://tools.ietf.org/html/rfc7617)", que es una castaña. Básicamente [guiño] consiste en coger el nombre de usuario, la contraseña, separarlo por el símbolo de dos puntos y pasarlo a base 64. Super seguro.

- Y segundo tenemos el "[Digest](https://tools.ietf.org/html/rfc7616)" que para no liarnos es como una especie de _token_ con varias propiedades, firmas e incluso alguna cosilla medio encriptada; pero que se envía en formato de texto plano. No está mal, pero con un man-in-the-middle podemos comprometer información sensible de un usuario y del sistema fácilmente.

Luego ya hay otro tipo de modelos, pero nosotros nos centraremos en el uso del *estándar* de autorización OAuth 2.0, que es "[Bearer](https://tools.ietf.org/html/rfc6750)". Un formato que nos permite la autorización en conjunto con la autenticación de usuarios. Este es el esquema que está más de moda hoy en día. Viene a avisar de que detrás le acompaña un _token_ de tipo _JSON Web Token_.

## JWT

Un [JSON Web Token](https://tools.ietf.org/html/rfc7519) o JWT es un formato estándar, compacto y seguro de trasmitir _Claims_ (propiedades, afirmaciones o en general información) entre diferentes sistemas.

Su gran ventaja es que pueden ser validadas ya que vienen firmadas digitalmente con una clave privada, que puede ser verificada usando una clave pública.

Entre otras _Claims_, podemos enviar desde la IP de la máquina para la que se ha emitido un JWT, los ámbitos a los que se le permite acceder, hasta la fecha y hora de expiración del mismo. De esta forma podremos conseguir comunicaciones mucho más seguras.

El formato de un JWT se basa en tres partes:

### Header

Generalmente consiste en dos valores:

- El algoritmo que se ha usado para firmar el token.
- El tipo de token. Que es "JWT".

```json
{
    "typ": "JWT",
    "alg": "RS256",
}
```

### Payload

El cuerpo del mensaje está compuesto por las _Claims_ que se trasmiten. Existen tres tipos:

- _[Registered Claim Names](https://tools.ietf.org/html/rfc7519#section-4.1)_: que son datos acerca del registro.
    - "iss": identifica al emisor del _token_.
    - "sub": es el asunto, que coincide con el identificador la persona que se identifica.
    - "aud": la audiencia para la que se ha emitido.
    - "exp": la hora de expiración, a partir de la cual, el _token_ no será válido.
    - "nbf": la hora hasta la que no será aceptado un token (su omisión indica 0).
    - "iat": la hora a la que fue emitido.
    - "jti": el identificador del _token_.
- _[Public Claim Names](https://tools.ietf.org/html/rfc7519#section-4.2)_: son valores personalizados, pero públicos. Pueden estar representados por una URL o por un nombre. Y para evitar colisiones, se recomienda registrarlos en  [IANA JSON Web Token Registry](https://www.iana.org/assignments/jwt/jwt.xhtml) (por ejemplo "email", "given_name", ...).
- _[Private Claim Names](https://tools.ietf.org/html/rfc7519#section-4.3)_: Esto son campos que se acuerdan compartir entre las partes, diferentes de los públicos.

```json
{
    "aud": "https://mycompany.com/mi-app",
    "iss": "https://sts.windows.net/common/",
    "sub": "asdasd34asf2332r23fea",
    "iat": 1552212046,
    "nbf": 1552212046,
    "exp": 1552215946,
    "family_name": "Pil",
    "given_name": "Paco",
    "ipaddr": "10.0.0.1",
    "name": "Paco Pil"
}
```

### Firma

La firma se realiza usando una clave privada digital. Es un proceso bastante simple, si por ejemplo elegimos com algoritmo RSA256:

```js
signature = RSA256(
    encodeURI(base64(header))
    + "." +
    encodeURI(base64(payload)),
    private_key
)
```

### El _token_ completo

Para ponerlo todo junto usaremos el mismo formato que el firmado, añadiendo la firma:

```js
header = { ... }
payload = { ... }
content = encodeURI(base64(header)) + "."  + encodeURI(base64(payload))
signature = RSA256(content, private_key)
JWT = content + "." + encodeURI(signature)
```

## Validando JWT

A la hora de validar vamos a usar como ejemplo un _JWT_ emitido por un Azure Active Directory. Para ello lo primero que tendremos que hacer es validar la cabecera de la petición HTTP. Comprobaremos que tiene una cabecera llamada "Authorization" y un valor que puede ser dividido en dos, separándolo por un espacio vacío. El primero de esos valores deberá ser "Bearer" y el segundo nuestro _token_.

Después deberemos saber de dónde recuperar las claves públicas para comprobar la firma. Esto se puede hacer preguntando a la configuración de openid connect, que encontraremos en:

```
https://login.windows.net/[nuestro_tenant_id]/.well-known/openid-configuration
```

Si desconocemos cual es el tenantId que estamos usando, lo podemos leer (en el caso de Azure Active Directory) del propio _token_. Se guarda en una propiedad llamada "tid". Por lo que, si cogemos el cuerpo del token, lo convertimos a un formato JSON y buscamos esta propiedad ya tenemos el tenantId. Ahora solo tenemos que realizar esa petición y de entre los diferentes datos que nos envía buscar un campo llamado "jwks_uri". En esa dirección web encontraremos las claves públicas para comprobar la firma de nuestro token.

La respuesta de esta última consulta, tendremos que mirar en la propiedad "keys" y dentro de los objetos que contiene esta propiedad, las claves se almacenan en formato de ``string`` en la propiedad "x5c". Ahora bastaría con coger estas cadenas que vienen en base 64 y convertirlas a un formato de clave conocido por nuestro sistema. Generalmente se tratará de un certificado con solo una clave pública.

Por último, utilizaremos las librerías más conocidas para que valide nuestro JWT usando los certficados que hemos creado.

Ahora vamos a ver 3 escenarios en donde resolverlo: TypeScript, .Net Core y Asp.Net Core.

### TypeScript

Para TypeScript vamos a usar un paquete _npm_ llamado ``jsonwebtoken``, que nos ayudará a tratar con _JWTs_. La idea es recoger las claves públicas y usar este paquete para que valide si es un _token_ correcto o no:

```ts
import * as jsonwebtoken from 'jsonwebtoken';
import axios from 'axios';

export class JwtAadValidator {
    constructor(private readonly jwt: string){
    }

    public get tenantId(): string {
        return jsonwebtoken.decode(this.jwt)["tid"] as string;
    };

    public async verify(options?: any): Promise<boolean> {
        options = options|| {};
        options.algorithms = ['RS256'];
        options.issuer = 'https://sts.windows.net/' + this.tenantId + '/';

        const certificates = await this.requestSigningCertificates();
        let lastError = null;
        for (let i = 0; i < certificates.length; i++) {
            try {
                jsonwebtoken.verify(this.jwt, certificates[i], options);
                return true;
            } catch(error) {
                lastError = error;
                if (error.message !== 'invalid signature') {
                    throw lastError;
                }
            }
        }

        throw lastError;
    }

    private async requestCertificateUrl(): Promise<string> {
        const url = 'https://login.windows.net/' + this.tenantId + '/.well-known/openid-configuration';
        const result = await axios.get(url);
        return result.data.jwks_uri as string;
    }

    private async requestSigningCertificates(): Promise<string[]> {
        const url = await this.requestCertificateUrl();
        const result = await axios.get(url);
        const certificates: string[] = [];
        result.data.keys.forEach(publicKeys => {
            publicKeys.x5c.forEach(certificate => {
                certificates.push(this.convertToCertificate(certificate));
            });
        });
        return certificates;
    }

    private convertToCertificate(cert: string): string {
        const beginCert = "-----BEGIN CERTIFICATE-----";
        const endCert = "-----END CERTIFICATE-----";

        let result = beginCert;
        while (cert.length > 0) {
            if (cert.length > 64) {
                result += "\n" + cert.substring(0, 64);
                cert = cert.substring(64, cert.length);
            }
            else {
                result += "\n" + cert;
                cert = "";
            }
        }

        if (result[result.length ] != "\n") {
            result += "\n";
        }

        result += endCert + "\n";
        return result;
    }
}
```

### .Net Core

Cuando estamos usando la plataforma .Net podemos generar un código semejante al que hicimos en TypeScript, pero en este caso vamos a usar los artefactos que nos proporciona la plataforma.

En este caso, las claves públicas hay que convertirlas en certificados X509 primero. Y la verificación del _token_ se realiza usando un artefacto del paquete ``System.IdentityModel.Tokens.Jwt`` llamado ``JwtSecurityTokenHandler``. Este objeto tiene un comportamiento bastante simple: se le pasa un _token_ y unos parámetros, y valida.

```csharp
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace Security
{
    public class JwtAadValidator
    {
        private readonly string _jwt;

        public JwtAadValidator(string token)
        {
            _jwt = token;
        }

        public string TenantId
        {
            get
            {
                return new JwtSecurityToken(_jwt).Claims.FirstOrDefault(x => x.Type == "tid")?.Value;
            }
        }

        public async Task<bool> Verify()
        {
            var validationParameter = new TokenValidationParameters()
            {
                RequireSignedTokens = true,
                ValidateAudience = false, //¡ojo! para ser seguro se debe validar la audiencia
                ValidIssuer = $"https://sts.windows.net/{TenantId}/",
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                IssuerSigningKeys = await RequestSigningCertificates()
            };

            try
            {
                var handler = new JwtSecurityTokenHandler();
                handler.ValidateToken(_jwt, validationParameter, out var token);
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private async Task<string> RequestCertificateUrl()
        {
            var url = $"https://login.windows.net/{TenantId}/.well-known/openid-configuration";
            using (var client = new HttpClient())
            {
                var response = await client.GetAsync(url);
                var data = await response.Content.ReadAsStringAsync();
                var json = JsonConvert.DeserializeObject<JObject>(data);
                return json["jwks_uri"].Value<string>();
            }
        }

        private async Task<IEnumerable<SecurityKey>> RequestSigningCertificates()
        {
            var url = await RequestCertificateUrl();
            var result = new List<SecurityKey>();
            using (var client = new HttpClient())
            {
                var response = await client.GetAsync(url);
                var data = await response.Content.ReadAsStringAsync();
                var json = JsonConvert.DeserializeObject<JObject>(data);
                json["keys"].Values<JObject>().ToList().ForEach(key =>
                {
                    key["x5c"].Values<string>().ToList().ForEach(cert =>
                    {
                        result.Add(ConvertToCertificate(cert));
                    });
                });
            }

            return result;
        }

        private SecurityKey ConvertToCertificate(string cert)
        {
            var c = new X509Certificate2(Convert.FromBase64String(cert));
            return new X509SecurityKey(c);
        }
    }
}
```

### Asp.Net Core

Este es el escenario más simple, ya que existe un _middleware_ que podemos utilizar para autenticar JWT. Así que solo tendremos que modificar el ``Startup.cs`` para que se parezca al siguiente:

```csharp
public class Startup
{
    private const key = "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING";

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(x =>
        {
            x.RequireHttpsMetadata = false;
            x.SaveToken = true;
            x.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,  //¡ojo! para ser seguro se debe validar el issuew
                ValidateAudience = false //¡ojo! para ser seguro se debe validar la audiencia
            };
        });
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        app.UseAuthentication();
        app.UseMvc();
    }
}
```

## Conclusiones

Evidentemente, los ejemplos están incompletos: no se usan cachés, no se validan campos importantes como la audiencia y en general no tratamos identidades, solo el _token_. Pero hemos visto a fondo cómo funciona el mundo de la autenticación y autorización con OAuth 2.0 para nuestras APIs. Además, hemos demostrado los principios de cómo realizar estas autenticación+autorización nosotros mismos o cómo funcionan internamente otros sistemas que la realizan por nosotros.

Y aunque ningún sistema es completamente seguro, siempre está bien conocer su funcionamiento interno para ser capaces de prevenir ataques y fallos de seguridad.