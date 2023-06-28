---
published: true
ID: 201903261
title: 'Azure Functions con docker'
author: fernandoescolar
post_date: 2019-03-26 07:35:02
layout: post
tags: azure-functions azure functions docker node
background: '/assets/uploads/bg/containers.jpg'
---

Docker y los containers son a la programación, lo que el rebozado y empanado a la cocina tradicional. Si bien añade un paso extra que ensucia y a veces se hace un poco difícil, después puedes transportar la comida con mucha facilidad, sin romperla, y además te resulta muy fácil de comer. Y no nos engañemos, está claro que a todo el mundo le gustan las croquetas<!--break-->.

Si has llegado hasta aquí es posible que quieras hacer pechugas a la villaroy o una imagen de docker con tus Azure Functions dentro, nunca se sabe lo que puede pasar con las inteligencias artificiales hoy en día. De cualquier forma, estás en el lugar correcto: para lo primero necesitaremos pan rallado, huevo, bechamel y pechugas de pollo, y para lo segundo, docker, un proyecto de Azure Functions y 5 minutos de tu vida.

Aquí os vamos a exponer dos recetas, pero lo más recomendable es que mezcléis cosas de una y de otra:

## Receta 1

La primera receta es más a mano. Vamos a empezar desde hacer la bechamel, hasta acabar friendo las pechugas. Eso no quiere decir que vayan a ser unos pasos difíciles:

### Preparando la bechamel

Cogemos un cazó y calentamos leche. Metemos harina, mantequilla, mantenemos a fuego bajo, revolvemos y rezamos para que no nos salgan grumos.

