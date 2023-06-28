---
published: true
ID: 202203031
title: 'Dockerfile tips'
author: fernandoescolar
post_date: 2022-03-03 06:15:41
layout: post
tags: best-practices docker k8s
background: '/assets/uploads/bg/tip.jpg'
---

Hace unos años, la entradilla de un artículo de este mismo blog, que hablaba de contenedores y Azure Functions, comenzaba:

> Docker y los containers son a la programación, lo que el rebozado y empanado a la cocina tradicional.

Y sigo pensando lo mismo. De hecho, los contenedores están más de moda que nunca. Y en este contexto, es fundamental saber crear las imágenes más eficientes posibles. Es decir, buenos archivos *Dockerfile*<!--break-->.

En este artículo vamos a detallar unos cuantos consejos. Es posible que ya los hayas leído en otras páginas Web o libros. También es posible que no te resulten novedosos. O que los estés aplicando sin haberles puesto nombre. De cualquier forma, aquí encontrarás un compendio de aquellos consejos que procuro seguir siempre que voy a crear imágenes de Docker (o simplemente OCI). Unos consejos para conseguir tres objetivos: que ocupen menos espacio, sean más eficientes y que mantengan un mínimo de seguridad.

Al lío:

## Evita usar imágenes base de dudosa procedencia

La mayoría de nuestros desarrollos utilizan al menos una imagen base. Esta se especifica usando el comando `FROM` dentro del *Dockerfile*. Y es que, las imágenes *Docker* no son diferentes de cualquier otra aplicación de software. Pueden ser manipuladas y, por lo tanto, es arriesgado usar una imagen que no sea de una fuente fiable. *Docker hub* proporciona versiones oficiales de las imágenes base de los sistemas operativos más populares, como por ejemplo **Ubuntu** o **CentOS**. Y otras *3rd parties* como **Microsoft** también tienen un catálogo de imágenes a nuestra disposición. Lo que recomendamos es que uses estas imágenes como base en tus desarrollos.

