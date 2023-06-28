---
published: true
ID: 202009301
title: 'SOLID menos mola (L)'
author: fernandoescolar
post_date: 2020-09-30 02:16:54
layout: post
tags: solid best-practices
background: '/assets/uploads/bg/solid2.jpg'
---

La *L* de *SOLID* se refiere al principio de sustitución de Liskov o **LSP** por sus siglas en inglés (**L**iskov **S**ubstitution  **P**rinciple). Se puede definir como que cada clase que hereda de otra puede usarse como su padre sin necesidad de conocer las diferencias entre ellas. Una definición muy compleja para un concepto mucho más simple. Pero con una historia algo truculenta detrás<!--break-->.

[Barbara Liskov](https://es.wikipedia.org/wiki/Barbara_Liskov) es una reconocida científica de computación del MIT. Como grandes logros encontramos que recibió la Medalla John von Neumann y el premio Turing (el Nobel de la informática) en 2004 y 2008 respectivamente. Pero lo que hoy nos interesa es un ensayo que escribió en Octubre de 1987 titulado [Data Abstraction and Hierarchy](https://www.cs.tufts.edu/~nr/cs257/archive/barbara-liskov/data-abstraction-and-hierarchy.pdf). En este documento la Doctora Liskov investiga la utilidad de dos de las características de la programación orientada a objetos: la abstracción y la herencia.

Cuando empieza a hablar de herencia de tipos escribe:

> Lo que se desea aquí es algo como la siguiente propiedad de sustitución: Si para cada objeto *o<sub>1</sub>* de tipo *S* hay un objeto *o<sub>2</sub>* de tipo *T*, tal que para todos los programas *P* definidos en términos de *T*, el comportamiento de *P* no cambia cuando *o<sub>1</sub>* sustituye a *o<sub>2</sub>*, entonces *S* es un subtipo de *T*.

Entonces [Uncle Bob](https://twitter.com/unclebobmartin), 8 años después utiliza esta frase para acuñar [el principio de sustitución de Liskov](https://web.archive.org/web/20060313120844/http://www.objectmentor.com/resources/articles/lsp.pdf) como:

> Las funciones que usan punteros o referencias a clases base, deben de poder usar objetos de clases derivadas sin tener conocimiento de ellos.

Y lo complementa con un ejemplo que me he permitido la libertad de traducir a C#:

```csharp
class Rectangle
{
  public virtual int Height { get; set; }
  public virtual int Width { get; set; }
}

class Square : Rectangle
{
  public override int Height
  {
    get => base.Height;
    set
    {
      base.Height = value;
      base.Width = value;
    }
  }

  public override int Width
  {
    get => base.Width;
    set
    {
      base.Height = value;
      base.Width = value;
    }
  }
}
```

Como podemos observar, tenemos un objeto `Rectangle` con dos propiedades para almacenar sus dimensiones: `Width` y `Height`. Entonces hemos creado un objeto `Square` de hereda de `Rectangle`. Y como un cuadrado es un rectángulo con la altura y la anchura iguales, sobrescribimos el `set` de las propiedades para que tengan esto en cuenta.

Ahora imaginemos que tenemos también un código así:

```csharp
public static void OperateRectangle(Rectangle r)
{
  r.Width = 4;
  r.Height = 5;
  Assert.AreEqual(r.Width * r.Height, 20);
}
```

Lo que pasará es que si le pasamos un objeto `Rectangle` este código funcionará, pero si le pasamos un objeto `Square` la línea del `Assert` lanzará un error.

Por lo tanto, estaríamos violando el **LSP**. Porque como menciona el enunciado de este principio:

> Las funciones que usan punteros o referencias a clases base (`OperateRectangle`), deben de poder usar objetos de clases derivadas (`Square` hereda de `Rectangle`) sin tener conocimiento de ellos.

Quizá con la definición no esté del todo claro, pero entiendo que como el código ha dado un error en tiempo de ejecución, no está bien. A partir de este punto, [Uncle Bob](https://twitter.com/unclebobmartin) empieza a divagar sobre **DbC** (**D**esign **b**y **C**ontract ¿os acordáis de *Code Contracts*?) y cómo esa aserción que hemos añadido al código nos ayuda a prevenir un mal uso de este principio.

El problema aquí es que se ha malinterpretado el texto de [Barbara Liskov](https://es.wikipedia.org/wiki/Barbara_Liskov), donde si traducimos la fórmula como:

> Si para cada objeto *o<sub>1</sub>* de tipo *S* (`Square`) hay un objeto *o<sub>2</sub>* de tipo *T* (`Rectangle`), tal que para todos los programas *P* (`OperateRectangle`) definidos en términos de *T* (`Rectangle`), el comportamiento de *P* (`OperateRectangle`) no cambia cuando *o<sub>1</sub>* (de tipo `Square`) sustituye a *o<sub>2</sub>* (de tipo `Rectangle`), entonces *S* (`Square`) es un subtipo de *T* (`Rectangle`).

Si nos paramos a leer con atención, lo que aquí dice la Doctora Liskov es que, si usamos cualquier objeto `Square` para sustituir a cualquier objeto `Rectangle`, y no tenemos que cambiar nada en `OperateRectangle`, significa que `Square` es un subtipo de `Rectangle`. Mientras que **LSP** nos expone este concepto del revés: cuando `Square` es un subtipo de `Rectangle`, tenemos que poder intercambiarlos sin que `OperateRectangle` conozca sus implementaciones.

En el ejemplo aplican las dos reglas, por lo que podemos deducir que C# funciona bien como lenguaje orientado a objetos y cumple a la perfección con la característica de la herencia. Quizá el problema es que este tipo de herencia no sea el más apropiado. Pero aquí lo que se expone como incorrecto es que una clase derivada tenga diferentes resultados que una clase base ante las mismas operaciones.

¿Os imagináis un mundo donde en la programación orientada a objetos no se pudiera modificar el comportamiento respetando el contrato de una clase en otra derivada? A esto se le llama **herencia** y **polimorfismo**, y son dos de las características de la POO.

Lo mejor de todo esto, es que era el propio Robert C. Martin quien nos proponía el uso exhaustivo de objetos derivados para cambiar el comportamiento de un programa en la definición del **OCP**.

Y además Liskov jamás ideó un principio, simplemente estaba describiendo en qué consistía la herencia de tipos. De hecho, recibió el premio Turing por "*su contribución a los fundamentos teóricos y prácticos en el diseño de lenguajes de programación y sistemas, **especialmente relacionados con la abstracción de datos**, tolerancia a fallos y computación distribuida*".

## Hay vida después de LSP

He de reconocer que el trabajo de [Uncle Bob](https://twitter.com/unclebobmartin) (Robert C. Martin) me ayuda a ser mejor programador. Cada vez que leo uno de sus libros o veo una de sus charlas, aprendo algo. Incluso si no es la primera vez que lo hago. Y los principios **SOLID**, incluido **LSP**, no son una excepción. Mi consejo es que:

- Olvídate de **LSP** y piensa en cómo definir bien la herencia de tus objetos.
- Si no sabes cómo, mira la fórmula de la Doctora Liskov, porque de eso va la herencia de tipos.
- Quizá te interesen temas como la composición o la inmutabilidad.

Creo que este principio fue una campaña de marketing para conseguir el acrónimo SOLID. Debió ser sinceramente difícil encontrar un principio con la letra 'L' y se tuvo que recurrir a lo que se pudo.

Aunque una interpretación bastante libre de este principio, creo que sí que me llevó a aprender una lección. Y es que no uses métodos en una base que luego no vayas a usar en las derivadas. Porque esto sería una mala abstracción. Un ejemplo sobre el mismo tema:

```csharp
class Shape
{
  public virtual int Height { get; set; }
  public virtual int Width { get; set; }
  public virtual int Radious { get; set; }
}

class Rectangle : Shape
{
  public override int Radious
  {
    get => throw new InvalidOperationException();
    set => throw new InvalidOperationException();
  }
}

class Circle : Shape
{
  public override int Height
  {
    get => throw new InvalidOperationException();
    set => throw new InvalidOperationException();
  }
  public override int Width
  {
    get => throw new InvalidOperationException();
    set => throw new InvalidOperationException();
  }
}
```

En este caso tendríamos una mala abstracción del objeto `Shape`. Ya que, en lugar de tratarlo como una clase base, lo estamos usando como una agregación donde encontramos todas las propiedades de sus clases derivadas.

La forma de prevenir estos usos poco canónicos, por así decirlo, podría estar en otro lado. En conceptos como la inmutabilidad y la composición:

### Inmutabilidad

La inmutabilidad es la capacidad de un objeto de permanecer en el mismo estado en el que se encuentra siempre. Es decir, un objeto que no puede cambiar de estado. Es una capacidad tradicional de paradigmas de programación funcional. Para conseguir este comportamiento tenemos varias herramientas en el lenguaje C#:

```csharp
public class Rectangle
{
  private readonly int _width;
  private readonly int _height;

  public Rectangle(int width, int height)
  {
      _width = width;
      _height = height;
  }

  public int Width => _width;
  public int Height => _height;
}
```

Usando la palabra clave `readonly`, propiedades de solo lectura, y constructores, podemos conseguir que una clase sea inmutable. Y si queremos trabajar con colecciones inmutables entonces podemos descargarnos el paquete de *nuget* `System.Collections.Immutable`.

El caso es que este tipo de implementaciones son muy prácticas porque:
- Son artefactos muy fáciles de entender.
- Son *thread-safe*, que para aplicaciones multihilo como asp.net vienen genial.
- Siempre están en un estado válido.

Y basándonos en esto, una forma de solucionar los problemas que exponía Robert C. Martin sería:

```csharp
public class Rectangle
{
  private readonly int _width;
  private readonly int _height;

  public Rectangle(int width, int height)
  {
      _width = width;
      _height = height;
  }

  public Rectangle(Rectangle r, int width, int height)
  {
      // copy other rectangle properties here
      _width = width;
      _height = height;
  }

  public int Width => _width;
  public int Height => _height;
}

public class Square : Rectangle
{
  public Square(int size) : base(size, size)
  {
  }
}

public static Rectangle OperateRectangle(Rectangle r)
{
  return new Rectangle(r, 4, 5);
}
```

De esta forma siempre funcionará correctamente y no tendríamos ningún problema como los que señala Uncle Bob.

### Composición vs Herencia

Es posible que no sea la primera vez que escuchas o lees sobre este concepto. Una idea que nace teniendo en cuenta las grandes virtudes de la herencia en un lenguaje orientado a objetos:
- Rápido de programar
- Sencillo de diseñar
- Es un nexo de unión básico con otras características como el polimorfismo o la abstracción.

Pero también teniendo en cuenta sus defectos:
- Una aplicación exhaustiva lleva a que sea muy difícil conocer qué es exactamente lo que hace un objeto que herede de una larga cadena de bases.
- Es muy fácil realizar malas herencias que nos pasarán factura con el tiempo.
- Es más difícil probar el código.
- En los lenguajes modernos de programación no existe la multi-herencia.

Una forma de prevenir estos problemas sería usar la composición. Un ejemplo rápido:

```csharp
// herencia
abstract class Thing { ... }
class MovableThing : Thing { void Move(...) }
class SolidThing : Thing { bool Collide(...) }
class MovableSolidThing : MovableThing { bool Collide(...) }
```

Como podemos ver en este ejemplo sobre herencia, tenemos un objeto base del que heredan dos objetos: uno que se puede mover y otro que es sólido (que puede chocar). Cuando queremos crear un objeto con ambas propiedades, encontramos un problema, que tenemos que volver a implementar una de ellas. Además, si seguimos haciendo esto, nuestro código va a ser muy difícil de mantener, porque tendremos muchas características y finalmente será muy complicado seguir como funciona realmente un método.

La propuesta de la composición sería:

```csharp
// composición
interface IMoveable { void Move(...) }
class Moveable : IMoveable { ... }
class Static : IMoveable { ... }

interface ISolid { void Collide(...) }
class Solid : ISolid { ... }
class NotSolid : ISolid { ... }

class Thing
{
  private readonly IMoveable _moveable;
  private readonly ISolid _solid;

  public Thing(IMoveable moveable, ISolid solid)
  {
      _moveable = moveable;
      _solid = solid;
  }
  public void Move(...)
  {
    _moveable.Move(...);
  }

  public bool Collide(...)
  {
      return _solid.Collide(...);
  }
}
```

De esta forma podemos crear diferentes sabores del mismo objeto:

```csharp
var staticNotSolidThing   = new Thing(new Static(),   new NotSolid());
var staticSolidThing      = new Thing(new Static(),   new Solid());
var moveableNotSolidThing = new Thing(new Moveable(), new NotSolid());
var moveableSolidThing    = new Thing(new Moveable(), new Solid());
```

También hay que tener en cuenta que no es oro todo lo que reluce. La composición tiene sus problemas como, por ejemplo:
- Es mucho más complicado de diseñar.
- Es muy fácil caer en métodos vacíos o implementaciones banales.
- No siempre encaja, hay veces que es mucho mejor usar herencia.

De cualquier forma, es una buena práctica a tener en cuenta cuando desarrollamos.
