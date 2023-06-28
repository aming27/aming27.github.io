---
published: true
ID: 202106021
title: 'Kata FizzBuzz en Rust'
author: fernandoescolar
post_date: 2021-06-02 01:05:31
layout: post
tags: rust
background: '/assets/uploads/bg/crab2.jpg'
---

Dicen las leyendas que uno de los juegos de beber más conocidos de Inglaterra es el FizzBuzz. El *quinito* en cuestión consiste en montar un corro de personas e ir contando desde 1 en adelante. Cada jugador va diciendo un número secuencialmente. Pero hay 3 condiciones: si el número es múltiplo de 3 en lugar del número, debes decir "Fizz", si es múltiplo de 5 dices "Buzz" y si es múltiplo de ambos, "FizzBuzz". El que falle al decir su número o palabra, bebe<!--break-->. Parece fácil, pero prueba a hacerlo con unos chupitos de por medio.

Lo malo es que luego [vas a la wikipedia](https://en.wikipedia.org/wiki/Fizz_buzz) y este juego tan divertido parece ser que está enfocado en los niños y que les ayuda a aprender multiplicaciones y divisiones... adiós a la leyenda urbana. Qué desilusión...

De cualquier manera, es una *kata* muy conocida de programación. Es simple, ayuda a aprender las mecánicas de TDD y expone una forma de trabajar del desarrollador que la resuelve.

Podríamos definir los requisitos de nuestro ejercicio como:

> Desarrollar un programa que muestre en pantalla los números del 1 al 100, sustituyendo los múltiplos de 3 por la palabra "Fizz", los múltiplos de 5 por "Buzz" y los múltiplos de ambos por la palabra "FizzBuzz".

Y siguiendo las enseñanzas del [artículo anterior sobre Rust](/2021/05/26/rust-intro/), vamos a resolver esta *kata* usando este lenguaje. Atentos que vienen curvas ;).

![Dr. Zoidberg, el cangrejo de Futurama](/assets/uploads/2021/06/zoidberg.gif)

Lo primero será crear nuestro proyecto usando `cargo`:

```bash
cargo new fizzbuzz
```

Después navegaremos a la carpeta y lanzaremos Visual Studio Code para programarlo:

```bash
cd fizzbuzz
code .
```

En el archivo "src/main.rs" añadiremos nuestra función que hará las veces de convertidor de número a cadena de texto que toca:

```rust
fn main() {
  println!("Fizz Buzz game");
}

fn fizzbuzzer(number: u8) -> &str {
  ""
}
```

Y lanzaremos una *build* para ver que vamos bien:

```bash
$ cargo build
   Compiling fizzbuzz v0.1.0 (fizzbuzz)
error[E0106]: missing lifetime specifier
 --> src\main.rs:5:30
  |
5 | fn fizzbuzzer(number: u8) -> &str {
  |                ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value with an elided lifetime, but the lifetime cannot be derived from the arguments
help: consider using the `'static` lifetime
  |
5 | fn fizzbuzzer(number: u8) -> &'static str {
  |                ^^^^^^^^

error: aborting due to previous error

For more information about this error, try `rustc --explain E0106`.
error: could not compile `fizzbuzz`

To learn more, run the command again with --verbose.
```

¡Vaya sorpresa! No hemos hecho más que añadir una función casi vacía y ya nos ha dado errores. Parece ser que eso de que nuestra función devuelva un *slice* (`&str`) le ha hecho gracia a medias. Nos dice claramente que tenemos que ponerle un tiempo de vida de tipo `static`. Y, de hecho, nos expone cómo hacerlo. Así que vamos a hacerle caso al compilador:

```rust
fn fizzbuzzer(number: u8) -> &'static str {
  ""
}
```

Y volvemos a lanzar el proceso de construcción:

```bash
$ cargo build
   Compiling fizzbuzz v0.1.0 (fizzbuzz)
warning: unused variable: `number`
 --> src\main.rs:5:15
  |
5 | fn fizzbuzzer(number: u8) -> &'static str {
  |         ^^^^^^ help: if this is intentional, prefix it with an underscore: `_number`
  |
  = note: `#[warn(unused_variables)]` on by default

warning: function is never used: `fizzbuzzer`
 --> src\main.rs:5:4
  |
5 | fn fizzbuzzer(number: u8) -> &'static str {
  |  ^^^^^^^^^^
  |
  = note: `#[warn(dead_code)]` on by default

