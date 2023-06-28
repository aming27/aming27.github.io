---
ID: 137
title: 'Rx IV &#8211; Linq: operaciones con observables'
author: fernandoescolar
post_date: 2012-02-15 10:15:08
post_excerpt: ""
layout: post
---
<p>Hemos llegado al cuarto art&iacute;culo sobre <strong>reactive extensions</strong> en el que vamos a hablar de operaciones que se pueden realizar con observables. Pero, como hace unos d&iacute;as que no public&aacute;bamos nada al respecto, vamos a hacer primero una peque&ntilde;a retrospectiva. Hasta ahora hemos tratado de explicar <a href="/2011/12/12/rx-i-que-son-las-reactive-extensions" title="Rx I - Qu&eacute; son las Reactive eXtensions">rx como una f&oacute;rmula matem&aacute;tica</a>:</p>
<!--break-->
<p style="align: center;"><img src="/assets/uploads/2012/09/rx-III-0.gif" alt="" width="370" height="150" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>Dentro de esta formula hemos intentado exponer que el componente b&aacute;sico son <a href="2011/12/19/rx-ii-observables-los-sujetos" title="Rx II - Observables: los sujetos">los sujetos</a> (observables), y tambi&eacute;n las <a href="/2012/01/02/rx-iii-linq-crear-objetos-observables" title="Rx III - Linq: crear objetos observables">operaciones b&aacute;sicas de creaci&oacute;n</a>&nbsp;(linq). En este art&iacute;culo explicaremos m&aacute;s a fondo el resto de operaciones y operadores que podemos encontrar.</p>
<p>Pero antes de entrar en materia vamos a conocer unos diagramas que nos ayudar&aacute;n a explicar y entender m&aacute;s f&aacute;cilmente c&oacute;mo se comportan las operaciones:</p>
<h2>Marble diagrams</h2>
<p>Cuando hablamos de <strong>reactive extensions</strong> es muy com&uacute;n encontrarnos con unos diagramas que nos ayudan a entender las operaciones. En ellos se muestra la evoluci&oacute;n de la tarea de observaci&oacute;n con respecto el tiempo y tienen este formato:</p>
<center><img src="/assets/uploads/2012/10/rx-iv-1.jpg" alt="" align="middle" width="400" height="192" /></center>
<p>Dentro de uno de estos diagramas podemos encontrarnos con 4 s&iacute;mbolos diferentes:</p>
<center>
<div>
<table class="table-bordered">
<tbody>
<tr>
<td>●</td>
<td>Representa una iteraci&oacute;n o un valor en una secuencia observable. (IObserver&lt;T&gt;.OnNext(T);)</td>
</tr>
<tr>
<td>▲</td>
<td>Cuando sucede una transformaci&oacute;n en un valor.</td>
</tr>
<tr>
<td>x</td>
<td>Si una excepci&oacute;n termina con la secuencia observable. (IObserver&lt;T&gt;.OnError(Exception);)</td>
</tr>
<tr>
<td>|</td>
<td>Cuando una secuencia observable termina de forma correcta. (IObserver&lt;T&gt;.OnCompleted();)</td>
</tr>
</tbody>
</table>
</div>
</center>
<p>&nbsp;</p>
<p>Una vez tenemos claro c&oacute;mo funciona, podemos ponernos a explicar los operadores especiales:</p>
<h2>Merge</h2>
<p>Cuando hacemos un Merge de dos objetos observables, estamos seleccionando todas las iteraciones (<em>OnNext</em>) de uno y otro operador.</p>
<pre class="brush: csharp">var z = x.Merge(y);</pre>
<p>En este ejemplo, el observable <em>z</em> terminar&aacute; cuando se haya completado (<em>OnComplete</em>) tanto <em>x</em> como <em>y</em>, o cuando <strong>una de ellas tenga un error</strong> (<em>OnError</em>). Una vista del resultado en un diagrama ser&iacute;a:</p>
<p><img src="/assets/uploads/2012/10/rx-md-merge.png" alt="Rx Merge" width="404" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<h2>Concat</h2>
<p>Otra operaci&oacute;n es la concatenaci&oacute;n. Donde el resultado no ser&aacute; exactamente el mismo que el de un merge.</p>
<pre class="brush: csharp">var z = x.Concat(y);</pre>
<p>Al concatenar el observable <em>x</em> con y, el resultado ser&aacute;n todas las iteraciones de <em>x</em> (<em>OnNext</em>), hasta que este se haya completado (<em>OnComplete</em>), y despu&eacute;s toda las que ocurran en el observable&nbsp;<em>y</em>. Las iteraciones que ocurran en <em>y</em> mientras <em>x</em> no ha terminado ser&aacute;n ignoradas. Y si ocurre un error (<em>OnError</em>) en <em>x</em> se terminar&aacute; <em>z</em> con el error. Es un concepto un tanto complejo, pero si echamos un vistazo a su diagrama se entiende r&aacute;pidamente:</p>
<p><img src="/assets/uploads/2012/10/rx-md-concat.png" alt="Rx Concat" width="404" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>En un lenguaje m&aacute;s vulgar, se recogen la iteraciones de <em>x</em> y cuando termina, las de <em>y</em>.</p>
<h2>Catch</h2>
<p>Al igual que cuando hablamos de un bloque <em>try ... catch</em>, este operador recoger&aacute; un error (<em>OnError</em>) que se produzca en el primer operando:</p>
<pre class="brush: csharp">var z = x.Catch(y);</pre>
<p>Al poner esta secuencia, el resultado ser&aacute; semejante a un <em>Concat</em>. Pero la diferencia es que la "se&ntilde;al" que se utiliza para cambiar de&nbsp;<br />operando es un error (OnError). Podemos decir entonces que se recogen todas las iteraciones (<em>OnNext</em>) de <em>x</em> hasta que este falla y entonces se empiezan a recoger las de <em>y</em>.</p>
<p><img src="/assets/uploads/2012/10/rx-md-catch.png" alt="Rx Catch" width="404" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>Si cualquiera de los dos operandos de la operaci&oacute;n terminan (OnComplete) el resultado ser&aacute; que <em>z</em> tambi&eacute;n terminar&aacute;.</p>
<h2>OnErrorResumeNext</h2>
<p>A la gente que ha programado en Visual basic, le sonar&aacute; este comando. Como su buen nombre indica lo que har&aacute; es que si ocurre un error se pase al siguiente y si no seguir&aacute; con el proceso normal.</p>
<pre class="brush: csharp">var z = x.OnErrorResumeNext(y);</pre>
<p>Es decir, realizar&aacute; la misma operaci&oacute;n que un <em>Concat</em>, pero si encuentra un error se comportar&aacute; como un <em>Catch</em>. O dicho con otras palabras, devuelve las iteraciones (<em>OnNext</em>) de <em>x</em>, hasta que ocurre un error (<em>OnError</em>) o es completado (<em>OnComplete</em>), momento en el cual empezar&aacute; a devolver las iteraciones de <em>y</em>.</p>
<p><img src="/assets/uploads/2012/10/rx-md-onerrorresumenext.png" alt="Rx OnErrorResumeNext" width="404" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<h2>Zip</h2>
<p>La operaci&oacute;n <strong>Zip</strong> puede resultar un poco especial. Podr&iacute;amos traducirla al castellano como "cremallera" y la operaci&oacute;n que realiza se asemeja a lo que hace una cremallera al cerrarse. Si nos adentramos en este c&oacute;digo:</p>
<pre class="brush: csharp">var z = x.Zip(y, (oneX, oneY) =&gt; oneX + oneY);</pre>
<p>El resultado esperar&aacute; una iteraci&oacute;n en alguno de los dos objetos observables. Cuando ocurra, esperar&aacute; a que tenga una "respuesta" por parte del otro objeto observable. Es decir, va emparejando las iteraciones (<em>OnNext</em>) de uno y otro observable, aplicando la conversi&oacute;n que especifiquemos:<br /><br /></p>
<p><img src="/assets/uploads/2012/10/rx-mb-zip.png" alt="Rx Zip" align="middle" width="404" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<h2>CombineLatest</h2>
<p>Una operaci&oacute;n que se asemeja con <strong>Zip</strong> es <strong>CombineLatest</strong>. Como su nombre indica combinar&aacute; las &uacute;ltimas iteraciones que se encuentra.</p>
<pre class="brush: csharp">var z = x.CombineLatest(y, (oneX, oneY) =&gt; oneX + oneY);</pre>
<p>Cuando nos encontremos este tipo de c&oacute;digo, sabremos que cada vez que ocurre una iteraci&oacute;n (OnNext) en alguno de los observables, la va a combinar con la &uacute;ltima ocurrida en el otro observable, usando para ello la funci&oacute;n que le hemos pasado como par&aacute;metro:<br /><br /></p>
<p><img src="/assets/uploads/2012/10/rx-md-combinelatest.png" alt="Rx CombineLatest" width="404" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<h2>Repeat</h2>
<p>Teniendo en cuenta que un objeto observable de reactive extensions es adem&aacute;s enumerable, puede ser que necesitemos repetir la &uacute;ltima secuencia que hemos estado observando. En este contexto podr&iacute;amos usar un c&oacute;digo semejante a este:</p>
<pre class="brush: csharp">var z = x.Repeat(3);</pre>
<p>Donde grabaremos en el objeto observable <em>z</em>&nbsp;todas las iteraciones (<em>OnNext</em>) en orden, que han ocurrido en <em>x</em>, y las repetiremos tantas veces como le indiquemos (en este caso 3). Gr&aacute;ficamente se representar&iacute;a as&iacute;:<br /><br /></p>
<p><img src="/assets/uploads/2012/10/rx-md-repeat.png" alt="Rx Repeat" width="454" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<h2>Retry</h2>
<p>Cuando lo que queremos es repetir la secuencia solo en el caso de que obtengamos un error (<em>OnError</em>), usaremos <strong>Retry</strong>.</p>
<pre class="brush: csharp">var z = x.Retry(3);</pre>
<p>Esta operaci&oacute;n volver&aacute; a repetir la secuencia de iteraciones si se produce un error. Y lo intentar&aacute; tantas veces como le indiquemos. Por supuesto que si no obtiene ning&uacute;n error no se repetir&aacute; nunca la secuencia.<br /><br /></p>
<p><img src="/assets/uploads/2012/10/rx-md-retry.png" alt="Rx Retry" width="454" height="152" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p></p>
<h2>Join</h2>
<p>Hablar del m&eacute;todo <strong>Join</strong>&nbsp;es lo mismo que hablar de uni&oacute;n entre dos objetos. Hasta este punto hemos visto dos formas de realizar "uniones" con objetos: <strong>Zip</strong> y <strong>CombineLatest</strong>. La diferencia fundamental de esta funci&oacute;n es que no solo combina parejas o los &uacute;ltimos, si no m&aacute;s bien todas las posibles combinaciones hasta el momento de ocurrir.</p>
<pre class="brush: csharp">var z = x.Join(y, v =&gt; x, v =&gt; y, (oneX, oneY) =&gt; oneX + oneY);</pre>
<p>El formato en este caso es la uni&oacute;n entre x e <em>y</em>, mientras por un lado dure <em>x</em> (<em>v =&gt; x</em>) y por el otro dure <em>y</em>. Y la funci&oacute;n de uni&oacute;n es la especificada en el &uacute;ltimo par&aacute;metro.</p>
<p>Con el c&oacute;digo que acabamos de ver, cada vez que ocurra una iteraci&oacute;n (<em>OnNext</em>) buscar&aacute; todas las iteraciones que han ocurrido en el otro observador y combinar&aacute; esta con todas las anteriores. Un concepto que queda mucho m&aacute;s claro al ver el diagrama:<br /><br /></p>
<p><img src="/assets/uploads/2012/10/rx-md-join.png" alt="Rx Join" width="274" height="219" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<h2>Buffer</h2>
<p>Uno de los m&eacute;todos m&aacute;s &uacute;tiles dentro de las rx, es el de <strong>Buffer</strong>, que nos permite crear bloques de observaci&oacute;n en forma de listas gen&eacute;ricas, en dependencia del tiempo o de un n&uacute;mero de iteraciones. Por ejemplo, imaginemos un escenario donde cada segundo recibimos una iteraci&oacute;n, pero queremos agruparlas cada 3 segundos con el fin de que el usuario no vea refrescada constantemente la interfaz gr&aacute;fica. En este caso podr&iacute;amos usar este c&oacute;digo:</p>
<pre class="brush: csharp">var z = x.Buffer(TimeSpan.FromSeconds(3));</pre>
<p>Y su resultado ser&iacute;a un objeto observable de este tipo: <strong><em>IObservable&lt;IList&lt;T&gt;&gt;</em></strong>. O lo que es lo mismo, cada iteraci&oacute;n de este nuevo objeto observable contendr&aacute; una lista de los objetos que se han almacenado en forma de buffer:<br /><img src="/assets/uploads/2012/10/rx-md-buffer-time.png" alt="Rx Buffer (time)" width="404" height="115" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>Como vemos en el ejemplo anterior, aunque en un segundo no se produzca una iteraci&oacute;n, se guardar&aacute; un buffer con respecto al tiempo. Si lo que deseamos es un resultado semejante a este:</p>
<p><img src="/assets/uploads/2012/10/rx-md-buffer-count.png" alt="Rx buffer (count)" width="404" height="115" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>Lo que tendremos que usar es tambi&eacute;n la funci&oacute;n <strong>Buffer</strong>, pero esta vez con respecto a un contador (y no al tiempo):</p>
<pre class="brush: csharp">var z = x.Buffer(3);</pre>
<h2>Window</h2>
<p>Muchos encontrar&aacute;n que <strong>Window</strong> y <strong>Buffer</strong>&nbsp;tienen un formato semejante. En el caso de <strong>Buffer</strong>&nbsp;creamos una secuencia de paquetes en forma de lista gen&eacute;rica. Sin embargo, cuando usamos&nbsp;<strong>Window</strong>, en lugar de listas, empaquetamos en objetos observables.</p>
<pre class="brush: ">var z = x.Window(3);</pre>
<p>En este caso el diagrama de <em>canicas</em> ser&iacute;a algo as&iacute;:</p>
<p><img src="/assets/uploads/2012/10/rx-md-window-count.png" alt="Rx Window (Counter)" width="357" height="203" style="display: block; margin-left: auto; margin-right: auto;" /></p>
<p>Por lo que el tipo de datos que devuelve esta funci&oacute;n es <strong><em>IObservable&lt;IObservable&lt;T&gt;&gt;</em></strong>. Y podemos usarlo con contador o con respecto el tiempo tambi&eacute;n:</p>
<pre class="brush: csharp">var k = x.Window(TimeSpan.FromSeconds(3));</pre>
<p><br /><br /></p>
<h2>Switch</h2>
<p>Para terminar de describir m&eacute;todos nuevos de las reactive extensions, hablaremos de <strong>Switch</strong>, que es complementario a <strong>Window</strong>, ya que realiza la operaci&oacute;n contraria. Es decir, convierte un objeto <em>IObservable&lt;IObservable&lt;T&gt;&gt;</em> en un simple <strong><em>IObservable&lt;T&gt;</em></strong>.</p>
<pre class="brush: csharp">IObservable&lt;int&gt; x;
/* ... */

