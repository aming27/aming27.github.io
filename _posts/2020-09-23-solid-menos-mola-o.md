---
published: true
ID: 202009231
title: 'SOLID menos mola (O)'
author: fernandoescolar
post_date: 2020-09-23 02:16:54
layout: post
tags: solid best-practices
background: '/assets/uploads/bg/solid1.jpg'
---

La *O* de *SOLID* se refiere al principio de abierto/cerrado, **OCP** por sus siglas en inglés (**O**pen/**C**losed **P**rinciple). Se puede definir como que una clase debe estar abierta a la extensión y cerrada a la modificación. Fue acuñado por primera vez por [Bertrand Meyer](https://twitter.com/Bertrand_Meyer). Pero no fue hasta que [Robert C. Martin](https://twitter.com/unclebobmartin) lo reformuló e introdujo dentro del acrónimo *SOLID*, que se popularizó<!--break-->.

Siguiendo [la definición de Uncle Bob](https://web.archive.org/web/20060822033314/http://www.objectmentor.com/resources/articles/ocp.pdf) el **OCP** se rige por dos propiedades:

- *Open For Extension*: esto significa que el comportamiento de un módulo puede ser extendido. Y expone que esto se consigue gracias a una de las propiedades de la programación orientada a objetos: el polimorfismo.
- *Closed for Modification*: que dice que el código fuente de un módulo es inviolable. Que nadie debería poder realizar cambios en él.

El truco es más simple de lo que parece: consiste en que todo objeto tenga una clase abstracta base que podamos sobrescribir y aplicar patrones conocidos.

Si tuviéramos un sistema que dibuja figuras:

```csharp
class Line { ... }
class Circle { ... }
class Rectangle { ... }

class Drawer
{
  public static void Draw(object o)
  {
    if (o is Line l) { /*Draw line stuff*/ }
    if (o is Circle c) { /*Draw circle stuff*/ }
    if (o is Rectangle r) { /*Draw rectangle stuff*/ }
  }
}
```

Podríamos hacerlo extensible creando una clase base abstracta con el contrato de dibujado y una implementación para cada una de las figuras:

```csharp
abstract class Shape
{
  public abstract void Draw();
}

class Line : Shape
{
  public override void Draw() { /*Draw line stuff*/ }
}

class Circle : Shape
{
  public override void Draw() { /*Draw circle stuff*/ }
}

class Rectangle : Shape
{
  public override void Draw() { /*Draw rectangle stuff*/ }
}

class Drawer
{
  public static void Draw(object o)
  {
    if (o is Shape s) s.Draw();
  }
}
```

Pero en un futuro podríamos querer añadir por ejemplo un recuadro rojo cuando algo esté seleccionado. Para esto podríamos poner todos los métodos como extensibles (usando la palabra clave `virtual`) y crear nuevas clases tipo:

```csharp
class Line : Shape
{
  public override void Draw() { /*Draw line stuff*/ }
}

class Circle : Shape
{
  public override void Draw() { /*Draw circle stuff*/ }
}

class Rectangle : Shape
{
  public override void Draw() { /*Draw rectangle stuff*/ }
}

class RedBorderedLine : Line
{
  public override void Draw()
  {
    /*Draw red border*/
    base.Draw();
  }
}

class RedBorderedCircle : Circle
{
  public override void Draw()
  {
    /*Draw red border*/
    base.Draw();
  }
}

class RedBorderedRectangle : Rectangle
{
  public override void Draw()
  {
    /*Draw red border*/
    base.Draw();
  }
}
```

O podríamos optar por el patrón *Decorator* y así prevendríamos futuros cambios compuestos, como por ejemplo dibujar un borde rojo, fondo azul o un *emote*, junto con mi figura.

Así que crearíamos nuestros decoradores:

```csharp
abstract class Decorator
{
  public abstract void Decorate(Shape shape);
}

