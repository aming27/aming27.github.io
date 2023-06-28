---
published: true
ID: 202302221
title: 'C#: enum'
author: fernandoescolar
post_date: 2023-02-22 01:04:36
layout: post
tags: csharp dotnet enum best-practices
background: '/assets/uploads/bg/programming1.jpg'
---

Antes de que existieran los tipos enumeración (`enum`), los programadores teníamos que usar otras técnicas para representar conjuntos de valores constantes con nombres significativos. Estas técnicas incluían el uso de constantes, estructuras y cadenas de texto. Sin embargo, estos apaños tenían sus propias desventajas y no eran tan flexibles ni tan fáciles de usar. <!--break--> Puede resultar un poco básico, pero ¿qué te parece si le damos juntos un repaso a los `enum`?

El tipo `enum` en C# es un tipo de dato especial que se utiliza para declarar un conjunto de constantes enteras. Las constantes de un `enum` se denominan elementos, y cada uno tiene un valor entero asignado por defecto, comenzando en 0 y continuando en incrementos de 1. Puedes usar un `enum` para declarar un conjunto de constantes que tienen un significado especial en tu código.

Aquí tienes un ejemplo:

```csharp
enum BeerTypes
{
    Ale,
    Ipa,
    Lager,
    Porter,
    Stout,
    Wheat,
    Witbier
}
```

En este ejemplo, hemos creado un `enum` llamado `BeerTypes` que tiene siete elementos: `Ale`, `Ipa`, `Lager`, `Porter`, `Stout`, `Wheat` y `Witbier`. Cada uno de estos elementos tiene un valor entero asignado por defecto, comenzando en `0` y continuando en incrementos de `1` para cada elemento adicional. Por lo tanto, `Ale` tiene el valor `0`, `Ipa` tiene el valor `1`, y así sucesivamente.

Puedes usar los elementos del `enum` en tu código como cualquier otra constante:

```csharp
BeerTypes myFavoriteBeer = BeerTypes.Ipa;
```

En este ejemplo, hemos creado una variable llamada `myFavoriteBeer` del tipo `BeerTypes` y le hemos asignado el valor `BeerTypes.Ipa`, que es equivalente a `1`.

Es importante tener en cuenta que los elementos de un `enum` son constantes y no pueden cambiar su valor una vez que se han declarado. También puedes asignar valores enteros específicos a los elementos del `enum` en lugar de usar los valores por defecto:

```csharp
enum BeerTypes
{
    Ale = 1,
    Ipa = 2,
    Lager = 3,
    Porter = 4,
    Stout = 5,
    Wheat = 6,
    Witbier = 7
}
```

Aquí hemos asignado valores enteros específicos a cada elemento del enum. Por lo tanto, `Ale` tiene el valor `1` (en lugar de `0`) y continuando en incrementos de `1` para cada elemento adicional.

Puedes usar la palabra clave `default` para asignar el valor por defecto (normalmente `0`) a una variable del tipo enum. Por ejemplo:

```csharp
BeerTypes myFavoriteBeer = default(BeerTypes);
```

En este código, hemos creado una variable llamada `myFavoriteBeer` del tipo `BeerTypes` y le hemos asignado el valor por defecto, que es equivalente a `0`. Si estuviéramos usando el primer ejemplo de código, en el que no hemos asignado valores enteros específicos a los elementos del enum, entonces `myFavoriteBeer` tendría el valor `BeerTypes.Ale`, que es equivalente a `0`.

## Curiosidades

Puedes usar la palabra clave `var` para declarar una variable del tipo `enum` sin tener que especificar el tipo completo:

```csharp
var myFavoriteBeer = BeerTypes.Ipa;
```

En este ejemplo, hemos creado una variable llamada `myFavoriteBeer` del tipo `BeerTypes` y le hemos asignado el valor `BeerTypes.Ipa`, que es equivalente a `1`.

Puedes usar la palabra clave `nameof` para obtener el nombre de un elemento del `enum`:

