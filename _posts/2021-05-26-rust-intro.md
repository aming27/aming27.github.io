---
published: true
ID: 202105261
title: 'Primeros pasos con Rust'
author: fernandoescolar
post_date: 2021-05-26 01:05:31
layout: post
tags: rust
background: '/assets/uploads/bg/crab1.jpg'
---

El año 2020 corona por quinta vez consecutiva a [Rust](https://www.rust-lang.org/) como [el lenguaje de programación más querido](https://insights.stackoverflow.com/survey/2020#technology-most-loved-dreaded-and-wanted-languages-loved) por los visitantes de [stackoverflow](https://stackoverflow.com/). Puede ser que en 2016 la gente tuviera un poco de *hype*. No en vano, ese año ya había salido su versión 1.0. Después de varios años de desarrollo empezaba a parecer una plataforma muy rápida, eficiente, solvente y, en definitiva, interesante<!--break-->. Y que [Google haya añadido soporte para Rust en android](https://security.googleblog.com/2021/04/rust-in-android-platform.html), que [Microsoft decidiera unirse a la Rust Foundation](https://cloudblogs.microsoft.com/opensource/2021/02/08/microsoft-joins-rust-foundation/) y que [AWS, Huawei, Mozilla o Facebook](https://foundation.rust-lang.org/members/) también estén en el barco, me hace pensar que es el momento de aprender un poco de Rust.

> **_Disclaimer_**: el objetivo de este artículo no es ser un tutorial exhaustivo para aprender a programar con Rust. Tan solo un pequeño resumen de mis primeras experiencias con el lenguaje. Es posible que esta información sea suficiente para hacer un aterrizaje a la plataforma, pero si quieres aprender de verdad, te recomendamos que leas [El Libro](https://doc.rust-lang.org/book/) y/o que veas [estos vídeos](https://www.youtube.com/watch?v=KOABboz7PBs&list=PLojDVPvSO1DjYj8bMcMOU3KzLbRww-3Eb) de [Roberto Huertas](https://twitter.com/robertohuertasm) sobre el tema.

Como en un futuro próximo querré volver a algún punto tratado en este artículo, voy a dejar un índice de los diferentes temas, a continuación:

- [Introducción](#intro)
- [Entorno](#environment)
- [Hola Mundo](#hello)
- [Mutabilidad](#mutable)
- [Shadowing](#shadowing)
- [Tipos de datos](#types)
- [String](#strings)
- [Tuplas](#tuples)
- [Array](#arrays)
- [Funciones](#functions)
- [Condicionales](#conditions)
- [Bucles](#loops)
- [Struct](#structs)
- [Módulos](#modules)
- [Conclusiones](#conclusiones)

<a id="intro"></a>El desarrollo de Rust arrancó en 2006. Ese año, [Graydon Hoare](https://twitter.com/graydon_pub) empezó un proyecto personal al que llamó "Rust" tomando como fuente de inspiración un [tipo de hongo](https://en.wikipedia.org/wiki/Rust_(fungus)). Años más tarde, en 2009, la empresa en la que trabajaba, que era ni más ni menos que [Mozilla](https://www.mozilla.org/), decidió patrocinar el proyecto. El momento en el que el fue [anunciado oficialmente](http://venge.net/graydon/talks/intro-talk-2.pdf) es en 2010, durante un "Mozilla Summit". Por ahí por 2012 se publicó la primera versión *alpha*, y no fue hasta 2015 que se lanzó [la primera *relase* estable](https://blog.rust-lang.org/2015/05/15/Rust-1.0.html), la 1.0.

A partir de ese momento, su popularidad y uso han ido en aumento hasta el punto en el que, por sus características y alto rendimiento, actualmente es uno de los lenguajes más usados para nuevos desarrollos, por encima, incluso, de lenguajes tradicionales como C o C++. Ha sido tan grande el aumento de su popularidad y tiene tan buen rendimiento que también es la plataforma más usada a la hora de trabajar con criptomonedas (y su minado).

Rust es un proyecto *Open Source* cuyo código fuente puedes encontrar en [su página de GitHub](https://github.com/rust-lang). Aunque esté patrocinado por megacorporaciones, se mantiene gracias a la colaboración de la comunidad y se desarrolla de forma totalmente abierta.

Existe una mascota (no oficial pero sí oficiosa) de Rust con forma de cangrejo que se llama "[Ferris](https://www.rustacean.net/)". Debido a esto, los programadores de este lenguaje se autodenominan "*rustaceans*" (que se podría traducir como "*rustáceos*"). Una mezcla de "rust" y "*crustacean*" (crustáceo).

<img src="/assets/uploads/2021/05/ferris.png" alt="Ferris the crab" width="300" />

Hay un documento al que los *rustaceans* llaman "[El Libro](https://doc.rust-lang.org/book/)" que es considerado como la enciclopedia-tutorial-guía-manual (todo en uno) sobre Rust. Un *must-read* en toda regla si quieres conocer algo de este lenguaje.

No me enrollo más:

## ¡A programar!

<a id="environment"></a>Para comenzar, tendremos unos pocos requisitos. Lo primero es instalar las [C++ Build Tools de Microsoft junto con el SDK de Windows 10](https://visualstudio.microsoft.com/visual-cpp-build-tools/). Después hay que descargar [el instalador de las herramientas de Rust](https://www.rust-lang.org/tools/install) y ejecutarlo. Por último, podemos añadir la [extensión no oficial de Rust](https://marketplace.visualstudio.com/items?itemName=matklad.rust-analyzer) para *vscode* (por lo visto la oficial no funciona). Y con esto ya estaríamos en disposición de empezar a aprender.

Parece ser que, para trabajar con Rust se usa una herramienta de consola llamada `cargo`. No es obligatorio, pero todos dicen que nos facilitará las tareas más comunes.

<a id="hello"></a>Con esta herramienta, para crear nuestro primer proyecto basta con lanzar el siguiente comando:

```bash
cargo new rust_demo
```

Y para compilarlo y ejecutarlo, navegamos a su carpeta y ejecutamos `cargo run`:

```bash
$ cd rust_demo
$ cargo run
  Finished dev [unoptimized + debuginfo] target(s) in 0.03s
   Running `target\debug\rust_demo.exe`
Hello, world!
```

Ahí veremos el famoso "hola mundo" de todo buen lenguaje de programación.

Si abrimos la carpeta con Visual Studio Code, encontraremos un repositorio de git con la estructura de archivos típica de un proyecto. En la carpeta "src" encontraremos un archivo llamado "main.rb" con el siguiente contenido:

```rust
fn main() {
  println!("Hello, world!");
}
```

Viendo esto, podemos deducir que el punto de entrada de nuestro programa es una función llamada `main`, como en tantas otras plataformas... Y para escribir un valor por pantalla podemos usar una macro llamada `println`. Sabemos que es una macro porque termina en el símbolo de exclamación. Ahora bien, aun no tengo claro que es una macro en Rust. Supongo o espero que algo parecido a lo que es en C/C++.

Rust es un lenguaje donde, en principio, las variables son inmutables:

```rust
let x = 41;
println!("x is: {}", x);
x = 42; // --> aquí da error
println!("x is: {}", x);
```

<a id="mutable"></a>Pero puedes usar la palabra clave `mut` para hacerlo mutable:

```rust
let mut x = 41;
println!("x is: {}", x);
x = 42; // --> ok
println!("x is: {}", x);
```

<a id="shadowing"></a>O hacer *shadowing*:


```rust
let x = 41;
println!("x is: {}", x);
let x = 42;
println!("x is: {}", x);
```

Aquí la variable `x` es sustituida por una nueva. De esta manera, podríamos incluso asignar una variable de otro tipo:

```rust
let x = 41;
println!("x is: {}", x);
let x = true;
println!("x is: {}", x);
```

<a id="types"></a>Si estamos programando en *vscode* veremos que este ejemplo se pinta en pantalla así:

```rust
let x: i32 = 41;
println!("x is: {}", x);
let x: bool = true;
println!("x is: {}", x);
```

Esto es porque Rust es un lenguaje tipado que infiere el tipo de las variables por su contexto. Pero aquellas veces en las que no se pueda determinar con exactitud cuál será su valor, se nos exigirá que lo indiquemos. Como, por ejemplo, cuando creamos una constante:

```rust
const THE_NUMBER: i32 = 42;

fn main() {
  println!("the answer is: {}", THE_NUMBER);
}
```

Tenemos tipos `bool`, enteros con o sin signo de 8, 16, 32, 64 y 128 bits (`i8`, `i16`, `i32`, `i64`, `i128`, `u8`, `u16`, `u32`, `u64` y `u128`), del tamaño de bits del sistema operativo (`isize` y `usize`), números con comas flotantes (`f32` y `f64`) y el tipo `char`, que aquí ocupa 4 bytes (es un carácter *unicode*).

Todos los *castings* han de ser explícitos:

```rust
let decimal = 65.4321;
let integer = decimal as u8;
let character = integer as char;
let boolean = false;
let false_value = boolean as u8;

println!("decimal: {}, integer: {}, character: {}, boolean: {}", decimal, integer, character, false_value);
// decimal: 65.4321, integer: 65, character: A, boolean: 0
```

<a id="strings"></a>Las cadenas de texto merecen una explicación a parte. Pueden ser de tipo `String`, que representa una cadena de texto en formato *unicode*, o de tipo `&str` que representa un puntero a una porción de un `String`.

Un `String` puede ser mutable y podemos modificar su valor mediante una serie de funciones:

```rust
let mut string = String::from("Hello");
string.push_str(", Rust!");
println!("{}", string.len()); // 12
```

Mientras que un `&str` es un puntero al que podemos modificar el valor si lo hacemos mutable, pero que no nos sirve para modificar el valor de una cadena:

```rust
let slice = "Hello, Rust!"; // infiere el tipo "&str"
let string: String = slice.to_string();
let slice: &str = string.as_str();
```

<a id="tuples"></a>Además, existen las tuplas. Y con ellas, una vía para componer y descomponerlas:

```rust
let tupla = (500, 6.4, 1);
let (x, y, z) = tupla;

println!("x is: {}, y is: {}, z is: {}", x, y, z);
```

<a id="arrays"></a>Y los *arrays*:

```rust
let a = [1, 2, 3, 4, 5];

let first = a[0];
let second = a[1];
```

<a id="functions"></a>Para crear funciones simplemente usaremos la palabra clave `fn`:

```rust
fn main() {
  get_the_answer();
}

fn get_the_answer() {
  print!("the answer to life the universe and everything is: ");

  let result = add(23, 19);
  println!("{}", result);
}

fn add(a: i32, b: i32) -> i32 {
  a + b
}
```

Y para devolver valores simplemente indicamos con una flechita (`->`) el tipo que va a devolver y escribimos el valor. Sin punto y coma ni nada. Pero podemos hacer muchas cosas antes de devolver el valor:

```rust
fn add(a: i32, b: i32) -> i32 {
  println!("ola");
  println!("k");
  println!("ase");
  a + b
}
```

También podemos especificar que una función no tiene valor de retorno (`-> ()`) o usar la palabra clave `return` dentro de una función:

```rust
fn get_the_answer() -> () {
  print!("the answer to life the universe and everything is: ");

  let result = add(23, 19);
  println!("{}", result);
}

fn add(a: i32, b: i32) -> i32 {
  return a + b;
}
```

<a id="conditions"></a>En Rust tenemos condicionales:

```rust
fn is_even(number: i32) {
  if number % 2 == 0 {
    println!("{} is even number", number);
  } else {
    println!("{} is odd number", number);
  }
}
```

<a id="loops"></a>Y bucles:

```rust
// for: desde 0 hasta 99
for number in 0..100 {
  is_even(number);
}

// for: desde 0 hasta 100
for number in 0..=100 {
  is_even(number);
}

// con loop
let mut counter = 0;
loop {
  is_even(counter);
  counter += 1;
  if counter > 100 {
    break;
  }
}

// con while
let mut counter = 0;
while counter <= 100 {
  is_even(counter);
  counter += 1;
}
```

<a id="structs"></a>En cuanto a estructuras o valores compuestos, encontramos `struct`, que funciona muy parecido a como lo haría en C/C++:

```rust
// estructura unitaria
struct Unit;

// como tupla
struct Pair(i32, f32);

// con campos
struct Point {
  x: f32,
  y: f32,
  z: f32
}
```

Podemos instanciar una `struct` usando su nombre:

```rust
let point: Point = Point { x: 10.3, y: 0.4, z: 1.2 };
```

Se puede generar una nueva `struct` a partir de otra existe:

```rust
let top_point = Point { x: 0.0, ..point };
```

Y se puede descomponer:

```rust
let Point { x: left_edge, y: top_edge, z: deep_edge } = point;
println!("top: {}, left: {}, deep: {}", left_edge, top_edge, deep_edge);
```

<a id="modules"></a>Todo esto está genial, pero ir declarando estructuras, funciones y demás, por todos los lados, nos puede generar un pequeño dolor de cabeza a la hora de gestionar. Para prevenir estos problemas nos encontramos la palabra clave `mod`, que nos ayuda a definir módulos.

Antes de hacer nada, hay que saber que todo lo que pongamos dentro de un módulo es privado. Por lo que si queremos exponerlo al exterior tendríamos que usar la palabra clave `pub`. Aquí un ejemplo de un módulo:

```rust
mod my_mod {
  pub struct Point {
     pub x: f32,
     pub y: f32
  }

  fn private_function() {
     println!("called `my_mod::private_function()`");
  }

  pub fn public_function() {
     println!("called `my_mod::public_function()`");
     private_function();
  }

  pub mod nested {
     pub fn public_function() {
       println!("called `my_mod::nested::public_function()`");
     }
  }
}
```

Para usar las funciones y estructuras públicas de este módulo podremos usar una navegación por nombres, usando `::` como unión:

```rust
my_mod::public_function();
my_mod::private_function(); // error, es privada
my_mod::nested::public_function();

let p = my_mod::Point { x: 1.0, y: 2.0 };
println!("x = {}, y = {}", p.x , p.y);
```

Si queremos usar módulos que estén en otros archivos usaremos la palabra clave `mod` pero sin las llaves. Es decir, usándola *inline*:

```rust
mod my_mod;

fn main() {
  my_mod::public_function();
}
```

La línea `mod my_mod;` va a buscar un archivo que se llame "my_mod.rs" y si no lo encuentra buscará "my_mod/mod.rs". Y la consecuencia es que el contenido de ese archivo estará disponible donde se referencie.

<a id="conclusiones"></a>Y lo vamos a dejar aquí, por hoy.

Hemos aprendido un montón de conceptos: [mutabilidad](#mutable), el [shadowing](#shadowing), los [tipos de datos](#types), cómo funcionan los [strings](#strings), [tuplas](#tuples) o [arrays](#arrays). También hemos repasado cómo declarar [funciones](#functions), hacer [bloques condicionales](#conditions) y [bucles](#loops). Para terminar, hemos visto la creación de [estructuras de datos](#structs) y la gestión de [módulos](#modules). Todo lo que le pediríamos a un lenguaje de programación para poder empezar a funcionar. Aunque, solo hemos raspado la superficie de este lenguaje y no hemos entrado en las características que hace tan potente y único a Rust.

De este artículo me quedo con el tema de las tuplas. Es muy interesante ver cómo se resuelve en Rust este tema y cómo los últimos avances de C# han sido al respecto. No sé quién fue primero, pero van bastante alineados...

La semana que viene me comprometo a aplicar los conocimientos que hemos adquirido en algún pequeño desarrollo y exponerlo en un nuevo artículo.

Ya estoy con ganas de seguir trabajando con Rust y saber más sobre este fantástico lenguaje de programación :).

![El Dr. Zoidberg sale corriendo](/assets/uploads/2021/06/zoidberg2.gif)