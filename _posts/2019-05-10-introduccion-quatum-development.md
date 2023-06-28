---
published: true
ID: 201905101
title: 'Introducción a Quatum Development (i)'
author: fernandoescolar
post_date: 2019-05-10 07:51:23
layout: post
tags: quantum programming
background: '/assets/uploads/bg/engineering1.jpg'
---

El mundo de la programación tal y cómo lo conocemos tiene fecha de caducidad. Por muchos materiales nuevos, aleaciones especiales o mejoras tecnológicas que tengamos, un microprocesador tiene un límite de tamaño a partir del cual deja de ser eficiente. Cada día estamos más cerca de ese límite y es aquí donde aparece la computación cuántica. Prepárate para cambiar de paradigma, para cambiar _bits_ por _qubits_<!--break-->.

O en realidad no: solo quería ponerme apocalíptico y algo dramático para hacer más llamativa la entradilla...

![Joder, Quantum Sol Hace](/assets/uploads/2019/05/quantum-sol-hace.jpg)

Lo que sí que es cierto es que, en un microprocesador muy muy pequeño (ínfimo), los electrones que transporta, al ser partículas cuánticas, podrían saltarse la "barrera física" que supone un transistor y pasar a otro (por eso del [efecto túnel](https://es.wikipedia.org/wiki/Efecto_t%C3%BAnel)). Acontecimiento que desencadenaría un mal-funcionamiento del micro.

Esto que para muchos podría ser un problema, para el señor [Paul Benioff](https://en.wikipedia.org/wiki/Paul_Benioff) fue una oportunidad. Y es donde encontramos el origen de la computación cuántica. Un paradigma que viene a intentar aprovechar las leyes cuánticas en beneficio de la computación.

La primera premisa de este paradigma es que en lugar de usar como unidad de proceso un _bit_, que puede tener valores `0` o `1`; usar un _qubit_ (_cúbit_ o bit cuántico), que podría tener el valor `0`, el `1` o el `0 y 1 a la vez`.

¿No os suena un poco a lo del [gato de Schrödinger](https://es.wikipedia.org/wiki/Gato_de_Schr%C3%B6dinger)?

![El gato de Schrödinger: Wanted Dead & Alive](/assets/uploads/2019/05/quantum-cat.jpg)

A la hora de la verdad, lo que significa es que, en una sola ejecución de un programa, tendríamos ambos estados.

Un ejemplo simplista que podría ayudarnos a entender la potencia de la computación cuántica: si tuviéramos una operación en la que se realiza una suma o una resta en dependencia de un valor `bool`, tendríamos que ejecutar el programa dos veces: una para obtener la suma y otra para la resta. Sin embargo, si usáramos un `Qubit`, en una sola ejecución tendríamos ambos resultados.

## Qubit

Un _qubit_ puede representarse matemáticamente en [notación bra-ket](https://es.wikipedia.org/wiki/Notaci%C3%B3n_bra-ket) como una superposición de un _ket_ unitario `|1>` y un _ket_ cero `|0>`:

```(α·|0> + β·|1>)```

dónde:

```|α|² + |β|² = 1```

Podríamos determinar que este estado superpuesto indica que tiene `|α|²` de probabilidad de ser `0` y  `|β|²` de ser `1`.

Además, un _ket_ puede representarse como una matriz de dos filas y una columna:

```math
  |0> = [[1], [0]]  ;    |1> = [[0], [1]]

α·|0> = [[α], [0]]  ;  β·|1> = [[0], [β]]
```

![fórmula de ket como matriz](/assets/uploads/2019/05/quantum-01.png)

## Operaciones Cuánticas

Lejos quedan `AND`, `OR`, `XOR` y demás puertas lógicas, que tan buen resultado dan trabajando con _bits_. Para tratar con _qubits_ existen otra serie de operaciones. Y aunque existen más de las que vamos a citar, para este artículo, lo mejor será comenzar con las básicas.

### M

La _Medida_ (o _Measure_) es la operación que se encarga de medir un _qubit_ y darnos su valor `0` o `1`.

Si por ejemplo tenemos un _qubit_ con una distribución al 50% del estado `0` o `1`:

```math
1/sqrt(2) · |0> + 1/sqrt(2) · |1>
```

![fórmula M](/assets/uploads/2019/05/quantum-m.png)

> Como hemos visto antes, la probabilidad de que sea `0` o `1`, vendría determinada por el cuadrado de `1/sqrt(2)` que es `1/2` o `0.5`.

Al realizar una medida, inmediatamente el _qubit_ colapsa su estado, quedando fijado en `0` o `1`. Además, no se puede deshacer esta operación para recuperar los factores de probabilidad. De esta forma quedaría como:

```math
1·|0> + 0·|1>     ó       0·|0> + 1·|1>
```

> Se pueden realizar medidas para las diferentes bases de `Pauli` (acerca de las [matrices de Pauli](https://es.wikipedia.org/wiki/Matrices_de_Pauli)). Aunque esos detalles quedarían fuera de esta introducción...

### X

La puerta lógica `X` es el equivalente a un `NOT` de programación convencional: `|0>` lo convierte en `|1>` y viceversa.

Se representa como la matriz:

```math
X = [[0, 1], [1,  0]]
```

![fórmula X](/assets/uploads/2019/05/quantum-x.png)

Y al operar seria de la siguiente forma:

```math
X·|1> = [[0, 1], [1,  0]] · [[0], [1]] = [[0·0 + 1·1], [1·0 + 0·1]] = [[1], [0]] = |0>
```

![fórmula X](/assets/uploads/2019/05/quantum-x-2.png)

### Z

Esta operación deja el valor `|0>` como `|0>`, pero convierte `|1>` en `-|1>`. Se puede representar como la siguiente matriz:

```math
Z = [[1, 0], [0,  -1]]
```

![fórmula Z](/assets/uploads/2019/05/quantum-z.png)

### H

La puerta _Hadamard_ o puerta H, superpone los valores `1` y `0`. Se representa como:

```math
H = 1/sqrt(2) · [[1, 1], [1,  -1]]
```

![fórmula H](/assets/uploads/2019/05/quantum-h.png)

Que al operar daría como resultado:

```math
|0> = (|0> + |1>)/sqrt(2);  |1> = (|0> - |1>)/sqrt(2)
```

![fórmula H](/assets/uploads/2019/05/quantum-h-2.png)

## Microsoft Quantum Development Kit

Para poder aplicar lo que hemos aprendido sobre programación cuántica, Microsoft nos brinda [Quantum Development Kit](https://www.microsoft.com/en-us/quantum/development-kit), que [liberará en breve como open source](https://venturebeat.com/2019/05/06/microsoft-open-sourcing-quantum-development-kit/).

Este conjunto de herramienta se basa en el lenguaje [Q#](https://devblogs.microsoft.com/qsharp/) como base para programar algoritmos cuánticos.

Estamos a un solo paso de empezar a programar. Para ello solo necesitamos tener instalado el [dotnet core SDK](https://dotnet.microsoft.com/download) e introducir dos comandos en el terminal:

```bash
dotnet tool install -g Microsoft.Quantum.IQSharp
```

```bash
dotnet new -i Microsoft.Quantum.ProjectTemplates
```

Una vez hecho esto, para crear un nuevo proyecto en Q# introduciremos el siguiente comando:

```bash
dotnet new console -lang Q#
```

Entonces, para comprobar que todo funciona correctamente introduciremos el comando `run` y veremos el _HelloWorld_:

```bash
$ dotnet run
Hello quantum world!
```

El proyecto está formado por 3 archivos:

- _.csproj_: es el archivo del proyecto.
- _Driver.cs_: es el programa en C# que lanza el simulador de Q#.
- _Operations.qs_: es el programa cuántico en Q# que ejecuta nuestro proyecto.

## Q#

Para aprender mejor este nuevo lenguaje os recomiendo empezar a leer la [documentación oficial](https://docs.microsoft.com/en-us/quantum/language/?view=qsharp-preview) y por supuesto la [referencia de sus librerías](https://docs.microsoft.com/en-us/qsharp/api/qsharp/microsoft.quantum.intrinsic?view=qsharp-preview).

No obstante, es un lenguaje bastante fácil de entender a simple vista. Si echamos un vistazo a "Operations.qs" veremos:

```ts
namespace QSharp
{
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Intrinsic;

    operation HelloQ(): Unit {
        Message("Hello quantum world!");
    }
}
```

Es una notación parecida a C# o TypeScript, donde podemos ver que los `imports` son `open` y una `static` `function` se declara como `operation`.

Si quisiéramos aplicar lo que hemos aprendido hasta ahora, podría crear un pequeño "interruptor":

```ts
namespace qsharp
{
    open Microsoft.Quantum.Intrinsic;

    operation Switch(desired: Result, q1: Qubit): Unit
    {
        let current = M(q1);
        if (desired != current)
        {
            X(q1);
        }
    }
}
```

En este código vamos a hacer que nuestro `Qubit` cambie al valor de la variable `desired`, que puede ser `Zero` o `One`.

Añadimos otra operación para saber qué valor tenemos actualmente después de hacer el `Switch`:

```ts
operation SwitchAndReturn(desired: Result, q1: Qubit): Result
{
    Switch(desired, q1);

    let res = M(q1);
    return res;
}
```

Aquí lo que hacemos es el cambio de estado y devolvemos en qué estado ha quedado. Y esta operación la llamaremos dentro de nuestra prueba:

```ts
operation TestSwitch(count: Int, initial: Result): (Int, Int)
{
    mutable numOnes = 0;
    using (qubits = Qubit[1])
    {
        for (test in 1..count)
        {
            let res = SwitchAndReturn(initial, qubits[0]);
            if (res == One)
            {
                set numOnes = numOnes + 1;
            }
        }

        Switch(Zero, qubits[0]);
    }

    return (count - numOnes, numOnes);
}
```

Partiremos de un número de iteraciones llamado `count` y de un estado de inicio llamado `initial`. Crearemos un `Qubit` y en cada iteración modificaremos su valor al `initial` y comprobaremos si tiene el valor `One` para contar sus apariciones.

Cuando terminemos las operaciones y antes de dejar de usar los _qubits_ que necesitemos, hay que dejarlos en estado `Zero`, si no, nos aparecerá el error de:

```
Microsoft.Quantum.Simulation.Simulators.Exceptions.ReleasedQubitsAreNotInZeroState: Released qubits are not in zero state.
```

Una vez terminadas las operaciones, devolvemos los `Zero`'s y `One`'s que encontramos.

Con el fin de poder ejecutar este nuevo código de Q#, tendremos que modificar el archivo "Driver.cs":

```csharp
static void Main(string[] args)
{
    using (var qsim = new QuantumSimulator())
    {
        var initials = new Result[] { Result.Zero, Result.One };
        foreach (var initial in initials)
        {
            var res = TestSwitch.Run(qsim, 1000, initial).Result;
            var (numZeros, numOnes) = res;
            Console.WriteLine($"{initial, -4}-> Zeros: {numZeros, -4}, Ones: {numOnes, -4}");
        }
    }
}
```

Que escribirá en consola el número total de `Zero`'s y `One`'s encontrados para cada valor inicial que le pasemos.

Al hacer un `run` deberíamos obtener la siguiente salida:

```bash
$ dotnet run
Zero-> Zeros: 1000, Ones: 0
One -> Zeros: 0   , Ones: 1000
```

Ahora vamos a jugar con la negación, vamos a realizar una modificación en la operación de `SwitchAndReturn` añadiendo la negación `X` del _qubit_ actual:

```ts
operation SwitchAndReturn(desired: Result, q1: Qubit): Result
{
    Switch(desired, q1);

    X(q1);

    let res = M(q1);
    return res;
}
```

De forma obtendremos el resultado contrario a la anterior ejecución. Volvemos a ejecutar para comprobarlo:

```bash
$ dotnet run
Zero-> Zeros: 0   , Ones: 1000
One -> Zeros: 1000, Ones: 0
```

Por último, podríamos aplicar la puerta lógica `H` en lugar de la `X`:

```ts
operation SwitchAndReturn(desired: Result, q1: Qubit): Result
{
    Switch(desired, q1);

    H(q1);

    let res = M(q1);
    return res;
}
```

Y comprobar unos resultados diferentes en cada ejecución y más o menos distribuidos cerca de al 50%:

```bash
$ dotnet run
Zero-> Zeros: 502 , Ones: 498
One -> Zeros: 496 , Ones: 504
```

## Conclusiones

La computación cuántica está en un estado poco maduro. Las grandes empresas de hardware están dedicando mucho dinero en crear ordenadores físicos que no solo simulen, si no que sean verdaderamente sistemas cuánticos.

No está llamada a sustituir la computación actual, pero sí a extenderla. Hoy en día podría resolver cierta clase de algoritmos concretos de una forma más eficiente y rápida.

Lo que sí que podemos intuir es que será importante en el futuro, y aunque no le veas sentido, creo que es divertido e interesante el irnos acostumbrando a este nuevo paradigma.

![One does not simply understand quantum development](/assets/uploads/2019/05/quantum-meme.jpg)

No te digo nada y te lo digo todo. Así a la vez.