```csharp
Console.WriteLine(nameof(BeerTypes.Ipa));
```

Aquí, hemos escrito el nombre del elemento `Ipa` del enum `BeerTypes` en la consola. El resultado es `Ipa`.

## Tipo de valor de enumeraciones

Puedes declarar un enum con un tipo de valor de `byte`, `sbyte`, `short`, `ushort`, `int`, `uint`, `long` o `ulong`. Por omisión el tipo de valor de un enum es `int`.

Aquí tienes un ejemplo de especificar el tipo como `byte`:

```csharp
enum BeerTypes : byte
{
    Ale,
    Ipa,
    Lager,
    Porter,
    Stout,
    Wheat,
    Witbier
}
```

En este código, hemos declarado un `enum` llamado `BeerTypes` con un tipo de valor de `byte`. Esto significa que cada elemento del `enum` tiene un valor entero de 8 bits. Por lo tanto, el valor máximo de un elemento del `enum` es `255`. Si intentas asignar un valor mayor a `255` a un elemento del `enum`, entonces obtendrás un error de compilación.

**No puedes declarar una variable del tipo `enum` con un tipo de valor de `string` o `char`.**

## Obtener todos los elementos de una enumeración

Puedes usar el método `Enum.GetValues` para obtener una lista de todos los valores de un `enum`. Este método devuelve una matriz de objetos que representa todos los valores del `enum` especificado.

Aquí un ejemplo de cómo usar `Enum.GetValues` para obtener todos los valores de un `enum`:

```csharp
var beerTypes = (BeerTypes[])Enum.GetValues(typeof(BeerTypes));

foreach (var beerType in beerTypes)
{
    Console.WriteLine(beerType);
}
```

Como puedes ver, hemos creado una matriz de objetos llamada `beerTypes` que contiene todos los valores del `enum` `BeerTypes`. Luego hemos usado un bucle `foreach` para escribir cada valor en la consola. Si ejecutamos este código, este es el resultado que se mostraría en la consola:

```bash
Ale
Ipa
Lager
Porter
Stout
Wheat
Witbier
```

## Convertir a cadena de texto y viceversa

Para convertir un enum a una cadena (`string`), puedes usar el método `ToString` del objeto `enum`:

```csharp
var myFavoriteBeer = BeerTypes.Ipa;
var myFavoriteBeerAsString = myFavoriteBeer.ToString();

Console.WriteLine(myFavoriteBeerAsString); // escribe "Ipa" en la consola
```

Hemos creado una variable llamada `myFavoriteBeer` del tipo `BeerTypes` y le hemos asignado el valor `BeerTypes.Ipa`, que es equivalente a `1`. Luego hemos creado una variable llamada `myFavoriteBeerAsString` del tipo `string` y le hemos asignado el valor de `myFavoriteBeer` convertido a una cadena. Por último, hemos escrito el valor de `myFavoriteBeerAsString` en la consola.

Para convertir una cadena a un `enum`, puedes usar el método `Parse` de la clase `Enum`:

```csharp
var myFavoriteBeerAsString = "Ipa";
var myFavoriteBeer = (BeerTypes)Enum.Parse(typeof(BeerTypes), myFavoriteBeerAsString);

Console.WriteLine(myFavoriteBeer); // escribe "Ipa" en la consola
```

En el ejemplo, hemos creado una variable llamada `myFavoriteBeerAsString` del tipo `string` y le hemos asignado el valor `Ipa`. Luego hemos creado una variable llamada `myFavoriteBeer` del tipo `BeerTypes` y le hemos asignado el valor de `myFavoriteBeerAsString` convertido a un `enum`. Por último, hemos escrito el valor de `myFavoriteBeer` en la consola.

## Valores múltiples

Puedes usar un sistema de "flags" con un `enum` y operadores booleanos `&` y `|` para representar valores múltiples que se pueden combinar mediante operaciones lógicas. Los "flags" se usan a menudo para representar opciones o configuraciones que se pueden habilitar o deshabilitar de manera independiente.

