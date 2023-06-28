---
ID: 248
title: 'Patrones de diseño: Strategy'
author: fernandoescolar
post_date: 2012-10-03 14:10:06
post_excerpt: ""
layout: post
---
La mayor parte de los problemas que nos podemos encontrar al usar patrones de diseño vienen de no ser capaces de reconocer en qué contextos hay que aplicarlos.
<!--break-->
Caemos en la trampa de, al intentar escribir código mejor, generar deuda técnica, ya que el patrón aplicado no resolvía el problema que teníamos en realidad. Es por eso que la pregunta más importante que tenemos que responder cuando empezamos a estudiar un patrón de diseño es: ¿para qué sirve?.

El patrón Strategy tiene sentido cuando nos encontramos en un escenario en el que para conseguir un objetivo, tenemos diferentes formas de afrontarlo. Por poner un ejemplo, imaginemos que estamos desarrollando un programa que añade estilos en formato HTML a un texto. Los estilos que soporta serán: poner en negrita, letra cursiva y subrayar.

Una solución que podríamos dar sería:
<div>
<pre class="brush: csharp">public enum Styles
{
    Bold,
    Italic,
    Underline
}

public class Styler
{
    public string SetStyle(string input, Styles style)
    {
        switch (style)
        {
            case Styles.Bold:
                return "&lt;b&gt;" + input + "&lt;/b&gt;";
            case Styles.Italic:
                return "&lt;i&gt;" + input + "&lt;/i&gt;";
            case Styles.Underline:
                return "&lt;u&gt;" + input + "&lt;/u&gt;";
            default:
                throw new NotImplementedException("This style is not supported");
        }
    }
}</pre>
</div>
Como podemos ver, hemos usado un bloque de tipo “<em>switch</em>” y en dependencia del estilo que queramos añadirle al texto de entrada (“<em>input</em>”), realizamos una acción u otra. El resultado final es que si dentro de dos días tenemos el requerimiento de añadir dos o tres estilos nuevos a nuestro sistema, tendremos que añadir más bloques “case” a nuestro código. Esto en definitiva, lo que provocaría es que no estuviéramos cumpliendo con el <strong>principio SOLID de Open Closed</strong>.

Este principio señala que nuestro código debería estar <strong>abierto a la extensión, pero cerrado a la modificación</strong>. Es decir, que para añadir una nueva funcionalidad, no tengamos la necesidad de modificar los algoritmos que ya están programados. Y es aquí es donde el patrón strategy cobra su importancia.

Con el fin de no tener que modificar nuestro bloque “<em>switch</em>” con cada nuevo estilo que queramos aplicar al texto, vamos a dividir cada uno de los estilos existentes, en clases más pequeñas, que solo resuelvan un estilo cada una:
<div>
<pre class="brush: csharp">public class BoldStyler
{
    public string SetStyle(string input)
    {
        return "&lt;b&gt;" + input + "&lt;/b&gt;";
    }
}

public class ItalicStyler
{
    public string SetStyle(string input)
    {
        return "&lt;i&gt;" + input + "&lt;/i&gt;";
    }
}

public class UnderlineStyler
{
    public string SetStyle(string input)
    {
        return "&lt;u&gt;" + input + "&lt;/u&gt;";
    }
}</pre>
</div>
Como podemos ver, todas las clases son muy parecidas y podríamos sacar una interface común que defina su comportamiento:
<div>
<pre class="brush: csharp">public interface IStyler
{
    string SetStyle(string input);
}
public class BoldStyler : IStyler
//...

public class ItalicStyler : IStyler
//...

public class UnderlineStyler : IStyler
//...</pre>
</div>
Ahora tendríamos que modificar el código inicial para que use estas nuevas clases y seguir resolviendo el problema:
<div>
<pre class="brush: csharp">public class Styler
{
    public string SetStyle(string input, IStyler styler)
    {
        return styler.SetStyle(input);
    }
}</pre>
</div>
Y si por un casual, ahora necesitáramos añadir un nuevo formato a nuestro programa, solo tendríamos que desarrollar un nuevo objeto que implementara “IStyler”. Y así evitaríamos tener que modificar el código que ya tenemos escrito.

Dando un repaso a los objetos que hemos ido desarrollando hasta este momento, podríamos extraer un diagrama de clases como este:

<a href="/assets/uploads/2012/10/styler-strategy-pattern.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="styler-strategy-pattern" src="/assets/uploads/2012/10/styler-strategy-pattern_thumb.png" alt="styler-strategy-pattern" width="546" height="171" border="0" /></a>

Donde vemos que nuestro objeto “Styler” consume objetos que implementan “IStyler” como son “BoldStyler”, “ItalicStyler”, … . Un diagrama semejante al que define el patrón Strategy:

<a href="/assets/uploads/2012/10/strategy-pattern.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="strategy-pattern" src="/assets/uploads/2012/10/strategy-pattern_thumb.png" alt="strategy-pattern" width="545" height="171" border="0" /></a>

Donde los artefactos son:
<ul>
	<li><strong>Context</strong>: es el objeto que orquesta el funcionamiento de las estrategias. Puede recibir una de estas por parámetro o gestionarlas internamente.</li>
	<li><strong>IStrategy</strong>: es la definición común que tiene que implementar todo algoritmo que soporte el sistema.</li>
	<li><strong>ConcreteStrategyX</strong>: los objetos que, implementando la interface común, desarrollan un algoritmo concreto.</li>
