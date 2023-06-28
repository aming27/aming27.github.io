---
ID: 208
title: >
  Analizando la seguridad de una
  aplicación en .net
author: fernandoescolar
post_date: 2012-09-18 09:15:52
post_excerpt: ""
layout: post
---
Se han escrito muchas líneas acerca de la seguridad de las aplicaciones que realizamos en .Net. Se dice que son muy fáciles de hackear, que aun usando herramientas de ofuscación, la seguridad de los empaquetados que se distribuyen es nula.
<!--break-->
Así pues, nos hemos propuesto buscar una aplicación comercial realizada con la Framework de .net de Microsoft y saltarnos su seguridad para poder disfrutar de todas las ventajas que tiene, pero sin pasar por caja.

Para evitar problemas legales y que la aplicación se distribuya de forma ilegal, no vamos a publicar su nombre y el método empleado no será del todo completo. Pero si esperamos que el lector comprenda la dificultad y los pasos a dar para conseguir piratear una aplicación.

Antes de empezar hemos tenido que instalar ciertas herramientas y aplicaciones:
<ul>
	<li>Red Gate Reflector</li>
	<li>Reflexil: AddIn para Reflector</li>
	<li>JetBrains dotPeek</li>
	<li>Visual Studio 2010</li>
	<li>Y cómo no, la aplicación que tenemos intención de hackear.</li>
</ul>
Lo primero que hemos hecho es observar la aplicación y encontrar un punto donde no nos deja acceder debido a que no tenemos la versión de pago. Esto ha ocurrido al intentar añadir una cuenta de usuario nueva al sistema.

Hemos decidido abrir el ejecutable con la aplicación Reflector:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-01.png" alt="" width="472" height="454" />

Y nos hemos llevado una grata sorpresa al encontrar indicios del patrón Model-View-ViewModel. Una cosa que hemos aprendido en nuestros años de experiencia es que todo lo que se muestra en pantalla y utiliza este patrón, tiene que pasar por el ViewModel, con lo que no nos ha costado encontrar un lugar concreto donde la aplicación iba a comprobar que tenemos la versión de pago.

A partir de este punto hemos decidido utilizar el dotPeek en lugar de Reflector, ya que trae una serie de herramientas de búsqueda y exploración que no trae (de serie) la anterior herramienta:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-02.png" alt="" width="647" height="604" />

Nos hemos situado en el lugar que sabíamos que la aplicación nos denegaba el acceso. Con la utilidad de buscar todos los usos de una variable, hemos realizado un escaneo, en busca del lugar donde se fija el valor de la variable que dice que no tenemos la versión de pago. Como resultado final hemos alcanzado una función llamada “CheckBoon” en una clase totalmente diferente a las que estábamos buscando en un principio.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-03.png" alt="" width="750" />

Así que hemos vuelto a la herramienta de Reflector para sacarle partido al AddIn previamente instalado: Reflexil.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-04.png" alt="" width="506" height="430" />

Al activarlo encontraremos una nueva ventana debajo del código descompilado con unos símbolos un tanto extraños en una lista. A estos comandos se les denomina IL o Intermediate Language, que es un lenguaje de programación de bajo nivel, en el que se convierten todas las aplicaciones de la plataforma .net, antes de convertirse en byte codes en forma de ensamblado.

La virtud más importante de Reflexil es mostrar, editar y guardar cambios en este lenguaje, para un ensamblado ya compilado. Pero puede surgir el problema de que no todo el mundo conoce IL, y para solventarlo usaremos el Visual Studio.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-05.png" alt="" width="750" />

La forma más simple de conseguir el código IL que necesitamos es escribir una simulación en un proyecto nuevo de Visual Studio para así poder encontrar el código IL con el tándem Reflector+Reflexil:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-06.png" alt="" width="397" height="448" />

Como resultado hemos simulado la función “CheckBoon” con un código semejante al que nos gustaría que tuviera.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-07.png" alt="" width="750" />

Al coger esta nueva aplicación y abrirla con Reflector, encontraremos que Reflexil ya nos ha hecho el trabajo de convertir la función que deseamos a IL.

A partir de aquí nuestro trabajo consistirá en borrar todas las instrucciones de la función original:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-08.png" alt="" width="611" height="558" />

Y añadir nuevas con la misma información (transformando nombres de propiedades y tipos de objeto) que podemos leer en nuestra simulación:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-09.png" alt="" width="552" height="186" />

Además, otra de las ventajas de Reflexil es que nos facilita la tarea con una pequeña herramienta para creación de instrucciones de IL, con un buscador de operadores incluido:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-10.png" alt="" width="486" height="651" />

Una vez tenemos todas las operaciones escritas, el código no cambiará pero el IL sí que estará como queríamos:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-11.png" alt="" width="605" height="428" />

Entonces solo nos quedarán dos acciones, la primera verificar los cambios que hemos realizado dirigiéndonos al panel de nuestra izquierda y en las opciones del ejecutable buscando Reflexil -&gt; Verify:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-12.png" alt="" width="442" height="458" />

Si nos dice que todo está correcto:

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-13.png" alt="" width="240" height="155" />

En el mismo menú encontraremos la opción de guardar, momento en el que recomendamos no usar exactamente el mismo nombre que el ensamblado original por si acaso.

<img style="display: block; margin-left: auto; margin-right: auto;" src="/assets/uploads/2012/10/net-hack-14.png" alt="" width="683" height="480" />

Y ejecutando nuestra versión “parcheada” en lugar de la original ya tendríamos las opciones de una versión de pago sin haber abonado el precio de la aplicación.

Ahora que cada uno saque sus propias conclusiones. Personalmente considero que un desarrollador al que realmente le importe la seguridad, se puede encontrar desolado tras leer este artículo, ya que Microsoft continúa con una asignatura pendiente en el tema de la seguridad de los ensamblado de la plataforma .Net.