---
published: true
ID: 201905231
title: 'Introducción a Quatum Development (ii)'
author: fernandoescolar
post_date: 2019-05-23 07:37:32
layout: post
tags: quantum programming
background: '/assets/uploads/bg/engineering2.jpg'
---

Te explicaré por qué estás aquí. Estás aquí porque sabes algo, aunque lo que sabes no lo puedes explicar, pero lo percibes. Ha sido así durante toda tu vida. Algo no funciona en la programación, no sabes lo que es, pero ahí está, como una astilla clavada en tu mente. Y te está enloqueciendo. Esa sensación te ha traído hasta aquí ¿Sabes de lo que estoy hablando? ¿Te gustaría saber qué es la programación cuántica?<!--break-->

![What if I told you using the word "Quantum" in your sentence doesn't make you a physicist (meme)](/assets/uploads/2019/05/quantum2-meme.jpg)

¿Qué me dirías si todo lo que estuvimos comentando en el [anterior artículo](/2019/05/10/introduccion-quatum-development/) fuera tan solo la superficie? ¿Y si fuera el equivalente a la tabla de multiplicar del 1 en el mundo de la resolución de derivadas?

Hoy vamos a profundizar más en el tema de la programación cuántica, y para ello, realizaremos ejemplos usando el [Microsoft Quantum Development Kit](https://www.microsoft.com/en-us/quantum/development-kit). Así que te recomendamos que [lo instales](/2019/05/10/introduccion-quatum-development/#microsoft-quantum-development-kit), si no lo has hecho ya.

## Qubit

El [otro día vimos](/2019/05/10/introduccion-quatum-development/#qubit) que un _qubit_ puede ser representado como una superposición de `|0>` y `|1>`:

`(α|0> + β|1>)`

Pero lo que no dijimos es que tanto `α` como `β` podrían ser [números complejos](https://es.wikipedia.org/wiki/N%C3%BAmero_complejo) que en su forma exponencial estarían representados por:

<code class="highlighter-rouge">r<sub>α</sub>e<sup>iΦ<sub>α</sub></sup>|0> + r<sub>β</sub>e<sup>iΦ<sub>β</sub></sup>|1></code>

Al usar números complejos esto nos aporta una nueva dimensión: la parte real y otra imaginaria. Esto unido con la superposición de `|0>` y `|1>`, nos llevaría a poder representar un _qubit_ en forma de una [esfera de Bloch](https://es.wikipedia.org/wiki/Esfera_de_Bloch):

![Esfera de Bloch](/assets/uploads/2019/05/quantum2-bloch-sphere.png)

Donde:

- En el eje `Z` tendríamos los valores `|1>` y `|0>`.
- En el eje `X` marcaríamos los estados positivo o negativo: `|+>` o `|->`.
- En el eje `Y` encontraríamos la parte imaginaria: `|i>` o `|-i>`.

![Va y me dice que es una esfera de Bloch (meme)](/assets/uploads/2019/05/quantum2-meme2.jpg)

### Operación _Measure_

Si quisiéramos realizar una medida en cualquiera de estos ejes, deberíamos recurrir a las [matrices de Pauli](https://es.wikipedia.org/wiki/Matrices_de_Pauli):

![Matrices de Pauli](/assets/uploads/2019/05/quantum2-pauli.svg)

Que en Q# sería algo como esto:

```ts
operation MeasureAll(): (Result, Result, Result)
{
    using (qubits = Qubit[1])
    {
        H(qubits[0]);

        let resZ = Measure([PauliZ], qubits);
        let resY = Measure([PauliY], qubits);
        let resX = Measure([PauliX], qubits);

        ResetAll(qubits);

        return (resZ, resY, resX);
    }
}
```

Donde la operación de `H` se usa para que no siempre tenga el valor `Zero` en la `Z`. Y la operación `Measure` es igual que la `M`, con la diferencia de que la operación `M` realiza la medida con la matriz `Z` y `Measure` nos deja seleccionar la matriz a utilizar. Recordad dejar a `Zero` el estado de todos los _qubits_ que usemos antes de dejar de utilizarlos. Para ello, si es una matriz, podemos usar la operación `ResetAll`.

De esta manera, el código de "driver.cs" quedaría como:

```csharp
static void Main(string[] args)
{
    using (var qsim = new QuantumSimulator())
    {
        for(var i = 0; i < 10; i++)
        {
            var res = MeasureAll.Run(qsim).Result;
            var (resZ, resY, resX, resI) = res;
            var z = resZ == Result.Zero ? "|0>" : "|1>";
            var y = resY == Result.Zero ? "|-i>" : "|i>";
            var x = resX == Result.Zero ? "|->" : "|+>";

            Console.WriteLine($"Z: {z, -4}, Y: {y, -4}, X: {x, -4}");
        }
    }
}
```

Y al ejecutar este código nos debería dar como resultado algo parecido a esto:

```bash
$ dotnet run
Z: |0> , Y: |i> , X: |+>
Z: |1> , Y: |i> , X: |+>
Z: |1> , Y: |i> , X: |->
Z: |1> , Y: |i> , X: |+>
Z: |1> , Y: |-i>, X: |->
Z: |0> , Y: |i> , X: |+>
Z: |0> , Y: |i> , X: |->
Z: |0> , Y: |-i>, X: |->
Z: |0> , Y: |i> , X: |->
Z: |0> , Y: |i> , X: |+>
```

## Sistema de varios Qubits

En la computación tradicional usamos más de un _bit_ para definir estados más complejos que `0` y `1`. Por ejemplo, si queremos definir el número 3 usaríamos dos _bits_ con valor `1`:

`11 binario = 3 decimal`

De la misma forma podemos actuar con los _qubits_. Podríamos tener dos _qubits_ que nos definieran un solo estado, de manera que esto formaría un nuevo sistema más complejo:

`a|00> + b|01> + c|10> + d|11>`

Donde:

`|a|² + |b|² +|c|² + |d|² = 1`

Si por ejemplo tuviéramos 3 _qubits_, entonces tendríamos definidos los estados `000`, `001`, `010`, `011`, `100`, `101`, `110` y `111`. Y así sucesivamente.

Cuantos más _qubits_ usemos en nuestro sistema, más estados contemplamos. Si por ejemplo tuviéramos un sistema de 10 _qubits_ estaríamos hablando de 1024 estados, con 100 _qubits_ nos encontraríamos en un orden de 10<sup>30</sup> de combinaciones. Y se opera con todas ellas a la vez. Esto nos da una idea de la gran potencia que tiene la computación cuántica.

![We don't have games, but we got TERAFLOPS (meme)](/assets/uploads/2019/05/quantum2-meme3.jpg)

## Más Operaciones Cuánticas

En el [artículo anterior](/2019/05/10/introduccion-quatum-development/#operaciones-cuánticas) pudimos estudiar algunas operaciones o puertas lógicas. En este vamos a extender ese listado con dos operaciones que solemos usar usando dos _qubits_ en lugar de solo uno:

### Puerta CNOT

Cuando hablamos de un sistema de dos _qubits_ la operación más utilizada es un _CNOT_ o _Controlled NOT_. Tiene dos _qubits_ por parámetro: uno de control y otro el objetivo de la operación _NOT_. Cuando el control es `|1>` realiza un _NOT_ en el objetivo. Se representa con el símbolo `⊕`:

`CNOT |c>|t> = |c>|c⊕t>`

Y los posibles resultados serían:

| Origen | Control | Objetivo | Resultado CNOT |
|---|---|---|---|
| 00 | 0 | 0 | **00** |
| 01 | 0 | 1 | **01** |
| 10 | 1 | 0 | **11** |
| 11 | 1 | 1 | **10** |

Si quisiéramos poner en práctica la operación con Q#, tendríamos el siguiente código:

```ts
operation Set(q: Qubit, value: Result): Unit
{
    let current = M(q);
    if (current != value)
    {
        X(q);
    }
}

operation MakeCNOT(control: Result, target: Result): (Result, Result)
{
    using (qubits = Qubit[2])
    {
        Set(qubits[0], control);
        Set(qubits[1], target);

        CNOT(qubits[0], qubits[1]);

        let resControl = M(qubits[0]);
        let resTarget = M(qubits[1]);

        ResetAll(qubits);

        return (resControl, resTarget);
    }
}
```

Aquí primero tenemos una operación que nos ayuda a asignar un valor a un _qubit_ llamada `Set`. Después tenemos la operación que realiza el `CNOT`. Primero reservamos dos _qubits_, después le asignamos los valores que hemos decidido para `control` y para `target`. Pasamos la puerta lógica `CNOT` y leemos los resultados.

En C# tendríamos la llamada:

```csharp
using (var qsim = new QuantumSimulator())
{
    var initials = new Result[] { Result.Zero, Result.One };
    foreach(var control in initials)
    {
        foreach(var target in initials)
        {
            var res = MakeCNOT.Run(qsim, control, target).Result;
            var (resControl, resTarget) = res;
            var source = $"|{(int)control}{(int)target}>";
            var result = $"|{(int)resControl}{(int)resTarget}>";
            Console.WriteLine($"{source} -> {result}");
        }
    }
}
```

Y la salida de la ejecución sería como la tabla que hemos descrito antes:

```bash
$ dotnet run
|00> -> |00>
|01> -> |01>
|10> -> |11>
|11> -> |10>
```

### Puerta SWAP

Esta puerta intercambia los valores de dos _qubits_. Su funcionamiento es semejante a la realización de:

```csharp
CNOT(qubit1, qubit2);
CNOT(qubit2, qubit1);
CNOT(qubit1, qubit2);
```

| Origen | Fin |
|---|---|
| 00 | **00** |
| 01 | **10** |
| 10 | **01** |
| 11 | **11** |

Si en el código anterior sustituyéramos el `CNOT` por `SWAP`:

```ts
operation MakeSWAP(control: Result, target: Result): (Result, Result)
{
    using (qubits = Qubit[2])
    {
        Set(qubits[0], control);
        Set(qubits[1], target);

        SWAP(qubits[0], qubits[1]);

        let resControl = M(qubits[0]);
        let resTarget = M(qubits[1]);

        ResetAll(qubits);

        return (resControl, resTarget);
    }
}
```

Entonces la salida sería:

```bash
$ dotnet run
|00> -> |00>
|01> -> |10>
|10> -> |01>
|11> -> |11>
```

## Conclusiones

Las segundas partes nunca fueron buenas. Es verdad que este artículo puede parecer un poco de relleno. Es que lo es. Pero si no quería alargarlo demasiado, tenía que parar de escribir en algún momento.

Hemos profundizado mucho más en qué es un _qubit_ y como operar con uno o varios de ellos. También nos hemos empezado a dar cuenta de la potencia que tendría un ordenador de propósito general que manejara muchos _qubits_.

Hasta aquí hemos tratado dos puntos claves de la programación cuántica:

- **El principio de incertidumbre (de Heisenberg)**: es imposible realizar una medida sin que el sistema se vea afectado.
- **La superposición cuántica (o de estados)**: un sistema existe en todos sus posibles estados a la vez.

Para el próximo _post_ prometo algo mucho más divertido como el entrelazado cuántico y su relación con la teleportación...

![When you hear someone say they understand quantum mechanics... (meme)](/assets/uploads/2019/05/quantum2-meme4.jpg)

No te digo nada y te lo digo todo. Así a la vez.