En el caso de las Azure Functions necesitaremos tener instalado inicialmente [npm](https://www.npmjs.com/get-npm), [dotnet sdk](https://dotnet.microsoft.com/download/dotnet-core) y [docker](https://docs.docker.com/install/).

Después instalaremos una tool de Azure Functions que nos permitirá crear nuestro proyecto:

```bash
npm i -g azure-functions-core-tools
```

Ahora podremos crear nuestro primer proyecto directamente con soporte para docker:

```bash
$ func init . --docker
Select a worker runtime:
1. dotnet
2. node
3. python (preview)
Choose option: 1
dotnet

Writing /Users/fernandoescolar/projects/functions-docker/.vscode/extensions.json
Writing Dockerfile
```

Una vez tenemos el proyecto, añadimos nuestra primera Function:

``` bash
$ func new
Select a template:
1. QueueTrigger
2. HttpTrigger
3. BlobTrigger
4. TimerTrigger
5. DurableFunctionsOrchestration
6. SendGrid
7. EventHubTrigger
8. ServiceBusQueueTrigger
9. ServiceBusTopicTrigger
10. EventGridTrigger
11. CosmosDBTrigger
12. IotHubTrigger
Choose option: 2
Function name: Hello
Hello

The function "Hello" was created successfully from the "HttpTrigger" template.
```

### Empanando las pechugas

Rebozar es una tarea simple, sucia y tediosa. Las pechugas ya forman una unidad con la bechamel. Ahora batimos unos huevos en un plato, mientras que en otro ponemos pan rallado. Entonces, cogemos una a una las pechugas con bechamel y las bañamos en el plato de huevo, para acto seguido pasarlas por el de pan rallado. Si lo hacemos bien, tendremos un preparado perfecto, listo para cocinar.

Por otro lado, si queremos hacer una imagen de docker con nuestras Functions, lo primero que haremos para poder probarlas es ponerles un acceso público. Para ello, abrimos el archivo "Hello.cs" y sustituimos el `AuthorizationLevel.Function` por `AuthorizationLevel.Anonymous`.

### Friendo

Podríamos decir que solo tenemos que echar aceite a una sartén, esperar a que se caliente e ir pasando las pechugas hasta que consideremos que están bien hechas. Pero freír es un arte. Es como pintar un bello retrato o componer la más deliciosa de las sinfonías. Solo el talento y la práctica nos llevará a tener unos resultados excelentes.

Mientras que generar una imagen de docker cuando ya tienes el "Dockerfile" hecho, es bastante fácil. Basta con ejecutar el comando `build`:

```bash
$ docker build -t azurefunctionsdemo .
Step 1/6 : FROM microsoft/dotnet:2.1-sdk AS installer-env
Step 2/6 : COPY . /src/dotnet-function-app
Step 3/6 : RUN cd /src/dotnet-function-app &&     mkdir -p /home/site/wwwroot &&     dotnet publish *.csproj --output /home/site/wwwroot
Step 4/6 : FROM mcr.microsoft.com/azure-functions/dotnet:2.0
Step 5/6 : ENV AzureWebJobsScriptRoot=/home/site/wwwroot
Step 6/6 : COPY --from=installer-env ["/home/site/wwwroot", "/home/site/wwwroot"]
Successfully tagged azurefunctionsdemo:latest
```

### Comiendo

La mejor parte de hacer unas pechugas a la villaroy es comérselas. Con cuchillo y tenedor, con la mano... da igual. Si sobra (que no creo), lo suyo es guardarlas en un tupperware para comerlas mañana o pasado.

En cuanto una imagen de docker, si queremos ejecutarla localmente, hay que lanzar el comando `run` exponiendo el puerto 80 en el 8080 local:

```bash
$ docker run -p 8080:80 azurefunctionsdemo
Hosting environment: Production
Content root path: /
Now listening on: http://[::]:80
Application started. Press Ctrl+C to shut down.
```

Y podremos comprobar que ha funcionado visitando la url: [http://localhost:8080/api/hello?name=Chimo%20Bayo](http://localhost:8080/api/hello?name=Chimo%20Bayo).

Si lo que queremos es coger esa imagen y realizar un deploy a kubernetes, las tools que instalamos al inicio nos ayudarán:

```bash
func deploy --platform kubernetes --name azurefunctionsdemo --registry <docker-hub-id or registry-server> --pull-secret <registry auth secret> --min 3 --max 10
```

Un poquito de perejil y ¡para el clúster!

![Arguiñano con gafas "fuckyou"](/assets/uploads/2019/03/arguinano-gafas.jpg)

## Receta 2

Esta es la receta más sencilla, con unos resultados excelentes con poco esfuerzo:

### Ir al corte inglés y comprarlas hechas

Hace un tiempo, paseando por el supermercado del corte inglés descubrí que hay un puesto fuera con comida ya cocinada. Si vas antes de las 12 (después de esa hora no puedo garantizaros nada), tienen unas pechugas a la villaroy que están riquísimas. Casi como las de mi madre. Pero en esta vez, no habremos tenido que ensuciar nada, solo meterlas al microondas.

En el caso de docker y las Azure Functions, también tenemos una tienda donde podremos adquirir todo lo que necesitemos.

Si echamos un vistazo a [Azure Functions Base en el Hub de docker](https://hub.docker.com/_/microsoft-azure-functions-base) encontraremos diferentes imágenes base en dependencia de la plataforma y lenguajes de programación que usemos.

Desde ahí, encontraremos enlaces al [repositorio de GitHub de Azure Functions Docker](https://github.com/Azure/azure-functions-docker).

En este repositorio podremos encontrar los ejemplos de "Dockerfile" para muchos casos de uso y para lenguajes de programación como node, c#, python o powershell. Además de una serie de archivos ".yml" que nos ayudarán a automatizar la integración continua de nuestros contenedores en Hubs privados de Azure.

Una mina de oro.

## Conclusiones

A mi me gustan mucho las pechugas a la villaroy y también la propuesta de containers de docker con Azure Functions. Ambas cosas son sencillas de conseguir, aunque tener maestría requiere práctica y tiempo.

![Rico, rico y con fundamento](/assets/uploads/2019/03/arguinano-end.jpg)