---
published: true
ID: 202306141
title: 'Goroutines y Channels en Go'
author: fernandoescolar
post_date: 2023-06-14 01:04:36
layout: post
tags: golang goroutine channel
background: '/assets/uploads/bg/golang.jpg'
---

Si hay algo que hace a *Go* especial, son las *goroutines* y los *channels*. Es como tener una varita mágica que te permite hacer malabares con múltiples tareas al mismo tiempo sin caer en el caos. Y si *Golang* es la varita mágica de los desarrolladores, entonces las *goroutines* y los *channels* son los hechizos de la programación. Y por consiguiente, los *gophers* vienen del mundo mágico de *Harry Potter*<!--break--> ¿O no?

En serio, las *goroutines* y los *channels* son características impresionantes que hacen que la programación concurrente sea mucho más fácil y sencilla. Y si a eso le añadimos la simplicidad y la elegancia del lenguaje, entonces tenemos un paquete completo que hará que cualquier desarrollador se sienta un virtuoso.

¿A que suena genial? ¡Pues vamos a ello!

## Goroutines

Entonces, ¿qué son las *goroutines*? Básicamente, son hilos ligeros de ejecución en *Go* que te permiten ejecutar varias tareas simultáneamente sin preocuparte por la sobrecarga de recursos. En otros lenguajes de programación, iniciar hilos puede ser complicado y engorroso, pero en *Go*, es muy sencillo. Simplemente usas la palabra clave `go` antes de la función que deseas ejecutar en una *goroutine*, y listo. Es como si estuvieras lanzando una bola de fuego en una partida de rol, pero en código.

Por ejemplo, echémosle un vistazo a este código:

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    go thread(1)
    go thread(2)
    fmt.Scanln()
}

func thread(id int) {
    for i := 1; i <= 10; i++ {
        fmt.Println("Thread", id, ":", i)
        time.Sleep(100 * time.Millisecond)
    }
}
```

Este código iniciará dos *goroutines* simultáneamente, y cada una imprimirá números del `1` al `10`. Si ejecutas este código, deberías ver algo como esto:

```bash
$ go run .
Thread 1 : 1
Thread 2 : 1
Thread 1 : 2
Thread 2 : 2
Thread 1 : 3
Thread 2 : 3
Thread 1 : 4
Thread 2 : 4
Thread 1 : 5
Thread 2 : 5
Thread 1 : 6
Thread 2 : 6
Thread 1 : 7
Thread 2 : 7
Thread 1 : 8
Thread 2 : 8
Thread 1 : 9
Thread 2 : 9
Thread 1 : 10
Thread 2 : 10
```

¡Guau! ¿No es impresionante? Con solo dos líneas de código `go`, estamos ejecutando dos tareas en paralelo. Y lo mejor de todo es que la sintaxis es tan sencilla y elegante que cualquier programador podría entenderla.

Pero como todo en la vida, hay un lado oscuro. A veces, si tienes demasiadas *goroutines* ejecutándose al mismo tiempo, puedes encontrar problemas de rendimiento y complejidad. Pero no te preocupes, con un poco de práctica, podrás manejar estas situaciones como un verdadero *gopher*.

## Channels

Ahora que ya sabes cómo ejecutar múltiples tareas simultáneamente, es hora de aprender cómo comunicarlas entre sí. Y para eso, tenemos los *channels*. Los *channels* son como tuberías que conectan las *goroutines* entre sí. Puedes enviar datos a través de un *channel* y recibirlos en otro. Y lo mejor de todo es que los *channels* son seguros para la concurrencia, por lo que no tienes que preocuparte por los problemas de sincronización.

### Creando un canal

Para crear un canal, necesitas la palabra clave "chan" y el tipo de dato de los mensajes que enviarás. Aquí tienes un ejemplo:

```go
ch := make(chan int)
```

En el ejemplo anterior, se crea un canal "ch" que acepta mensajes del tipo "int".

Enviando un valor a un canal
Para enviar un valor a un canal, necesitas usar este operador <-, que parece una flecha que apunta hacia la izquierda y se lee como la dirección en la que se envía algo. Aquí tienes un ejemplo de cómo enviar un mensaje a un canal:

```go
ch <- 2
```

En el código anterior, el número 2 se envía al canal "ch".

Escuchando un canal
Para escuchar un canal, de nuevo se usa la flecha <-, pero esta vez necesitas una variable receptora en el lado izquierdo y el canal en el lado derecho, así:

```go
value := <- ch
```

Haciendo coincidir envío y recepción
Imagina que tienes este código:

```go
package main

