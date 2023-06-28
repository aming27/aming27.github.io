---
ID: 171
title: Deuda Técnica
author: fernandoescolar
post_date: 2012-05-29 12:15:18
post_excerpt: ""
layout: post
---
¿Qué desarrollador de software nunca ha estado una semana programando a toda velocidad, casi sin saber que hace, ya que la fecha de entrega está cerca y todo tiene que estar terminado “para ayer”? ¿Quién no se ha encontrado en la situación de saber que está programando una chapuza, pensando que otro día lo mejorará, y ese día nunca llega? ¿Quién alguna vez, al ver una porción de código fuente no ha exclamado indignado: ¡qué narices hace este código! o ¡quién leches lo ha programado!?
<!--break-->
A todo este código lo solemos calificar como chapuzas, apaños, ñapas, mierdecillas… Su problema es que, por lo general, se va extendiendo de forma exponencial y acumulándose a lo largo del desarrollo de un proyecto. Y en consecuencia tenemos como resultado un código fuente que es muy difícil de mantener, extender y reutilizar; y un aplicativo que funcionalmente tiene problemas.

¿Quién no ha pensado alguna vez que le sería más fácil rescribir todo un proyecto que mantenerlo o evolucionarlo?

Al llegar a este punto podríamos pensar que <strong>algo huele dentro del </strong><strong>código</strong>, y  ese olor no es bueno precisamente. Además, así como podemos identificar el olor que emana de nuestra papelera en relación con lo que hemos tirado en ella y cuanto tiempo lleva; también podemos distinguir los diferentes olores de un código fuente.
<h3>¿A qué huele el código?</h3>
En castellano “<em>Code Smells</em>” se traduce como “<em>Olores de código</em>”. Parece ser que fue Kent Beck quien acuñó este concepto a finales de la década de los 90. Pero no se popularizó hasta su aparición en el conocido libro de Martin Fowler: “<em>Refactoring: improving the Design of Existing Code</em>”.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/code-smells.png" alt="" width="424" height="339" />

Los olores de un código fuente, indican por lo general un problema más profundo. La mejor forma que tenemos de tratarlos es evitando hacerlos. Y si por alguna razón no se ha podido evitar, corregirlo lo antes posible.

¿Quién no se ha encontrado con un proyecto organizado anárquicamente, que no hay quien le encuentre lógica? o ¿quién no ha impreso alguna vez una función que ocupa varias páginas de papel? La conclusión es pensar que ese código huele. Pero ¿A qué?

Podemos encontrarnos diferentes olores, pero se resumen, por lo general, en estos 7:
<ul>
	<li><strong>Rigidez</strong>: Cuando algo es rígido significa que no se puede moldear. Un código rígido es aquel que resulta muy difícil de mantener y extender.</li>
</ul>
<ul>
	<li><strong>Fragilidad</strong>: Si alguna vez te has encontrado con un programa que al cambiar un detalle, empieza a fallar en muchos puntos donde no has tocado nada, ya te has encontrado con código frágil. Un código que solemos tratar con miedo y bordeamos para modificarlo lo menos posible, generando así más código mal oliente.</li>
</ul>
<ul>
	<li><strong>Inmovilidad</strong>: Aunque la solución tiene partes que serían interesantes en otros sistemas, el esfuerzo y riesgo de separarlas del resto del código es tan grande que nunca se reutilizan, se vuelven a escribir.</li>
</ul>
<ul>
	<li><strong>Viscosidad</strong>: Podemos definir como viscoso un entorno de desarrollo que es lento e ineficiente. Pero también es viscoso aquel código que es más difícil de usar tal y como está diseñado. Por lo general preferiremos realizar unos “hacks” que programarlo como estaba pensado.</li>
</ul>
<ul>
	<li><strong>Complejidad</strong> innecesaria: Contiene elementos muy complejos difíciles de identificar y entender su utilidad, artefactos y funciones que no se usan, y código que no es útil en absoluto.</li>
</ul>
<ul>
	<li><strong>Repeticiones de código</strong>: la consecuencia de la maniobra informática más conocida del mundo: copiar y pegar. Crear código repetido a lo largo de toda la aplicación implica que no se ha conseguido identificar esas partes y agruparlas en funciones, clases y contextos comunes.</li>
