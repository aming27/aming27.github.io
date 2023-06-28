---
published: true
ID: 202106101
title: 'Rust es especial'
author: fernandoescolar
post_date: 2021-06-10 01:05:31
layout: post
tags: rust
background: '/assets/uploads/bg/crab3.jpg'
---

Rust es un lenguaje de programación que no ha venido a hacer que programemos menos. Desde el primer momento de empezar a escribir código vamos a descubrir que, cosas relativamente comunes son mucho más fáciles de desarrollar usando lenguajes interpretados o compilados para una máquina virtual. Quizá ahí resida su encanto<!--break-->.

No obstante, hay que tener en cuenta que en ningún momento nos ha engañado. [La página web oficial de Rust](https://www.rust-lang.org/) lo define como "un idioma que empodera a todos para construir software confiable y eficiente". Suena a frase de CEO de megacorporación del estado de Washington. Y nunca dice que nos vaya a ayudar a programar menos. Dice que nos va a dar la capacidad de construir buen software.

Por ahora todo lo que hemos visto en los anteriores artículos será muy familiar para todos aquellos programadores que utilicen lenguajes como C y sus derivados. Lo único que la sintaxis te puede gustar más o menos. O quizá los automatismos te pueden parecer mejores o peores. De cualquier forma, es muy similar a lo que ya conocemos.

Entonces, ¿dónde está eso que tanto les gusta a los programadores de [stackoverflow](https://stackoverflow.com/)?

* TOC
{:toc}

## Lifecycle

En Rust no vamos a encontrar un *Garbage Collector* o algún mecanismo parecido que nos ayude a controlar el uso de memoria de nuestra aplicación. Esto es un gasto de rendimiento que si queremos conseguir las cifras que dicen, no nos lo podemos permitir. Rust es más como C, pero con una pequeña diferencia: en lugar de delegar la limpieza de memoria en nuestro criterio, va a crear un sistema de ámbito de existencia de una variable.

Esto quiere decir que allí donde declaremos una variable es donde reside la propiedad (*ownership*) de ese objeto. En medida que se libera el ámbito de ejecución del propietario de nuestra variable, esta se destruye automáticamente.

```rust
{
  let s = "ola k ase";
}

println!(s); // error: 's' ya no existe
```

Este concepto parece genial y muy sencillo de aplicar. Aquellos datos que van al "*Stack*" (los *Data Types*, como ocurre en otros lenguajes) no darán ningún problema y simplificará su uso, pero ¿qué pasa con los datos que van al "*Heap*"?

Ahí ya la cosa no es tan fácil. Por ejemplo, este código dará error:

```rust
let s1 = String::from("ola");
let s2 = s1;

println!("{} k ase", s1); // error aquí
```

Dará error porque el valor de `s1` ha sido prestado a `s2`. Por lo tanto, el valor de `s1` pertenece ahora a `s2` y ya no podemos usarlo con `s1`. Y por eso podemos clonarlo:

```rust
let s2 = s1.clone();
```

Encontraremos el mismo problema si enviamos un objeto del "*Heap*" a una función;

```rust
fn main() {
  let s1 = String::from("ola k ase");
  me_lo_quedo(s1);

  println!("{}, 2!", s1); // error aquí
}

fn me_lo_quedo(s: String) { // "s" entra en este ámbito
    println!("{}", s);
} // al finalizar el ámbito se destruye "s"
```

Esto significa que no pasamos un valor, si no una referencia a la porción de memoria que tiene ese valor. Por lo tanto, si se libera el contenido de esta sección de memoria, se borra el objeto para todos los ámbitos de existencia, incluido los superiores.

Solventar este problema es muy fácil, basta con devolver el objeto para que la propiedad de este vuelva al ámbito principal:

```rust
fn main() {
  let mut s1 = String::from("ola"); // mutable
  s1 = no_me_lo_quedo(s1); // lo asigno

  println!("{} k ase", s1); // ok
}

fn no_me_lo_quedo(s: String) -> String {
    println!("{}", s);
    s
} // al finalizar el ámbito no se destruye "s" porque se devuelve
```

Pero este comportamiento constantemente sería muy loco (o quizá no). Así que los diseñadores de Rust decidieron darnos una salida, la opción de pasar una referencia a nuestra variable, sin perder la posesión de esta usando el carácter `&`:

```rust
fn main() {
    let s1 = String::from("ola");
    no_me_lo_quedo(&s1);

    println!("{} k ase", s1);
}

fn no_me_lo_quedo(s: &String) {
    println!("{}", s);
}
```

Y con este método de usar referencias, podríamos resolver también el problema inicial:

```rust
let s1 = String::from("ola");
let s2 = &s1;

println!("{} k ase", s1);
```

Los tipos que se verían afectados si no pasamos la referencia son los se almacenan en el *Heap*, como `String`, `str` (que es un pedazo de un string), `Box<T>`, `Vec<T>`, etc. Y los tipos `struct`, que aunque se guardan en el *stack*, como referencian a otros objetos dentro de este, tendrían un comportamiento semejante.

Los tipos que no les afectaría este problema por ser de tipo valor son: los numéricos, booleanos y de tipo carácter.

## Impl Struct

Vamos a crear una estructura para almacenar los datos relacionados con un rectángulo:

```rust
struct Rectangle {
  width: u32,
  height: u32,
}
```

Si quisiéramos calcular el área de un rectángulo cualquiera, lo lógico sería crear una función que recibiera como parámetro un rectángulo por referencia:

```rust
fn area(r: &Rectangle) -> u32 {
  r.width * r.height
}
```

Pero en Rust se nos propone una implementación más elegante: crear una implementación de un método para una estructura:

```rust
impl Rectangle {
  fn area(&self) -> u32 {
    self.width * self.height
  }
}
```

Como podemos observar, referenciamos al objeto que estamos implementando con el valor `&self`. Esto es un *syntax-sugar* para definir `self: &Self`. Representa una referencia al propio objeto. Así que podremos acceder a las propiedades y a otras implementaciones de este usando `self`.

Declarando una función de esta forma, se puede llamar usando la notación típica para métodos de un objeto:

```rust
let r = Rectangle {
  width: 2,
  height: 3,
};

println!(
  "The area of the rectangle is {}.",
  r.area()
);
```

## Trait

Un `trait` en Rust, es la forma que tenemos para encapsular comportamiento. Se podría asemejar con lo que es una interfaz en otros lenguajes como C#, pero sensiblemente diferente:

```rust
trait Shape {
    fn area(&self) -> u32;
}
```

Este `trait` indicaría que nuestro objeto implementa una función llamada `area` que devuelve un número. Si quisiéramos implementarlo para un `struct` existente:

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Shape for Rectangle {
    fn area(&self) -> u32 {
        self.height * self.width
    }
}
```

Ahora podríamos consumir el `trait` llamado `Shape` de la siguiente manera:

```rust
fn print_area(shape: &dyn Shape) {
    println!("The area is {}", shape.area());
}

fn main() {
    let r = Rectangle { width: 2, height: 3 };
    print_area(&r);
}
```

Lo que más nos puede llamar la atención de este código es que usamos una palabra clave nueva: `dyn`. Esta palabra se usa al definir un tipo `trait`, para indicar de forma explícita que vamos a llamar a un método dentro de él. Esto es porque el sistema no tiene el tipo concreto de un `trait` y se pasa un puntero doble para detectar donde se alojan los métodos. El caso es que hay que usarlo para referenciarlo.

También podemos complicar un `trait` creando implementaciones por defecto:

```rust
trait Shape {
    fn get_name(&self) ->  &'static str;

    fn area(&self) -> u32;

    fn print_area(&self) {
        println!("The area of {} is {}", self.get_name(), self.area());
    }
}

struct Rectangle {
    width: u32,
    height: u32,
}

impl Shape for Rectangle {
    fn get_name(&self) ->  &'static str {
        "Rectangle"
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let r = Rectangle { width: 2, height: 3 };
    r.print_area();
    // The area of Rectangle is 6
}
```

E incluso podríamos declarar constructores:

```rust
struct User {
    name: &'static str
}

trait WithName {
    fn new(name: &'static str) -> Self;
}

impl WithName for User {
    fn new(name: &'static str) -> Self {
        User { name: name }
    }
}
```

Una forma muy potente de tratar y encapsular contratos y comportamientos. Además, recuerda mucho a los movimientos que se vienen haciendo en las últimas versiones de C#, en los que le van dando estas mismas funcionalidades a los objetos de tipo `interface` que existen en la plataforma de Microsoft.

## Pattern Matching

Rust tiene un sistema de *Pattern Matching* digno del mejor lenguaje de programación funcional. Su uso es muy simple, basta con usar la palabra clave `match` y describir los diferentes casos. Con números se pueden hacer series, diferenciales, igualdades... prácticamente todo lo que se nos pueda ocurrir:

```rust
let x = 5;

match x {
    1..=5 => println!("one through five"),
    6 | 7 => println!("six or seven"),
    8 => println!("eight"),
    _ => println!("something else"),
}
```

Y con estructuras y enumerados hay desde casting hasta deconstrucción:

```rust
let p = Point { x: 0, y: 7 };

match p {
    Point { x, y: 0 } => println!("On the x axis at {}", x),
    Point { x: 0, y } => println!("On the y axis at {}", y),
    Point { x, y } => println!("On neither axis: ({}, {})", x, y),
}
```

A lo largo de este artículo veremos muchas más aplicaciones de *Pattern Matching*. Otra carácterística que hemos ido viendo evolucionar en las últimas versiones de C# de una forma muy semejante a como la encontramos en Rust.

## Enum

Los enumerados de Rust funcionan de forma semejante a como lo hacen en otros lenguajes de programación. Es un tipo que engloba varios valores:

```rust
enum Kind {
    Dash,
    Slash,
    None
}
```

Para consumirlo es muy simple, basta con usar su nombre y seleccionar uno de los valores definidos:

```rust
let k: Kind = Kind::Dash;
```

Pero los valores de `enum` son mucho más potentes de lo que parece. Podemos componer estructuras de datos complejas, con propiedades o valores. Y, además, que estas estructuras sean diferentes para cada valor:

```rust
enum Action {
    Clean,
    Move { x: i32, y: i32 },
    Write(String),
    Color(u8, u8, u8),
}
```

De esta manera encapsularíamos diferentes tipos y datos dentro de un mismo `enum`. Y podríamos usar *Pattern Matching* para seleccionar y descomponer:

```rust
fn log_action(action: Action) {
    match action {
        Action::Clean => println!("clean"),
        Action::Move { x, y } => println!("move x={}, y={}", x, y),
        Action::Write(s) => println!("write: {}", s),
        Action::Color(r, g, b) => println!("color {:02x}{:02x}{:02x}", r, g, b),
    }
}
```

Para consumirlo utilizaremos una notación semejante a la que usamos con `struct`:

```rust
log_action(Action::Clean);
log_action(Action::Move { x: 1, y: 2 });
log_action(Action::Write("ola k ase".to_string()));
log_action(Action::Color(255, 0, 0));
```

Una funcionalidad que deja atrás casi todas las implementaciones que he podido ver al respecto. Aunque podríamos conseguir un comportamiento semejante, por ejemplo, en C#, usando herencia y polimorfismo.

## Generics

Al igual que en otros lenguajes de programación, en Rust podemos usar tipos genéricos. Además, tiene la ventaja de que estos tipos no causan ningún tipo de penalización en el rendimiento.

Por ejemplo, podemos crear una función que acepta un parámetro genérico cualquiera:

```rust
fn write<T>(_obj: T) {
    // ...
}
```

Si quisiéramos que, usando el formateador por defecto, esta función escribiera en consola el objeto que le pasáramos como parámetro, podríamos usar una cláusula `where` para indica que el objeto que recibamos debe ser de tipo `Display`:

```rust
use std::fmt::Display;

fn write<T>(obj: T) where T: Display {
    println!("{}", obj);
}
```

Y lo podríamos llamar de esta forma:

```rust
write(12);
write("hola");
write(true);
```

También podríamos declararlo en un `struct`:

```rust
struct Point<T> {
    x: T,
    y: T
}
```

Con tipos genéricos, podemos realizar una implementación específica para un tipo concreto:

```rust
impl Point<f64> {
    fn distance(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

Y también implementaciones para tipos que implementan un `trait`. En este caso tendríamos un ejemplo de una función que escribe en pantalla un descriptivo de nuestro objeto:

```rust
impl<T> Point<T> where T : Display {
    fn print(&self) {
        println!("x: {}, y: {}", &self.x, &self.y);
    }
}
```

O incluso podríamos implementar un `trait` existente, como el de escribir por pantalla, para nuestro tipo genérico:

```rust
impl<T> Display for Point<T> where T : Display {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        write!(f, "x: {}, y: {}", self.x, self.y)
    }
}
```

Y aquí cómo podríamos llamar a esas funciones que hemos creado:

```rust
let p = Point { x: 1.5, y: 2.0 };
println!("{}", p);
p.print();
```

## Closures

Lo que vulgarmente llamo "expresiones lambda", en Rust se le llama "*clousures*". Esto es una porción de código que representa una función declarada *inline* que se puede usar dentro de otra función. Seguro que queda más claro con un ejemplo:

```rust
fn  add_one_v1   (x: u32) -> u32 { x + 1 }
let add_one_v2 = |x: u32| -> u32 { x + 1 };
let add_one_v3 = |x|             { x + 1 };
let add_one_v4 = |x|               x + 1  ;
```

Como podemos ver, hay diferentes formatos para expresar este tipo de valores.

Además, cuando no especificamos el tipo, se infiere del contexto:

```rust
let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5); // error: 5 is not a string
```

Para usar *clousures* como tipos podemos usar `Fn`:

```rust
let a: Fn(u32) -> u32 = |x| x;
```

## Iterators

Otra funcionalidad cada día más común en todos los lenguajes de programación que tiene su implementación en Rust es la relacionada con los iteradores. Esto es un patrón mediante el cual podemos recorrer una lista secuencialmente llamando a un método `next`.

Gracias a este patrón podemos recorrer un objeto iterable en bucles:

```rust
let v = vec![1, 2, 3];
let v_iter = v.iter();
for val in v_iter {
    println!("Got: {}", val);
}
```

También podemos ejecutar funciones de tipo agregado:

```rust
let v = vec![1, 2, 3];
let v_iter = v.iter();
let total: i32 = v_iter.sum();
// total = 6
```

O transformaciones:

```rust
let v1 = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();
// v2 = [2, 3, 4]
```

Para hacer que un objeto (como ocurre con `Vec<>`) sea iterable, tenemos que implementar el `trait` llamado `Iterator`:

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```

Como, por ejemplo, este iterador que cuenta hasta 10:

```rust
struct Counter {
    count: u32,
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.count < 10 {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}
```

## Common C/C++ problems

Cuando desarrollas un nuevo lenguaje de programación lo primero que debes tener en mente son los problemas de sus predecesores. Es difícil no encontrar nada de C/C++ en cualquier otro lenguaje de programación y Rust no es una excepción. Ha tomado prestados muchos conceptos. Desde su forma de compilar, los tipos, referencias, estructuras, genéricos... Pero Rust también ha aprendido de algunos de los problemas que tanto dolor de cabeza nos han dado a los desarrolladores:

### NULL management

En Rust no existe el valor `null`, `NULL` o como quieras escribirlo. Para lidiar con este tipo de abstención de asignación, existe `Option<T>`. Un `enum` que nos ayudará a gestionar la ausencia de un valor en una variable:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Su uso es bastante simple:

```rust
let none_number: Option<i32> = None;
let some_number = Some(15);

if none_number == None {
    println!("is none")
}

if some_number == Some(15) {
    println!("is 15")
}
```

[Tony Hoare](https://en.wikipedia.org/wiki/Tony_Hoare), el inventor del concepto de "referencia nula", llegó a pedir perdón en 2009 por haberlo introducido. Sus disculpas mencionaban que lo hizo porque era fácil de implementar, pero que jamás fue código seguro. Alegando que este error habría costado millones de millones de dólares en daños, miedo y diferentes problemas durante los últimos 40 años.

Rust no iba a caer en esta trampa a la hora de implementarse como un lenguaje moderno y seguro.

### Error Handling

La forma más sencilla de lanzar un error en Rust es usar la macro `panic`:

```rust
fn main() {
    panic!("crash and burn");
}
```

Pero la mayor parte de las veces, cuando encontramos un error programando, no es necesario parar la ejecución del programa. Simplemente nos basta con manejar el error. Para ello contaremos con `Result<T, E>`:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

Un tipo `enum` que podremos usar en nuestros desarrollos y que encontraremos que se usa en prácticamente todas las librerías de Rust. Por ejemplo, a la hora de abrir un archivo:

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {:?}", error),
    };
}
```

Además, gracias al *Pattern Matching* y a los descriptivos de los errores, podremos realizar una lógica semejante, e incluso más potente, que la que podemos implementar con `try`, `catch` y las excepciones de otros lenguajes de programación:

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => {
                panic!("Problem opening the file: {:?}", other_error)
            }
        },
    };
}
```

### Smart pointers

Un puntero inteligente es un tipo de puntero, en el sentido más tradicional del concepto puntero, un valor en el *stack* que apunta a una dirección de memoria en el *heap*, pero con unas capacidades adicionales. La más importante de todas es que encapsulan una referencia (un puntero) y se hacen los "owners" de la misma. De esta manera, la referencia puede ser usada en diferentes lugares del código y es liberada una vez su dueño desaparece. Es decir, un *smart pointer* es un puntero "seguro".

Para ello Rust nos provee de unos cuantos artefactos. El más importante `Box<T>`, un `struct` que almacena un tipo en el *heap*:

```rust
let a = Box::new(5);
println!("The value of a is : {}", a);
```

Este código lo que hace es crear un puntero en el *stack* que apunta a una zona del *heap* donde encontraremos el valor `5`.

Además, podemos coger la referencia de cualquier puntero inteligente usando el método `deref` que implementamos con el `trait` `Deref`. Sería algo así:

```rust
impl<T> Deref for Box<T> {
    type Target = T;

    fn deref(&self) -> &T
    {
        &self.0
    }
}
```

También podemos realizar alguna tarea para cuando destruimos un *smart pointer* usando el `trait` `Drop`:

```rust
impl<T> Drop for Box<T> {
    fn drop(&mut self) {
        println!("Dropped {}", self.0);
    }
}
```

Con los `trait`s `Deref` y `Drop` podemos implementar nuestros punteros inteligentes personalizados.

Y existen dos tipos más por defecto. El `Rc<T>` que representa un puntero que cuenta el número de referencias de un dato. Y `RefCell<T>` que es un puntero mutable que nos permite modificar datos incluido los que ya son inmutables. Pero esto ya es otra liga :).

## Conclusiones

Ya os habréis dado cuenta de que en realidad Rust es un lenguaje multiparadigma. Se puede programar de forma funcional u orientado a objetos. Y eso es algo que ya de por sí mola mucho.

Se ve como una plataforma moderna. Gracias a todas esas formas de prevenir los punteros "locos", la gestión de memoria sin necesidad de recolectores de basura o todas las funcionalidades avanzadas, es, sin duda, un lenguaje referente a pesar de su corta edad.

Tan referente que a medida que lo iba estudiando iba encontrando carácterísticas que en los últimos años se han añadido a mi lenguaje de programación de referencia (C#). Y al ir a mirar la fecha de implementación, me he dado cuenta de que eran funcionalidades que llevaban bastante tiempo implementadas en Rust.

A Rust lo acompaña un conjunto de herramientas muy depuradas. Por ejemplo, el compilador es una pasada. Es muy exigente, pero también aporta soluciones muy concretas. Con *cargo* todo se hace más fácil: el sistema de paquetes (*crates*) o incluso lanzar pruebas unitarias. Muy intuitivo todo.

Encima, la comunidad que lo acompaña es espectacular. Quizá no sea tan grande como la de otros lenguajes, pero hay mucho material. Un buen rollo tremendo entre *rustaceans*, muchos *crates*, un montón de vídeos en YouTube, muchos meetups locales (como estos de [Barcelona](https://www.meetup.com/es-ES/BcnRust) o [Madrid](https://www.meetup.com/es-ES/MadRust/)) y muchísima documentación:

- [El libro de Rust](https://doc.rust-lang.org/book/)
- [El libro de ejemplos](https://doc.rust-lang.org/stable/rust-by-example/)
- El libro de artes oscuras: [El rustonomicon](https://doc.rust-lang.org/nomicon/)
- [Patrones de diseño con Rust](https://rust-unofficial.github.io/patterns/)
- [El libro de cocina de Rust](https://rust-lang-nursery.github.io/rust-cookbook/)

Rust mola. Mola mucho. Creo que ahora entiendo por qué es [el lenguaje más querido de los desarrolladores de stackoverflow](https://insights.stackoverflow.com/survey/2020#technology-most-loved-dreaded-and-wanted-languages-loved). Pero no lo usaría en todos mis desarrollos. Quizá sea porque estoy lejos de ser un experto.

![El Dr. Zoidberg sale corriendo](/assets/uploads/2021/06/zoidberg2.gif)