import "fmt"

func thread(ch chan int) {
	ch <- 1
	ch <- 2
}

func main() {
	ch := make(chan int)
	go thread(ch)

	var result int
	result = <-ch
	fmt.Println("ch", ":", result)
	result = <-ch
	fmt.Println("ch", ":", result)
}
```

Estás invocando `thread()` y está enviando mensajes al canal dos veces:

```bash
$ go run .
ch : 1
ch : 2
```

En `main()`, recibes los resultados:

```go
var result int
result = <-ch
fmt.Println("ch", ":", result)
result = <-ch
fmt.Println("ch", ":", result)
```

¿Qué pasa si produces más valores de los que recibes?

```go
func thread(ch chan int) {
    ch <- 1
    ch <- 2
    ch <- 3
}
```

Pues que te perderás el valor que no lees (en este caso, el `3`).

¿Qué pasa si es lo contrario y tratas de recibir un valor más de los que realmente recibes?

```go
var result int
result = <-ch
fmt.Println("ch", ":", result)
result = <-ch
fmt.Println("ch", ":", result)
result = <-ch
fmt.Println("ch", ":", result)
```

En este punto, tu código se bloqueará, como así:

```bash
$ go run .
ch : 1
ch : 2
fatal error: all goroutines are asleep - deadlock!
...
```

Tu código nunca terminará porque ese valor nunca llegará.

La lección aquí es que debes llevar un registro de cuántos resultados podrías recibir y solo tratar de recibir esa cantidad.

Hay otra manera de recibir valores, y es usando un `select` de esta manera:

```go
for i := 0; i < 2; i++ {
    select {
    case x, ok := <-ch:
        if ok {
            fmt.Println("ch", ":", x)
        }
    }
}
```

La idea es hacer coincidir la recepción de un valor de esta manera:

```go
case x, ok := <-ch:
```

Lo que obtienes son dos cosas: el valor en sí, `x`, y un booleano que llamamos `ok`. Si logramos obtener un valor, `ok` tendrá el valor `true`. ¿Qué pasa si no es así? Sería `false` si el canal está cerrado y ya no puede producir más valores, así que hablemos de eso a continuación.

### Cerrando un canal
Un canal está abierto hasta que lo cierras. Puedes cerrarlo activamente llamando a `close()` con el canal como parámetro de entrada:

```go
close(ch)
```

Sin embargo, cuando cerramos un canal, necesitamos verificarlo. Si intentamos recibir un valor de un canal cerrado, esto provocará un error. Para comprobar si el canal está abierto o no, podemos usar el select que acabamos de escribir:

```go
select {
case x, ok := <-ch:
   if ok {
        fmt.Println("ch", ":", x)
   } else {
        break // el canal está cerrado
   }
}
```

El valor de `ok` ahora es `false`.

Para aplicar el concepto de cerrar un canal, agregamos `close()` a `thread()` y hacemos que nuestro bucle for se ejecute una vez más de lo que hay valores, así:

```go
package main

import "fmt"

func thread(ch chan int) {
	ch <- 1
	ch <- 2
	close(ch)
}

func main() {
	ch := make(chan int)
	go thread(ch)

	for i := 0; i < 3; i++ {
		select {
		case x, ok := <-ch:
			if ok {
				fmt.Println("ch", ":", x)
			} else {
				fmt.Println("canal cerrado")
			}
		}
	}
}
```

La salida de ejecutar dicho código es:

```bash
$ go run .
1
2
canal cerrado
```

Podemos ver cómo se cumple la cláusula else en la tercera iteración.

## Conclusión

Las *goroutines* son una forma de crear hilos de ejecución livianos y gestionados por el sistema operativo que permiten una concurrencia más eficiente que los hilos tradicionales. En Go, se pueden crear miles de goroutines en una sola aplicación, lo que permite una mayor paralelización y capacidad de respuesta.

Los *channels*, por su parte, son una forma de comunicación y sincronización entre goroutines. Permiten el envío y recepción de datos de forma segura y concurrente, y evitan las condiciones de carrera y los bloqueos. Además, los channels son bidireccionales, lo que permite una comunicación más flexible entre goroutines.

Juntos, permiten a los desarrolladores crear aplicaciones altamente concurrentes, escalables y eficientes en términos de recursos.