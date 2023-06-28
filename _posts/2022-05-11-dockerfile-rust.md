---
published: true
ID: 202205111
title: 'Dockerfile para Rust'
author: fernandoescolar
post_date: 2022-05-11 05:15:46
layout: post
tags: docker k8s rust
background: '/assets/uploads/bg/rust-docker.jpg'
---

He de reconocer que tengo una debilidad con *rust*. No es mi lenguaje de programación favorito ni de referencia. Ni si quiera lo uso en mi trabajo diario. Pero siempre que puedo hago alguna pequeña aplicación usándolo. Es un lenguaje de programación que me gusta mucho<!--break-->. Así que he decido crear una buena imagen de *rust* a base de aplicar buenas prácticas en un `Dockerfile`.

> **Disclaimer**: me considero un programador *junior* de *rust*. Y mis conocimientos de *docker* no es que sean de experto. El código que vais a ver a continuación puede no ser el ideal ni el más/mejor optimizado.

Como en toda aplicación de *rust*, lo primero que necesitaremos es crear el proyecto y a tal fin, recomendamos usar la herramienta `cargo`:

```bash
cargo new rustainer
```

Nos movemos al directorio de nuestro proyecto:

```bash
cd rustainer
```

Y ahora editaremos el archivo `Cargo.toml` para añadir las dependencias mínimas para crear un proyecto web sencillo:

- `tokio`: para el tema de asincronía
- `hyper`: para crear un servidor web
- `routerify`: para crear las rutas y *handlers* de nuestros *endpoints*

El archivo `Cargo.toml` podría quedar tal que así:

```ini
[package]
name = "rustainer"
version = "1.0.0"
authors = ["Fernando Escolar <f.escolar[at]hotmail.com>"]
edition = "2018"

[dependencies]
hyper = "0.14"
tokio = { version = "1.17", features = ["full"] }
routerify = "3.0"
```

Ahora vamos a desarrollar, en *rust* y usando estas librerías, una pequeña *API* que por *HTTP* devuelva un simple "Hola mundo". No vamos a entrar en los detalles de implementación, pero aprovechamos para proponer una solución:

```rust
use std::{net::SocketAddr, convert::Infallible};
use hyper::{Server, Request, Response, StatusCode, Body};
use routerify::{RouterService, Router, RequestInfo};

async fn home_handler(_: Request<Body>) -> Result<Response<Body>, Infallible> {
    Ok(Response::new(Body::from("Hello world!")))
}

async fn error_handler(err: routerify::RouteError, _: RequestInfo) -> Response<Body> {
    eprintln!("{}", err);
    Response::builder()
        .status(StatusCode::INTERNAL_SERVER_ERROR)
        .body(Body::from(format!("Something went wrong: {}", err)))
        .unwrap()
}

fn router() -> Router<Body, Infallible> {
    Router::builder()
        .get("/", home_handler)
        .err_handler_with_info(error_handler)
        .build()
        .unwrap()
}

#[tokio::main]
async fn main() {
    let router = router();
    let service = RouterService::new(router).unwrap();
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let server = Server::bind(&addr).serve(service);

    println!("Server is running on: {}", addr);
    if let Err(err) = server.await {
        eprintln!("Server error: {}", err);
   }
}
```

Para comprobar que todo funciona como esperamos usaremos `cargo` para compilar y lanzar nuestra aplicación:

```bash
cargo run
```

Y ahora desde otro terminal, podremos consultar el *endpoint* que hemos expuesto usando el comando `curl`:

```bash
$ curl http://localhost:3000
Hello world!
```

La respuesta debería ser ese `Hello world!` que vemos.

Ahora vamos a comenzar con el archivo `Dockerfile`. La idea es que en el proceso de construcción de la imagen de tipo *docker* (sí, una imagen *OCI*) construyamos la aplicación que hemos programado en *rust* y la ejecutemos en otra imagen lo más simple posible. Siempre que hablamos de imagen simple dentro del ecosistema de *docker*, nos viene a la cabeza `alpine`. Así que usaremos la imagen de *rust* oficial en su versión `alpine3.15` ya que tenemos la intención de ejecutar nuestra aplicación en esa última imagen:

```dockerfile
FROM rust:alpine3.15 AS build
```

Con el fin de crear una imagen lo más compatible posible y para no tener problemas con las dependencias de algunos *crates*, vamos a instalar *musl*. Esto es una implementación de la biblioteca estándar de C construida sobre la API base de Linux. Vamos a usar *musl* porque es ligero, rápido, sencillo, gratuito y cumple con los estándares. En una imagen `alpine` solo tenemos que usar el comando `apk`:

```dockerfile
RUN apk add musl-dev --no-cache
```

Después crearemos el entorno de trabajo, seleccionaremos un directorio y copiaremos todos los archivos del proyecto:

```dockerfile
WORKDIR /src
COPY . .
```

Para tener los binarios de nuestra aplicación, solo tenemos que ejecutar el comando `cargo build`:

```dockerfile
RUN cargo build --release
```

Ahora tendremos que configurar el entorno para ejecutar el binario resultado de la compilación de los pasos anteriores. En este caso, nos hemos decantado por usar una imagen `alpine`:

```dockerfile
FROM alpine:3.15
```

Copiaremos los binarios:

```dockerfile
WORKDIR /app
COPY --from=build /src/target/release/rustainer .
```

Y ejecutaremos nuestra aplicación:

```dockerfile
ENTRYPOINT [ "./rustainer" ]
```

Todo esto junto nos daría como resultado un archivo `Dockerfile` tal que así:

```dockerfile
FROM rust:alpine3.15 AS builder
RUN apk add musl-dev --no-cache
WORKDIR /src
COPY . .
RUN cargo build --release

FROM alpine:3.15
WORKDIR /app
COPY --from=builder /src/target/release/rustainer .
ENTRYPOINT [ "./rustainer" ]
```

Así que, ya podemos construir nuestra imagen:

```bash
docker build -t rustainer .
```

Y podemos lanzar un contenedor exponiendo el puerto `3000`:

```bash
docker run -p 3000:3000 rustainer
```

Y para comprobar que todo funciona correctamente, recurriremos de nuevo al comando `curl`:

```bash
$ curl http://localhost:3000
Hello world!
```

De nuevo, si obtenemos un `Hello world!` como resultado, significa que todo ha ido bien.

![oh yeah!](/assets/uploads/2022/05/yes1.gif)

## Añadir .dockerignore

Lo primero que haremos para mejorar la construcción de nuestra imagen es añadir el archivo `.dockerignore` que contiene los archivos que no queremos que se incluyan en la construcción de la imagen cuando llamamos al comando `COPY`:

```txt
.vscode
.gitignore
target
Cargo.lock
```

Lo importante es excluir la carpeta "target" para evitar llevar a la imagen binarios locales. Y después el archivo "Cargo.lock" para no cerrarnos a nuevas revisiones de los *crates* que estamos usando.

## Realizar descarga de paquetes primero

Existe un *crate* llamado `cargo-chef`. Una herramienta pensada para acelerar la construcción de imágenes tipo *docker* con *rust*. Pero nada recomendable para el uso en local.

Instalarla es muy sencillo, solo tendremos que llamar al comando `cargo install cargo-chef`. Así que podríamos preparar una imagen basada en `alpine` que tenga instaldo *msul* y esta herramienta:

```dockerfile
FROM rust:alpine3.15 AS chef
RUN apk add musl-dev --no-cache && \
    cargo install cargo-chef
WORKDIR /src
```

Después deberíamos lanzar el comando `prepare`. Este comando analiza el proyecto actual para determinar el subconjunto mínimo de archivos (Cargo.lock y Cargo.toml) necesarios para construirlo y almacenar en caché las dependencias. Podríamos crear un *stage* a tal fin:

```dockerfile
FROM chef AS planner
COPY . .
RUN cargo chef prepare
```

Entonces crearemos un nuevo *stage* para construir el proyecto. Y lo primero que haremos será copiar el resultado de `cargo chef prepare`:

