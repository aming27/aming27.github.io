---
published: true
ID: 202204271
title: 'Dockerfile para .Net 6'
author: fernandoescolar
post_date: 2022-04-27 05:15:41
layout: post
tags: docker k8s net6 test pipelines azure
background: '/assets/uploads/bg/docker.jpg'
---

Hoy vamos a proponer un reto: a ver si conseguimos hacer un artículo sobre contenedores sin usar la palabra *docker* españolizada y verbalizada. Y ya que estamos, a ver si también conseguimos hablar de como *dockerizar* nuestras aplicaciones en *.Net 6*... oh vaya... bueno, como iba diciendo: a ver si conseguimos no escribir la palabra *kubernetes* en todo el artículo. Difícil<!--break-->.

Imaginemos que tenemos una solución en *.Net 6* llamada "DockerWithNet6":

```bash
mkdir demo
cd demo
dotnet new sln -n DockerWithNet6
```

Imaginemos que dentro de esta solución tenemos una aplicación de tipo `webapi` llamada "MyApi":

```bash
dotnet new webapi -o MyApi
dotnet sln add MyApi/MyApi.csproj
```

Y que tenemos un proyecto para los *tests* unitarios llamado "MyApi.Tests":

```bash
dotnet new xunit -o MyApi.Tests
dotnet sln add MyApi.Tests/MyApi.Tests.csproj
dotnet add MyApi.Tests/MyApi.Tests.csproj reference MyApi/MyApi.csproj
```

Si quisiéramos añadir cobertura de código para nuestros tests, una forma podría ser añadir una referencia a la librería `xcoverlet.msbuild`:

```bash
dotnet add MyApi.Tests/MyApi.Tests.csproj package coverlet.msbuild
```

De esta forma podríamos ejecutar un comando semejante al siguiente y obtener un informe sobre el resultado y la cobertura de nuestras pruebas en la carpeta "testresults":

```bash
dotnet test --results-directory testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="../testresults/" -p:CoverletOutputFormat=json%2cCobertura
```

Hasta aquí creo que todos podríamos tener un escenario inicial bastante parecido en nuestros proyectos. Ahora bien, ¿qué pasa si queremos que nuestra aplicación se ejecute en un contenedor de tipo *docker*?

Lo primero que deberíamos hacer es crear un archivo llamado `Dockerfile` en la raíz de nuestra solución. Dentro de este archivo lo primero sería lanzar la compilación de nuestra aplicación. Y la mejor forma de compilar una aplicación en *.Net 6* dentro de *docker* es usar la imagen oficial de *Microsoft* con el *SDK*:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
```

Después especificaríamos el directorio de trabajo y copiaríamos ahí el código fuente:

```dockerfile
WORKDIR /src
COPY . .
```

Y finalmente lanzaríamos el comando de publicar nuestra aplicación en un directorio concreto dentro del contenedor:

```dockerfile
RUN dotnet publish "MyApi/MyApi.csproj" -c Release -o /app
```

Para ejecutar nuestra aplicación podemos lanzar el comando `dotnet run` dentro del contenedor, pero es mejor no usar la imagen del *SDK*. *Microsoft* tiene imágenes específicas para la ejecución de aplicaciones *asp.net* dentro de *docker*:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0
```

Luego especificaríamos un directorio de trabajo nuevo y copiaríamos ahí los binarios que compilamos con la imagen anterior:

```dockerfile
WORKDIR /app
COPY --from=build /app ./
```

Y finalmente ejecutaríamos nuestra aplicación:

