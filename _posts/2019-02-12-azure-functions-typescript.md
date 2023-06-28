---
published: true
ID: 201902051
title: 'Azure Functions con TypeScript'
author: fernandoescolar
post_date: 2019-02-12 07:18:25
post_excerpt: ""
layout: post
tags: azure-functions azure functions typescript
background: '/assets/uploads/bg/thunder5.jpg'
---

No os ha pasado alguna vez que al leer un artículo en lugar de leer los textos explicativos que su autor ha añadido, vais directamente al contenido de los _code snipets_ y vais copiando y pegando... No os ha pasado que ignoráis la prosa que tanto tiempo ha costado escribir y solo leéis el código, porque ya os resulta bastante auto explicativo... <!--break--> Pues hoy es el día en el que he entendido vuestras necesidades. Voy a poner código y reducir mis comentarios a la mínima expresión.

<style>
  .notes {
    cursor: pointer;
    padding: 10px 0;
  }

  .notes span {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: gray;
  }

  .notes .tip {
      display: block;
      position: absolute;
      background-color: #41444F;
      color: #fff;
      opacity: 0;
      transform: translate3d(calc(100%),60px,100px);
      transition: transform .15s ease-in-out, opacity .2s;
      width: 70%;
      padding: 8px 15px;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  .notes:active .tip {
    opacity: 1;
    transform: translate3d(0,0,0) rotate3d(1,1,1,0deg);
  }
</style>
<div class="notes">
  <span>TypeScript con Azure Functions</span>
  <div class="tip">
    <p>
      Cada día que paso trabajando con TypeScript en un contexto de equipo, pienso en lo afortunados que somos de no haber elegido JavaScript. Tener un lenguaje tipado no solo te sirve de red de seguridad, también te ayuda a entender el código que han hecho los demás y poder interactuar con otros artefactos fácilmente gracias al <i>intellisense</i>.
    </p>
    <p>
      El problema es que cuando empezamos a trabajar con Azure Functions nos encontramos con que podemos desarrollar con los lenguajes C#, Java, JavaScript o Python, pero no con TypeScript. Así que aprovechando que estoy un poco aburrido, he decidido invertir un poco de mi preciado tiempo, montando lo que llamaríamos un <i>boilerplate</i>.
    </p>
  </div>
</div>

<div class="notes">
  <span>Nuevo proyecto usando la consola.</span>
  <div class="tip">
    <p>
      Para empezar a trabajar, vamos a crear un nuevo proyecto. Para ello crearemos una carpeta nueva usando la consola (en mi caso uso <a href="http://cmder.net/" target="_blank">Cmder</a>, que usa el símbolo <i>lambda</i> antes de cada línea).
    </p>
  </div>
</div>

```bash
λ mkdir azure-functions-typescript-boilerplate
λ cd azure-functions-typescript-boilerplate\
```

<div class="notes">
  <span>Creamos el package.json.</span>
  <div class="tip">
    <p>
      Cuando creamos el archivo <i>package.json</i> usando <i>npm</i>, el comando nos irá preguntando por el nombre del paquete, la versión, datos sobre el autor, repositorio de código y la licencia. Lo rellenamos.
    </p>
  </div>
</div>

```bash
λ npm init
```

<div class="notes">
  <span>Instalamos las Azure Functions Tools.</span>
  <div class="tip">
    <p>
      Microsoft ha publicado una herramienta de consola para hacer que la creación de <i>Functions</i> sea más sencilla. Para ello tendremos que instalarla como dependencia de desarrollo de nuestro proyecto, o bien como herramienta global, cambiando el parámetro <i>--save-dev</i> por <i>-g</i>.
    </p>
    <p>
      Personalmente prefiero instalar todas las dependencias de un proyecto de forma local y no global, ya que no todo el mundo tiene por qué tener instalados los mismos paquetes <i>npm</i>, ni tampoco creo que desarrollar un proyecto deba implicar instalar paquetes globales. Pero esto es tan solo una opinión, cada uno es libre de instalar lo que considere de forma global.
    </p>
  </div>
</div>

```bash
λ npm install --save-dev azure-functions-core-tools
```

<div class="notes">
  <span>Configurando las Azure Functions Tools.</span>
  <div class="tip">
    <p>
      Si has elegido instalar localmente las tools, para poder usarlas tendremos que cambiar el <i>PATH</i> actual añadiendo la carpeta "node_modules\.bin" de nuestro directorio de trabajo. Este cambio solo será efectivo durante la sesión de consola. Es decir, que una vez cerrada la consola actual, ya no existirá este cambio y volveremos al <i>PATH</i> original del sistema.
    </p>
    <p>
      Por otro lado, si has instalado las tools de forma global, este paso lo puedes ignorar.
    </p>
  </div>
</div>

```bash
λ set PATH=%PATH%;[currrent_folder_fullpath]\node_modules\.bin
```

<div class="notes">
  <span>Creando el proyecto de Azure Functions en <i>node</i>.</span>
  <div class="tip">
    <p>
      Usando la tool de Microsoft que acabamos de instalar, nos pedirá que seleccionemos el lenguaje de programación que vamos a usar. Ahí elegiremos <i>node</i>.
    </p>
  </div>
</div>

```bash
λ func init
Select a worker runtime:
dotnet
node                             <------------------
python (preview)
```

<div class="notes">
  <span>Añadiendo paquetes de TypeScript.</span>
  <div class="tip">
    <p>
      Cuando decimos que no hay soporte para TypeScript en Azure Functions, no quiere decir que no tengamos ya los archivos de tipos publicados. Así que, vamos a instalar el lenguaje TypeScript y los tipos necesarios para desarrollar Azure Functions.
    </p>
  </div>
</div>

```bash
λ npm install --save-dev typescript @azure/functions
```

<div class="notes">
  <span>Añadiendo paquetes de utilidades.</span>
  <div class="tip">
    <p>
      Con el fin de tener unos comandos rápidos para borrar y copiar archivos en nuestros <i>scripts</i> de <i>npm</i>, vamos a añadir los paquetes <i>rimraf</i> y <i>copyfiles</i>. Además del paquete <i>azure-functions-pack</i>, que nos ayuda a crear paquetes de funciones optimizados para funcionar en la plataforma de Azure Functions.
    </p>
  </div>
</div>

```bash
λ npm install --save-dev copyfiles rimraf azure-functions-pack
```

<div class="notes">
  <span>Ordenando el código.</span>
  <div class="tip">
    <p>
      ¡Que no te engañen! Ser ordenado es una virtud, no un defecto. Si cada vez que abro un proyecto de TypeScript veo una carpeta llamada <i>src</i> donde sé a priori que voy a encontrar el código fuente, ¿por qué este proyecto no debería tenerla? ¡Vamos al  lío!
    </p>
  </div>
</div>

```bash
λ mkdir src
λ mv host.json local.settings.json src
```

<div class="notes">
  <span>Abrimos Visual Studio Code.</span>
  <div class="tip">
    <p>
      Ahora necesitamos un editor de código para retocar y crear ciertos archivos de la configuración. Para ello usaremos <a href="https://code.visualstudio.com/" target="_blank">Visual Studio Code</a>.
    </p>
  </div>
</div>

```bash
λ code .
```
<div class="notes">
  <span>Creamos el archivo <i>tsconfig.json</i>.</span>
  <div class="tip">
    <p>
      En la raíz de nuestra solución crearemos un nuevo archivo (<i>tsconfig.json</i>) con la configuración necesaria para "transpilar" el código TypeScript en código JavaScript compatible con el <i>runtime</i> de las Azure Functions. Lo más importante es tener en cuenta que usaremos el sistema de módulos de "commonjs" (module.export...) y la versión de <b>ECMAScript de 2017</b> (con compatibilidad con <i>async</i> y <i>await</i>).
    </p>
  </div>
</div>

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2017",
    "lib": ["dom","es2017"],
    "sourceMap": true,
    "allowJs": false,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "rootDir": "./src",
    "forceConsistentCasingInFileNames": true,
    "suppressImplicitAnyIndexErrors": true,
    "allowSyntheticDefaultImports": true,
    "strictNullChecks":false,
    "noImplicitAny": false,
    "downlevelIteration": true
  },
  "exclude": [
    "node_modules"
  ]
}
```

<div class="notes">
  <span>Editamos el <i>package.json</i>.</span>
  <div class="tip">
    <p>
      Ahora vamos a añadir una serie de scripts al archivo <i>package.json</i>, que nos van a ayudar en el día a día con nuestro proyecto:
      <ul>
        <li><b>new</b>: creará una nueva <i>Function</i> en JavaScript usando las plantillas de la herramienta de Microsoft.</li>
        <li><b>serve</b>: transpilará el código y lo ejecutará localmente.</li>
        <li><b>build</b>: creará una nueva carpeta llamada "dist" en la que encontraremos los archivos necesarios para su publicación en Azure.</li>
        <li><b>clean</b>: borrará los transpilados y la carpeta "dist".</li>
      </ul>
    </p>
  </div>
</div>

```json
  "scripts": {
    "new": "cd src && func new",
    "serve": "tsc && cd src && func host start && rimraf **/*.js **/*.map",
    "build": "tsc && funcpack pack ./src --copyToOutput && cd src && copyfiles host.json local.settings.json *.csproj ../dist && cd .funcpack && copyfiles **/* ../../dist && cd .. && rimraf .funcpack",
    "clean": "rimraf dist src/**/*.js src/**/*.map"
  },