class RedBorderedDecorator : Decorator
{
  public override void Decorate(Shape shape) { /*Draw red border*/ }
}

class LineDecorator : Decorator
{
  public override void Decorate(Shape shape) { /*Draw line stuff*/ }
}

class CircleDecorator : Decorator
{
  public override void Decorate(Shape shape) { /*Draw circle stuff*/ }
}

class RectangleDecorator : Decorator
{
  public override void Decorate(Shape shape) { /*Draw rectangle stuff*/ }
}
```

Y modificaríamos nuestro original para que utilizara los decoradores que hemos creado:

```csharp
abstract class Shape
{
  private readonly Decorator _decorator;

  public Shape(Decorator decorator)
  {
      _decorator = decorator;
  }

  public bool IsSelected { get; set; }

  public virtual void Draw()
  {
      if (IsSelected)
      {
          new RedBorderedDecorator().Decorate(this);
      }

      _decorator.Decorate(this);
  }
}

class Line : Shape
{
  public Line() : base(new LineDecorator()) { }
}

class Circle : Shape
{
  public Circle() : base(new CircleDecorator()) { }
}

class Rectangle : Shape
{
  public Rectangle() : base(new RectangleDecorator()) { }
}
```

Pero aquí hemos hecho trampa. Si os fijáis hemos añadido una propiedad a `Shape` llamada `IsSelected` y quizá en un futuro esa propiedad no deba de estar en nuestro código, así que lo mejor sería refactorizarlo y, por ejemplo, usar un patrón *Visitor* para cambiar el estado de nuestra figura:

```csharp
abstract class Visitor
{
  public abstract void Visit(Shape shape);
}

class SelectVisitor : Visitor
{
  public override void Visit(Shape shape)
  {
      shape.AddDecorator(new RedBorderedDecorator());
  }
}

class UnselectVisitor : Visitor
{
  public override void Visit(Shape shape)
  {
      shape.RemoveDecorator(typeof(RedBorderedDecorator));
  }
}

abstract class Shape
{
  private readonly List<Decorator> _decorators;

  public Shape(Decorator decorator)
  {
      _decorators = new List<Decorator> { decorator };
  }

  public void AddDecorator(Decorator d) { ... }

  public void RemoveDecorator(Type t) { ... }

  public virtual void Draw()
  {
      _decorators.ForEach(d => d.Decorate(this));
  }
}
```

Para hacer que estos objetos "visiten" nuestras figuras, necesitaremos otro tipo de elemento, como por ejemplo un *Command*. Aplicando este patrón crearíamos acciones que se pueden ejecutar en nuestro sistema:

```csharp
abstract class Command
{
  public abstract void Execute(Manager manager, Shape shape);
}

class SelectCommand : Command
{
  private readonly Visitor _selectVisitor = new SelectVisitor();
  private readonly Visitor _unselectVisitor = new UnselectVisitor();

  public override void Execute(Manager manager, Shape shape)
  {
    manager.Shapes.ToList().ForEach(x => _unselectVisitor.Visit(x));
    _selectVisitor.Visit(shape);
  }
}
```

Y finalmente para orquestar esos *Commands* crearemos otra clase que nos servirá de ayuda:

```csharp
class Manager
{
  private readonly List<Shape> _shapes = new List<Shape>();
  private readonly IDictionary<string, Command> _commands;

  public Manager(IDictionary<string, Command> commands)
  {
    _commands = commands;
  }

  public IEnumerable<string> Commands { get => _commands.Keys; }

  public IEnumerable<Shape> Shapes { get => _shapes; }

  public void AddShape(Shape s)
  {
      _shapes.Add(s);
  }

  public void RemoveShape(Shape s)
  {
      _shapes.Remove(s);
  }

