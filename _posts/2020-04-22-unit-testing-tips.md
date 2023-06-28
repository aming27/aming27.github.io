---
published: true
ID: 202004221
title: 'Unit testing tips'
author: fernandoescolar
post_date: 2020-04-22 09:15:41
layout: post
tags: best-practices unit test csharp
background: '/assets/uploads/bg/tip.jpg'
---

Cuando preguntas a la gente por unit tests, en mi experiencia, te puedes encontrar con tan solo un puñado de posibilidades: los que no saben qué son, los que dicen saber qué son y los que saben que son. Y si miramos más profundamente este último grupo nos encontraremos con: los que dicen usarlos cuando deben, los que dicen usarlos cuando pueden, los que dicen usarlos siempre y los que los usan cuando pueden<!--break-->.

Lo que está claro es que no todos hacemos todos los tests que deberíamos. Y la culpa es de nuestra naturaleza developer...

Si me dices que diseñe una arquitectura distribuida de trescientas capas, voy a perder el culo haciendo diagramas de todas las movidas que se me ocurran. Voy a empezar un proyecto de prueba de concepto de esta nueva arquitectura. Voy a hacer una charla sobre las chorradas que me pasan por la cabeza. Le voy a poner un nombre molón, como [N-texture chocolate cake architecture](/video/2020/04/09/n-texture-chocolate-cake-architecture/). Igual hasta monto un twitch para monetizar las locuras que brotan a borbotones de mi mente.

Pero si me dices que consiga un 80% de cobertura de unit tests, me voy a meter en LinkedIn a ver si hay un curro chulo de hacer arquitecturas nuevas. Porque no nos engañemos, probar código es un peñazo. Aunque, por otro lado, si hay que hacerlo, ¿por qué no vamos a dar lo mejor de nosotros mismos y programar los mejores tests que podamos?

Con esta premisa en mente, me he propuesto escribir unos pocos consejos sobre cómo intento escribir unit tests (cuando puedo hacerlo):