var k = x.Window(TimeSpan.FromSeconds(5));

var w = k.Switch();</pre>
<p><br />En este c&oacute;digo, har&iacute;amos que el objeto observable&nbsp;<em>x</em> fuera exactamente igual a <em>w</em>. Podr&iacute;amos decir entonces que <strong>Switch</strong> es el equivalente al deshacer de un comando <strong>Window</strong>.</p>
<p></p>
<h2>Aplicando Rx</h2>
<p>La mejor de las virtudes de las reactive extensions, es su versatilidad. Puede aplicarse en muy diferentes escenarios y solo hay que dejar volar un poco la imaginaci&oacute;n para darnos cuenta de que podemos usarlas para problemas comunes del d&iacute;a a d&iacute;a. Por ejemplo, hace unos meses, <strong>Pablo Nu&ntilde;ez</strong> (<a href="https://twitter.com/#!/pablonete" title="@pablonete" target="_blank">@pablonete</a>) propuso v&iacute;a <strong>twitter</strong> un ejercicio simple de <strong>Linq</strong> que seguro nos hubiera ocupado unas cuantas l&iacute;neas y gracias a rx podemos reducirlo a una:</p>
<p><i>Ejercicio LINQ: Trocear una lista { "a", "1", "b", "2", ...} en sublistas { { "a", "1" }, { "b", "2"}, {...}...}</i></p>
<p>La soluci&oacute;n que podr&iacute;amos deducir con lo estudiado hasta hora podr&iacute;a ser:</p>
<pre class="brush: csharp">var list = new List&lt;string&gt; { "1", "a", "2", "b", "3", "c", "4", "d", ... };
var result = new List&lt;List&lt;string&gt;&gt;();