  public void DoCommand(string commandKey, Shape s)
  {
      if (_commands.ContainsKey(commandKey))
      {
          _commands[commandKey].Execute(this, s);
      }
  }
}
```

De esta manera, nuestro programa estará abierto a la extensión:

- Si quisiéramos añadir o modificar una figura, añadiríamos un nuevo objeto que heredara de `Shape` y otro que lo hiciera de `Decorator` para dibujarla en pantalla.
- Si quisiéramos añadir o modificar una característica de dibujado, crearíamos un nuevo objeto de tipo `Decorator`.
- Si quisiéramos añadir o modificar una característica de dibujado condicional, además de lo que hicimos en el paso anterior, crearíamos una serie de objetos de tipo `Visitor` para cambiar el listado de decoradores de nuestra figura.
- Si quisiéramos añadir acciones a realizar en una lista de figuras, crearíamos un nuevo objeto tipo `Command`.
- Si quisiéramos borrar alguno de los objetos que ya existen, solo tendríamos que ignorarlos.

Por lo que también estará cerrado a la modificación, porque todo cambio consistirá en crear nuevos objetos y/o ignorar los que ya existen.

Si bien es verdad que se ha incrementado un poco la complejidad del sistema, como estamos usando patrones conocidos, a nuestro equipo de programadores no les importará demasiado. Sería pagar un poco de complejidad a cambio de que todo lo que está hecho, se tenga la seguridad de que no se va a tener que tocar jamás ¿Quién no firmaría esto ahora mismo para sus desarrollos?

Ahora surge un nuevo problema, empieza un *sprint* y tenemos una nueva *feature*:
- Añadir colores al pintado de la figura

Siguiendo el **OCP** para poder pintar en colores, no podemos modificar el código existente, luego tendríamos que crear un nuevo conjunto de decoradores:

```csharp
abstract class ColoredDecorator : Decorator
{
  protected ColoredDecorator(Color color)
  {
      Color = color;
  }

  protected Color Color { get; private set; }
}

class ColoredBorderedDecorator : ColoredDecorator
{
  public ColoredBorderedDecorator(Color color): base(color) { }
  public override void Decorate(Shape shape) { /*Draw red border*/ }
}

class ColoredLineDecorator : ColoredDecorator
{
  public ColoredLineDecorator(Color color): base(color) { }
  public override void Decorate(Shape shape) { /*Draw line stuff*/ }
}

class ColoredCircleDecorator : ColoredDecorator
{
  public ColoredCircleDecorator(Color color): base(color) { }
  public override void Decorate(Shape shape) { /*Draw circle stuff*/ }
}

