---
published: true
ID: 202010061
title: 'SOLID menos mola (I)'
author: fernandoescolar
post_date: 2020-10-06 02:16:54
layout: post
tags: solid best-practices
background: '/assets/uploads/bg/solid6.jpg'
---
La *I* de *SOLID* se refiere al principio de segregación de interfaz o **ISP** por sus siglas en inglés (**I**nterface **S**egregation  **P**rinciple). Se puede definir como que muchas interfaces específicas son mejores que una interfaz de propósito general. O como diría [Robert C. Martin](https://twitter.com/unclebobmartin), "los clientes no deben ser forzados a depender de interfaces que no utilizan"<!--break-->.

[Uncle Bob](https://twitter.com/unclebobmartin) lo explica mediante un ejemplo, [en su ensayo sobre **ISP**](https://web.archive.org/web/20060313141044/http://www.objectmentor.com/resources/articles/isp.pdf), que voy a intentar simplificar y traducir a C# a continuación.

Estamos desarrollando la interfaz del cajero automático. Este cajero tiene diferentes formas de comunicarse con un ser humano:
- Un formato visual.
- Una interfaz hablada.
- Y otra en braille.

Lo ideal sería tener este conjunto de artefactos:

```csharp
interface IUserInterface { ... }
class ScreenUI : IUserInterface { ... }
class SpeechUI : IUserInterface { ... }
class BrailleUI : IUserInterface { ... }
```

Además, en nuestro cajero podemos realizar operaciones de depósito de dinero, transferencia o retirada de efectivo:

```csharp
interface ITransaction { ... }

class Deposit : ITransaction
{
  public Deposit(IUserInterface ui) { ... }
  ...
}

class Transfer : ITransaction
{
  public Transfer(IUserInterface ui) { ... }
  ...
}

class Withdraw : ITransaction
{
  public Withdraw(IUserInterface ui) { ... }
  ...
}
```

Entonces, aquí es muy probable que la interfaz `IUserInterface` tenga un contrato semejante a:

```csharp
interface IUserInterface
{
    void RequestDepositAmount(...);
    void RequestTransferAmount(...);
    void RequestWithdrawlAmount(...);
}
```

La coyuntura con la que nos enfrentamos es que una `Transfer` no tendría por qué conocer el método `RequestWithdrawlAmount`. Y lo mismo con `RequestDepositAmount`. Tampoco le interesaría a `Withdraw` conocer el método `RequestTransferAmount`. Y así sucesivamente. Para darle solución, lo que propone Uncle Bob es que cojamos `IUserInterface` y la segreguemos en interfaces más pequeñas:

```csharp
interface IDepositUI
{
    void RequestDepositAmount(...);
}

interface ITransferUI
{
    void RequestTransferAmount(...);
}

interface IWithdrawlUI
{
    void RequestWithdrawlAmount(...);
}

interface IUserInterface : IDepositUI, ITransferUI, IWithdrawlUI
{
}
```

De tal forma que nuestras operaciones quedarían como:

```csharp
class Deposit : ITransaction
{
  public Deposit(IDepositUI ui) { ... }
  ...
}

class Transfer : ITransaction
{
  public Deposit(ITransferUI ui) { ... }
  ...
}

class Withdraw : ITransaction
{
  public Deposit(IWithdrawlUI ui) { ... }
  ...
}
```

De esta manera, nos desacoplaríamos. O al menos conseguiríamos que una clase no referenciara a una interfaz que tuviera métodos que no se usan en dicha clase. Y, por lo tanto, cumpliríamos con la norma de no depender de contratos que no vamos a usar.

Pero ahora vamos a completar un poco este ejemplo, porque en un cajero automático tenemos muchas más interacciones con el ser humano de las que hemos expuesto:
- Bienvenida
- Selección de operación
- Selección de cuenta
- Operación realizada con éxito
- Error en la operación
- Selección de si se desea recibo
- Selección de si se desea realizar otra operación

Así que en realidad tendríamos que añadir estas interfaces:

```csharp
interface IWelcomeUI
{
    void WelcomeUser(...);
}

interface IOperationSelectionUI
{
    void SelectOperation(...);
}

interface IAccountSelectionUI
{
    void SelectAccount(...);
}

interface ISuccessUI
{
    void OperationSucceeded(...);
}

interface IErrorUI
{
    void OperationFailed(...);
}

interface IReceiptUI
{
    bool PrintReceipt(...);
}

interface IFinishOperationUI
{
    bool ShouldExit(...);
}
```

Así que, por ejemplo, nuestra clase `Deposit` debería ser:

```csharp
class Deposit : ITransaction
{
  public Deposit(IDepositUI ui,
                 IWelcomeUI welcomeUI,
                 IAccountSelectionUI accountSelectionUI,
                 ISuccessUI successUI,
                 IErrorUI errorUI,
                 IFinishOperationUI finishUI)
  {
    ...
  }
  ...
}
```

De esta forma tendríamos cada interfaz independiente y jamás ocurriría que tuviéramos disponible un método de una dependencia que no usáramos.

Lo malo de este código es que es muy posible que todas esas interfaces de tipo "ui" sean en realidad la misma instancia. Una forma de solucionar esto sería crear una implementación para cada una de ellas, teniendo en cuenta que tenemos 3 formas de comunicarnos con los usuarios. Por lo que tendríamos estos artefactos:

```csharp
class ScreenWelcomeUI : WelcomeUI { ... }
class SpeechWelcomeUI : WelcomeUI { ... }
class BrailleWelcomeUI : WelcomeUI { ... }

class ScreenOperationSelectionUI : IOperationSelectionUI { ... }
class SpeechOperationSelectionUI : IOperationSelectionUI { ... }
class BrailleOperationSelectionUI : IOperationSelectionUI { ... }

class ScreenAccountSelectionUI : IAccountSelectionUI { ... }
class SpeechAccountSelectionUI : IAccountSelectionUI { ... }
class BrailleAccountSelectionUI : IAccountSelectionUI { ... }

class ScreenSuccessUI : ISuccessUI { ... }
class SpeechSuccessUI : ISuccessUI { ... }
class BrailleSuccessUI : ISuccessUI { ... }

class ScreenErrorUI : IErrorUI { ... }
class SpeechErrorUI : IErrorUI { ... }
class BrailleErrorUI : IErrorUI { ... }

class ScreenReceiptUI : IReceiptUI { ... }
class SpeechReceiptUI : IReceiptUI { ... }
class BrailleReceiptUI : IReceiptUI { ... }

class ScreenFinishOperationUI : IFinishOperationUI { ... }
class SpeechFinishOperationUI : IFinishOperationUI { ... }
class BrailleFinishOperationUI : IFinishOperationUI { ... }
```

Pero este tipo de soluciones es posible que alerte a más de uno. El caso es que existe un *code smell* llamado *Parallel Inheritance Hierarchies*. Esto ocurre cuando tenemos un árbol de dependencias entre clases con varias ramificaciones en las que las dependencias de unas con otras van en paralelo. Y en este caso sería fácil terminar teniendo ese tipo de patrón de herencias.

Otra solución que quizá nos haga sentir más cómodos sería crear una especie de grafo de interfaces, con una interfaz "base" que aglutine otras interfaces como, por ejemplo:

```csharp
interface IOperationUI : IWelcomeUI,
                         IAccountSelectionUI,
                         ISuccessUI,
                         IErrorUI,
                         IFinishOperationUI
{
}
```

Así podríamos hacer que nuestras interfaces dependieran de esa interfaz común:

```csharp
interface IDepositUI : IOperationUI
{
    void RequestDepositAmount(...);
}

interface ITransferUI : IOperationUI
{
    void RequestTransferAmount(...);
}

interface IWithdrawlUI : IOperationUI
{
    void RequestWithdrawlAmount(...);
}

interface IUserInterface : IDepositUI, ITransferUI, IWithdrawlUI
{
}
```

Pero imaginemos que una `Transfer` no espera un resultado de la operación porque se realiza en segundo plano y se le envía un email al usuario para comunicar el resultado. Esto nos llevaría tener diferentes interfaces comunes:

```csharp
interface IOperationUI : IWelcomeUI,
                         IAccountSelectionUI,
                         IFinishOperationUI
{
}

interface IOperationWithResultUI : IOperationUI,
                                   ISuccessUI,
                                   IErrorUI
{
}

interface IDepositUI : IOperationWithResultUI
{
    void RequestDepositAmount(...);
}

interface ITransferUI : IOperationUI
{
    void RequestTransferAmount(...);
}

interface IWithdrawlUI : IOperationWithResultUI
{
    void RequestWithdrawlAmount(...);
}
```

No obstante, en este ejemplo no estamos usando las interfaces en más de un lugar. En caso de que una misma agrupación de interfaces, se usara en otra clase donde no se llamara a alguno de sus métodos ¿tendríamos que seguir dividiéndola en más interfaces?

Si seguimos esta tendencia en nuestro desarrollo, estaríamos generando muchas herencias y un código un tanto caótico. Además, esto de crear agrupaciones ¿no iría en contra de segregar interfaces? Pero claro, muy dividido ¿no estaría perdiendo cohesión?

No sé si merecería la pena dejar alguna interfaz con algún método que pueda o no ser usado, siempre y cuando mantenga coherencia. Por ejemplo, en *.Net* encontramos el objeto `System.Console`. Puede que no sea la mejor implementación del mundo, y que sea una clase estática. Puede que no cumpla con los principios *SOLID* en absoluto. Pero todos sabemos que ahí vamos a encontrar todo lo necesario para interactuar con el terminal: *write*, *read*, colores, limpieza... y lo tenemos todo a pesar de que una aplicación simple de consola no lea nada del terminal. Y tampoco es que me genere demasiados problemas tenerlo.

Solo opino que, aunque hay implementaciones mejores y mucho más completas para acceder al terminal, `System.Console` te aporta un comportamiento básico muy útil. Y que es suficiente, fácil de usar e intuitivo, a pesar de haberse saltado el **ISP** (y otros tantos principios).

## Hay vida después de ISP

He de reconocer que el trabajo de [Uncle Bob](https://twitter.com/unclebobmartin) (Robert C. Martin) me ayuda a ser mejor programador. Cada vez que leo uno de sus libros o veo una de sus charlas, aprendo algo. Incluso si no es la primera vez que lo hago. Y los principios **SOLID**, y en concreto el **ISP**, no son una excepción. Mi consejo es que:

- Si consideras que este principio es una mierda, acostúmbrate a seguirlo siempre.
- Si siempre lo sigues y consideras que este artículo es una mierda, sigue aplicándolo.
- Y si lo has aplicado hasta la extenuación y te surgen dudas, sigue leyendo.

Debemos ser críticos con todo lo que hacemos y encontrar esos puntos débiles en las "reglas" que seguimos al programar:

- ¿La solución genérica es crear una interfaz por cada método?
- ¿Tener muchas interfaces muy pequeñas es siempre mejor que unas pocas más grandes?
- Y si nos ponemos a dividir mucho una interfaz para desencapsular ¿Podríamos estar ignorando activamente una de las propiedades de la orientación a objetos como es la cohesión?

El principio de segregación de interfaz no es el mal. Es parecido al principio de responsabilidad única. Creo que ambos buscan simplificar el código fuente. Aunque si los seguimos sin sentido, podríamos terminar consiguiendo lo contrario de lo que buscábamos.

Tal cual lo veo, a **ISP** le pasaría lo mismo que a **SRP**. Considero que es necesario cumplir una serie de requisitos antes de aplicarlo sin consecuencias negativas:

- *simplicity*, de [los valores en los que se basa XP](http://www.extremeprogramming.org/values.html).
- *Reveals intention* y *Fewest elements*, de las [*four rules of simple design*](https://martinfowler.com/bliki/BeckDesignRules.html) de [Kent Beck](https://twitter.com/kentbeck).

El caso es que hoy en día me parece más importante aplicar estos valores y reglas, que el principio de segregación de interfaz. Pero eso no quiere decir que no tenga en cuenta este último.

Y lo que me pueda parecer mañana, ya lo veremos...

## Ejemplo en el mundo real

Lamentablemente hoy no traigo una de las famosas sesiones de *code review* que solemos hacer. Así que os propongo hacerla online y ahora mismo.

Actualmente tenemos una serie de aplicaciones en las que usamos configuraciones específicas a partir del país. A este fin, creamos una librería genérica donde poner todo en orden y normalizar las gestiones con países a todos estos proyectos. Esta librería, entre otras cosas expone esta interfaz:

```csharp
public interface ICountryStore
{
  Task<IEnumerable<Country>> LoadAllCountriesAsync();

  Task<Country> LoadByCountryIsoCodeAsync(string countryIsoCode);

  Task<Country> LoadByPhonePrefixAsync(string internationalPhoneCode);

  Task<bool> ExistsAsync(string countryIsoCode);
}
```

Este artefacto expone la operativa esencial:
- Recoger todas las configuraciones de países: algunos programas necesitan cargar todos los paísesal principio para determinar cuáles están disponibles para su uso.
- Devolver un país por *ISO Code*: las *requests* que generalmente se reciben, suelen contener el código *ISO* para el país donde deben ejecutarse.
- Devolver un país por prefijo de teléfono: existen diferentes normas de validación de un número de teléfono en dependencia del país, con esto podemos saber de cual se trata.
- Conocer si un país existe: para saber si se soporta un país específico.

Y la forma que tenemos de exponerlo es mediante el *IoC* de *dotnet core* y su `IServiceCollection`:

```csharp
services.AddScoped<ICountryStore, CountryStore>();
```

Ahora bien, después de leer en qué consiste **ISP** lo que deducimos es que deberíamos crear esta división de interfaces (o al menos una parecida):

```csharp
public interface IAllCountriesLoader
{
  Task<IEnumerable<Country>> LoadAllCountriesAsync();
}

public interface IByIsoCodeCountryLoader
{
  Task<Country> LoadByCountryIsoCodeAsync(string countryIsoCode);
}

public interface IByPhonePrefixCountryLoader
{
  Task<Country> LoadByPhonePrefixAsync(string internationalPhoneCode);
}

public interface ICountryExistsChecker
{
  Task<bool> ExistsAsync(string countryIsoCode);
}

public interface ICountryStore : IAllCountriesLoader,
                                 IByIsoCodeCountryLoader,
                                 IByPhonePrefixCountryLoader,
                                 ICountryExistsChecker
{
}
```

No hay problema, ya que es solo añadir más código a lo que ya tengo hecho. Aunque un pequeño detalle, ahora también deberíamos exponer estas instancias para que se puedan usar con el `IServiceProvider` de *dotnet core*. Así que tendríamos que hacer algo así:

```csharp
services.AddScoped<ICountryStore, CountryStore>();
services.AddScoped<IAllCountriesLoader, CountryStore>();
services.AddScoped<IByIsoCodeCountryLoader, CountryStore>();
services.AddScoped<IByPhonePrefixCountryLoader, CountryStore>();
services.AddScoped<ICountryExistsChecker, CountryStore>();
```

Pero haciendo esto directamente o mediante algún método automatizado que explote `System.Reflection`, nos va a generar un problema y es que, si necesito dos de esas interfaces, al haberlas declaradas como `Scoped`, durante el mismo *scope* se me generarán dos instancias del mismo objeto. Así que lo ideal sería cambiar la declaración a algo como esto:

```csharp
services.AddScoped<ICountryStore, CountryStore>();
services.AddScoped<IAllCountriesLoader>(s => s.GetService<ICountryStore>());
services.AddScoped<IByIsoCodeCountryLoader>(s => s.GetService<ICountryStore>());
services.AddScoped<IByPhonePrefixCountryLoader>(s => s.GetService<ICountryStore>());
services.AddScoped<ICountryExistsChecker>(s => s.GetService<ICountryStore>());
```

Ahora ya tendría finalizado el *refactoring* de este artefacto, pero el resultado final, ¿es mejor resultado o en realidad añade una capa de abstracción que no necesitamos?

Si, por ejemplo, ahora no quiero que sean instancias `Scoped` si no que las quiero `Transient`, tendría que volver a modificar todas estas líneas. Mientras que con el código anterior era solo una.

También es verdad que desgranar en interfaces me da más capacidad para ser eficiente al realizar una sola operación:

```csharp
class Demo
{
  public Demo(IByPhonePrefixCountryLoader loader) { ... }
}
```

Pero si necesito dos, ¿uso la `ICountryStore` o las dos interfaces que necesite?


```csharp
class Demo
{
  public Demo(IByPhonePrefixCountryLoader loader, ICountryExistsChecker existsChecker) { ... }
}

// vs.

class Demo
{
  public Demo(ICountryStore store) { ... }
}
```

¿Incluso si se trata de la misma instancia?

En mi opinión, este código ya está bien como estaba. Y no solo eso, funciona correctamente. Guarda cohesión, porque todos los métodos de carga y de existencia están en un lugar. No tengo que conocer 4 interfaces ni elegir una en dependencia de la operación que quiera realizar. Me vale con: `ICountryStore`. Además, si sigo la misma forma de nombrar objetos y quiero buscar, por ejemplo, clientes, puedo imaginar que tendré una interfaz `IClientStore` donde existirá un abanico de posibilidades de búsqueda. Es un comportamiento bastante coherente de la aplicación. Y por estas razones tiraría para atrás lo que hemos hecho y lo dejaría como estaba.