---
published: true
ID: 202301251
title: 'Cómo corregir una Null Reference Exception'
author: fernandoescolar
post_date: 2023-01-25 01:04:36
layout: post
tags: csharp dotnet best-practices
background: '/assets/uploads/bg/programming2.jpg'
---

¿Alguna vez has intentado tomarte un botellín de cerveza sin abrir? Puede ser divertido, pero también será decepcionante. Si no andas con cuidado, podrías hacerte una herida con la chapa que cierra el botellín. Siempre deberías abrir una cerveza antes de tomarla, o terminarás con la garganta seca, el estómago vacío y una estupenda cerveza en la mano que no te puedes beber.<!--break--> Esto mismo es lo que pasa con `NullReferenceException`.

Una excepción `NullReferenceException` se produce cuando el programa intenta acceder a una propiedad o llamar a un método de un objeto que es `null` (una cerveza cerrada). Esto puede ocurrir cuando un objeto no ha sido inicializado correctamente (o la cerveza ha sido abierta) antes de ser utilizado (beberla), o cuando un objeto ha sido asignado `null` accidentalmente (se nos ha roto el botellín por abajo y no nos hemos dado cuenta). Es un problema muy común en el desarrollo de aplicaciones C#.

Un ejemplo de código que causa una NullReferenceException:

```csharp
class Beer
{
    public void Drink() { }
}

Beer myBeer;
// myBeer no ha sido inicializado, contiene un valor null

myBeer.Drink();
// Esta línea causará una NullReferenceException, ya que se intenta acceder a una método de un objeto null
```

En este ejemplo, el objeto `myBeer` no ha sido inicializado antes de intentar acceder a su método `Drink`. Como resultado, se produce una `NullReferenceException`.

Para evitar esto, se puede inicializar el objeto antes de acceder a sus propiedades o métodos,

```csharp
Beer myBeer = new Beer();
myBeer.Drink();

```

Y adicionalmente, se puede comprobar si el objeto es `null` antes de intentar acceder a él:

```csharp
Beer myBeer = new Beer();
if (mybeer != null)
{
    myBeer.Drink();
}
```

De esta manera, se evitará la excepción `NullReferenceException` y el código se ejecutará correctamente.

Esta solución sería la evidente, pero aun siendo conscientes de que los objetos en *dotnet* pueden ser nulos, a veces nos olvidamos de comprobarlo. Por ejemplo, si tenemos una lista de objetos, y queremos acceder a uno de ellos, podemos cometer el error de no comprobar si el objeto existe en la lista:

```csharp
var beers = new Beer[5];
beers[0] = new Beer();
beers[1] = new Beer();
beers[2] = new Beer();

beers[4].Hello();
// Esta línea causará una NullReferenceException, ya que el índice 4 no ha sido inicializado en la lista
```

En este ejemplo, la lista `beers` contiene 5 objetos `Beer`, solo se jan inicializado los 3 primeros y se intenta acceder al índice 4, que no se ha inicializado. Como resultado, se produce una `NullReferenceException`.

Vamos a estudiar varias formas más genéricas y globales de evitar esta excepción:


## Nullable Object Pattern

El patrón **Nullable Object** es un patrón de diseño que se utiliza para manejar los casos en los que un objeto puede ser `null`. Este patrón se basa en la idea de crear un objeto "nulo" específico que se utiliza para representar un objeto que no tiene un valor válido.

En lugar de utilizar null directamente, se utiliza un objeto "nulo" específico que implementa la misma interfaz que el objeto real. Este objeto "nulo" puede tener comportamientos específicos cuando se utiliza, como devolver valores predeterminados o lanzar excepciones.

Aquí hay un ejemplo de cómo se podría implementar:

```csharp
public class Beer
{
    public static Beer ClosedBeer { get; } = new NullBeer();

    public virtual void Drink() { /* ... */ }

}

public class NullBeer : Beer
{
    public override void Drink()
    {
        Debug.WriteLine("No beer to drink");
    }
}

Beer myBeer = Beer.ClosedBeer;
myBeer.Drink(); // No beer to drink
```

Aquí estamos creando un objeto `NullBeer` que representa una cerveza cerrada y hereda de la clase `Beer` que es representa la cerveza que esperamos que esté abierta. El objeto `NullBeer`  se puede usaría en lugar de `null` para representar una cerveza que no se puede beber. Cuando se intenta beber una cerveza cerrada, se muestra un mensaje en la consola. Pero no emitimos una excepción `NullReferenceException`.