warning: 2 warnings emitted

  Finished dev [unoptimized + debuginfo] target(s) in 0.69s
```

¡No me lo puedo creer! ¡Este compilador es exquisito!

Ahora nos da dos alertas. Esto quiere decir que podemos seguir desarrollando, compilando y ejecutando nuestro código, sin problemas. No obstante, no me gustaría empezar esta primera *kata* con mal pie. Así que vamos a estudiar un poco estos problemas:

- El primero habla sobre que esta función no se llama en ningún lado. Así que por defecto nos da este aviso. Con una búsqueda rápida por internet encontraremos que añadiendo una anotación (sí, Rust tiene anotaciones :D) así `#[allow(dead_code)]`, corregiremos este problema.
- El segundo habla sobre que el parámetro `number` no se usa. Para indicar que un parámetro de una función no se usa, según nos informa el propio compilador, hay que ponerle un guion bajo antes: `_number`.

```rust
#[allow(dead_code)]
fn fizzbuzzer(_number: u8) -> &'static str {
  ""
}
```

Volvemos a lanzar la compilación y por fin parece que todo ha ido bien:

```bash
$ cargo build
   Compiling fizzbuzz v0.1.0 (fizzbuzz)
  Finished dev [unoptimized + debuginfo] target(s) in 0.76s
```

Ahora viene el siguiente reto: hacer pruebas unitarias.

Tras una exhaustiva búsqueda en internet encuentro la solución, podemos añadir un módulo con las anotaciones pertinentes para *testing* y el sistema lo reconocerá:

```rust
#[cfg(test)]
mod fizzbuzz_tests {
  #[test]
  fn test_works() {
    assert_eq!(1 + 1, 2);
  }
}
```

Para lanzar la compilación y los tests podremos ejecutar:

```bash
cargo test
```

Entonces veremos cómo el `test_works` es ejecutado y se devuelve por consola un informe de que lo ha hecho con éxito.

Ya hemos llegado al punto de poder empezar con la *kata*. Para ello, en el módulo `fizzbuzz_tests` vamos a añadir la línea `use super::fizzbuzzer;`. Esto quiere decir que dentro de nuestro módulo vamos a "importar" la función `fizzbuzzer` que viene de este mismo archivo, pero de un nivel superior al del propio módulo (`super`). De esta forma ya podremos crear un *unit test* para el primer caso de uso de la *kata*: cuando te toca el `1` tienes que responder `"1"`:

```rust
#[cfg(test)]
mod fizzbuzz_tests {
  use super::fizzbuzzer;

  #[test]
  fn when_input_is_1_returns_1() {
    let input: u8 = 1;
    let expected = "1";
    let actual = fizzbuzzer(input);

    assert_eq!(expected, actual);
  }
}
```

Pasamos los tests:

```bash
cargo test
```

Y veremos que esta prueba ha fallado debido a que esperaba el valor `"1"` y ha recibido el valor `""`.

Esto está bien porque en TDD el primer paso es tener una prueba en rojo. El siguiente paso es escribir el mínimo código posible que hace que esta prueba pase. En este caso se me ocurre que devolver `"1"` en la función `fizzbuzzer` hará que esa prueba tenga éxito. Realizamos el cambio:

```rust
#[allow(dead_code)]
fn fizzbuzzer(_number: u8) -> &'static str {
  "1"
}
```

Volvemos a pasar los *test* con la ayuda de `cargo` y esta vez pasará.

El tercer paso de TDD sería realizar un *refactoring*, pero ahora mismo no veo cómo podría mejorar el código que he escrito, así que vamos al siguiente caso. La prueba de que cuando me viene un `2` tengo que responder con `"2"`:

```rust
#[test]
fn when_input_is_2_returns_2() {
  let input: u8 = 2;
  let expected = "2";
  let actual = fizzbuzzer(input);
  assert_eq!(expected, actual);
}
```

Al correr las pruebas esta última fallará. Así que solo nos queda hacer que pase, sin romper la prueba anterior. A ese fin, el mínimo código que se me ocurre es devolver el mismo número que recibimos como entrada en formato texto. Y además, podemos aprovechar y quitar el guion bajo de `_number`. Ahora sí que vamos a usar esta variable y ya no requiere esta notación especial:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> &'static str {
  number.to_string()
}
```

Pero al compilar, este código no le va a gustar al compilador. Nos va a decir que la función `to_string` devuelve un objeto de tipo `String` y que eso es lo que debería devolver nuestra función. Así que lo vamos a cambiar:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  number.to_string()
}
```

