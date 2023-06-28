---
published: true
ID: 202010141
title: 'SOLID menos mola (D)'
author: fernandoescolar
post_date: 2020-10-14 02:16:54
layout: post
tags: solid best-practices
background: '/assets/uploads/bg/solid4.jpg'
---

La *D* de *SOLID* se refiere al principio de inversión de dependencia o **DIP** por sus siglas en inglés (**D**ependency **I**nversion **P**rinciple). Se puede resumir con que una clase debe depender de las abstracciones, no de las concreciones. Aunque [Robert C. Martin](https://twitter.com/unclebobmartin) es mucho más específico y realiza una definición dividida en dos partes<!--break-->:

> A. *Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de las abstracciones.*

> B. *Las abstracciones no deben depender de los detalles. Los detalles deben depender de las abstracciones.*

[Uncle Bob](https://twitter.com/unclebobmartin) lo explica mediante un ejemplo, [en su ensayo sobre **DIP**](https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf), que voy a intentar traducir a C# a continuación:

```csharp
public class Copier
{
  private const char EndOfFile = default;

  public void Copy()
  {
    char c;
    while ((c = ReadCharFromConsole()) != EndOfFile)
      WriteCharInPrinter(c);
  }

  public char ReadCharFromConsole() { ... }

  public void WriteCharInPrinter(char c) { ... }
}
```

Tenemos una clase llamada `Copier`. Esta clase realiza la copia `char` a `char` de lo que escribes en consola con dirección la impresora. En este caso, nuestra clase tiene una dependencia directa con los módulos de bajo nivel para la lectura de la consola y para la escritura en la impresora. En *.Net* esas capacidades las encontramos en los artefactos `System.Console` y `System.Drawing.Printing.PrintDocument`.

Si quisiéramos darle la capacidad de escribir en la impresora o en un archivo en disco, podríamos ampliar nuestro código con:

```csharp
public enum OutputDevice { Printer, Disk };
```

`OutputDevice` es una enumeración que nos aportará el destino de los caracteres que estoy escribiendo. Así que tendremos que modificar nuestra clase original con algo parecido a esto:

```csharp
public void Copy(OutputDevice device)
{
  char c;
  while ((c = ReadCharFromConsole()) != EndOfFile)
    if (device == OutputDevice.Printer)
      WriteCharInPrinter(c);
    else
      WriteCharInDisk(c);
}

public char ReadCharFromConsole() { ... }
public void WriteCharInPrinter(char c) { ... }
public void WriteCharInDisk(char c) { ... }
```

Este cambio también implicaría que estaríamos añadiendo una dependencia de `System.IO.File`, el artefacto mediante el cual podemos gestionar archivos en disco.

Al usar tantos módulos externos dentro de nuestra clase `Copier`, vamos a tener un problema a la hora de realizar los *unit tests*. Una prueba unitaria no debería crear archivos en disco o realizar una impresión. Y, sobre todo, una prueba unitaria no debería quedarse a la espera de que el usuario escriba algo en la consola.

Además, tenemos el problema de que cada nuevo comportamiento que le queramos añadir será una nueva dependencia, un nuevo método y una nueva condición en el bucle.

Todo esto se soluciona, como dice el punto *A* del principio de inversión de dependencia, diseñando abstracciones:

```csharp
public interface ICharReader
{
    char Read();
}
public interface ICharWriter
{
    void Write(char c);
}
```

Y haciendo que nuestros módulos dependan de estas:

```csharp
public class Copier
{
  private const char EndOfFile = default(char);
  private readonly ICharReader _reader;
  private readonly ICharWriter _writer;

  public Copier(ICharReader reader, ICharWriter writer)
  {
      _reader = reader;
      _writer = writer;
  }

  public void Copy()
  {
    char c;
    while ((c = _reader.Read()) != EndOfFile)
      _writer.Write(c);
  }
}
```

Gracias a esta implementación, podríamos hacer pruebas unitarias. Abstraernos de las dependencias sería sencillo usando *test doubles*:

```csharp
[Fact]
public void Copier_Does_not_write_When_reads_EOF()
{
  var reader = new Mock<ICharReader>();
  var writer = new Mock<ICharWriter>(MockBehavior.Strict);
  reader.Setup(x => x.Read()).Returns(default(char));

  var target = new Copier(reader.Object, writer.Object);
  target.Copy();

  writer.Verify();
}
```

Y también añadimos la posibilidad de realizar composición. Esto nos ayuda a dotar a nuestro código de más opciones de lectura y escritura:

```csharp
public class ConsoleCharReader : ICharReader { ... }
public class PrinterCharWriter : ICharWriter { ... }
public class FileCharWriter : ICharWriter { ... }

var copyToPrinter = new Copier(new ConsoleCharReader(), new PrinterCharWriter());
var copyToFile    = new Copier(new ConsoleCharReader(), new FileCharWriter());
```

Por lo tanto, podemos deducir que los módulos de alto y bajo nivel dependan de las abstracciones, aporta mucho valor a nuestro código. Desacopla artefactos, los hace *testeables* y nos ayuda a aplicar patrones con más facilidad.

Pero ¿qué pasaría si en lugar de leer desde la consola, quisiera leer los caracteres que me vienen en una conexión remota? Posiblemente tendría que crear una nueva implementación de `ICharReader`:

```csharp
public class SocketCharReader : ICharReader, IDisposable
{
  private readonly NetworkStream _reader;

  public SocketCharReader(Socket socket)
  {
    _reader = new NetworkStream(socket);
  }

  public char Read()
  {
    int i;
    if ((i = _reader.ReadByte()) > 0)
      return (char)i;

    return default;
  }

  public void Dispose()
  {
    _reader.Dispose();
  }
}
```

El caso es que, si pensamos en sacar un buen rendimiento a la hora de leer desde un socket, escribir en un archivo o enviar a la impresora, todo este código es ineficiente. Para este tipo de funcionalidades es mejor realizar lecturas y escrituras en bloque. Por ejemplo, usando un *buffer*:

```csharp
// Reader
public int Read(byte[] buffer)
{
  return _streamReader.Read(buffer, 0, buffer.Length);
}

// Writer
public void Write(byte[] buffer, int length)
{
  _streamWriter.Write(buffer, 0, length);
}

// Copier
public void Copy()
{
  var buffer = new byte[2048];
  int read;
  while ((read = _reader.Read(buffer, 0, buffer.Length)) > 0)
  {
    _writer.Write(buffer, 0, read);
  }
}
```

Pero nuestra abstracción está pensada para leer carácter a carácter conforme se van pulsado teclas desde la consola del sistema. Así que eso de que las *abstracciones no deben depender de los detalles* quizá, si buscamos realizar esta operación en un tiempo razonable, no encajaría del todo.

Y es que la eficiencia y el buen rendimiento se encuentra en los detalles. Y esta es la parte que creo que no funciona del todo dentro de **DIP**.

## Patrones

Para aplicar el principio de inversión de dependencia encontramos una serie de patrones de diseño que nos pueden ayudar. Los más comunes en este ámbito son:

### Service Locator

Este patrón consiste en crear un artefacto donde almacenar todas las dependencias de nuestros módulos:

```csharp
public class ServiceLocator
{
  private static readonly Dictionary<Type, object> _services;

  static ServiceLocator()
  {
    _services = new Dictionary<Type, object>
    {
      { typeof(ICharReader), new ConsoleCharReader() },
      { typeof(ICharWriter), new PrinterCharWriter() },
    };
  }

  public static T GetService<T>()
  {
    if (_services.ContainsKey(typeof(T)))
      return (T)_services[typeof(T)];

    throw new ArgumentException(nameof(T), "Type not found");
  }
}
```

De esta forma, en nuestras clases, podemos ir a buscar las dependencias a `ServiceLocator` y de esta forma no depender de concreciones, solo de abstracciones:

```csharp
public class Copier
{
  private const char EndOfFile = default(char);
  private readonly ICharReader _reader;
  private readonly ICharWriter _writer;

  public Copier()
  {
      _reader = ServiceLocator.GetService<ICharReader>();
      _writer = ServiceLocator.GetService<ICharWriter>();
  }
```

Todo esto salvo por una particularidad, si aplicamos este patrón el propio `ServiceLocator` será una dependencia a lo largo de todo nuestro código, haciendo que todos nuestros módulos dependan de él.

### Dependency Injection

El *design pattern* de inyección de dependencias nos ayuda a crear objetos sin necesidad de tener que definir sus dependencias. Estás serán inyectadas por un constructor o una fábrica.

Existen diferentes formas de inyectar dependencias:

#### DI Constructor

La más común que nos podemos encontrar es por el constructor. La idea es que el constructor de nuestra clase contenga una referencia a las abstracciones de las que depende:

```csharp
public class Copier
{
  // ...
  public Copier(ICharReader reader, ICharWriter writer)
  {
      _reader = reader;
      _writer = writer;
  }
  // ...
}
```

Y luego estás serán inyectadas al ser instanciada:

```csharp
public class CopierFactory
{
  public Copier CreateConsoleToPrinterCopier()
  {
    return new Copier(new ConsoleCharReader(), new PrinterCharWriter());
  }
}
```

#### DI Propiedad

Esta es una idea semejante al constructor, pero usando propiedades. La idea es crear tantas propiedades como dependencias tenga un módulo:

```csharp
public class Copier
{
  // ...
  public ICharReader Reader { get; set; }
  public ICharWriter Writer { get; set; }
  // ...
}
```

Y asignarlas nada más crear la instancia:

```csharp
public class CopierFactory
{
  public Copier CreateConsoleToPrinterCopier()
  {
    return new Copier
    {
      Reader = new ConsoleCharReader(),
      Writer = new PrinterCharWriter()
    };
  }
}
```

#### DI Método

Y por último está la inyección de dependencias vía método, en la que crearemos métodos que nos permiten asignar las dependencias de nuestro módulo, que luego llamaremos al instanciarlo:

```csharp
public class Copier
{
  // ...
  public void SetReader(ICharReader reader) { ... }
  public void SetWriter(ICharWriter writer) { ... }
  // ...
}

public class CopierFactory
{
  public Copier CreateConsoleToPrinterCopier()
  {
    var copier = new Copier();
    copier.SetReader(new ConsoleCharReader());
    copier.SetWriter(new PrinterCharWriter());

    return copier;
  }
}

```

Si ahora cogemos el patrón de *service locator*, lo mezclamos con el de *dependency injection*:

```csharp
public interface IServiceLocator
{
  T GetService<T>();
}

public interface IServiceRegister
{
  void Register<T>(Func<IServiceLocator, T> factory);
}

public class DependencyInjector : IServiceLocator, IServiceRegister
{
  private static readonly ConcurrentDictionary<Type, object> _services = new   ConcurrentDictionary<Type, object>();

  public T GetService<T>()
  {
    if (_services.ContainsKey(typeof(T)))
      return (T)_services[typeof(T)];

    throw new ArgumentException(nameof(T), "Type not found");
  }

  public void Register<T>(Func<IServiceLocator, T> factory)
  {
    var instance = factory(this);
    _services.AddOrUpdate(typeof(T), instance, (a, b) => instance);
  }
}
```

Ahora podríamos tener un inicio de nuestra aplicación parecido a este:

```csharp
// build dependency tree
var dependencyInjector = new DependencyInjector();
dependencyInjector.Register<ICharReader>(_ => new ConsoleCharReader());
dependencyInjector.Register<ICharWriter>(_ => new PrinterCharWriter());
dependencyInjector.Register<Copier>(serviceLocator => new Copier(serviceLocator.GetService<ICharReader>(), serviceLocator.GetService<ICharWriter>()));

// run application
var copier = dependencyInjector.GetService<Copier>();
copier.Copy();
```

### Inversion of Control

Otra vuelta de tuerca sobre la misma idea, y la que más personas conocerán, es el patrón de inversión de control (o *IoC*).

En este patrón la idea es tener un contenedor que se asemeje a la clase `DependencyInjector` que hemos implementado anteriormente. A este contenedor le añadimos la capacidad de crear, reutilizar y destruir estas dependencias que registramos. Y terminamos controlando el flujo de nuestra aplicación mediante su uso.

Así que si pensamos en qué control se invierte cuando usamos *IoC*, nos referimos a que en lugar de controlar nosotros el ciclo de vida de los objetos de nuestra aplicación, delegamos esto en el contenedor de *IoC*.

En *dotnet core* este patrón ya forma parte del propio *framework* usando el paquete de nuget `Microsoft.Extensions.DependencyInjection`. Pero seguro que muchos ya lo habéis visto en librerías de terceros como `Autofac`, `Ninject`, `Unity`, ...

Para ponerlo a prueba usando la librería del *framework* de *dotnet core*, primero usaríamos un objeto de tipo `ServiceCollection` para registrar nuestras dependencias y su ciclo de vida:

```csharp
var serviceCollection = new ServiceCollection();
serviceCollection.AddSingleton<ICharReader, ConsoleCharReader>();
serviceCollection.AddScoped<ICharWriter, PrinterCharWriter>();
serviceCollection.AddTransient<Copier>();
```

Como se puede observar, en este ejemplo:
- `ConsoleCharReader`: ha sido declarado como *singleton*, es decir, que solo existirá una instancia lo usemos las veces que lo usemos.
- `PrinterCharWriter`: se instanciará uno por ámbito. Si por ejemplo estamos en *asp.net core*, el ámbito sería lo que dure una *request*. Pero podemos crear nuevos ámbitos usando el método `serviceProvider.CreateScope()`.
- `Copier`: se instanciará uno por cada llamada que hagamos, independientemente del ámbito o de que una dependencia sea *singleton*.

Después crearíamos un objeto tipo service locator al que han llamado `IServiceProvider` a partir del cual podríamos resolver nuestros servicios:

```csharp
var serviceProvider = serviceCollection.BuildServiceProvider();
serviceProvider.GetService<Copier>();
copier.Copy();
```

Este tipo de patrones nos obligan a ser muy cuidadosos configurando el ciclo de vida de nuestros artefactos, porque podemos tener muchos problemas si no cuidamos la jerarquía de duración. Es decir, que los objetos, solo dependan de artefactos con un ciclo de vida igual o mayor al que estamos usando y no al revés.

## Hay vida después de DIP

He de reconocer que el trabajo de [Uncle Bob](https://twitter.com/unclebobmartin) (Robert C. Martin) me ayuda a ser mejor programador. Cada vez que leo uno de sus libros o veo una de sus charlas, aprendo algo. Incluso si no es la primera vez que lo hago. Y los principios **SOLID**, y en concreto el **DIP**, no son una excepción. Mi consejo es que:

- Si consideras que este principio es una mierda, acostúmbrate a seguirlo siempre.
- Si siempre lo sigues y consideras que este artículo es una mierda, sigue aplicándolo.
- Y si lo has aplicado hasta la extenuación y te surgen dudas, sigue leyendo.

### Depender de abstracciones

Como hemos podido ver, depender de abstracciones viene muy bien a nuestro código. Es muy útil y nos aporta muchas ventajas. El problema que encontramos aquí es cómo se consigue aplicar este patrón. Por lo general todo el mundo usa *IoC* y quizá no sea necesario siempre. Por ejemplo, una *Azure Function* o un programa de consola mono hilo es muy posible que, por usar inversión de control, estemos añadiendo una complejidad innecesaria a nuestra aplicación.

En mi opinión, siempre que podamos, es mejor depender de abstracciones y no de concreciones. Sobre todo, si estamos interesados en tener pruebas unitarias o código desacoplado. Pero no debemos caer el en anti-patrón del [martillo dorado](https://es.wikipedia.org/wiki/Martillo_de_oro): *IoC* no es siempre la respuesta a **DIP**, es solo una de ellas.

### Las abstracciones no deben depender de los detalles

Está claro que, si hacemos que las abstracciones no dependan de los detalles, nos va a aportar muchos beneficios. Sobre todo, que nuestro código será más susceptible a ser reutilizado en otras partes o incluso en otros proyectos. Pero quizá este objetivo no debería ser lo primero que debemos buscar a la hora de realizar un programa. Quizá la reutilización de código debería surgir como un subproducto de dos proyectos que usan las mismas tecnologías. Y quizá debamos dejar de obsesionarnos con lo que sucederá mañana y prepararnos para lo que tenemos hoy.

En mi opinión, esta parte del principio de **DIP** tiene muchos casos en los que es mejor no aplicarla, ya que nos puede obligar a tener un mal diseño y por tanto una pobre mantenibilidad y sobre todo un mal rendimiento.

El caso es que esta es mi opinión a día de hoy. Lo que me pueda parecer mañana, ya lo veremos...