- [Art of Unit Testing](#art-of-unit-testing)
- [Tests triple A](#tests-triple-a)
- [Test FIRST](#test-first)
- [Test doubles](#test-doubles)
- [Usa nombres descriptivos](#usa-nombres-descriptivos)
- [Usar TraitAttribute](#usar-traitattribute)
- [No usar expected como param](#no-usar-expected-como-param)
- [Describe el contexto](#describe-el-contexto)
- [Assume](#assume)
- [Prueba un Bug, luego lo corriges](#prueba-un-bug-luego-lo-corriges)

## Art of Unit Testing

Según [The art of unit testing](https://www.manning.com/books/the-art-of-unit-testing-second-edition) (de [Roy Osherove](https://osherove.com/) y editado por [Manning Publications co](https://www.manning.com/)) *"un unit test es una parte de un código (generalmente un método) que invoca otra parte del código y luego verifica la exactitud de algunas suposiciones. Si las suposiciones resultan ser incorrectas, el unit test ha fallado"*.

Y parecerá una tontería exponerlo, porque si estás leyendo esto, es muy posible que ya sepas lo que es un unit test. Pero en serio, hay que recordarlo cada cierto tiempo. Es muy fácil que, como programadores, se nos olvide qué es exactamente un test unitario y hagamos más cosas de las que debemos dentro de una prueba.

```csharp
[Fact]
public void IsPrime_returns_false_When_number_is_2()
{
    var primeService = new PrimeNumbersService();
    var result = primeService.IsPrime(2);

    Assert.False(result, "2 should not be prime");
}
```

## Tests triple A

Los unit tests son como los buenos videojuegos. Los de la triple A son los mejores. Los *GotY*<abbr title="Game of the Year">*</abbr>.

Cuando hablamos de triple A en unit testing nos referimos a los diferentes pasos que debe dar un test:

- **A**rrange: en esta fase se prepara el entorno para poder ejecutar la prueba.

- **A**ct: realizamos la prueba en cuestión.

- **A**ssert: comprobamos que el estado del entorno es el esperado.

```csharp
public void Sum_returns_5_When_input_numbers_are_2_and_3()
{
    // Arrange
    const int expected = 5;
    const int inputA = 2;
    const int inputB = 3;
    var target = new Calculator();

    // Act
    var actual = target.Sum(inputA, inputB);

    // Assert
    Assert.Equal(expected, actual);
}
```

Una técnica que nos puede ayudar a acostumbrarnos a esto es, a la hora de escribir un test, siempre empezar usando este *code snippet*:

```csharp
[Fact]
public void MyTestMethod()
{
    // Arrange

    // Act

    // Assert
    Assert.False(true);
}
```

## Test FIRST

Como en cualquier otra técnica del desarrollo, los unit tests tienen un acrónimo para definir los principios por los que se rige la excelencia en la materia. En este caso es FIRST:

- **F**ast: una prueba unitaria tiene que ser muy muy rápida. La unidad para medirlo debe ser milisegundos. Y mejor 1ms que 200ms. Vamos a hacer muchas pruebas, no querrás estar 2 horas mirando la pantalla, ¿no?

- **I**solated: tu test tiene que estar aislado de los demás tests. Deben ser independientes totalmente. No empieces a crear un objeto en un test y que otro lo borre. Eso no son tests unitarios. Tienes que poder ejecutar un unit test en cualquier momento y en cualquier orden.

- **R**epeatable: las pruebas deben ser repetibles todas las veces que se necesite. Y si no hemos modificado el código fuente, debemos obtener siempre el mismo resultado de cualquier ejecución de un test.

- **S**elf-Validating: una prueba unitaria tiene que ser validada por ella misma. De esta forma, evitaremos cualquier interacción manual que decida si el test se ha finalizado con éxito o no.

- **T**imely: el unit test debe ser escrito en el momento oportuno. Antes del código que lo resuelve. Si no, corremos el riesgo de que nuestro test no tenga efecto. Así que, si no practicamos TDD, lo mejor es al menos comprobar que el test puede fallar.

## Test doubles

El término genérico de *Test Double*, acuñado por [Gerard Meszaros](https://twitter.com/gerardmes), se usa para referirse a cualquier caso en el que, con fines de prueba, se reemplaza un objeto de producción por otro no productivo. Hay varios tipos de dobles:

- Dummy: son objetos que se intercambian como parámetro pero que no se usan en realidad. El ejemplo más claro de un *dummy* es un DTO con unos valores concretos.

- Fake: son objetos que tienen implementación funcional. Pero generalmente toman un "atajo" que los hace no adecuados para la producción (p.e. `UseInMemoryDatabase` de EF Core).

- Stubs: proporcionan respuestas "enlatadas" a las llamadas realizadas durante la prueba.

- Spies: Los espías son *stubs* que además, registran información en función de las llamadas que se realizan. Por ejemplo, un servicio de correo electrónico que registra cuantos emails se han enviado.

- Mocks: son objetos preprogramados. Tienen expectativas sobre las llamadas que se espera que reciban. Pueden lanzar una excepción si reciben una llamada que no esperan y se verifican durante la fase de *Assert*.

Los Test Doubles son fundamentales en nuestros unit tests para poder desencapsular procesos complejos y así poder probar un solo caso unitario.

En las librerías de Test Doubles de .net lo más común es encontrar objetos *Mock* que tienen implementados *Spies* y *Stubs* (p.e. [Moq](https://github.com/moq/moq)):

```csharp
[Theory]
[InlineData("Pa$$w0rd")]
public void Password_is_valid_When_value_is(string password)
{
    // Arrange
    var dummy = new PasswordOptions()
    {
        RequireDigit = true,
        RequireLetter = true,
        RequiredLength = 6
    };
    var stub = new Mock<IOptionsService>();
    stub.Setup(x => x.GetPasswordOptions()).Returns(dummy);

    var target = new PasswordService(stub.Object);

    // Act
    var actual = target.Validate(password);

    // Assert
    Assert.True(actual.Succeded);
}
```

## Usa nombres descriptivos

Que un producto como *Azure DevOps* haya tenido una multitud de nombres tales como *Team Foundation Server Online*, *Team Foundation Services*, o *Visual Studio Online*; no es más que un ejemplo de que poner nombres es muy difícil. Pero por favor, no hagas esto:

```csharp
[Fact]
public void Test1_Pass(string password)
{
    // ...
}
```

Existen muchísimas formas de nombrar los unit tests. Elije una que te sirva y con la que estés a gusto. Y úsala, pero pensando en los *inputs* y *outputs*.

En mi caso personal, me gusta ignorar el convenido de nombres original de dotnet y usar un formato tipo *snake_case* semejante al siguiente:

```csharp
public class PasswordService_Validate_Should
{
  public void Return_failed_When_password_has_less_than_6_characters();
  // ...
}

public class PasswordService_Hash_Should
{
  public void Throw_argument_exception_When_password_is_null();
  public void Throw_argument_exception_When_password_is_empty();
  public void Return_unreadable_hash_When_password_is_valid();
  public void Return_the_same_unreadable_hash_When_password_is_the_same();
}
```

Puedes usar otra notación que te parezca mejor. Aunque al final todas son bastante parecidas. Lo que hay que tener en cuenta es no tener miedo a escribir nombres largos. Cuanto más descriptivos sean muchísimo mejor.

### También en las variables

No olvidemos que la forma de nombrar no es solo para los nombres de clases y métodos. Las variables y constantes también deben estar bien descritas. Podemos nombrarlas según su misión o según el estado que van a generar.

```csharp
const ValidationResult succeded_result = ValidationResult.Succeded;
var target = new PasswordService(optionsServiceStub.Object);

var actual = target.Validate(valid_password);

Assert.Equal(succeded_result, actual);
```

Donde:

- `target`: es el objeto que vamos a testear.
- `expected`: es el estado objetivo del test.
- `actual`: es el estado resultado del test.
- `optionsServiceStub`: es un stub del servicio `OptionsService`.
- `valid_password`: un password válido.

No usemos *magic numbers* ni *magic string*, usemos constantes con nombres referentes a su uso para ello:

```csharp
private const string valid_password = "P@ssW0rd";
private const string invalid_password = "P@ss";
private const string unsecure_url = "http://dummy.com";
private const string secure_url = "https://dummy.com";
private static readonly User some_user = new User { Id = 1, DisplayName = "Test" };
```

## Usar TraitAttribute
Lo mejor a la hora de tratar nuestros unit tests es pensar en hacer código legible, que nos ayude a formar parte de la documentación.

Existe un atributo en `xunit` que nos ayudará a clasificar los tests: `Trait`.

```csharp
[Trait("Category", "Unit")]
[Trait("Class", nameof(UserService))]
[Trait("Method", nameof(UserService.DeleteUser))]
public class DeleteUserService_DeleteUser_Should
{
}
```

Esta forma de clasificar las pruebas nos va a permitir luego realizar filtros:

```bash
dotnet test --filter "Category=Unit&Class=UserService"
```

## No usar expected como param

En ocasiones podemos encontrarnos un caso en el que podamos usar parámetros para realizar todas las pruebas que deseamos con un solo método de test. Esto es una buena práctica desde el punto de vista de la programación, ya que evitamos repetir código:

```csharp
[Theory]
[InlineData(true, "Pa$$w0rd")]
[InlineData(true, "Passw0rd")]
//...
[InlineData(false, "Pa$$0")]
[InlineData(false, "")]
public void Return_expected_When_passwor_is(bool expected, string password)
{
    var target = new PasswordService();
    var actual = target.Validate(password);
    Assert.Equal(expected, actual.Succeded);
}
```

Pero esta forma de programar unit tests nos va a ocultar un poco que es lo que está sucediendo realmente dentro. Por eso deberíamos intentar de omitir que el resultado de una prueba sea uno de los parámetros:

```csharp
[Theory]
[InlineData("Pa$$w0rd")]
[InlineData("Passw0rd")]
//...
public void Return_succeded_When_password_is_valid(string valid_password)
{
    var target = new PasswordService();
    var actual = target.Validate(valid_password);
    Assert.True(actual.Succeded);
}

[InlineData("Pa$$0")]
[InlineData("")]
//...
public void Return_failed_When_password_is_invalid(string invalid_password)
{
    var target = new PasswordService();
    var actual = target.Validate(invalid_password);
    Assert.False(actual.Succeded);
}
```

De esta manera dejamos explícito que estamos probando password válidos que se validan con éxito en un método, y en el caso contrario en el otro.

## Describe el contexto

La técnica de *refactoring* en los unit tests nos va a llevar a generar funciones que realizan casi todo el trabajo:

```csharp
[Fact]
public void Return_succeded_When_length_is_equal_than_expected()
{
    var target = CreateTargetToSucceded();
    var actual = target.Validate(valid_password);
    IsSucceded(actual);
}
```

Pero a veces escribir más y detallar parámetros que, quizá no eran necesarios, nos puede dejar más claro qué hace nuestro test:

```csharp
[Fact]
public void Return_succeded_When_length_is_equal_than_expected()
{
    var target = CreateTargetWith(min_length: 6);

    var actual = target.Validate(length_6_password);

    AssertIsSucceded(actual);
}
```

## Assume

Para ayudar con la documentación del código usando unit tests, tenemos el paquete de [`xunit.Assume`](https://github.com/fernandoescolar/Xunit.Assume).

El uso de la cuarta A, deja implícito en nuestro test cuando y por qué lo estamos saltando:

```csharp
[AssumeFact]
public void Return_somthing_When_any_thing()
{
    // Arrange

    // Assume
    Assume.True(IsWindows(), "This OS is not supported");

    // Act

    // Assert
}

private static bool IsWindows()
{
    return RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
}
```

Aquí dejaríamos patente que este test solo corre en sistemas Windows. Pero no generaríamos un error. Solo un aviso y *skip*, cuando se ejecute en otro tipo de máquina.

## Prueba un Bug, luego lo corriges

Cuando te encuentres un *bug* nuevo en el sistema, es evidente que no tenías un test que cubriera ese caso previamente. Si no, no hubiera sido un bug. Así que antes de nada, crea un unit test que haga evidente este error.

Si por ejemplo, nuestro servicio lanza una excepción cuando el password es nulo y nos gustaría que en su lugar devuelva un estado de error:

```csharp
[Fact]
public void Return_failed_when_password_is_null()
{
    var target = new PasswordService();
    var actual = target.Validate(null_password);
    Assert.False(actual.Succeded);
}
```

Al pasar nuestro test fallará, así que ahora ya podemos corregirlo y ver como se pone en verde.

## Conclusiones

Escribir buenos unit test requiere práctica, aunque en realidad, esto es cierto para casi cualquier actividad en la vida. Al seguir algunas de las reglas de esta lista podemos mantener las pruebas limpias, fáciles de mantener y comprender, y con el potencial de generar... blah, blah, blah... ¡que programes bien, coño ya!

