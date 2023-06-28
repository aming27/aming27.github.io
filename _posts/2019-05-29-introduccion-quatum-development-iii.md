---
published: true
ID: 201905291
title: 'Introducción a Quatum Development (iii)'
author: fernandoescolar
post_date: 2019-05-29 08:01:23
layout: post
tags: quantum programming
background: '/assets/uploads/bg/engineering3.jpg'
---

Sé que tenéis miedo. Teméis los _qubits_. Teméis el cambio. Yo no conozco el futuro. No he venido para deciros cómo acabará todo esto. Al contrario, he venido a deciros cómo va a comenzar. Voy a terminar de escribir este artículo. Voy a enseñarles a todos lo que vosotros no queréis que vean. Les enseñaré un mundo sin vosotros. Un mundo sin _bits_ y sin problemas de calor en los transistores, sin limites ni fronteras. Un mundo donde todos los estados sean posibles. Lo que hagáis después, es una decisión que dejo en vuestras manos.<!--break-->

![We need qubits, lots of qubits (meme)](/assets/uploads/2019/05/quantum3-meme.jpg)

En artículos anteriores ([i](/2019/05/10/introduccion-quatum-development) y [ii](/2019/05/23/introduccion-quatum-development-ii)) ya introdujimos la computación cuántica, el [Microsoft Quantum Development Kit](/2019/05/10/introduccion-quatum-development/#microsoft-quantum-development-kit), los _qubits_ de forma [básica](/2019/05/10/introduccion-quatum-development/#qubit) y algo [más avanzada](/2019/05/23/introduccion-quatum-development-ii/#qubit), además de varias operaciones y puertas lógicas de este nuevo paradigma.

Y como lo prometido es deuda, hoy vamos a hablar de entrelazamiento y teleportación cuánticos:

## Entrelazamiento

El entrelazamiento cuántico es algo más abstracto (si cabe ya) de explicar. Quizá lo más sencillo es verlo con un ejemplo:

Imaginad que tenemos dos qubits representados de la siguiente forma:

`a|00> + b|01> + c|10> + d|11>`

Donde: `a` y `d` valen uno partido de la raíz cuadrada de dos y `b` y `c` valen `0`:

`1/sqrt(2)|00> + 0|01> + 0|10> + 1/sqrt(2)|11> = (1/sqrt(2))(|00> + |11>)`

Esto quiere decir que solo tenemos dos estados posibles con un 50% de posibilidades de que ocurra `00` o 50% de `11` mientras que no es posible que sea `01` ni `10`.

Como ya vimos en [otros artículos](/2019/05/10/introduccion-quatum-development/#m), en el momento en el que realizo una medida de un _qubit_ este colapsa a ese estado. Una consecuencia del principio de incertidumbre.

Entonces si midiéramos el valor del primer _qubit_ y este diera como resultado `0`, esto significaría que el segundo _qubit_ colapsaría también pasando a valer `0`.

Podríamos decir que un estado de entrelazamiento es un estado en el que tener un valor en un _qubit_ implica otro valor en otro _qubit_ diferente.

![Me explota la cabeza (meme)](/assets/uploads/2019/05/quantum3-meme2.gif)

A estos estados de entrelazamiento completo se les conoce como [estados de Bell](https://en.wikipedia.org/wiki/Bell_state). Y para este ejemplo en concréto, se puede conseguir aplicando una fórmula con operaciones que ya hemos visto:

![CNOT de H](/assets/uploads/2019/05/quantum3-bell-state.png)

Esta misma formula escrita en Q# podría ser:

```ts
operation Entanglement(q1: Qubit, q2: Qubit): Unit
{
    H(q1);
    CNOT(q1, q2);
}
```

Donde aplicamos una puerta `H` al primer _qubit_ y acto seguido una puerta `CNOT` usando como objetivo el segundo _qubit_. El resultado de estas dos operaciones es un estado de entrelazamiento semejante al usado en el ejemplo anterior: 50% `00` y 50% `11`.

Ahora podríamos escribir el código de ejemplo de ejecución de la operación de entrelazar:

```ts
operation Set(q: Qubit, value: Result): Unit
{
    let current = M(q);
    if (current != value)
    {
        X(q);
    }
}

operation MakeEntanglement(initial: Result): (Result, Result)
{
    using (qubits = Qubit[2])
    {
        Set(qubits[0], initial);
        Set(qubits[1], Zero);

        Entanglement(qubits[0], qubits[1]);

        let res0 = M(qubits[0]);
        let res1 = M(qubits[1]);

        ResetAll(qubits);

        return (res0, res1);
    }
}
```

Aquí simplemente asignamos un valor inicial a un par de _qubits_, realizamos el entrelazado y los medimos.

En C# podríamos realizar una prueba con este código:

```csharp
using (var qsim = new QuantumSimulator())
{
    var initials = new Result[] { Result.Zero, Result.One };
    foreach (var initial in initials)
    {
        var res = MakeEntanglement.Run(qsim, initial).Result;
        var (res1, res2) = res;
        Console.WriteLine($"{res1} {res2}");
    }
}
```

Que al ejecutar podría tener una salida semejante a:

```bash
$ dotnet run
Zero Zero
One One
```

Aunque podría tener diferentes combinaciones (por eso del 50% de posibilidades de uno y otro) siempre que se repitan el valor primero y segundo (por eso del entrelazamiento cuántico).

## Teleportación

La [teleportación cuántica](https://es.wikipedia.org/wiki/Teleportaci%C3%B3n_cu%C3%A1ntica) es algo parecido a lo que piensas, pero no es exactamente como piensas.

![¿Esquivar balas? Puedes teletransportarte (meme)](/assets/uploads/2019/05/quantum3-meme3.jpg)

La idea es conseguir enviar el estado de un _qubit_ `a` a otro `b` que no se encuentra en el mismo lugar.

Para ello podemos usar el entrelazamiento cuántico como canal de comunicación:

Imaginemos que tenemos dos partículas entrelazadas como en el ejemplo anterior. Una la coges tu y la otra la cojo yo. Cada uno nos vamos a nuestra casa. En la comodidad del hogar decides mirar el valor de tu partícula, y en ese momento colapsas el valor de ambas. De forma que si la tuya vale `1` ya sabes que la mía vale `1`.

Ahora, si tú copias el valor de otra partícula no entrelazada con la mía, en la que sí que está entrelazada, entonces podríamos decir que has pasado el estado de una tercera partícula hasta mi.

La realidad detrás de este experimento es que no se ha transmitido ninguna información. Esta información ya la teníamos tanto tú como yo. Y si yo llego a mirar primero el valor de mi partícula, hubiera obtenido el mismo resultado. Es lo que se conoce como [la paradoja EPR](https://es.wikipedia.org/wiki/Paradoja_EPR), algo que escapa totalmente al ámbito de este artículo.

Podríamos aclarar (o complicar, no lo tengo claro) todo un poco más, usando un ejemplo con punteros de C++:

```cpp
// esta es mi partícula
int mine = 1;
// esta es la tuya
int *yours = NULL;
// y este el valor que quieres teleportar
int other = 0;

// nos entrelazamos
yours = &mine;

// ahora cada uno nos iríamos a nuestra casa

// desde tu casa transformas el valor de tu partícula
*yours = other;

// el resultado final es que tanto tu partícula como la mia son 0
cout << "Mine: " << mine << endl;
cout << "Yours: " << *yours << endl;
```

Realizar esta operación en Q# es algo más complejo, pero no mucho. Si echamos un vistazo a [la página de la wikipedia sobre el tema](https://es.wikipedia.org/wiki/Teleportaci%C3%B3n_cu%C3%A1ntica), nos propone unos pasos:

- Puerta CNOT
- Operador de Hadamard
- Medida y transmisión
  - Finalmente se debería aplicar un operador `Z` o `X` en el valor del _qubit_ `b`, en dependencia de los valores medidos, para tener el valor original:

```ts
operation Teleport (source : Qubit, target : Qubit) : Unit
{
    // creamos un canal de transmisión
    using (channel = Qubit())
    {
        // lo entrelazamos con el qubit objetivo
        Entanglement(channel, target);

        // puerta CNOT
        CNOT(source, channel);

        // operador de Hadamard
        H(source);

        // medida
        let data1 = M(source);
        let data2 = M(channel);

        // transformación
        if (data1 == One) { Z(target); }
        if (data2 == One) { X(target); }

        // dejar los qubits a Zero
        Reset(channel);
    }
}
```

Para llamar a la teleportación usaríamos la siguiente operación de Q#:

```ts
operation MakeTeleport(message : Result) : Result
{
    using ((source, target) = (Qubit(), Qubit()))
    {
        Set(source, message);

        Teleport(source, target);

        let measurement = M(target);
        ResetAll([source, target]);

        return measurement;
    }
}
```

Donde creamos dos _qubits_. En el primero guardamos el valor del mensaje que queremos enviar. Realizamos la teleportación y devolvemos el valor del destino.

El código en C# para probarlo sería algo como esto:

```csharp
using (var qsim = new QuantumSimulator())
{
    var initials = new Result[] { Result.Zero, Result.One };
    foreach (var initial in initials)
    {
        var res = MakeTeleport.Run(qsim, initial).Result;
        Console.WriteLine($"{initial} = {res}");
    }
}
```

Y la salida que obtendríamos al ejecutar vendría a confirmar que se ha transmitido la información:

```bash
$ dotnet run
Zero = Zero
One = One
```

![Goku: ¿teletransporte? Esto es teletransporte (meme)](/assets/uploads/2019/05/quantum3-meme4.jpg)

Como curiosidad, unos científicos chinos tienen el [record de distancia de teleportación cuántica](http://www.rtve.es/noticias/20170615/dos-particulas-separadas-1200-kilometros-se-entrelazan-forma-cuantica/1565524.shtml), llegando a 1200km de separación entre dos partículas entrelazadas ¡Ahí es nada!

## Conclusiones

Creo que con esta tercera parte he conseguido resarcirme del fiasco de la anterior. Aquí se aplican prácticamente todos los conceptos que hemos ido explicando en los artículos anteriores y es cuando empezamos a ver dos capacidades muy potentes de la programación cuántica.

Por ejemplo, el uso de estas técnicas es fundamental en la [criptografía cuántica](https://es.wikipedia.org/wiki/Criptograf%C3%ADa_cu%C3%A1ntica): un tipo de encriptación de información mucho más seguro de los usados hoy en día. Y por extensión sería muy interesante el uso de ambas técnicas para conseguir una comunicación muy rápida y segura.

![Quantum entanglement, is all about Aliens (meme)](/assets/uploads/2019/05/quantum3-meme5.jpg)

Eso sí, todo esto que comentamos, hoy en día, sería muy difícil de aplicar en el mundo real...

No te digo nada y te lo digo todo. Así a la vez.