```dockerfile
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

Todo junto daría como resultado este contenido:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish "MyApi/MyApi.csproj" -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app ./
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

Ahora podríamos probar construir la imagen:

```bash
docker build -t docker-net6-test .
```

Y ejecutarla exponiendo el puerto `80` del contenedor en el puerto `5000` de nuestra máquina:

```bash
docker run -p 5000:80 docker-net6-test:latest
```

Para probar que la aplicación funciona podríamos ejecutar un comando `curl` que consumiera la *api* por defecto que crea la plantilla de *.Net*:

```bash
$ curl http://localhost:5000/WeatherForecast
[{"date":"2022-05-15T09:06:08.9415323+00:00","temperatureC":33,"temperatureF":91,"summary":"Scorching"},{"date":"2022-05-16T09:06:08.942493+00:00","temperatureC":0,"temperatureF":32,"summary":"Cool"},{"date":"2022-05-17T09:06:08.9424966+00:00","temperatureC":-4,"temperatureF":25,"summary":"Balmy"},{"date":"2022-05-18T09:06:08.9424973+00:00","temperatureC":34,"temperatureF":93,"summary":"Hot"},{"date":"2022-05-19T09:06:08.9424979+00:00","temperatureC":32,"temperatureF":89,"summary":"Bracing"}]
```

En este punto hemos conseguido crear un proyecto de *asp.net* en con el SDK de *.Net 6*, construirlo en un *Dockerfile* y ejecutarlo en un contenedor de tipo *docker*. Pero no estamos satisfechos, creemos que todo esto lo podemos mejorar:

## Añadir .dockerignore

Lo primero que haremos para mejorar la construcción de nuestra imagen es añadir el archivo `.dockerignore` que contiene los archivos que no queremos que se incluyan en la construcción de la imagen cuando llamamos al comando `COPY`:

```txt
.git
.vscode
.vs
**/bin
**/obj
```

Excluir las carpetas "bin" y "obj" de cada proyecto es fundamental para evitar errores de compilación. El resto de las carpetas son algunas genéricas que no necesitamos para hacer funcionar nuestra aplicación.

## Realizar descarga de paquetes primero

Para ganar velocidad a la hora de lanzar muchas construcciones de una misma imagen de *.Net*, es recomendable realizar unos pasos específicos comunes donde descargamos los paquetes de *NuGet*, antes de realizar la compilación de la aplicación. A tal fin, sustituiremos la línea de `COPY . .` por las siguientes operaciones:

```dockerfile
COPY ./*.sln ./
COPY ./MyApi/*.csproj ./MyApi/
COPY ./MyApi.Tests/*.csproj ./MyApi.Tests/
RUN dotnet restore
```

Después copiaremos solo los archivos del código fuente de nuestra aplicación:

```dockerfile
COPY ./MyApi/. ./MyApi/
```

Y finalmente, lanzaremos la compilación de la aplicación indicando que no debe restaurar los paquetes de *NuGet*:

```dockerfile
RUN dotnet publish "MyApi/MyApi.csproj" -c Release -o /app --no-restore
```

Pero esta línea estaría muy bien poder separarla en forma de *stage* de compilación:

```dockerfile
FROM build AS publish
WORKDIR /src/MyApi
RUN dotnet publish -c Release -o /app --no-restore
```

El resultado completo sería:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ./*.sln ./
COPY ./MyApi/*.csproj ./MyApi/
COPY ./MyApi.Tests/*.csproj ./MyApi.Tests/
RUN dotnet restore
COPY ./MyApi/. ./MyApi/

FROM build AS publish
WORKDIR /src/MyApi
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS run
WORKDIR /app
COPY --from=publish /app ./
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

## Indicar al inicio la información importante

Siempre que leo un archivo `Dockerfile` espero encontrar al principio cual es la imagen que se va a ejecutar y, en el caso de que sea una Web o una API, cual es el puerto donde se expone la aplicación. Pero en este caso, estamos especificando la imagen que vamos a ejecutar cerca del final. Esto tiene fácil solución, solo tenemos que indicarlo:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 80
```

Y después donde llamemos a la imagen de *asp.net* para ejecutar la aplicación, basta referenciarla como `base`. El resultado final sería algo así:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ./*.sln ./
COPY ./MyApi/*.csproj ./MyApi/
COPY ./MyApi.Tests/*.csproj ./MyApi.Tests/
RUN dotnet restore
COPY ./MyApi/. ./MyApi/

FROM build AS publish
WORKDIR /src/MyApi
RUN dotnet publish -c Release -o /app --no-restore

FROM base AS run
WORKDIR /app
COPY --from=publish /app ./
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

## Añadir los tests

Ahora que tenemos varios *stages* definidos, como son `build`, `publish` y `run`, podríamos añadir uno más para lanzar los *tests* y recoger los resultados y la cobertura en una carpeta específica.

Lo primero será crear este nuevo *stage* basándonos en el de `build`:

```dockerfile
FROM build as tests
```

Ahora añadiremos una etiqueta para indicar que es un *stage* de tests:

```dockerfile
LABEL test=true
```

Copiaremos el código fuente del proyecto de pruebas:

```dockerfile
COPY ./MyApi.Tests/. ./MyApi.Tests/
```

Y finalmente, lanzaremos la ejecución de los *tests* basándonos en el comando que usamos al inicio del artículo, pero variando las carpetas de salida para que las podamos encontrar en contenedor fácilmente:

```dockerfile
RUN dotnet test -c Release --results-directory /testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="/testresults/" -p:CoverletOutputFormat=json%2cCobertura -m:1
```

El resultado del archivo `Dockerfile` completo vendría a ser algo así:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ./*.sln ./
COPY ./MyApi/*.csproj ./MyApi/
COPY ./MyApi.Tests/*.csproj ./MyApi.Tests/
RUN dotnet restore
COPY ./MyApi/. ./MyApi/

FROM build AS publish
WORKDIR /src/MyApi
RUN dotnet publish -c Release -o /app --no-restore

FROM build as tests
LABEL test=true
COPY ./MyApi.Tests/. ./MyApi.Tests/
RUN dotnet test -c Release --results-directory /testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="/testresults/" -p:CoverletOutputFormat=json%2cCobertura -m:1

FROM base AS run
WORKDIR /app
COPY --from=publish /app ./
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

Ahora podríamos volver a construir la imagen con todos los *stages*:

```bash
docker build -t docker-net6-test .
```

Y podríamos lanzar un contenedor que ejecutara la aplicación:

```bash
docker run -p 5000:80 docker-net6-test
```

Si quisiéramos comprobar que sigue respondiendo de forma correcta podríamos volver a ejecutar el comando `curl` con la previsión del tiempo:

```bash
$ curl http://localhost:5000/WeatherForecast
[{"date":"2022-05-22T10:29:51.5716016+00:00","temperatureC":35,"temperatureF":94,"summary":"Balmy"},{"date":"2022-05-23T10:29:51.5723112+00:00","temperatureC":26,"temperatureF":78,"summary":"Hot"},{"date":"2022-05-24T10:29:51.5723143+00:00","temperatureC":17,"temperatureF":62,"summary":"Chilly"},{"date":"2022-05-25T10:29:51.572315+00:00","temperatureC":13,"temperatureF":55,"summary":"Bracing"},{"date":"2022-05-26T10:29:51.5723157+00:00","temperatureC":48,"temperatureF":118,"summary":"Cool"}]
```

![oh yeah!](/assets/uploads/2022/03/yes1.gif)

Construye la imagen a toda velocidad y todo funciona correctamente, pero ¿dónde están los resultados de las pruebas?

Como ya sabréis, una imagen de tipo *docker* se genera a partir de una serie de capas. Cada línea de código que se ejecuta en el `Dockerfile` podríamos decir que representa una de esas capas. Cada capa se comporta como una imagen en sí misma, siendo la última de ellas esa capa junto con la ejecución de todas las anteriores.

Y resulta que, al realizar la construcción de nuestra imagen, se generó una capa con la etiqueta de `test=true`. Así que, solo tenemos que buscarla:

```bash
$ docker images --filter "label=test=true"
REPOSITORY          TAG       IMAGE ID       CREATED              SIZE
<none>              <none>    e5b5bc46ae6a   About a minute ago   1.02GB
```

En este caso la imagen con los resultados de las pruebas tiene el identificador `e5b5bc46ae6a`. Pero podríamos encontrar este valor usando un pequeño script de bash como este:

```bash
# image_with_tests=e5b5bc46ae6a
image_with_tests=$(docker images --filter "label=test=true" | head -2 | tail -1 |  sed 's/|/ /' | awk '{print $3}')
```

Una vez tenemos este valor podríamos crear un contenedor basado en esta imagen/capa:

```bash
docker create --name test-results $image_with_tests
```

Después de crear este contenedor con nombre `test-results` podríamos copiar el contenido de la carpeta de resultados de las pruebas a una carpeta local, fuera del contexto del contenedor:

```bash
docker cp test-results:/testresults ./testresults
```

Y si miramos el contenido local de la carpeta que acabamos de copiar encontraremos el resultado de los *tests* en formato *trx* y la cobertura en formato *json*:

```bash
$ ls testresults
_8xxxxxxxxxxx_2022-05-21_12_46_50.trx  coverage.cobertura.xml  coverage.json
```

Ya tenemos los resultados de las pruebas en nuestra carpeta local y podemos analizarlos o generar informes a partir de ellos.

![oh yeah!](/assets/uploads/2022/03/yes2.gif)

Si quisiéramos poner un "nombre" y/o versión a la imagen con los resultados de las pruebas podríamos hacerlo apuntando como *stage* objetivo de la construcción de la imagen el de los `tests`:

```bash
docker build -t docker-net6-test . --target tests
```

Y de esta forma sería más sencillo crear un contenedor:

```bash
docker create --name test-results docker-net6-test
```

Y usar el mismo comando que antes para recoger los resultados:

```bash
docker cp test-results:/testresults ./testresults
```

## Bonus: Tests Results en Azure Pipelines

Si usáramos todos estos comandos para automatizar estas pruebas en una *pipeline* de *azure devops* por ejemplo, podríamos usar un código semejante a este:

```yaml
- script: |
    docker build -t docker-net6-test .
  displayName: build image
- script: |
    image_with_tests=$(docker images --filter "label=test=true" | head -2 | tail -1 |  sed 's/|/ /' | awk '{print $3}')
    docker create --name test-results $image_with_tests
    docker cp test-results:/testresults ./testresults
  displayName: copy results
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'VSTest'
    testResultsFiles: '**/*.trx'
    searchFolder: testresults/
    publishRunAttachments: true
  displayName: 'Publish test results'