```dockerfile
FROM chef AS builder
COPY --from=planner /src/recipe.json recipe.json
```

A continuación, lanzaremos el comando `cook`. Esto rehidrata el esqueleto del proyecto usando las dependencias y archivos de configuración generados en el paso anterior.

```dockerfile
RUN cargo chef cook
```

Y una vez tenemos el proyecto preparado, copiaremos el código fuente y lanzaremos la compilación:

```dockerfile
COPY . .
RUN cargo build --release
```

El resultado final podría ser algo así:

```dockerfile
FROM rust:alpine3.15 AS chef
RUN apk add musl-dev --no-cache && \
    cargo install cargo-chef
WORKDIR /src

FROM chef AS planner
COPY . .
RUN cargo chef prepare

FROM chef AS builder
COPY --from=planner /src/recipe.json recipe.json
RUN cargo chef cook
COPY . .
RUN cargo build --release

FROM alpine:3.15
WORKDIR /app
COPY --from=builder /src/target/release/rustainer .
ENTRYPOINT [ "./rustainer" ]
```

![oh yeah!](/assets/uploads/2022/05/yes3.gif)

## Indicar al inicio la información importante

Siempre que leo un archivo `Dockerfile` espero encontrar al principio cual es la imagen que se va a ejecutar y, en el caso de que sea una Web o una API, cual es el puerto donde se expone la aplicación. Pero en este caso, estamos especificando la imagen que vamos a ejecutar cerca del final. Esto tiene fácil solución, solo tenemos que indicarlo:

```dockerfile
FROM alpine:3.15 as runtime
EXPOSE 3000
```

Y después donde llamemos a la imagen de *alpine* para ejecutar la aplicación, basta referenciarla como `runtime`. El resultado final sería algo así:

```dockerfile
FROM alpine:3.15 as runtime
EXPOSE 3000

FROM rust:alpine3.15 AS chef
RUN apk add musl-dev --no-cache && \
    cargo install cargo-chef
WORKDIR /src

FROM chef AS planner
COPY . .
RUN cargo chef prepare

FROM chef AS builder
COPY --from=planner /src/recipe.json recipe.json
RUN cargo chef cook
COPY . .
RUN cargo build --release

FROM runtime AS runner
WORKDIR /app
COPY --from=builder /src/target/release/rustainer .
ENTRYPOINT [ "./rustainer" ]
```

## Compilar con root, ejecutar con usuario

Cuando estamos trabajando con imágenes tipo *docker* es importante el tema de los permisos del usuario que ejecuta la aplicación. Pero en este caso, vamos a realizar una compilación de código y quizá alguna tarea extra, y estos procesos pueden requerir permisos elevados. Para usar este tipo de credenciales bastará con ejecutar este comando:

```dockerfile
USER root
```

Pero cuando queramos ejecutar la aplicación compilada sería interesante usar otro tipo de cuenta de permisos reducidos. Para ello podríamos crear una nueva cuenta llamada `webuser` en `alpine`:

```dockerfile
RUN addgroup -S webuser && adduser -S webuser -G webuser
```

Y para usar esta cuenta bastaría con indicarlo:

```dockerfile
USER webuser
```

Si aplicamos esta estrategia a nuestro archivo `Dockerfile`, tendríamos un resultado parecido al siguiente:

```dockerfile
FROM alpine:3.15 as runtime
EXPOSE 3000

FROM rust:alpine3.15 AS chef
RUN apk add musl-dev --no-cache && \
    cargo install cargo-chef
USER root
WORKDIR /src

FROM chef AS planner
COPY . .
RUN cargo chef prepare

FROM chef AS builder
COPY --from=planner /src/recipe.json recipe.json
RUN cargo chef cook
COPY . .
RUN cargo build --release

FROM runtime AS runner
WORKDIR /app
RUN addgroup -S webuser && adduser -S webuser -G webuser
COPY --from=builder /src/target/release/rustainer .
USER webuser
ENTRYPOINT [ "./rustainer" ]
```

## Ser explícitos con los comandos