class ColoredRectangleDecorator : ColoredDecorator
{
  public ColoredRectangleDecorator(Color color): base(color) { }
  public override void Decorate(Shape shape) { /*Draw rectangle stuff*/ }
}
```

También tendríamos que crear nuevas figuras para que usarán estos nuevos decoradores. Y lo mismo para los *Visitors* y los *Commands*. Tendríamos que crear alguna forma de que los *Commands* recibieran el parámetro de color de forma dinámica, así que al final terminaríamos reescribiendo la implementación completa del `Manager` llamándolo `ColoredManager` o recubriéndola en un *wrapper*.

El caso es que en un desarrollo normal terminaremos o bien haciendo *Copy & Paste* de todo nuestro código cientos de veces para crear un objeto nuevo con una nueva capacidad, o bien extendiendo de unas bases que en un principio no contenían toda la complejidad del sistema.

¿Os imagináis un año un equipo de 4 personas desarrollando este proyecto para ir dotándolo de más características? Imagino una cantidad de objetos inabarcable. Algo que a una persona nueva en el proyecto le sería prácticamente incomprensible por lo distribuida que estaría la información.

Y es que, hemos caído en nuestra propia trampa: no podemos modificar, solo extender. Esto implica que tenemos que programar haciendo que nuestro código sea extensible en todos aquellos puntos en los que podría tener que ser modificado en el futuro. Pero hasta donde sé, nunca he conocido un programador adivino que vea cómo va a evolucionar un producto en el futuro. Al menos no en su totalidad.

Por esta razón, [Uncle Bob](https://twitter.com/unclebobmartin) decidió [reformular en 2014 su propuesta de OCP](https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html). En este nuevo documento nos habla del uso de sistemas de *plugins*, como los que usan nuestros IDEs preferidos, para poner en práctica este principio. Y aunque creo que es muy interesante esta propuesta, también creo que son pocas las aplicaciones que he programado en las que añadir un sistema de complementos vaya a impactar directamente en la mejora de la calidad de su código fuente.

El ejemplo que hemos expuesto es un buen código. Sigue a rajatabla **OCP**. Pero llega un momento en el que, en dependencia de la nueva *feature* que tengamos que implementar, creo que mejoraría más modificando ciertos objetos que añadiendo extensiones, derivaciones o *plugins*.

Porque el desarrollo de software, la gestión del ciclo de vida de una aplicación, las metodologías ágiles, las prácticas XP (e**X**treme **P**rogramming) y todo lo que lo rodea, va en dirección de adaptarse al cambio, no a preverlo. Y cuando un requisito del sistema cambia, significa que tu código no es válido y tienes que reemplazarlo.

## Hay vida después de OCP

He de reconocer que el trabajo de [Uncle Bob](https://twitter.com/unclebobmartin) (Robert C. Martin) me ayuda a ser mejor programador. Cada vez que leo uno de sus libros o veo una de sus charlas, aprendo algo. Incluso si no es la primera vez que lo hago. Y los principios **SOLID**, y en concreto el **OCP**, no son una excepción. Mi consejo es que:

- Si consideras que este principio es una mierda, acostúmbrate a seguirlo siempre.
- Si siempre lo sigues y consideras que este artículo es una mierda, sigue aplicándolo.
- Y si lo has aplicado hasta la extenuación y te surgen dudas, sigue leyendo.

Debemos ser críticos con todo lo que hacemos y encontrar esos puntos débiles en las "reglas" que seguimos al programar:

- Si tengo que estar cerrado a la modificación ¿Cómo puedo predecir qué código va a cambiar para hacerlo extensible?
- Si intento prever todos los cambios que se pueden dar en un sistema ¿Qué pasa con eso de "adaptarse al cambio" que promueve el desarrollo *agile*?
- ¿Es este principio una oposición directa a <abbr title="You Aren't Gonna Need It">YAGNI</abbr>?
- ¿Es más importante estar abierto a la extensión y cerrado a la modificación que el principio <abbr title="Don't Repeat Yourself">DRY</abbr>?
- ¿Es mejor tener un sistema abierto a la extensión o una aplicación que se ciña a hacer lo que dice que debe hacer?
- Si quiero aplicar OCP en un código que nunca lo ha tenido en cuenta ¿podría entonces modificar las clases existentes?

El principio de abierto/cerrado creo que busca reducir el uso de bloques condicionales (como `switch` e `if`) aplicando patrones y usando las capacidades de un lenguaje orientado a objetos. Esto es importante porque los bloques condicionales hacen que nuestro código sea más difícil de entender y, por lo tanto, de mantener. Aunque seguirlo sin sentido nos llevará a conseguir todo lo contrario, un código en el que todo está tan desperdigado y hay tantas herencias, que resulta muy difícil de comprender.

Afortunadamente no todo en este mundo es **SOLID**. Existen multitud de principios y reglas de programación que son muy válidas también. Antes que seguir el **OCP** creo que sería interesante pensar en uno de [los valores en los que se basa XP](http://www.extremeprogramming.org/values.html) (e**X**treme **P**rogramming):

- *simplicity*: Es mejor hacer una cosa simple hoy y pagar un poco más mañana para cambiarlo, que hacer una cosa más complicada hoy que jamás vaya a ser utilizada.

Y después tendría en cuenta seguir el abierto/cerrado procurando no contradecir dos de las [*four rules of simple design*](https://martinfowler.com/bliki/BeckDesignRules.html) de [Kent Beck](https://twitter.com/kentbeck): *No duplication* y *Fewest elements*. Las cuatro me parecen muy importantes, pero una aplicación agresiva de **OCP** podría llevarnos a duplicar mucho código con la excusa de no poder modificarlo, y encontrarnos con muchos artefactos con una alta probabilidad de tener el *smell* de *Parallel Inheritance Hierarchies*.

Según la opinión que tengo hoy en día y usando lenguaje de acrónimos: **OCP** debería estar supeditado por otros principios como **KISS**, **DRY** y **YAGNI**. Pero eso no quiere decir que sea equivocado o que no lo apliquemos.

Y lo que me pueda opinar mañana, ya lo veremos...


## Ejemplo en el mundo real

En otro de los famosos *code reviews* en los que tuve la suerte de poder asistir, salió un código que nos viene al pelo:

```csharp
public static dynamic FromObject(dynamic obj)
{
  if (obj is ExpandoObject) return obj;

  var expando = new ExpandoObject();
  if (obj is Document d)
  {
    obj = JsonConvert.DeserializeObject(d.ToString());
  }

  var dictionary = (IDictionary<string, object>)expando;
  if (obj is JObject)
  {
    ((JObject)obj).Children<JProperty>().ToList().ForEach(x =>
    {
      dictionary.Add(x.Name, x.Value);
    });

    return expando;
  }

  (obj.GetType() as Type).GetProperties().ToList().ForEach(p =>
  {
    dictionary[p.Name] = p.GetValue(obj);
  });

  if (dictionary.Keys.All(x => x == "Payload") && (obj.GetType() as Type).FullName == "Microsoft.Azure.Documents.QueryResult")
  {
    return FromObject(dictionary["Payload"]);
  }

  return expando;
}
```

Es un ejemplo real de algo que conocemos vulgarmente como *spaghetti-code*. Y lo mejor es que el autor de semejante atentado contra la humanidad fui yo mismo. Así que primero me sirvió para bajarme los humos y segundo para ser crítico con mi propio trabajo. Por muy bueno que se considere un programador siempre cometerá errores. Y la mejor forma de aprender y mejorar, es que tu código aparezca en un *code review*.

Como este código era un conjunto de *bugfixes* hechos con el menor rigor profesional, lo primero que tuvimos que hacer fue explicar qué hacía y por qué. Así que os lo voy a dejar a continuación en formato de comentario:

```csharp
// convierte un objeto cualquiera en un ExpandoObject, que es un tipo dinámico que nos permite añadir nuevas propiedades al vuelo
// en este caso se usa para crear un objeto al que le vamos añadiendo ciertas propiedades en tiempo de ejecución y que será almacenado en una base de datos de tipo documental sin esquema
public static dynamic FromObject(dynamic obj)
{
  // si el objeto de entrada ya es un ExpandoObject lo devolvemos tal cual
  if (obj is ExpandoObject) return obj;

  // nuestra función devolverá finalmente este "expando"
  var expando = new ExpandoObject();

  // si el objeto de entrada es de tipo Document (de cosmosDB) lo deserializamos para convertirlo en un JObject
  if (obj is Document d)
  {
    obj = JsonConvert.DeserializeObject(d.ToString());
  }

  // para poder interactuar de una forma sencilla con un ExpandoObject, lo podemos convertir en un diccionario
  var dictionary = (IDictionary<string, object>)expando;

  // si el objeto de entrada es un JObject
  if (obj is JObject)
  {
    // copiamos las propiedades de este objeto
    ((JObject)obj).Children<JProperty>().ToList().ForEach(x =>
    {
      dictionary.Add(x.Name, x.Value);
    });

    // devolvemos el ExpandoObject
    return expando;
  }

  // si no, copiamos las propiedades de un objeto cualquiera
  (obj.GetType() as Type).GetProperties().ToList().ForEach(p =>
  {
    dictionary[p.Name] = p.GetValue(obj);
  });

  // si después de copiar los datos, observamos que solo existe la propiedad Payload y que el objeto de entrada es de tipo QueryResult
  // *QueryResult es un objeto interno al que no se tiene acceso, por eso comparamos con el nombre del tipo
  if (dictionary.Keys.All(x => x == "Payload") && (obj.GetType() as Type).FullName == "Microsoft.Azure.Documents.QueryResult")
  {
    // lanzamos otra vez la función de convertir pero usando solo la propiedad Payload
    return FromObject(dictionary["Payload"]);
  }

  // devolvemos el ExpandoObject
  return expando;
}
```

Como se puede observar por los comentarios, estamos creando un objeto `ExpandoObject` a partir de otro objeto, haciendo diferenciación de si este objeto es de tipo `Document`, `JObject`, `QueryResult` o cualquier otro tipo.

Los primeros comentarios que surgieron en el *code review* proponían montar un *Command Pattern* o algo parecido para gestionar esto. Pero nadie sabía cómo empezar a hacerlo. Así que decidimos empezar por los pequeños pasos seguros que teníamos y a partir de ahí ver cómo evolucionaba el código.

### Evita el uso de dynamic en contratos

Creo que todos tendremos grabado a fuego que [no es recomendable usar el tipo `dynamic` en C#](https://cloudncode.blog/2016/07/12/c-dynamic-keyword-what-why-when/). Y menos como parámetros de entrada y salida de un método o función:

```csharp
public static dynamic FromObject(dynamic obj)
```

Realmente estábamos construyendo un objeto de tipo `ExpandoObject` a partir de cualquier otro `object`. Por lo que la firma sin usar `dynamic` nos simplificaría lo que vendría después:

```csharp
public static ExpandoObject FromObject(object obj)
```

### Simplifica los condicionales

Al final de código teníamos esta comprobación:

```csharp
if (dictionary.Keys.All(x => x == "Payload") && (obj.GetType() as Type).FullName == "Microsoft.Azure.Documents.QueryResult")
{
  return FromObject(dictionary["Payload"]);
}
```

Aquí estamos *hackeando* el sistema para realizar una conversión de un tipo `internal` del SDK 2.0 de cosmosDB, pero también estamos comprobando que tenga una propiedad llamada "Payload". Quizá nos podríamos ahorrar esta comprobación si ya sabemos cuál es el tipo:

```csharp
if (obj.GetType().FullName == "Microsoft.Azure.Documents.QueryResult")
{
  var payload = obj.GetType().GetProperty("Payload");
  return FromObject(payload);
}
```

Este cambio tiene un efecto secundario, ya no hace falta que sea la última condición porque nos hemos quitado la dependencia de `diccionary`. Así que podría situarse en las comprobaciones iniciales.

### Empieza por extraer métodos

Cuando ya te quedas sin ideas, lo que puedes hacer con un código espagueti es empezar a extraer métodos en busca de algo que te llame la atención.

En este caso nos fijamos en la asignación de propiedades, que se podría hacer de dos formas diferentes, una en si es un `JObject` y otra si no:

```csharp
private static ExpandoObject PopulateProperties(object obj)
{
  var expando = new ExpandoObject();
  var dictionary = (IDictionary<string, object>)expando;

  PopulateJsonProperties(dictionary, obj);
  PopulateDefaultProperties(dictionary, obj);

  return expando;
}