</ul>
En este primer ejemplo hemos creado un contexto que acepta recibir una estrategia como parámetro, pero quizá, el problema podría ser que obligatoriamente hay que aplicar los tres formatos al texto que le pasemos. En este caso podríamos generar una clase de contexto como esta:
<div>
<pre class="brush: csharp">public class Styler
{
    private readonly List&lt;IStyler&gt; strategies = new List&lt;IStyler&gt;
                                            {
                                                new BoldStyler(),
                                                new ItalicStyler(),
                                                new UnderlineStyler()
                                            };
    public string SetStyle(string input)
    {
        var result = input;
        foreach(var strategy in this.strategies)
        {
            result += strategy.SetStyle(result);
        }

        return result;
    }
}</pre>
</div>
Y si usáramos alguna Framework de inyección de dependencias como Autofac, StructureMaps o NInject, podríamos aprovecharnos  de los sistemas de escaneo de ensamblados para poder obtener en el constructor todas las estrategias de un tipo correspondiente:
<div>
<pre class="brush: csharp">public class Styler
{
    private readonly IEnumerable&lt;IStyler&gt; strategies;

    public Styler(IEnumerable&lt;IStyler&gt; strategies)
    {
        this.strategies = strategies;
    }

    public string SetStyle(string input)
    {
        var result = input;
        foreach(var strategy in this.strategies)
        {
            result += strategy.SetStyle(result);
        }

        return result;
    }
}</pre>
</div>
&nbsp;

Una de las grandes ventajas del <strong>Strategy Pattern</strong> es que no es exclusivo de c# o la plataforma .Net, puede ser usado con diferentes lenguajes de programación, como por ejemplo <strong>Javascript</strong>. Una implementación de este mismo código podría ser esta:
<div>
<pre class="brush: javascript">function HtmlStyler() {
    this.setStyle = function (input) {
        var result = input;
        for (var key in this.strategies) {
            var strategy = this.strategies[key];
            if (strategy.setStyle)
                result = strategy.setStyle(result);
            else
                throw "Invalid strategy";
        }

        return result;
    };
}

HtmlStyler.prototype.strategies = { };
HtmlStyler.prototype.strategies.boldStyler = {
    setStyle: function(input) {
        return '&lt;b&gt;' + input + '&lt;/b&gt;';
    },
};

HtmlStyler.prototype.strategies.italicStyler = {
    setStyle: function (input) {
        return '&lt;i&gt;' + input + '&lt;/i&gt;';
    },
};

HtmlStyler.prototype.strategies.underlineStyler = {
    setStyle: function (input) {
        return '&lt;u&gt;' + input + '&lt;/u&gt;';
    },
};</pre>
</div>
La peculiaridad de esta implentación en Javascript es el uso de "prototype" para facilitar las futuras características nuevas que se pueden desarrollar. No hará falta modificar el programa original, si no añadir una nueva propiedad a las estrategias del prototipo de nuestro objeto.

Y cómo no, también podríamos realizar el mismo código en el lenguaje de programación de moda, <strong>Typescript</strong>:
<div>
<pre class="brush: csharp">interface IStyler {
    setStyle: (input: string) =&gt; string;
}

class HTMLStyler {

    strategies: IStyler[];

    constructor (strategies: IStyler[]) {

        this.strategies = strategies;

    }

    setStyle(input: string):string {
        var result: string = input;
        for (var i = 0; i &lt; this.strategies.length; i++) {
            var strategy : IStyler = this.strategies[i];
            result = strategy.setStyle(result);
        }
        return result;
    }
}

class BoldStyler implements IStyler {
    setStyle(input: string) {
        return '&lt;b&gt;' + input + '&lt;/b&gt;';
    }
}

class ItalicStyler implements IStyler {
    setStyle(input: string) {
        return '&lt;i&gt;' + input + '&lt;/i&gt;';
    }
}

class UnderlineStyler implements IStyler {
    setStyle(input: string) {
        return '&lt;u&gt;' + input + '&lt;/u&gt;';
    }
}

var styler = new HTMLStyler([new BoldStyler(), new ItalicStyler(), new UnderlineStyler()]);
alert(styler.setStyle('hola!'));</pre>
</div>
Y podremos ver claramente que el resultado final <strong>se asemeja más al que desarrollamos con c#</strong>, que a la solución propuesta en javascript.
<h3>Conclusiones</h3>
Mientras describíamos el patrón Strategy hemos dejado caer alguno de sus beneficios, como por ejemplo que es más fácil de leer el código. También será más fácil por tanto de mantener y por supuesto de ampliar con nuevas funcionalidades. Gracias a este patrón vamos a cumplir con dos de los principios de SOLID: el principio de responsabilidad única, al crear pequeñas clases que contienen un algoritmo muy concreto; y el de abierto/cerrado, abriendo nuestra solución a la extensión pero no a la modificación.

También queda claro el problema que podría suponer a largo plazo: una gran cantidad nueva de objetos para que sean gestionados por el hilo principal de nuestro programa. Por lo que para un sistema de tiempo real o donde la velocidad de respuesta y el poco consumo de recursos, fueran lo más importante, no sería la implementación ideal.

No obstante, teniendo en cuenta que en este ejemplo usamos lenguajes como Javascript o c#, en los que la velocidad no es su punto fuerte, siempre deberíamos pensar en este patrón antes de escribir un bloque “switch”.