list.ToObservable().Buffer(2).ObserveOn(Scheduler.Immediate).Subscribe(result.Add);</pre>
<p>Esto no quiere decir que esta sea la mejor soluci&oacute;n, solo una m&aacute;s. Lo que queremos dejar claro en este art&iacute;culo es que <strong>reactive extensions son unas nuevas herramientas aplicables a la mayor parte de los escenarios que manejamos hoy en d&iacute;a</strong>. Nos aportan nuevas operaciones y por lo tanto m&aacute;s versatilidad al lenguaje y la plataforma de desarrollo que usamos.<br /><br /></p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Antes de terminar, quisiera instar al lector a experimentar m&aacute;s m&eacute;todos dentro de las extensiones de <strong>rx</strong>. Ya que aunque en este art&iacute;culo hemos tratado muchos de ellos, no son los &uacute;nicos. Y solo conoci&eacute;ndolos, descubriremos todas sus aplicaciones.</p>
<p>Por hoy me despido y os invito a seguir esta l&iacute;nea de art&iacute;culos, y m&aacute;s a&uacute;n el siguiente donde de verdad la cosa se pone entretenida con la &uacute;ltima variable de la funci&oacute;n que nos definen las<strong> reactive extensions</strong>: <strong>Schedulers</strong>.</p>