```

<div class="notes">
  <span>Creando la primera <i>Function</i>.</span>
  <div class="tip">
    <p>
      Con la ayuda de los <i>scripts</i> de <i>npm</i> que hemos creado, vamos a crear una nueva <i>Function</i>. Para ello tendremos que volver a la consola y ejecutar el comando "npm run new". Durante el proceso elegiremos "HTTP trigger" como desencadenador y por nombre introduciremos "hello_world".
    </p>
  </div>
</div>

```bash
λ npm run new

Select a template:
Azure Blob Storage trigger
Azure Cosmos DB trigger
Durable Functions activity
Durable Functions HTTP starter
Durable Functions orchestrator
Azure Event Grid trigger
Azure Event Hub trigger
HTTP trigger                     <------------------
IoT Hub (Event Hub)
Azure Queue Storage trigger
SendGrid
Azure Service Bus Queue trigger
Azure Service Bus Topic trigger
Timer trigger
```

```bash
Select a template: HTTP trigger
Function name: [HttpTrigger] hello_world
```

<div class="notes">
  <span>Renombrar <i>index.js</i> a <i>index.ts</i>.</span>
  <div class="tip">
    <p>
      Nuestro script ha creado una <i>Function</i> básica en JavaScript. Para convertirla a TypeScript lo primero será cambiar la extensión de ".js" a ".ts", y después tendremos que tipar el código. Si eres un poco vago (como yo) puedes copiar el código expuesto a continuación.
    </p>
  </div>
</div>

```ts
import { Context, HttpRequest } from "@azure/functions";