Al lanzar los *tests* veremos que pasan los dos. Y de nuevo estamos en la tesitura de refactorizar el código, con la misma respuesta que en el punto anterior: no sabría cómo podría mejorarlo.

Vamos a la siguiente prueba. En este caso, cuando recibamos un `3` deberemos devolver `"fizz"`:

```rust
#[test]
fn when_input_is_3_returns_fizz() {
  let input: u8 = 3;
  let expected = "fizz";
  let actual = fizzbuzzer(input);

  assert_eq!(expected, actual);
}
```

Al ejecutar las pruebas, fallará esta última y podremos ir a solucionarlo. La idea es que si viene un `3` devuelva `"fizz"`, pero si no, que siga devolviendo el mismo número en formato cadena de texto. Para crear un nuevo `String` usaremos `String::from("mi texto")`:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  if number == 3 { String::from("fizz") }
  else { number.to_string() }
}
```

Al pasar los tests veremos que los 3 que hemos realizado pasan. Pero también veremos un punto que se puede mejorar en nuestro código. En los tests, en cada uno de ellos, estamos repitiendo las mismas líneas cambiando los valores. Como las pruebas también forman parte del código de la aplicación, también entran dentro de la fase de refactorización. Así que vamos a crear una función que comparta esas líneas de nuestras pruebas:

```rust
fn assert_fizzbuzzer(input: u8, expected: &str) {
  let actual = fizzbuzzer(input);
  assert_eq!(expected, actual);
}
```

Y vamos a modificar las pruebas existentes para que llamen a esta función:

```rust
#[test]
fn when_input_is_1_returns_1() {
  assert_fizzbuzzer(1, "1");
}

#[test]
fn when_input_is_2_returns_2() {
  assert_fizzbuzzer(2, "2");
}

#[test]
fn when_input_is_3_returns_fizz() {
  assert_fizzbuzzer(3, "fizz");
}
```

Si volvemos a pasar las pruebas, veremos que todo sigue funcionando correctamente.

```rust
#[test]
fn when_input_is_4_returns_4() {
  assert_fizzbuzzer(4, "4");
}
```

Si ejecutamos las pruebas, veremos que todas pasarán correctamente. Esto significa que esta prueba que acabamos de hacer para el `4`, sobra. No aporta valor al proceso, ni a nuestras pruebas ni a nuestro código. Se borra y pasamos al siguiente paso.

Para probar el `5` nos encontramos con el segundo caso especial, que devuelve `"buzz"`. Vamos a hacer la prueba:

```rust
#[test]
fn when_input_is_5_returns_buzz() {
  assert_fizzbuzzer(5, "buzz");
}
```

Al ejecutarla, fallará. Así que vamos a buscar la forma más simple que se nos ocurre para solucionar este fallo. Simplemente, añadiremos otra condición dentro de `fizzbuzzer`:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  if number == 3 { String::from("fizz") }
  else if number == 5 { String::from("buzz") }
  else { number.to_string() }
}
```

Una vez tenemos los tests en verde iremos a por el siguiente caso. Cuando tenemos un `6`, como es múltiplo de 3, tendremos que devolver `"fizz"`. Vamos a escribir la prueba:

```rust
#[test]
fn when_input_is_6_returns_fizz() {
  assert_fizzbuzzer(6, "fizz");
}
```

Y para hacer que este test pase, el mínimo código que podríamos tocar sería la comparación del número de entrada con 3, cambiarla por el módulo de 3 sea 0:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  if number % 3 == 0 { String::from("fizz") }
  else if number == 5 { String::from("buzz") }
  else { number.to_string() }
}
```

Podremos entonces ejecutar y ver que todas las pruebas pasan bien.

Entonces vendrán el `7`, el `8` y el `9`. Pero si pensamos un poco antes de programarlos, nos daremos cuenta de que sus pruebas van a pasar sin necesidad de cambiar nuestro código. Si no estamos seguros, lo mejor es realizar estas pruebas y si no salen en rojo, borrarlas.

El caso es que el siguiente número que no pasará las pruebas es el `10`. Este tiene que devolver `"buzz"`, por ser múltiplo de 5:

```rust
#[test]
fn when_input_is_10_returns_buzz() {
  assert_fizzbuzzer(10, "buzz");
}
```

Para conseguir que esta prueba pase, modificaremos la condición del 5 de la misma manera que modificamos la del 3:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  if number % 3 == 0 { String::from("fizz") }
  else if number % 5 == 0 { String::from("buzz") }
  else { number.to_string() }
}
```