private static void PopulateJsonProperties(IDictionary<String, Object> dictionary, object obj)
{
  if (!(obj is JObject o)) return;

  o.Children<JProperty>().ToList().ForEach(x =>
    {
        dictionary.Add(x.Name, x.Value);
    });
}

private static void PopulateDefaultProperties(IDictionary<String, Object> dictionary, object obj)
{
  if (obj is JObject) return;

  obj.GetType().GetProperties().ToList().ForEach(p =>
  {
      dictionary[p.Name] = p.GetValue(obj);
  });
}
```

### Encontrando el patrón

Entonces empezamos a extraer a métodos los bloques `if` que teníamos:

```csharp
private static ExpandoObject FromExpandoObject(object obj)
{
  if (obj is ExpandoObject e) return e;
  return default;
}
```

Primero para ver si era un `ExpandoObject` y luego para cuando era un `QueryResult`:

```csharp
private const string QueryResultTypeName = "Microsoft.Azure.Documents.QueryResult";
private const string PayloadPropertyName = "Payload";

private static ExpandoObject FromQueryResult(object obj)
{
  if (obj.GetType().FullName == QueryResultTypeName)
  {
    var payload = obj.GetType().GetProperty(PayloadPropertyName);
    return FromObject(payload);
  }

  return default;
}
```

Y ya teníamos un patrón a la vista, crear funciones con la firma que acepten un parámetro de entrada de tipo `object` y devuelvan `ExpandoObject`:

```csharp
Func<object, ExpandoObject>
```

Así que terminamos con el último bloque `if` que nos quedaba, para cuando se trataba de un objeto de tipo `Document`:

```csharp
private static ExpandoObject FromDocument(object obj)
{
  if (obj is Document d)
  {
    var json = JsonConvert.DeserializeObject(d.ToString());
    return FromObject(json);
  }

  return default;
}
```

Y después refactorizamos los métodos que creamos en el paso anterior para asignación de propiedades, con la misma forma que habíamos estandarizado:

```csharp
private static ExpandoObject FromJObject(object obj)
{
  if (obj is JObject o)
  {
      var expando = new ExpandoObject();
      var dictionary = (IDictionary<string, object>)expando;
      o.Children<JProperty>().ToList().ForEach(x =>
      {
        dictionary.Add(x.Name, x.Value);
      });

      return expando;
  }

  return default;
}