[Imágenes oficiales de Docker](https://docs.docker.com/docker-hub/official_images/)

[Imágenes oficiales de Docker para .NET](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/net-core-net-framework-containers/official-net-docker-images)

## Evita la etiqueta latest para las imágenes base

Está muy bien que usemos las imágenes base oficiales para evitar problemas. Pero como corolario a esta práctica, se recomienda evitar usar la etiqueta `latest` para referenciarlas. Esta etiqueta es cambiante y puede referenciar a diferentes versiones de las imágenes según un periodo de tiempo. Si la usamos y cambia la versión, podríamos encontrar comportamientos no esperados. Y, además, podríamos estar usando una versión antigua con vulnerabilidades, pero que no fuéramos conscientes porque nuestras soluciones apuntan a `latest`.

Como norma general se recomienda concretar la versión de las imágenes base:

```Dockerfile
FROM ubuntu:focal
```

o

```Dockerfile
FROM ubuntu:20.04
```

## Usar varias LABEL en una sola línea

Los archivos Dockerfile nos permiten añadir metadatos a nuestras imágenes usando el comando `LABEL`. Esto nos ayudará a organizar mejor un conjunto de imágenes de los que se puede componer un solo producto. Un bloque que podríamos encontrarnos sería:

```Dockerfile
LABEL version="0.0.1"
LABEL vendor="Contoso Ltd."
LABEL vendor2=Fabrikam\ Inc
LABEL date="2022-03-03"
```

Esto mismo podría ser expresado como una sola línea:

```Dockerfile
LABEL version="0.0.1" \
      vendor="Contoso Ltd." \
      vendor2=Fabrikam\ Inc \
      date="2022-03-03" \
```

## Usa COPY en lugar de ADD

Dentro de un *Dockerfile* podemos usar los comandos `ADD` y `COPY` para lograr un objetivo similar: introducir contenido dentro del contenedor. Mientras `COPY` es claramente para copiar archivos de un directorio local al contenedor, `ADD` tiene un super poder oculto. Se puede usar para descargar contenido desde una *URL* durante el tiempo de construcción. Esto puede tener como resultado un comportamiento inesperado, especialmente si la *URL* utilizada carga contenido de una fuente no del todo fiable.

## Usa el archivo .dockerignore

El archivo **.dockerignore** tiene un cometido semejante al de, por ejemplo **.gitignore**. Permite especificar una lista de archivos o directorios que *Docker* debe ignorar durante el proceso de construcción. Esto puede ser muy útil en algunos casos. Pero lo más importante es que el archivo **.dockerignore** puede ayudarte a reducir el tamaño de la imagen y a acelerar drásticamente el proceso de compilación.

Un ejemplo:

```Dockerfile
# ignorar archivos de configuración y/o contraseñas
*.settings

# resultados de compilación
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Bb]in/
[Oo]bj/
[Ll]og/

#  resultados de los tests
[Tt]est[Rr]esult*/
[Bb]uild[Ll]og.*

# ignora las carpetas git, cache, de visual studio y visual studio code
.git
.cache
.vs
.vscode

# archivos específicos del usuario
*.suo
*.user
*.userosscache
*.sln.docstates

# Publish Web Output
*.Pp]ublish.xml

# ignora todos los archivos markdown
*.md
```

## Copia sólo lo necesario

Este consejo viene de la mano del anterior. Es muy común encontrar el comando `COPY` de forma que apunte a todo el contenido del directorio local, usando el carácter `.`:

```Dockerfile
COPY . /app
```

Con esta línea, todo lo disponible en el directorio actual, se copiará en el contenedor. Este tipo de líneas puede conllevar un riesgo si por ejemplo se nos cuela algún tipo de información sensible como contraseñas o backups en alguna de esas carpetas. Y también es posible que copiemos archivos que no son necesarios dentro de nuestro contenedor (por ejemplo, el propio *Dockerfile*). Y por tanto nos puede llevar a un tamaño de la imagen mayor. Así que recomendamos que, si se puede, copiar solo lo indispensable de forma explícita:

```Dockerfile
COPY server.js /app
```

## Usa menos capas

Cada comando en un *Dockerfile* se traduce en una nueva capa. Siempre es recomendable asegurarse de mantener el número de capas lo más bajo posible.

Un ejemplo sería si tuviéramos una imagen donde quisiéramos crear un *nginx* que nos sirva una web estática:

```Dockerfile
FROM alpine:3.14
EXPOSE 80

RUN apk update
RUN apk add curl
RUN apk add nodejs
RUN apk add nginx

COPY index.html /usr/share/nginx/www
COPY 404.html /usr/share/nginx/www
COPY 500.html /usr/share/nginx/www
COPY nginx.conf /etc/nginx/default.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
```

Podríamos optimizar este archivo encadenando las llamadas `RUN` y usando *wildcards* como `*` en uno de los comandos `COPY`:

```Dockerfile
FROM alpine:3.14
EXPOSE 80

RUN apk update \
 && apk add curl \
 && apk add nodejs \
 && apk add nginx

COPY *.html /usr/share/nginx/www
COPY nginx.conf /etc/nginx/default.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
```

## Diferencias entre CMD y ENTRYPOINT

Las instrucciones `CMD` y `ENTRYPOINT` se usan para definir el proceso que se ejecuta en tu contenedor.
- `ENTRYPOINT` establece el proceso que se ejecuta cuando el contenedor se inicia por primera vez. Por defecto su valor es el de la *shell* '/bin/sh'.
- `CMD` proporciona los argumentos por defecto para el proceso `ENTRYPOINT`.

El siguiente Dockerfile ejecutaría `echo "hello world"`:

```Dockerfile
FROM ubuntu:focal

ENTRYPOINT [ "echo" ]
CMD [ "hello world" ]
```

Al especificar tanto `ENTRYPOINT` como `CMD`, cualquier usuario podrá ver el comportamiento por defecto usando `docker run`:

```bash
$ docker run hello-world
hello world
```

Pero podríamos sobrescribir los parámetros que aporta `CMD` añadiendo parámetros a nuestra llamada de ejecución:

```bash
$ docker run hello-world "ola k ase"
ola k ase
```

Básicamente lo que ha ocurrido es que habremos ejecutado `echo "ola k ase"`.

## Limpiar cachés

Es muy posible que entre los diferentes pasos que seguimos en la creación de una imagen, instalemos algún paquete o utilidad. Y es muy posible que usemos herramientas de gestión de paquetes como `apt`, `apk` o `yum`. Estas utilidades descargan un archivo y lo almacenan en caché. Después lo instalarán desde esa caché. Pero los archivos descargados es posible que se queden almacenados en nuestra imagen, ocupando un espacio muy preciado.

Por eso recomendamos una limpieza después de la instalación y vamos a comentar las más comunes:

### Usando alpine

Si usas `alpine` como imagen base y estás instalando paquetes con la herramienta `apk` tienes dos alternativas. La primera sería especificar que no deseas usar caché:

```Dockerfile
FROM alpine:3.14
RUN apk add --no-cache mysql-client
```

Y la segunda, que sería borrar la caché después de instalar:

```Dockerfile
FROM alpine:3.14
RUN apk add mysql-client \
    && rm -rf /var/cache/apt/
```

### Usando debian/ubuntu

En estas distribuciones, el gestor de paquetes es `apt`. Y aquí estás de suerte, porque ambas imágenes oficiales llaman automáticamente a `apt-get clean` después de cada `install`. Aunque tal vez creas que es conveniente ejecutar un `&& rm -rf /var/lib/apt/lists/*` para borrar los datos referentes al estado de los paquetes en los repositorios al finalizar las instalaciones.

### Instalado manual

Si realizas una instalación manual, usando por ejemplo `curl` para descargar un instalador, siempre puedes borrar el instalador al finalizar:

```Dockerfile
RUN curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 \
    && chmod 700 get_helm.sh \
    && ./get_helm.sh \
    && rm get_helm.sh
```

## El momento de dotnet restore

Una buena práctica a la hora de generar imágenes de **.Net** es descargar primero los paquetes *NuGet* y en una capa posterior añadir el código fuente.

Esto es porque, mientras no cambien las dependencias, esta capa se reusará la siguiente vez que queramos construir la imagen. Se empezarán a crear nuevas capas cuando encuentre cambios en el código fuente y en los archivos binarios.

La idea sería seguir un orden semejante a este:

```Dockerfile
# copia los archivos .csproj que indican los paquetes NuGet
COPY *.csproj .
# realiza el restore
RUN dotnet restore
# copia el código fuente
COPY . .
# compila la aplicación
RUN dotnet publish -c Release -o out
```

## Aprovecha el multi-stage

Cuando tenemos un *Dockerfile* grande es común que se haya diseñado siguiendo la técnica de *multi-stage*. Uno de los principales beneficios de esta técnica es reducir el tamaño total de la imagen Docker final. Pero también tiene efectos secundarios positivos. Uno de ellos impacta en la seguridad, ya que la imagen final sólo contiene lo necesario. Y otro sería hacer que los archivos * Dockerfile* sean más legibles.

El secreto de *multi-stage* es que realiza operaciones de construcción en un contenedor intermedio. De esta forma, puedes incluir en la imagen final sólo las bibliotecas y los binarios de salida. Es decir, la imagen final no contendrá piezas como las herramientas de compilación (por ejemplo, el sdk o herramientas como `npm` o `tsc`).

Un ejemplo:

```Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet: 6.0-bullseye-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY *.sln .
COPY MyApp.Api/*.csproj ./MyApp.Api/
COPY MyApp.Library/*.csproj ./MyApp.Library/
RUN dotnet restore

COPY . .
WORKDIR /src/MyApp.Api
RUN dotnet publish -c release -o /app --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app ./
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

## Conclusiones

Creo que hacer imágenes de *Docker* es muy sencillo. Pero cuando queremos hacerlas bien, es decir:

- que no tarden años en construirse
- que no nos dejen sin espacio las máquinas donde las usamos
- que sean seguras

Esto ya es otro cantar. Puedes seguir estos consejos y hacer muy malas imágenes. También podrías ignorarlos y tener el sistema más eficiente.

Solo espero que te resulten de ayuda.