</ul>
<ul>
	<li><strong>Opacidad</strong>: Decimos que un objeto es opaco cuando no se puede ver a través de él. Es decir, un código que es difícil de entender y leer.</li>
</ul>
El problema de generar un código que huele, es que tarde o temprano vas a tener que enfrentarte a él. Y cuando tengas que modificarlo o ampliarlo, puedes cometer el grave error de que las circunstancias te lleven a hacer una chapuza mayor. Siempre amparado en la escusa de no tocarlo demasiado, ya que no entiendes muy bien del todo cómo o incluso qué es lo que hace.

Pensemos ahora en una situación común, en la vida de una persona cualquiera, que gracias al trabajo diario que realiza, recibe un pago de forma mensual. Pero a pesar de tener un poco de dinero todos los meses, nuestro protagonista ha visto un coche que le gusta mucho. El coche cuesta más de lo que cobra en un mes, pero menos de lo que va a cobrar durante todo el año. Es entonces cuando, teniendo en cuenta estos factores, un banco le deja el dinero necesario para adquirir el coche, con la condición de que esta persona se lo vaya devolviendo a lo largo del año. Al suceder esto decimos que esta persona tiene una deuda económica con el banco.

De la misma forma, si creamos código que huele, podemos decir que estamos contrayendo una <strong>deuda técnica con nuestro proyecto</strong>. Ya que algún día tendremos que modificarlo o corregirlo y cuanto más tiempo pase, mayores serán los intereses.
<h3>Endeudando el código</h3>
El término “<em>Technical Debt</em>” (Deuda Técnica) fue introducido en 1992 por Ward Cunningham. Es una metáfora que viene a explicar que la falta de calidad en el código fuente de nuestro proyecto, genera una deuda que repercutirá en sobrecostes, tanto en el mantenimiento de un software, como en la propia operativa funcional de la aplicación.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/technical-debt.png" alt="" width="424" height="339" />

Cuando hablamos de un sobrecoste, puede significar desde tener que dedicarle más tiempo o más desarrolladores de los estimados, hasta acumular malestar general y mal ambiente. Lo que nos puede llevar a rotaciones habituales en el equipo de desarrollo, que nunca tendrá esa experiencia que se adquiere con el tiempo, en cada proyecto específico. En adición, un número elevado de problemas funcionales pueden crear la desconfianza del cliente y unas relaciones tensas con los comerciales, el equipo de desarrollo y en general, todos los involucrados en el proyecto.

Así que, aunque el sobrecoste no se refiera directamente al factor económico, al fin y al cabo, siempre termina repercutiendo negativamente en el precio del proyecto.

Y es que es fácil deducir que a menor calidad de código, mayor probabilidad de que contenga más errores. Además en un código fuente complicado de entender también será mucho más costoso corregir problemas o programar nuevas funcionalidades.

Pero el punto donde si se puede discutir es en determinar la cuantía de este coste.

Mi experiencia personal dice que es bastante elevada, y que ese coste sube de forma exponencial con respecto el tiempo, si no se trata lo antes posible. Pero así como no hay una fórmula maestra que nos calcule la calidad del código, tampoco existe ninguna que nos permita averiguar cuanto va a repercutir la mala calidad en los costes.

El problema es que algunas veces no es tan fácil evitar la deuda técnica. En muchas ocasiones el proyecto o el desconocimiento nos lleva inevitablemente a adquirirla y lo único que podemos hacer es ser conscientes de que está ahí. Y es por esta razón que aparece la necesidad de clasificarla.
<h3>Tipos de deudas</h3>
Es Martin Fowler quien confecciona el <strong>Cuadrante de la Deuda Técnica</strong>, clasificándola según dos factores: La prudencia y la deliberación de incurrir en este tipo de deuda. Combinándolos obtenemos como resultado cuatro tipos posibles:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/technical-debt-cuadrante.png" alt="" width="640" height="411" />
<ul>
	<li>La <strong>deuda prudente y deliberada</strong> es la que se produce cuando somos conscientes de que estamos haciendo las cosas mal, y factores externos nos obligan ha incurrir en deuda técnica que tendremos que pagar posteriormente.</li>