- task: PublishCodeCoverageResults@1
  inputs:
    codeCoverageTool: 'cobertura'
    summaryFileLocation: 'testresults/coverage.cobertura.xml'
  displayName: 'Publish coverage reports'
- script: |
    docker rm test-results
  displayName: cleanup
```

Y podríamos encontrar en los informes de la ejecución de la *pipeline* algo parecido a esto:

![Azure DevOps: Pipeline - Test Coverage](/assets/uploads/2022/03/pipeline-test-coverage.png)

>Si no ves el tab de cobertura de código es porque hasta que no aparece hasta que no finaliza la pipeline completa

## Bonus: añadiendo más proyectos de tests

Si nos encontráramos con un proyecto más complejo, donde tuviéramos más de un proyecto de pruebas:

```bash
dotnet new xunit -o MyApi.Tests2
dotnet sln add MyApi.Tests2/MyApi.Tests2.csproj
dotnet add MyApi.Tests2/MyApi.Tests2.csproj reference MyApi/MyApi.csproj
dotnet add MyApi.Tests2/MyApi.Tests2.csproj package coverlet.msbuild
```

Para ejecutar todos los proyectos de pruebas en un solo comando, podríamos hacerlo de la siguiente forma:

```bash
dotnet test --results-directory testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="../testresults/" -p:MergeWith="../testresults/coverage.json" -p:CoverletOutputFormat=json%2cCobertura
```

Observad que al ejecutar el comando se generan dos archivos de resultado de tipo *trx* y solo uno de cobertura en formato *json*. Esto se debe al argumento `-p:MergeWith` que indica que los resultados de cobertura de código deberán ser unificados en un solo archivo.

Para hacer que la imagen de *docker* contenga también las pruebas de este nuevo proyecto solo tendremos que copiar el nuevo archivo *.csproj* antes del `dotnet restore`:

```dockerfile
COPY ./MyApi.Tests2/*.csproj ./MyApi.Tests2/
```

y el código fuente de nuestras pruebas antes del `dotnet test`:

```dockerfile
COPY ./MyApi.Tests2/. ./MyApi.Tests2/
```

Finalmente, tendríamos un `Dockerfile` semejante al siguiente:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ./*.sln ./
COPY ./MyApi/*.csproj ./MyApi/
COPY ./MyApi.Tests/*.csproj ./MyApi.Tests/
COPY ./MyApi.Tests2/*.csproj ./MyApi.Tests2/
RUN dotnet restore
COPY ./MyApi/. ./MyApi/

FROM build AS publish
WORKDIR /src/MyApi
RUN dotnet publish -c Release -o /app --no-restore

FROM build as tests
LABEL test=true
COPY ./MyApi.Tests/. ./MyApi.Tests/
COPY ./MyApi.Tests2/. ./MyApi.Tests2/
RUN dotnet test -c Release --results-directory /testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="/testresults/" -p:MergeWith="/testresults/coverage.json" -p:CoverletOutputFormat=json%2cCobertura -m:1

FROM base AS run
WORKDIR /app
COPY --from=publish /app ./
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

## Conclusiones

La verdad es que la generación de imágenes OCI (tipo *docker*) es todo un mundo. Puedes hacer algo muy sencillo o algo muy complejo. Se puede aprovechar para encapsular muchas operaciones en una sola construcción y luego sacar partido a todo en diferentes contenedores.

En este ejemplo hemos visto algunas buenas prácticas como reutilizar las capas con los paquetes externos. O cómo dividir en diferentes *stages* las diferentes tareas que ejecutamos durante la construcción de una imagen. También hemos visto como pasar los proyectos de prueba y recoger la cobertura de código. Además, de cómo podríamos usar esta información en una *Azure DevOps pipeline*.

Un ejemplo que creemos muy completo y que esperamos que os pueda ayudar vuestro día a día...