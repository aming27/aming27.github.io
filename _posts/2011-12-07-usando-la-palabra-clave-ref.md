---
ID: 60
title: 'Usando la palabra clave &#8220;ref&#8221;'
author: fernandoescolar
post_date: 2011-12-07 11:45:20
post_excerpt: ""
layout: post
---
<p>No hace mucho, estabamos tomando unas cervezas algunos desarrolladores de .net de Barcelona. Entonces sali&oacute; el tema de los talibanes del c&oacute;digo. Cosas como <em>fxCop</em> o <em>styleCop</em>. Aunque estas herramientas y sus reglas dan para varios art&iacute;culos de debate, el caso es que surgi&oacute; una norma del<strong> code analysis</strong> (<em>fxCop</em>) que recomienda no usar la palabra en clave "<em>ref</em>".</p>
<!--break-->
<p>En ese momento varios afirmamos que estaba bien porque no era necesario, al menos con objetos. Entonces uno de los comensales, <strong>Jaume Jornet</strong> (@jaumejornet) rapidamente respondi&oacute; con un "<em>es un doble-aster&iacute;sco de c</em>". A partir de ah&iacute; ya le hab&iacute;amos comprado la respuesta, pero puso un ejemplo r&aacute;pido usando un dibujo del <strong>heap</strong> y otro del <strong>stack</strong>, que para las personas que siempre han usado lenguajes manejados puede resultar muy &uacute;til.</p>
<p>Como es un tema muy interesante, vamos a intentar ampliar la explicaci&oacute;n que nos di&oacute; de Jaume y comentar el uso de la palabra en clave <em>ref.</em></p>
<p>Antes de empezar vamos a explicar vagamente qu&eacute; es la stack y qu&eacute; el heap:</p>
<ul>
<li><strong>Stack</strong>: es la pila. Una secci&oacute;n de memoria secuencial (<strong>L</strong>ast <strong>I</strong>n <strong>F</strong>irst<strong> O</strong>ut) y de acceso r&aacute;pido. Ah&iacute; se almacenar&aacute;n estructuras (struct, int, long, bool ...) y punteros a datos m&aacute;s complejos que se almacenan en heap o a la propia stack. Una pila tiene un tama&ntilde;o fijo y es de acceso r&aacute;pido.</li>
<li><strong>Heap</strong>: es la memoria como comunmente la conocemos. Puede crecer seg&uacute;n las necesidades, es de acceso aleatorio (no sabemos cuanto tardar&aacute; en realizar la operacion). Aqu&iacute; se almacenan los objetos y datos complejos.</li>
</ul>
<p>Esta descripci&oacute;n quiz&aacute; no sea la m&aacute;s exacta y tampoco la que m&aacute;s aclara. As&iacute; que vamos a ver un ejemplo:</p>
<pre class="brush: c#">public class Person
{
   public string Name { get; set; }
   public int Age { get; set; }
}</pre>
<pre class="brush: c#">int a = 3;
long b = 4;
var c = new Person();</pre>
<p>En el momento de ejecutar ese c&oacute;digo, quedar&iacute;a as&iacute; almacenado (en azul stack y en rojo heap):</p>
<center><img src="/assets/uploads/2012/09/stack1.png" alt="" width="312" height="134" /></center>
<p>Para los que no vienen de lenguajes como <em>c</em> o <em>c++</em>, cuando vemos el s&iacute;mbolo asterisco delante del nombre de una variable significa que es donde se almacena la direcci&oacute;n de memoria (el lugar en el heap) del objeto. Pero el objeto verdaderamente no est&aacute; ah&iacute;. Solo es una referencia a la zona del heap donde est&aacute; almacenado. Un <strong>puntero</strong>.</p>
<p>Ahora declaramos una funci&oacute;n de esta forma:</p>
<pre class="brush: c#">public void Method1(int i, Person p)
{
   i = 12;
   p.Name = "Fernando";
}