</ul>
<ul>
	<li>La <strong>deuda prudente e inadvertida</strong> aparece en todo proyecto. Y es que todo desarrollador adquiere experiencia a lo largo de un proyecto y llega un momento en el que se da cuenta de que podría haber hecho las cosas mejor, gracias a los conocimientos que ha ido recolectando. Cuando llega este momento, tenemos que evaluar cuando podríamos pagar esta deuda o incluso si merece la pena hacerlo.</li>
</ul>
<ul>
	<li>La <strong>deuda imprudente y deliberada</strong> es la más negativa. Acumular esta deuda es asumir que el proyecto que estamos desarrollando va a tener mala calidad. Puede ser producida por diferentes factores como por ejemplo el poco compromiso de los desarrolladores, una mala gestión en el proyecto, o un compendio de despropósitos.</li>
</ul>
<ul>
	<li>La <strong>deuda imprudente e inadvertida</strong> puede ser el resultado de una falta de formación o experiencia necesaria. Es cuando por desconocimiento se toman las medidas equivocadas en el desarrollo.</li>
</ul>
Probablemente la más peligrosa sea esta última deuda. Las tres primeras pueden ser malas o peores, pero al fin y al cabo, siempre puedes asumirlas e intentar tomar medidas para solucionarlas. Sin embargo la cuarta, debido a su naturaleza, hace que permanezca oculta y pueda repercutir en el fracaso total de un proyecto.

Si queremos que un proyecto llegue a buen puerto, al final siempre tendremos que pagar la deuda técnica que se ha generado.
<h3>Pasando por caja</h3>
La mejor forma de solucionar los problemas de deuda técnica es evitarla. Y para ello un equipo bien formado, comprometido y con una buena base de conocimientos es fundamental.
<h4>Prevenir</h4>
Para tener un software de mayor calidad es muy importante conocer de los <strong>principios básicos de la programación:</strong>
<ul>
	<li><strong>SOLID</strong>: Que es el acrónimo de 5 principios.
<ul>
	<li>Single Responsibility: una clase o función solo debe tener una y solo una razón para existir o ser modificada.</li>
	<li>Open-Close: el código debe estar abierto a la extensión, pero cerrado a modificaciones.</li>
	<li>Liskov Substitution: las clases derivadas, deben poder ser sustituidas por su clase base.</li>
	<li>Interface Segregation: Desgranar las interfaces lo más fino posible, para que sean lo más específicas posible.</li>
	<li>Dependency Inversion: Hay que depender de las abstracciones no de las concreciones.</li>