Ahora pasarán los tests y encontraremos que también van a pasar los casos de `11`, `12`, `13` y `14`. Un pequeño ejercicio de cálculo mental nos llevará a esta conclusión, pero, como en el anterior caso, si no estamos seguros de alguno, lo mejor es programar la prueba y comprobar que efectivamente pasa sin necesidad de realizar ningún cambio en nuestro código. No obstante, estas pruebas no aportan valor y deberíamos borrarlas.

Esto nos llevará al siguiente caso que será el del `15`. Como este valor es múltiplo de 3 y de 5 a la vez, la respuesta que deberemos obtener será "`fizzbuzz`":

```rust
#[test]
fn when_input_is_15_returns_buzz() {
  assert_fizzbuzzer(15, "fizzbuzz");
}
```

Para resolver este caso podría bastar con añadir un condicional tipo:

```rust
if number == 15 ...
```

Pero como la experiencia es un grado, vamos a prevenir todos los futuros múltiplos de 3 y 5, al igual que hicimos en los casos anteriores:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  if number % 15 == 0 { String::from("fizzbuzz") }
  else if number % 3 == 0 { String::from("fizz") }
  else if number % 5 == 0 { String::from("buzz") }
  else { number.to_string() }
}
```

Al pasar nuestros *tests* veremos esto:

```bash
$ cargo test
   Compiling fizzbuzz v0.1.0 (fizzbuzz)
  Finished test [unoptimized + debuginfo] target(s) in 0.80s
   Running unittests (target\debug\deps\fizzbuzz-a943ca5cd4b92e47.exe)

running 7 tests
test fizzbuzz_tests::when_input_is_10_returns_buzz ... ok
test fizzbuzz_tests::when_input_is_15_returns_buzz ... ok
test fizzbuzz_tests::when_input_is_1_returns_1 ... ok
test fizzbuzz_tests::when_input_is_2_returns_2 ... ok
test fizzbuzz_tests::when_input_is_5_returns_buzz ... ok
test fizzbuzz_tests::when_input_is_3_returns_fizz ... ok
test fizzbuzz_tests::when_input_is_6_returns_fizz ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
```

Todas las pruebas pasan. Si seguimos creando casos, nos daremos cuenta de que ya hemos resuelto el problema completo. Así que, podríamos dar por acaba la *kata*.

Pero no lo voy a dejar aquí. Buscando por internet hemos encontrado una forma de resolver este ejercicio usando *Pattern Matching*. Y creo que puede quedar un código más claro y atractivo:

```rust
#[allow(dead_code)]
fn fizzbuzzer(number: u8) -> String {
  match (number % 3, number % 5) {
    (0, 0) => String::from("fizzbuzz"),
    (0, _) => String::from("fizz"),
    (_, 0) => String::from("buzz"),
    (_, _) => number.to_string()
  }
}
```

Si lanzamos de nuevo todas las pruebas, veremos que siguen pasando. Así que habremos conseguido una buena refactorización del código existente.

Para acabar poniendo la guinda al pastel, modificaremos la función `main` para que escriba del 1 al 100, todos los valores del algoritmo de *Fizz Buzz*:

```rust
fn main() {
  println!("Fizz Buzz game");
  println!("-----------------");
  for i in 1..101 {
    println!("{}", fizzbuzzer(i));
  }
}
```

La verdad es que ha sido muy útil realizar este ejercicio. Hemos aplicado las bases del lenguaje Rust en un problema. Hemos aprendido que existen anotaciones, cómo hacer pruebas unitarias, resolver ciertas incidencias, aplicar una de las características especiales como es el *Pattern Matching* y hemos comprobado que el compilador es una auténtica maravilla (aunque te puede sacar de quicio fácilmente).

Tienes el ejercicio terminado en [este gist de github](https://gist.github.com/fernandoescolar/69df2fc913438892e3646548b146187d). Pero también puedes ver el historial de modificaciones siguiendo TDD [aquí](https://gist.github.com/fernandoescolar/69df2fc913438892e3646548b146187d/revisions).

La próxima semana, si todo va bien, seguiremos ahondando en Rust :).

![El Dr. Zoidberg sale corriendo](/assets/uploads/2021/06/zoidberg2.gif)