export default async function (context: Context, req: HttpRequest) {
    context.log('TypeScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};
```

<div class="notes">
  <span>Probando el proyecto.</span>
  <div class="tip">
    <p>
      Para finalizar tendremos que probar que todo ha salido bien. Para ello lanzaremos en consola el comando "npm run serve" y veremos cómo se lanza un <i>Hosting</i> de Azure Functions y cerca del final de todos los logs nos parecerá la URL de nuestra <i>Function</i>.
    </p>
  </div>
</div>

```bash
λ npm run serve

Http Functions:

        hello_world: [GET,POST] http://localhost:7071/api/hello_world
```

<div class="notes">
  <span>Abrir la URL en un navegador cualquiera.</span>
  <div class="tip">
    <p>
      Si abrimos la URL en un navegador cualquier y le añadimos un parámetro de <i>QueryString</i> llamado "name", obtendremos un saludo.
    </p>
  </div>
</div>

```
http://localhost:7071/api/hello_world?name=Chiquitan%20Chiquititantantan
```

<div class="notes">
  <span>¡Hala! ¡A cascarla!</span>
  <div class="tip">
    <p>
      Solo queda despedirnos, no sin antes poneros <a href="https://github.com/fernandoescolar/azure-functions-typescript-boilerplate">el enlace al proyecto de GitHub donde hemos subido este boilerplate</a>. Sí, ya lo sé... os podíais haber ahorrado todo este artículo. Perdón.
    </p>
  </div>
</div>

```
https://github.com/fernandoescolar/azure-functions-typescript-boilerplate
```

<div style="text-align: center; margin-top: 30px;">
<button id="showAll" style="cursor: pointer; background-color: #ac4142; border: none; padding: 10px; color: #fff;">
clic aquí para disfrutar de la prosa
</button>
</div>

<script>
  function showAll() {
    var elements = document.getElementsByClassName('notes');
    while(elements.length > 0) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].children[0].remove();
        elements[i].classList.remove('notes');
      }
      elements = document.getElementsByClassName('notes');
    }
    document.getElementById('showAll').style.display = 'none';
    window.scroll(0, 0);
  }

  document.getElementById('showAll').addEventListener('click', showAll);
</script>