Method1(a, c);</pre>
<p>Esta funci&oacute;n cuando es llamada genera dos nuevas entradas en la stack, una de tipo entero (int) con el valor de 'a' copiado y otra de tipo puntero a persona con la misma direcci&oacute;n de memoria que la anterior:</p>
<center><img src="/assets/uploads/2012/09/stack2.png" alt="" width="312" height="170" /></center>
<p>Entonces vemos que si dentro de la funci&oacute;n cambiamos el valor del entero, este es una copia y se cambia en la pila (stack). Pero si cambiamos el valor del nombre de la persona, aunque el puntero sea una copia, referencia la misma direcci&oacute;n de memoria que la variable '<em>c</em>'.</p>
<center><img src="/assets/uploads/2012/09/stack3.png" alt="" width="312" height="170" /></center>
<p>Por esta raz&oacute;n, cuando termine la ejecuci&oacute;n del m&eacute;todo, la variable '<em>a</em>' seguir&aacute; valiendo <em>3</em>, pero el nombre de '<em>c</em>' ser&aacute; "<em>Fernando</em>". Y de aqu&iacute; viene ese dicho que reza: que en c# (y otros lenguajes manejados) los objetos se pasan siempre por referencia. Porque lo cierto es que se copia la referencia (o direcci&oacute;n en el heap) de ese objeto en la pila.</p>
<p>Si queremos cambar el valor del entero, tendremos que pasarlo por referencia, usando la palabra en clave <em>ref</em>:</p>
<pre class="brush: c#">public void Method2(ref int i, Person p)
{
   i = 12;
   p.Name = "Fernando";
}

Method2(ref a, c);</pre>
<p>Al escribir la palabra <i>ref</i>, la variable que se crea en la pila, en lugar de ser un entero, ser&aacute; una referencia (un puntero) a la direcci&oacute;n de la pila donde se encuentra el entero original. Y su ejecuci&oacute;n causar&iacute;a esto:</p>
<center><img src="/assets/uploads/2012/09/stack4.png" alt="" width="312" height="170" /></center>
<p>Como antes hemos dicho que el objeto '<em>p</em>' ya se pasaba por referencia sin necesitad del comando&nbsp;<em>ref</em>, &iquest;qu&eacute; pasar&iacute;a si lo reasignamos a un nuevo valor?</p>
<pre class="brush: c#">public void Method3(ref int i, Person p)
{
   i = 12;
   p.Name = "fernando";
   p = new Person();
   p.Name = "pablo";
}

Method3(ref a, c);</pre>
<p>En este contexto el objeto '<em>p</em>' es una copia de la direcci&oacute;n de memoria del objeto '<em>c</em>' original. Y al asignarle una nueva instancia, se cambia la direcci&oacute;n de memoria y genera un nuevo bloque en el <em>heap</em>. Pero el objeto '<em>c</em>' permanece apuntando al original:</p>
<center><img src="/assets/uploads/2012/09/stack5.png" alt="" width="312" height="170" /></center>
<p>As&iacute; pues llegamos al &uacute;ltimo punto, &iquest;qu&eacute; pasar&iacute;a si quisieramos cambiar la instancia original? Entonces tendr&iacute;amos que crear el famoso doble-puntero. O lo que es lo mismo, una referencia del objeto <em>Person</em>:</p>
<pre class="brush: c#">public void Method4(int i, ref Person p)
{
   p = new Person();
   p.Name = "pablo";
}

Method4(a, ref c);</pre>
<p>As&iacute; al salir del m&eacute;todo cuarto, el valor de '<em>c</em>' ser&iacute;a la direcci&oacute;n de memoria del nuevo objeto person con nombre "<em>pablo</em>":</p>
<center><img src="/assets/uploads/2012/09/stack6.png" alt="" width="312" height="170" /></center>
<p>Ahora os invito a que haga&iacute;s estas pruebas y observe&iacute;s por vosotros mismos este comportamiento.</p>