De esta manera, el patrón **Nullable Object** permite manejar los casos en los que un objeto puede ser `null` de una manera más controlada y segura, ayuda a detectar errores de nulidad en tiempo de ejecución y permite definir un comportamiento específico para los casos en los que un objeto es nulo.

## Usar el operador `?.` y `??`

Si estamos usando una versión de C# superior o igual que C# 8 podemos usar los operadores `?.` y `??` para evitar la excepción `NullReferenceException`.

Por un lado, para utilizar la característica conocida como "verificación de nulidad", se debe utilizar el operador `?.` en lugar del operador `.` para acceder a las propiedades o métodos de un objeto. Si el objeto es `null`, el operador  `?.` no causará una excepción, sino que simplemente devolverá null en lugar del valor de la propiedad o el resultado del método:

```csharp
Beer myBeer = null;
myBeer?.Drink(); // No se produce ninguna excepción
```

Por otro lado, para utilizar la característica conocida como "asignación de nulidad", se debe utilizar el operador `??` para asignar un valor predeterminado a una variable si el valor de la variable es `null`:

```csharp
Beer myBeer = null;
myBeer = myBeer ?? new Beer();
```

En este ejemplo, si `myBeer` es `null`, se asigna un nuevo objeto `Beer` a la variable `myBeer`. Si `myBeer` no es `null`, no se asigna ningún valor a la variable `myBeer`.

Estos operadores se podrían utilizar juntos y en combinación con el patrón **Nullable Object** para evitar la excepción `NullReferenceException`:

```csharp
Beer myBeer = null;
myBeer = myBeer ?? Beer.ClosedBeer;
myBeer?.Drink(); // No beer to drink
```

## Usar el modo seguro de nulos

También a partir de la versión 8 de C#, se puede utilizar el modo seguro de nulos para evitar la excepción `NullReferenceException`. El modo seguro de nulos se puede activar en el proyecto mediante la propiedad `Nullable` del archivo de proyecto `.csproj`:

```xml
...
<PropertyGroup>
    <Nullable>enable</Nullable>
    ...
</PropertyGroup>
...
```

Esta propiedad puede tener los valores:

- `disable`: El modo seguro de nulos está desactivado.
- `enable`: El modo seguro de nulos está activado.
- `warnings`: El modo seguro de nulos está activado y se emiten advertencias cuando se detectan posibles errores de nulidad.
- `annotations`: El modo seguro de nulos está activado y se emiten advertencias cuando se detectan posibles errores de nulidad

Esta característica, requiere que los tipos de referencia sean anotados con `?` para indicar que pueden ser nulos.

```csharp
public class Beer
{
    public string? Name { get; set; }
    public string Description { get; set; } // warning CS8618: Non-nullable property 'Name' must contain a non-null value when exiting constructor. Consider declaring the property as nullable.
}
```

En este ejemplo, la propiedad `Name` es anotada con `?` para indicar que puede ser nula. Si no se anota con `?`, se emite una advertencia indicando que la propiedad no puede ser nula.

Si quisiéramos evitar ese aviso deberíamos inicializar la propiedad `Description` en el constructor:

```csharp
public class Beer
{
    public string? Name { get; set; }
    public string Description { get; set; } = string.Empty;
}
```

Y si asignamos un objeto `null` a la propiedad `Description`:

```csharp
Beer myBeer = new Beer();
myBeer.Description = null; // warning CS8625: Cannot convert null literal to non-nullable reference type.
```

Se emite una advertencia indicando que no se puede asignar `null` a una propiedad que no es anotada con `?`.

Esta utilidad nos ayuda a detectar errores de nulidad en el código de manera temprana y ayuda a los desarrolladores a escribir código más seguro y fiable.

## Conclusiones

En este artículo hemos visto cómo evitar la excepción `NullReferenceException` en C#. Para ello hemos visto los siguientes conceptos:

  * La excepción `NullReferenceException`
  * El patrón **Nullable Object**
  * El operador `?.`
  * El operador `??`
  * El modo seguro de nulos

Estas son algunas técnicas y herramientas nos ayudarán a evitar la excepción `NullReferenceException` y a escribir código más seguro y fiable.