Otra buena práctica con *rust* y en general con todas las herramientas de línea de comandos es ser explícitos con los parámetros por defecto que queremos usar. Actualmente se usan ciertos parámetros por omisión, pero podría suceder que estos valores por defecto cambiaran y generaran problemas o incertidumbre.

El primer parámetro que podemos especificar es el nombre del archivo resultado de la ejecución de `cargo chef prepare`. Este archivo es importante porque luego se consume para realizar el comando `cargo chef cook`. Así que es recomendable especificarlo con el argumento:

```
--recipe-path recipe.json
```

Otro parámetro importante es la plataforma objetivo de la compilación. Aunque estamos usando *musl* como dependencias y estamos dentro de una imagen linux, estaría bien especificar qué tipo de binario esperamos obtener:

```
--target x86_64-unknown-linux-musl
```

Y, por último, merece la pena indicar qué proyecto es el que tenemos intención de compilar y ejecutar después:

```
--bin rust-devops
```

Si añadimos estos parámetros a los comandos de nuestro archivo `Dockerfile`, tendríamos:

```dockerfile
FROM alpine:3.15 as runtime
EXPOSE 3000

FROM rust:alpine3.15 AS chef
RUN apk add musl-dev --no-cache && \
    cargo install cargo-chef
USER root
WORKDIR /src

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /src/recipe.json recipe.json
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl --bin rustainer

FROM runtime AS runner
WORKDIR /app
RUN addgroup -S webuser && adduser -S webuser -G webuser
COPY --from=builder /src/target/x86_64-unknown-linux-musl/release/rustainer .
USER webuser
ENTRYPOINT [ "./rustainer" ]
```

Es importante remarcar que, al especificar el `target` de la compilación, la carpeta donde se almacenará los binarios resultantes cambiará.

Y todo seguirá funcionando a la perfección.

![oh yeah!](/assets/uploads/2022/05/yes2.gif)

## Añadir tests

El último detalle con el que podríamos mejorar el proceso sería añadiendo la ejecución de las pruebas unitarias.

Para definir un *test* bastará con añadir un archivo llamado "src/lib.rs" con un contenido similar a este:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

Y para ejecutar las pruebas unitarias bastaría con ejecutar el comando `cargo test`:

```dockerfile
FROM builder AS tests
RUN cargo test --workspace --release
```

Al construir la imagen, veremos que se ejecutan los tests unitarios y su resultado por el terminal. Deberíamos encontrarnos con algo parecido a esto:

```bash
running 1 tests

test result: ok. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
```

Y finalmente, si añadimos este *stage* a nuestro archivo `Dockerfile`, tendríamos:

```dockerfile
FROM alpine:3.15 as runtime
EXPOSE 3000

FROM rust:alpine3.15 AS chef
RUN apk add musl-dev --no-cache && \
    cargo install cargo-chef
USER root
WORKDIR /src

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /src/recipe.json recipe.json
RUN cargo chef cook --release --target x86_64-unknown-linux-musl --recipe-path recipe.json
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl --bin rustainer

FROM builder AS tests
LABEL test=true
RUN cargo test --workspace --release

FROM runtime AS runner
WORKDIR /app
RUN addgroup -S webuser && adduser -S webuser -G webuser
COPY --from=builder /src/target/x86_64-unknown-linux-musl/release/rustainer .
USER webuser
ENTRYPOINT [ "./rustainer" ]
```

## Conclusiones

La verdad es que la generación de imágenes OCI (tipo *docker*) es todo un mundo. Puedes hacer algo muy sencillo o algo muy complejo. Se puede aprovechar para encapsular muchas operaciones en una sola construcción y luego sacar partido a todo en diferentes contenedores.

En este ejemplo hemos visto algunas buenas prácticas como reutilizar las capas con los paquetes externos. O cómo dividir en diferentes *stages* las diferentes tareas que ejecutamos durante la construcción de una imagen. También hemos visto como pasar las pruebas unitarias.

Un ejemplo que creemos muy completo y que esperamos que os pueda ayudar vuestro día a día...