private static ExpandoObject FromAnyObject(object obj)
{
  var expando = new ExpandoObject();
  var dictionary = (IDictionary<string, object>)expando;
  obj.GetType().GetProperties().ToList().ForEach(p =>
  {
    dictionary[p.Name] = p.GetValue(obj);
  });

  return expando;
}
```

Finalmente, nuestra función quedaría como una llamada encadenada a cada una de las funciones que intentaban realizar la conversión a `ExpandoObject`:

```csharp
public static ExpandoObject FromObject(object obj)
{
  var result = FromExpandoObject(obj);
  result ??= FromQueryResult(obj);
  result ??= FromDocument(obj);
  result ??= FromJObject(obj);
  result ??= FromAnyObject(obj);
  return result;
}
```

### Resultado final

Aquí surgió de nuevo si merecía la pena implementar un *Strategy Pattern* para separar todas estas funciones en clases completas (abierto a la extensión, pero cerrado a la modificación). Pero, teniendo en cuenta que era el código de una clase de apoyo (un *Helper*), que no se espera que cambie nunca, el equipo decidió que una solución intermedia era suficiente, creando una lista de funciones y realizando un recorrido por todas ellas:

```csharp
private static readonly Func<object, ExpandoObject>[] _strategies = new Func<object, ExpandoObject>[] {
  FromExpandoObject,
  FromQueryResult,
  FromDocument,
  FromJObject,
  FromAnyObject
};

public static ExpandoObject FromObject(object obj)
{
  return _strategies.Select(x => x(obj))
                    .FirstOrDefault(x => x != null);
}
```

Es posible que el código hubiera mejorado con el patrón de estrategia, o con cualquier otro patrón de los que hemos visto en el primer ejemplo. Pero el equipo consideró que ya había realizado una buena refactorización y que dejarían esa decisión para el futuro. En ese momento ya habíamos conseguido el objetivo de la reunión: refactorizar el horrible código inicial y hacerlo legible.