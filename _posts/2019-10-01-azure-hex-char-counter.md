---
published: true
ID: 201910011
title: 'Azure hex-char-counter tutorial'
author: fernandoescolar
post_date: 2019-10-01 13:51:23
layout: post
tags: azure webapp appservice node
---

El otro día en el trabajo surgió la necesidad de crear un sistema online complejo y escalable para la resolución de un problema general que teníamos. El objetivo era conseguir el tamaño de una cadena de texto en formato hexadecimal. Lo primero que nos vino a la cabeza fue Azure: ¿cómo podría ayudarnos?<!--break-->

La respuesta a esta pregunta es que de una forma muy eficiente. Si no, no hubiéramos escrito este artículo... Ya teníamos proyecto. Y su code-name: *HCC* (**H**exadecimal-**C**haracters-**C**ounter). Y he aquí como lo ejecutamos:

## Implementando HCC

Lo primero que tenemos que hacer es ir al portal de Microsoft Azure y crear un servicio *PaaS* donde hospedar nuestra aplicación. Así que buscaremos en el *marketplace* el recurso de tipo "Web App":

![Crear azure web app](/assets/uploads/2019/09/hex-counter-1.png)

Entonces tendremos que configurar los datos sobre la suscripción, el grupo de recursos, el tipo de aplicación (usaremos la de por defecto: .Net 4.7 en una máquina Windows), la región y el tamaño del servicio:

![Configurar la web app](/assets/uploads/2019/09/hex-counter-2.png)

El tema de monitoring lo dejaremos configurado por defecto. Esto implica que creará un servicio de App Insights con el mismo nombre que nuestra aplicación.

![Confirmar y crear la web app](/assets/uploads/2019/09/hex-counter-3.png)

Una vez hemos revisado todo, creamos el servicio dentro de Azure y tras unos pocos segundos, se notificará de que ya está disponible:

![Notificación de creada](/assets/uploads/2019/09/hex-counter-4.png)

Por cuestiones de facilidad hemos decidido utilizar *nodejs* como lenguaje de programación de servidor. Así no tendremos que crear complejos procesos de compilación. Para ello tendremos que añadir un en la configuración del "App Service" un "AppSettting" con el nombre "WEBSITE_NODE_DEFAULT_VERSION" y con el valor de una versión estable, como por ejemplo la "6.2.2":

![Configurando node](/assets/uploads/2019/09/hex-counter-5.png)

Después de guardar todos los cambios, tendremos que subir la aplicación en cuestión que ayudará a los servicios de Azure a realizar la cuenta de la longitud de una cadena de texto en hexadecimal. Así que podemos abrir el editor de código online, seleccionando la opción de "App Service Editor (Preview)" del menú:

![Desarrollando la aplicación](/assets/uploads/2019/09/hex-counter-6.png)

Una vez en este editor tendremos que crear un nuevo archivo llamado "index.js" con el siguiente contenido:

```js
const http   = require('http');
const port   = process.env.PORT || 3000;
const server = http.createServer(myServer);

function myServer(request, response) {
	response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end(request.url.substring(1));
    return;
}

server.listen(port);
console.log('Server running at port ' + port);
```

Como podemos observar, nuestro servicio va a devolver en forma de texto, el valor que pasemos a la url de nuestro explorador. Si por ejemplo ponemos en la barra de dirección "http://domain.com/something", devolverá "something".

Después tendremos que crear otro archivo llamado "Web.config" donde le diremos al servicio de Azure cómo puede ejecutar nuestra aplicación:

![Monaco editor](/assets/uploads/2019/09/hex-counter-7.png)

El contenido de este archivo debería ser parecido a este:

```xml
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
	  <rewrite>
      <rules>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>
	  <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
```

Con esto ya podemos probar nuestra aplicación. Pero entonces os daréis cuenta de que solo devuelve texto y que en ningún momento estamos contando los caracteres de la cadena:

![No funciona exactamente como queremos](/assets/uploads/2019/09/hex-counter-bad.png)

Aquí es donde una de las mejores *features* de Microsoft Azure nos pueden ayudar. Con 3 sencillos pasos vamos a conseguir aplicar la magia:

1. Dentro del "App Service" ir al menú de "Application Insights"
2. Cambiar el valor de "Collection level" a "Recommended"
3. Pulsar el botón de "Apply"

![Do magic tricks](/assets/uploads/2019/09/hex-counter-8.png)

Una vez termine la actualización si entramos de nuevo en nuestra aplicación web, podremos ver que tendremos una respuesta diferente:

![El resultado](/assets/uploads/2019/09/hex-counter-9.png)

Donde en la primera línea de la respuesta, podremos ver el tamaño de la cadena de texto que hemos enviado en hexadecimal.

*HCC* ya está funcionando, en un entorno escalable y al servicio de todos. ¡Misión cumplida!

![Ronaldinho sonrie](/assets/uploads/2019/09/ronaldinho.jpg)

## Conclusiones

Son solo dos:

1. Qué fácil es hacer cosas con Azure. Los chicos de Microsoft están haciendo un gran trabajo.
2. Me parece genial lo de estas *features* ocultas que meten sin avisar. Aportan muchísimo valor. Aunque vendría muy bien que estuvieran documentadas.