</ul>
</li>
	<li><strong>KISS</strong> (Keep It Simple, Stupid!): Mantén tu código simple (sencillo) para que cualquier sea capaz de comprenderlo.</li>
	<li><strong>DRY</strong> (Don't Repeat Yourself): No repitas código.</li>
	<li><strong>YAGNI</strong> (You Ain't Gonna Need It): No programes más de la cuenta. Si no lo necesitas, no lo hagas.</li>
</ul>
<strong></strong>Las prácticas de <strong>eXtreme Programming</strong> (también conocido como <strong>XP</strong>) pueden resultar de gran ayuda. Por ejemplo:
<ul>
	<li><strong>TDD</strong>: La técnica de Test Driven Design, establece que hagamos las pruebas unitarias antes que el código. De esta forma conseguiremos tener un código probado 100%. Además tener un código testable, <a href="/2011/11/21/tdd-en-entornos-net-bdc11" target="_blank">conlleva varios beneficios</a>.</li>
	<li><strong>Pair Programing</strong>: Programar por parejas, de tal forma que una persona escriba código pero ambas piensen en la solución. Es un arma de doble filo: dos cabezas piensan mejor que una, pero además si sabes que alguien te está mirando, es muy probable que te lo pienses dos veces antes de hacer una chapuza en el código.</li>
</ul>
Y no hay que olvidar herramientas que nos aportan <strong>métricas de código</strong>, que a pesar de no ser factores que deban comprometer un proyecto, si que nos pueden ayudar a detectar secciones problemáticas.
<h4>Tratar</h4>
Pero no siempre podemos adelantarnos y prevenirla, para estos casos solo podemos acogernos al proceso de <strong>refactoring</strong>. Esto consiste en basándonos en todos los conceptos anteriores, rescribir ciertas partes del código que consideramos que no están del todo correctas.

Antes de empezar a refactorizar un código fuente para pagar la deuda técnica acumulada es muy importante tener <strong>pruebas del código</strong>: unitarias, de integración… Esto será nuestra red de seguridad principal para poder llevar a cabo mejoras del código, estando seguros de que <strong>no estamos rompiendo nada</strong>.
<h4>Informar</h4>
Además el pago de deuda técnica hay que <strong>explicárselo a todos los stakeholders</strong> (todos los involucrados en el proyecto de alguna forma) y hacerles entenderla, aunque a veces sea difícil. En este punto es donde Rodrigo Corral (persona muy reconocida en la comunidad de desarrolladores española con un historial tan grande de éxitos que no caben en este artículo) introduce una herramienta que puede servirnos para explicar a un neófito de la programación qué es lo que se hace al pagar la deuda técnica de un proyecto: <strong>la curva J</strong>.

En economía se conoce como curva J, a esa gráfica que representa como para corregir el balance negativo(-XN) de caja, se recurre a devaluar el valor (D). De esta forma, en un principio prevé una bajada mayor debido a unos costes mayores por culpa de esta devaluación. Pero con el paso del tiempo (Tº), esta situación se revertirá terminando con un saldo positivo mayor (XN). Como la curva resultante tiene una forma semejante a la letra “J” recibe este nombre (aunque personalmente no le encuentro tanto parecido).

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/curva-j.png" alt="" width="476" height="306" />
Así pues, aplicando este concepto al pago de deuda técnica, vamos a poder explicar que vamos a realizar una inversión de tiempo en solucionar parte de esta deuda. En el eje vertical interpretaremos que tenemos la velocidad de producción de nuestro equipo. Y en el eje horizontal el tiempo. Si invertimos en pagar la deuda técnica, nuestro proyecto va a tener una bajada de velocidad del desarrollo, que repercutirá en que no avancemos con la producción de la funcionalidad esperada. Pero al haber conseguido mejorar la calidad del código en un futuro recuperaremos la inversión con creces, porque será más fácil afrontar desarrollos futuros.
<h3>Sobre la rentabilidad</h3>
Por lo general, el pago de deuda <strong>hay que planificarlo</strong>. Encontrar el momento adecuado dentro del ciclo de producción. Hay que tener presente que no hay que enfrentarse a todos los problemas a la vez: <strong>poco a poco será más sencillo</strong> y productivo. Y sobre todo hay que estar seguro de que <strong>se va a obtener un beneficio claro y visible</strong> al invertir en solucionar estos problemas. Lo que se conoce como asegurar el <strong>ROI</strong> (Return of Investment o <strong>Retorno de Inversión</strong>, en castellano).

El ROI es un factor indicativo del rendimiento de una inversión, y la forma de calcularlo coloquialmente es:

<em>ROI = (beneficios - inversión) / inversión</em>

<em></em>Cuanto mayor sea su valor, significa que mejor ha sido el rendimiento obtenido. Para a partir de aquí calcular el porcentaje del rendimiento obtenido, podemos multiplicar el ROI por 100. Por ejemplo si invertimos 1000€ y obtenemos un beneficio de 3000€, entonces (3000 – 1000) / 1000 = 2. Lo que quiere decir que hemos conseguido un rendimineto del 200% de la inversión.

La situación ideal sería poder calcular este factor antes de invertir, pero no existe una respuesta concreta y empírica. No obstante lo que recomendamos es basarse en la experiencia y en una gran cantidad de información, cuanta más mejor. Por ejemplo, preguntando periódicamente al equipo de desarrollo, qué mejoraría o cambiaría en el proyecto.

&nbsp;

A lo largo de este artículo hemos explicado qué es el código que huele, cómo nos lleva a generar deuda técnica y hemos realizado una introducción a sus posibles soluciones. En futuras publicaciones trataremos de explicar como afrontar más concretamente un código heredado (legacy) plagado de deuda técnica. Así que os recomendamos estar atentos...