Para usar un sistema de "flags" con un `enum`, primero debes agregar la palabra clave `[Flags]` encima de tu `enum` y asignar valores enteros a cada elemento del enum de manera que cada bit represente una opción diferente:

```csharp
[Flags]
enum Options
{
    None = 0,
    Option1 = 1,
    Option2 = 2,
    Option3 = 4,
    Option4 = 8
}
```

Hemos declarado un `enum` llamado `Options` con un sistema de "flags". Cada elemento del `enum` tiene un valor entero que representa una opción diferente. Por ejemplo, el elemento `Option1` tiene el valor `1`, que representa la primera opción. El elemento `Option2` tiene el valor `2`, que representa la segunda opción. El elemento `Option3` tiene el valor `4`, que representa la tercera opción. El elemento `Option4` tiene el valor `8`, que representa la cuarta opción.

Una vez que has declarado tu `enum` de "flags", puedes usar los operadores booleanos `&` y `|` para combinar y comparar los valores:

```csharp
var options = Options.Option1 | Options.Option3;

if ((options & Options.Option1) == Options.Option1)
{
    Console.WriteLine("Option1 is enabled");
}

if ((options & Options.Option2) != Options.Option2)
{
    Console.WriteLine("Option2 is disabled");
}
```

Aquí, hemos creado una variable llamada `options` del tipo `Options` y le hemos asignado el valor `Options.Option1` y `Options.Option3`, que es equivalente a `5`. Luego hemos usado el operador booleano `&` para comprobar si la opción `Option1` está habilitada. Como `Option1` está habilitada, este código escribe `Option1 is enabled` en la consola. Luego hemos usado el operador booleano `&` para comprobar si la opción `Option2` está habilitada. Como `Option2` está deshabilitada, este código escribe `Option2 is disabled` en la consola.

La operativa en binario se podría representar así:

```csharp
var option1 = 1; // 0001
var option3 = 4; // 0100
var options = option1 | option3; // 0001 or 0100 = 0101

var option1Enabled = options & option1; // 0101 and 0001 = 0001
if (option1Enabled == option1) // 0001 == 0001
{
    Console.WriteLine("Option1 is enabled");
}

var option2Enabled = options & option2; // 0101 and 0010 = 0000
if (option2Enabled != option2) // 0000 != 0010
{
    Console.WriteLine("Option2 is disabled");
}
```

Por eso es importante que cada elemento del `enum` tenga un valor entero que represente una opción diferente. Si no lo haces, el resultado de las operaciones booleanas será incorrecto.

A continuación, se muestra una tabla con los valores enteros y la representación en binario que podríamos usar en los elementos de un `enum`:

| Valor entero | Representación en binario |
|--------------|---------------------------|
| 0            |00000000
| 1            |00000001
| 2            |00000010
| 4            |00000100
| 8            |00001000
| 16           |00010000
| 32           |00100000
| 64           |01000000
| 128          |10000000

## Conclusiones

Los `enum` son un tipo de dato muy útil en C# (y también en otros lenguajes de programación):

- Permiten definir un conjunto de valores constantes con nombres significativos. Esto hace que el código sea más legible y fácil de mantener, ya que los nombres de los elementos del enum pueden proporcionar contexto y significado a los valores constantes.

- Limitan el rango de valores que pueden asignarse a una variable. Esto puede evitar errores de programación y hacer que el código sea más seguro y confiable.

- Hacen que el código sea más expresivo y fácil de entender. Al usar nombres significativos en lugar de números o cadenas, el código se vuelve más legible y es más fácil entender qué está sucediendo en cada parte del programa.

- Los `enum` pueden ser marcados con la etiqueta `[Flags]` para permitir que sus elementos se combinen usando los operadores booleanos `|` y `&`. Esto puede ser muy útil para representar opciones o configuraciones múltiples en una sola variable.

En resumen, los `enum` son una herramienta muy útil que pueden mejorar la legibilidad y la mantenibilidad del código, y limitar el rango de valores permitidos para una variable.
