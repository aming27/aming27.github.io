---
ID: 1198
title: 'La peque&ntilde;a gran gu&iacute;a sobre Load Tests'
author: fernandoescolar
post_date: 2013-10-21 09:41:58
post_excerpt: ""
layout: post
---
Las pruebas de carga se usan para observar y analizar un sistema en unas circunstancias específicas. Por ejemplo, podríamos crear un portal web en el que esperamos un número determinado de usuarios. Y antes de ponerlo en producción queremos estar seguros de que se va a comportar correctamente cuando lleguemos al cupo esperado.
<!--break-->
La idea es montar un entorno de pruebas que simule estas condiciones y así monitorizar los servidores implicados, en busca de unas estadísticas. El resultado de ejecutar este tipo de prueba es una gran cantidad de datos que nos informarán de si el sistema se ha comportado como esperábamos y qué cuellos de botella se han encontrado.

Hay que tener cuidado y no confundir las pruebas de estrés con pruebas de carga. Las de estrés tratan de llevar al límite un sistema, para poder observar si tiene estabilidad en condiciones difíciles y encontrar cual es el máximo que le podemos pedir antes de que empiece a fallar. Mientras que las de carga, aunque son muy parecidas y de una se puede sacar la otra cambiando unos parámetros de la configuración, no buscan llegar al límite. Solo observar el comportamiento en unas condiciones normales/esperadas.

A lo largo de este artículo vamos a tratar varios temas, y puede ser que resulte algo denso. La intención no es explicar todos los detalles de este tipo de pruebas, ya que sería una labor titánica. Simplemente mostraremos las actuaciones típicas que solemos realizar en nuestros proyectos:

<ul id="index">
<li><a href="#environment">Entorno de test</a></li>
<li><a href="#web-performance">Creando un test de web performance</a></li>
<li><a href="#custom-rules">Custom extraction rules and validators</a></li>
<li><a href="#load-test">Configurando el test de carga</a></li>
<li><a href="#executing">Ejecutando y explotando los resultados</a></li>
<li><a href="#pal">PAL: Performance Analysis Logs</a></li>
<li><a href="#summary">Conclusiones</a></li>
</ul>

&nbsp;
<h2 id="environment">Entorno de test</h2>
Antes de empezar a trabajar tenemos que tener licencias e imágenes de dvd de Visual Studio Ultimate y los Visual Studio Agents. Todo este software se puede encontrar en una cuenta de MSDN con licencia Ultimate. Los test de carga no pueden ser ejecutados desde un Visual Studio de licencia inferior, simplemente no tendrá las opciones.

La idea de todo entorno para este tipo de pruebas es usar:
<ul>
	<li>Un ordenador con Visual Studio como cliente que solicita el lanzamiento de una prueba y muestra los resultados.</li>
	<li>Un controlador que sirve para orquestar la ejecución de las pruebas y recolectar los datos.</li>
	<li>Una serie de agentes cuya misión es simular el escenario, ejecutar las pruebas.</li>
</ul>
<a href="/assets/uploads/2013/10/Entorno-de-pruebas.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="Entorno de pruebas" alt="Entorno de pruebas" src="/assets/uploads/2013/10/Entorno-de-pruebas_thumb.png" width="356" height="309" border="0" /></a>

Para tener este entorno se recomienda bien crear una serie de máquinas virtuales en azure o bien físicamente poseer estos equipos e instarles el software de Visual Studio Test Agent o Test Controller según corresponda.

<a href="/assets/uploads/2013/10/controller-config.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="controller-config" alt="controller-config" src="/assets/uploads/2013/10/controller-config_thumb.png" width="383" height="449" border="0" /></a>

En la configuración del controlador se nos solicitará la cuenta que va a ejecutar el servicio, opcionalmente si queremos registrar el controlador en un TFS (para ejecutar las pruebas desde ahí) y por último, un servidor de base de datos donde almacenar los resultados.

<a href="/assets/uploads/2013/10/agent-config.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="agent-config" alt="agent-config" src="/assets/uploads/2013/10/agent-config_thumb.png" width="389" height="397" border="0" /></a>

En cuanto a los agentes, después de preguntar si deseamos ejecutar el agente como un proceso interactivo o como un servicio (recomendamos esta última), deberemos especificar la cuenta encargada de ejecutar el servicio y cuál es el equipo que tiene instalado el controlador.

En la nueva versión de Visual Studio 2013 no tendremos la obligación de crear este entorno, ya que los tests de carga se podrán ejecutar directamente en el TFService (azure):

<a href="/assets/uploads/2013/10/vs2013-tfs-controller.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="vs2013-tfs-controller" alt="vs2013-tfs-controller" src="/assets/uploads/2013/10/vs2013-tfs-controller_thumb.png" width="517" height="337" border="0" /></a>

Bastará con configurar un archivo de Test Settings y especificarlo. Luego en el Team Explorer habrá que conectarse con una cuenta de TFService (TFS en la nube) y ya se ejecutarán allí automáticamente.

Para terminar con las configuraciones a parte de esto, también tendremos que desplegar nuestro aplicativo de tal forma que sea accesible por el entorno que hemos creado. Pero esto ya depende de cada uno…

<a href="#index">Volver al índice</a>
&nbsp;
<h2 id="web-performance">Creando un test de web performance</h2>
Un test de carga está compuesto por un conjunto de juegos de prueba que pueden ser de todo tipo. Pero en el caso de querer probar una aplicación web, lo más recomendable es generar ese juego de pruebas que vamos a ejecutar en formato de Web Performance Tests.

Un Web Performance Test está compuesto por una serie peticiones web, dentro de estas peticiones podemos especificar varias propiedades. Además podemos crear unas reglas para extraer datos que vienen en la respuesta y unos validadores que nos ayudarán a saber si el resultado de esa petición es el esperado.

Para crear un Web Performance Test vamos a necesitar tener primero un proyecto de tipo de load test abierto. Entonces a este proyecto le añadimos un nuevo elemento de tipo Web Permormance Test y se nos abrirá una ventana de Internet Explorer con el plugin Web Test Recorder a mano izquierda:

<a href="/assets/uploads/2013/10/web-test-recorder-1.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-recorder-1" alt="web-test-recorder-1" src="/assets/uploads/2013/10/web-test-recorder-1_thumb.png" width="623" height="321" border="0" /></a>

Nuestra misión ahora será ir ejecutando un caso de prueba desde nuestra web. Por ejemplo puede ser realizar una búsqueda:

<a href="/assets/uploads/2013/10/web-test-recorder-2.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-recorder-2" alt="web-test-recorder-2" src="/assets/uploads/2013/10/web-test-recorder-2_thumb.png" width="623" height="321" border="0" /></a>

Una vez hayamos terminado presionamos en el botón de Stop. Entonces volverá a aparecer en primer plano el Visual Studio con las request capturadas dentro de nuestro test. Ahí el sistema analizará las relaciones entre las peticiones. Es decir, que si por ejemplo un input de tipo hidden tiene un valor que se pasa en un post de un formulario, hacerlo dinámicamente, sin que nosotros tengamos que especificarlo. Una vez haya realizado estas comprobaciones tendremos algo como esto:

<a href="/assets/uploads/2013/10/web-test-1.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-1" alt="web-test-1" src="/assets/uploads/2013/10/web-test-1_thumb.png" width="308" height="271" border="0" /></a>

Aquí vemos que hemos realizado dos peticiones, una a la página principal y otra que es la búsqueda, que contiene una serie de datos en forma de parámetros. Una de las primeras acciones que es recomendable hacer es parametrizar los servidores web, presionando el segundo botón del ratón y seleccionando la opción de Parameterize Web Servers. Aquí nos propondrá una variable de contexto con nuestro nombre de servidor. Así si cambiamos de entorno, solo tenemos que modificar el valor de este parámetro.

<a href="/assets/uploads/2013/10/web-test-2.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-2" alt="web-test-2" src="/assets/uploads/2013/10/web-test-2_thumb.png" width="314" height="327" border="0" /></a>

Ahora veremos que opciones tenemos de configuración por cada petición. Si marcamos la primera por ejemplo, en la ventana de propiedades encontraremos algo parecido a esto:

<a href="/assets/uploads/2013/10/web-test-3.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-3" alt="web-test-3" src="/assets/uploads/2013/10/web-test-3_thumb.png" width="311" height="380" border="0" /></a>

Aquí podremos modificar todos los datos de la request, como por ejemplo si vamos a usar Caché (nos puede interesar o no en este tipo de pruebas), si esperamos un código HTTP de respuesta concreto o el Think Time. Este último es importante ya que nos ayudará a imitar el comportamiento de un usuario de verdad. El Think Time es el tiempo que se añade después de esta request, en el que simulamos que un usuario puede tardar en leer, hacer clic o escribir algo en pantalla. Su valor equivale a la cantidad de segundos que se esperará para ejecutar la siguiente petición web.

Si pulsamos con el segundo botón del ratón sobre una de las peticiones aparecerán ante nosotros un buen número de opciones:

<a href="/assets/uploads/2013/10/web-test-4.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-4" alt="web-test-4" src="/assets/uploads/2013/10/web-test-4_thumb.png" width="364" height="385" border="0" /></a>

Las primeras opciones están relacionadas con la prueba y las demás con la petición seleccionada. A nivel de prueba podremos:
<ul>
	<li>Insertar una request manuamente.</li>
	<li>Crear una transacción. Esto es un conjunto de peticiones web agrupadas. Podría ser una operación completa, como por ejemplo varias request que son necesarias para añadir un nuevo usuario en el sistema. Al final se nos mostrarán estadísticas concretas respecto a las transacciones de nuestros tests.</li>
	<li>Podríamos crear un bucle, que nos permitiría repetir un conjunto de peticiones según varias cosas, como por ejemplo un número determinado de veces o incluso mientras una condición ocurra o no.</li>
	<li>Cuando añadimos una condición, podemos dividir la prueba en diferentes partes dependiendo de cómo se encuentre el escenario.</li>
	<li>También podríamos añadir un comentario, por si es necesario especificar algo determinado.</li>
	<li>Añadir una llamada a otro Web Test que hayamos creado.</li>
	<li>Y por último volver a grabar en Internet Explorer una serie de peticiones y añadirlas.</li>
</ul>
Con respecto a las opciones referentes a la petición seleccionada encontraremos:
<ul>
	<li>Podemos añadir peticiones dependientes, que podrían ser por ejemplo llamadas a servicios vía Ajax dentro de una carga asíncrona. En realidad en el tiempo de ejecución el sistema encontrará varias peticiones dependientes, por lo que por lo general, en un escenario normal, no añadiremos nada aquí. En todo caso nuestra misión podría ser recoger una request posterior y moverla a esta sección.</li>
	<li>Añadir una cabecera que no haya detectado.</li>
	<li>Añadir parámetros de Query String, que son los que vienen con la URL.</li>
	<li>También podemos crear nuevos parámetros de tipo formulario.</li>
	<li>O simular un POST de un archivo.</li>
	<li>Cada petición puede tener una serie de validadores que pueden ir desde encontrar algún contenido concreto hasta lo que queramos crear. Si la validación falla, entonces el test dará error.</li>
	<li>Otra característica importante son las reglas de extracción. Dentro de una petición puede haber un dato que sea de interés para las peticiones venideras. Si usamos un extractor, el dato quedará almacenado en el contexto de la prueba. Este contexto es común para todas las peticiones de la misma.</li>
	<li>Podemos ayudarnos de plugins para aislar código que se ejecuta antes y/o después de una petición.</li>
	<li>La opción de buscar y remplazar busca todas las coincidencias de un texto y las remplaza por algo nuevo.</li>
	<li>Y por último las conocidas opciones de copiar, cortar y pegar, a las que estamos acostumbrados.</li>
</ul>
Como hemos dicho antes, un Web Performance Test posee un contexto de ejecución que es común para todas las peticiones que contiene. En este contexto podemos crear y borrar datos para ponerlos a disposición de ciertas peticiones que lo necesiten. Para hacer uso de estas variables de contexto se ha creado un sistema “plantillado” para poner valor a los parámetros (uri, headers, querystring o form body). Consiste en usar el mismo nombre con el que hemos guardado el dato entre dos llaves: {{mi_valor_del_contexto}}. El ejemplo más claro de esto lo veremos en nuestro test, al parametrizar el servidor web, que ha cambiado todas las URI de las peticiones para que contengan “{{WebServer1}}” en lugar del nombre del servidor.

Para cambiar los valores y sustituirlos por parámetros, tendremos que seleccionar uno de ellos y en la ventana de propiedades veremos esta serie de opciones:

<a href="/assets/uploads/2013/10/web-test-5.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-5" alt="web-test-5" src="/assets/uploads/2013/10/web-test-5_thumb.png" width="352" height="304" border="0" /></a>

Como vemos en la captura, podremos cambiar el valor por uno de los parámetros contextuales, o incluso añadir una fuente de datos como podría ser un Excel o un XML, de donde podremos recogerlos. Si el parámetro que queremos usar no se encuentra en el listado, podremos escribir el literal con las llaves.

Una vez que tenemos el test a nuestro gusto, podremos ejecutarlo y en los resultados observaremos todo lo que ha ido pasando.

<a href="/assets/uploads/2013/10/web-test-6.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="web-test-6" alt="web-test-6" src="/assets/uploads/2013/10/web-test-6_thumb.png" width="583" height="195" border="0" /></a>

Si observamos detenidamente los detalles, veremos que no solo ha cargado las requests que le hemos definido, si no que se ha ido operando como un navegador de internet: descargando el contenido dependiente y respondiendo de la forma correcta cuando se encuentre escenarios que lo requieran.

<a href="#index">Volver al índice</a>
&nbsp;
<h2 id="custom-rules">Custom extraction rules and validators</h2>
Aunque existen ya de por si muchas reglas de extracción y validación; puede ser que estas no se ciñan a nuestras necesidades específicas. Aunque antes de desarrollar una nueva recomendamos echar un vistazo a todas las opciones, ya que incluso existe una norma de extracción genérica donde podemos introducir una expresión regular.

Para crear una regla de extracción simplemente heredaremos de la clase base “ExtractionRule”, añadiremos unos decoradores de descripción y nombre, para que se muestre en los diálogos de configuración de una forma correcta, y sobrescribiremos la función de “Extract”:
<pre class="brush: csharp">[Description("This is a demo extraction rule")]
[DisplayName("My Custom Extraction Rule")]
public class CustomExtractionRule : ExtractionRule
{
    public override void Extract(object sender, ExtractionEventArgs e)
    {
        var bodyText = e.Response.BodyString;
        // search something ...
        e.WebTest.Context[this.ContextParameterName] = found;
    }
}</pre>
Lo que tendremos que hacer en el método de extracción será recoger un dato de la respuesta del servidor y añadirlo al contexto para que esté disponible para otras pruebas venideras. Es simple, pero a la vez podemos complicarlo todo lo que queramos.

En cuanto a las reglas de validación, funcionan con la misma dinámica, con la diferencia de que heredaremos de la clase “ValidationRule” y el método que sobrescribiremos será “Validate”:
<pre class="brush: csharp">[Description("This is a demo validation rule")]
[DisplayName("My Custom Validation Rule")]
public class CustomValidationRule : ValidationRule
{
    public override void Validate(object sender, ValidationEventArgs e)
    {
        var bodyText = e.Response.BodyString;
        // validate something
        e.IsValid = result;
        e.Message = result ? "Ok" : "Something went wrong";
    }
}</pre>
Una vez hayamos validado la información que nos interesa, indicaremos los resultados en los argumentos de la función. Si la regla de validación responde como que no es válido, la prueba que se está ejecutando en ese momento, será fallida.

<a href="#index">Volver al índice</a>
&nbsp;
<h2 id="load-test">Configurando el test de carga</h2>
Una vez hemos creado un buen juego de pruebas web, concretamente las que consideramos que van a realizar los usuarios en el sistema, ya podemos definir una prueba de carga.

Para esto, añadiremos a la solución un nuevo Load Test. Al hacerlo aparecerá una ventana tipo Wizard, que nos guiará en el proceso de definición de la prueba.

<a href="/assets/uploads/2013/10/load-test-1.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-1" alt="load-test-1" src="/assets/uploads/2013/10/load-test-1_thumb.png" width="556" height="340" border="0" /></a>

En la primera pestaña relevante tendremos que dar un nombre a un escenario. Un Load Test puede contener más de un escenario. Y un escenario no es más que un contexto de ejecución con sus normas y comportamientos correspondientes.

También tendremos que decidir el perfil para cálculos de Think Time. Esto es el tiempo de espera entre peticiones, un valor que ya asignamos a la hora de crear los Web Permormance Tests. Se nos propondrá usar el valor que ya tenemos grabado, usar una distribución normal según el valor que grabamos (+-20%) o no usar Think Times.

Y por último podremos especificar el Think Time entre cada una de las iteraciones de la propia prueba de carga.

<a href="/assets/uploads/2013/10/load-test-2.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-2" alt="load-test-2" src="/assets/uploads/2013/10/load-test-2_thumb.png" width="555" height="339" border="0" /></a>

En las siguientes páginas seguiremos definiendo las características de escenario. En la segunda tendremos que señalar la forma en la que queremos simular los diferentes usuarios del sistema y su número. Tendremos la opción de que un número constante de usuarios esté conectado o bien hacer una carga progresiva, esperando con un número inferior que se va incrementando hasta un punto determinado con el tiempo.

Aunque la página que nos tocaría ahora sería la de Text Mix Model, personalmente prefiero antes visitar la de Text Mix, donde definiremos las pruebas que cada usuario va a lanzar:

<a href="/assets/uploads/2013/10/load-test-4.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-4" alt="load-test-4" src="/assets/uploads/2013/10/load-test-4_thumb.png" width="559" height="341" border="0" /></a>

Básicamente tendremos que ir añadiendo o borrando Web Performance Test a la lista y distribuirlos de la forma que nos parezca más correcta. Por ejemplo, si un usuario realiza una búsqueda, podríamos pensar que lo normal sería que visitara los resultados de esa búsqueda, antes que realizar una nueva. Por lo que si hacemos dos pruebas web para estas actividades, la correspondiente a la búsqueda tendrá un porcentaje menor, para que se ejecute menos veces.

Como nota, si queremos añadir una prueba y vemos que no está en el listado que se nos propone, quizá es que primero tengamos que compilar la solución. Entonces al intentarlo de nuevo veremos que ahora si aparece.

<a href="/assets/uploads/2013/10/load-test-3.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-3" alt="load-test-3" src="/assets/uploads/2013/10/load-test-3_thumb.png" width="562" height="343" border="0" /></a>

Volviendo atrás a la página de Test Mix Model, lo que vamos a tener que decidir es cómo queremos que los usuarios simulados vayan ejecutando las pruebas definidas en el Test Mix:
<ul>
	<li>Basados en el número total de pruebas: el sistema irá administrando a los usuarios para que entre todos, los porcentajes de distribución sean los especificados.</li>
	<li>Basándonos en el número total de usuarios virtuales: el sistema determinará cuantas pruebas va a ejecutar cada usuario, distribuyéndolas de tal forma que en cualquier momento de la ejecución del Load Test, este tenga el porcentaje especificado de distribución.</li>
	<li>Basado en el ritmo de cada usuario: en este modelo se asignará un número total de pruebas por usuario y por hora. Así habrá usuarios con un ritmo más alto que otros y se puede generar un escenario con peticiones más anárquicas, no todas a la vez.</li>
	<li>Basado en el orden secuencial: cada usuario ejecutará las pruebas en el orden que se ha especificado y cuando termine volverá a empezar.</li>
</ul>
Aquí no hay ninguna recomendación, cada uno tendremos que decidir cual se ajusta mejor al escenario que queremos definir.

<a href="/assets/uploads/2013/10/load-test-5.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-5" alt="load-test-5" src="/assets/uploads/2013/10/load-test-5_thumb.png" width="555" height="339" border="0" /></a>

En la siguiente pantalla se nos permitirá definir el Network Mix. Esto no es más que el porcentaje de conexiones que vendrán de los diferentes tipos de redes. Por defecto Visual Studio tiene definidos unos cuantos, pero si quisiéramos crear un tipo de red que sea diferente tenemos aquí un artículo que nos puede ayudar mucho:

<a href="http://blogs.msdn.com/b/rubel/archive/2011/06/05/load-test-how-to-create-a-custom-network-profile-for-network-emulation.aspx">http://blogs.msdn.com/b/rubel/archive/2011/06/05/load-test-how-to-create-a-custom-network-profile-for-network-emulation.aspx</a>

<a href="/assets/uploads/2013/10/load-test-6.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-6" alt="load-test-6" src="/assets/uploads/2013/10/load-test-6_thumb.png" width="554" height="339" border="0" /></a>

La última característica que vamos a definir del escenario es el Browser Mix. Porque podría ser que tuviéramos un comportamiento en la página web diferente en dependencia del navegador, como por ejemplo si te conectas desde un dispositivo móvil. Aquí lo más recomendable es ser consecuente con el escenario donde se va a distribuir nuestra aplicación. No es lo mismo ponerla en una zona pública, donde tendremos que dejarnos guiar por las estadísticas normales de internet; que en la intranet de la empresa donde solo dejan usar Internet Explorer 8.

<a href="/assets/uploads/2013/10/load-test-7.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-7" alt="load-test-7" src="/assets/uploads/2013/10/load-test-7_thumb.png" width="558" height="341" border="0" /></a>

Cuando ya hemos terminado de definir el escenario tocará el turno de añadir los servidores que ejecutan la aplicación y los contadores de los mismos que queremos observar. Por ejemplo, si tenemos un servidor de base de datos, añadiremos su nombre host y solo marcaremos los contadores de SQL.

Una nota aquí es que los servicios remotos de logs y alertas de performance tendrán que estar iniciados en la máquina servidora para poder recoger estos datos.

<a href="/assets/uploads/2013/10/load-test-8.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-8" alt="load-test-8" src="/assets/uploads/2013/10/load-test-8_thumb.png" width="559" height="342" border="0" /></a>

La última página del Wizard será la que defina los datos correspondientes a la ejecución de la prueba de carga:
<ul>
	<li>La duración: donde podremos especificar un warm-up (tiempo que se espera para que los servicios se levanten) y un tiempo de duración de la prueba. O si lo preferimos un número concreto de iteraciones.</li>
	<li>El sampling rate: que es el tiempo que pasa entre la recogida de datos de los contadores de las máquinas que hemos decidido observar. Cuanto mayor sea este valor, los datos serán menos exactos. Pero querer capturar datos cada segundo puede acabar con que nuestra prueba pierde más tiempo recolectando información que ejecutando la prueba en sí.</li>
	<li>Una descripción.</li>
	<li>Si queremos grabar logs cuando haya fallo en una prueba concreta.</li>
	<li>Y el nivel de validación.</li>
</ul>
Una vez hayamos finalizado el proceso se nos abrirá una ventana con los detalles de la prueba de carga:

<a href="/assets/uploads/2013/10/load-test-9.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-9" alt="load-test-9" src="/assets/uploads/2013/10/load-test-9_thumb.png" width="279" height="427" border="0" /></a>

Seleccionando cada componente y mirando en la ventana de propiedades podremos cambiar toda la configuración que hemos creado en el Wizard. Además presionando con el segundo botón del ratón podremos entrar en ventanas similares a las que usamos durante la creación del Load Test.

Aquí habrá dos puntos en los que habrá que detenerse a mirar, ya que nos aporta ciertas opciones extras que anteriormente no hemos tenido la posibilidad de configurar.

Si pulsamos sobre Run Settings, el que esté activo, en la ventana de propiedades veremos muchas más opciones de las que definimos. Cosas como gestión de errores o guardar logs de ejecución (no solo cuando fallen), hasta el cool-down time, que no es más que un tiempo que se espera a que las pruebas paren, para dar tiempo al sistema a estabilizarse después de una ejecución.

Y por último si tuviéramos un escenario en el que el usuario realiza una actividad antes de empezar con todas las pruebas (como por ejemplo un login) y/o otra para terminarlas (como por ejemplo un logout), podremos crear un Web Permormance Test para realizar estas actividades y añadirlo al inicio o al final de toda la duración de la prueba.

Para ello tendremos que con el segundo botón del ratón pulsar sobre Text Mix. Allí seleccionaremos la opción de Edit Test Mix. En la nueva pantalla que aparecerá veremos en la parte inferior unas opciones de añadir una prueba que se inicia antes que el resto de pruebas sean ejecutadas, una vez para cada usuario y otra para la de después:

<a href="/assets/uploads/2013/10/load-test-10.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="load-test-10" alt="load-test-10" src="/assets/uploads/2013/10/load-test-10_thumb.png" width="504" height="419" border="0" /></a>

Aquí podremos marcar la casilla y seleccionar la prueba que se dedica a esa actividad.

<a href="#index">Volver al índice</a>
&nbsp;
<h2 id="executing">Ejecutando y explotando los resultados</h2>
Antes de ejecutar nuestras pruebas de carga tendremos que configurar los Test Settings. En todo proyecto de pruebas de carga tiene que haber a nivel de solución un archivo de configuración de la prueba, podríamos crear uno nuevo si no existe o varios diferentes para poder ejecutar las pruebas en diferentes entornos.

<a href="/assets/uploads/2013/10/test-settings-1.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-settings-1" alt="test-settings-1" src="/assets/uploads/2013/10/test-settings-1_thumb.png" width="372" height="191" border="0" /></a>

Al hacer doble clic en un archivo de Test Settings nos aparecerá una nueva ventana donde podemos configurar la ejecución de las pruebas:

<a href="/assets/uploads/2013/10/vs2013-tfs-controller1.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="vs2013-tfs-controller" alt="vs2013-tfs-controller" src="/assets/uploads/2013/10/vs2013-tfs-controller_thumb1.png" width="527" height="344" border="0" /></a>

En la primera página encontraremos la descripción de la configuración y podremos decidir, solo si estamos en VS2013, si queremos ejecutarlos en un controlador local o usando el de Team Foundation.

Si elegimos ejecutar las pruebas en una máquina local o un Test Controller, aparecerán nuevas opciones. Una de las más significativas es la de Roles:

<a href="/assets/uploads/2013/10/test-settings-2.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-settings-2" alt="test-settings-2" src="/assets/uploads/2013/10/test-settings-2_thumb.png" width="531" height="347" border="0" /></a>

Aquí tendremos que especificar si queremos usar el propio Visual Studio local o una máquina remota que es el controlador. Si marcamos esta última, tendremos que indicar el host del controller.

Otra página en la que podríamos tener que configurar algo especial, es la de Deployment. Cuando nuestras pruebas necesiten referencias a ensamblados que no son el propio ensamblado de la prueba, tendremos que añadir estos ensamblados en como elementos que hay que desplegar junto con la propia prueba. Un ejemplo de esto podría ser un ensamblado donde guardamos normas de extracción y validación que usamos en los tests.

El resto de opciones como los diagnósticos y demás, podemos dejarlos con los valores por defecto, en un principio.
Para terminar con la configuración previa en el menú de Load Test de Visual Studio tendremos que activar la configuración que queramos usar:

<a href="/assets/uploads/2013/10/test-settings-3.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-settings-3" alt="test-settings-3" src="/assets/uploads/2013/10/test-settings-3_thumb.png" width="536" height="219" border="0" /></a>

Ahora bastará con abrir la prueba de carga y presionar el botón de ejecución de las pruebas de carga. Visual Studio se conectará con el controlador que hemos especificado y este orquestará esta ejecución enviándonos datos de diagnóstico en tiempo real, que podremos ver desde el propio Visual Studio.

<a href="/assets/uploads/2013/10/test-execution.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-execution" alt="test-execution" src="/assets/uploads/2013/10/test-execution_thumb.png" width="648" height="390" border="0" /></a>

Aquí podremos ver gráficas estándar o crear las nuestras propias seleccionando contadores que vemos a mano izquierda. También tendremos unas tablas a modo resumen. Así que solo nos quedará esperar a que nuestra prueba de carga termine.

Una vez terminen las pruebas podremos ver el resultado completo que el controlador almacenará en la base de datos que indicamos.

<a href="/assets/uploads/2013/10/test-results.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-results" alt="test-results" src="/assets/uploads/2013/10/test-results_thumb.png" width="647" height="360" border="0" /></a>

Tanto en las gráficas como en las tablas podremos ver si hay algún contador extraño que ha ido demasiado arriba, si por ejemplo vemos que no se libera bien la memoria de la aplicación, o simplemente si los tiempos de respuesta son los que esperábamos.

Otro detalle que nos puede ayudar a luego diferenciar las pruebas que hemos ido lanzando es añadir una descripción. Para ello tendremos que pulsar en el icono señalado y en el campo descripción añadir un comentario. Después al buscar resultados de la ejecución de esta prueba, encontraremos este campo de descripción que nos ayudará a identificarla:

<a href="/assets/uploads/2013/10/test-results-description.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-results-description" alt="test-results-description" src="/assets/uploads/2013/10/test-results-description_thumb.png" width="641" height="301" border="0" /></a>

Por último, para acceder a estos resultados, tendremos que abrir el archivo del test de carga y en el menú contextual seleccionar la opción de abrir resultados de tests:

<a href="/assets/uploads/2013/10/test-results-open.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="test-results-open" alt="test-results-open" src="/assets/uploads/2013/10/test-results-open_thumb.png" width="390" height="314" border="0" /></a>

<a href="#index">Volver al índice</a>
&nbsp;
<h2 id="pal">PAL: Performance Analysis Logs</h2>
PAL (<a href="https://pal.codeplex.com/)">https://pal.codeplex.com/)</a> es una herramienta desarrollado por Clint Huffman, con la ayuda de Microsoft, que realiza un análisis de los contadores de rendimiento del sistema, en busca de los thresholds conocidos.

Básicamente nos ayudará a crear unos contadores que podremos activar en los servidores de nuestra aplicación y luego los analizará y nos devolverá un documento con gráficas y umbrales que nos harán la vida más fácil.

Para usarlo solo tendremos que ir a la página web del proyecto, descargarlo e instalarlo. Y entonces nos tendremos que plantear qué datos y de qué servidores queremos recolectar.

Lo primero que haremos es generar los contadores, para eso abriremos PAL y en la página de Threshold File, encontraremos en un combobox varias plantillas ya creadas. Generalmente suelo usar la de SQL Server y la IIS. La idea es exportar estas plantillas para luego llevarlas a nuestros servidores y activar esos contadores:

<a href="/assets/uploads/2013/10/pal-1.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-1" alt="pal-1" src="/assets/uploads/2013/10/pal-1_thumb.png" width="555" height="442" border="0" /></a>

Ahora recogeremos el archivo xml resultante y lo llevaremos a nuestro servidor. Dentro del servidor abriremos el Performance Monitor:

<a href="/assets/uploads/2013/10/pal-2.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-2" alt="pal-2" src="/assets/uploads/2013/10/pal-2_thumb.png" width="566" height="365" border="0" /></a>

En Data Collector Sets tendremos que crear uno nuevo, al presionar en la opción se nos abrirá un nuevo dialogo, donde le daremos un nombre y le indicaremos que queremos basar el contador en una plantilla:

<a href="/assets/uploads/2013/10/pal-3.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-3" alt="pal-3" src="/assets/uploads/2013/10/pal-3_thumb.png" width="483" height="371" border="0" /></a>

En la siguiente página tendremos que presionar sobre “browse” y buscar el archivo que exportamos del PAL.

<a href="/assets/uploads/2013/10/pal-4.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-4" alt="pal-4" src="/assets/uploads/2013/10/pal-4_thumb.png" width="480" height="369" border="0" /></a>

Ahora ya podemos finalizar el Wizard.

Cada vez que vayamos a ejecutar una prueba de carga, solo tendremos que ir al servidor, al Performance Monitor y activar el contador que hemos creado. Cuando la prueba termine lo pararemos e iremos a buscar los resultados a la ruta por defecto: “c:\PerfLogs\Admin\[Nombre del contador]”.

<a href="/assets/uploads/2013/10/pal-5.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-5" alt="pal-5" src="/assets/uploads/2013/10/pal-5_thumb.png" width="465" height="208" border="0" /></a>

Una vez ha terminado deberíamos encontrarnos con una serie de archivos parecida a esta:

<a href="/assets/uploads/2013/10/pal-6.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-6" alt="pal-6" src="/assets/uploads/2013/10/pal-6_thumb.png" width="618" height="152" border="0" /></a>

Para obtener nuestro informe tendremos que abrir PAL de nuevo e indicarle que este es nuestro documento de entrada:

<a href="/assets/uploads/2013/10/pal-7.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-7" alt="pal-7" src="/assets/uploads/2013/10/pal-7_thumb.png" width="553" height="441" border="0" /></a>

En la página de Counter Log seleccionaremos el archivo.

<a href="/assets/uploads/2013/10/pal-11.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-1" alt="pal-1" src="/assets/uploads/2013/10/pal-1_thumb1.png" width="555" height="442" border="0" /></a>

En Thershold File tendremos que volver a seleccionar el perfil que hemos tratado.

<a href="/assets/uploads/2013/10/pal-8.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border: 0px;" title="pal-8" alt="pal-8" src="/assets/uploads/2013/10/pal-8_thumb.png" width="544" height="434" border="0" /></a>

Una vez termine se abrirá una nueva ventana del explorador de internet con un informe muy completo sobre nuestro sistema. Y es muy recomendable leerlo entero en busca de los posibles problemas que se han podido encontrar en el sistema.

<a href="#index">Volver al índice</a>
&nbsp;
<h2 id="summary">Conclusiones</h2>
A lo largo de este artículo hemos visto una pequeña parte de la creación y explotación de datos en pruebas de carga. Pero este contenido no es todo. Han quedado muchas cosas en el tintero que nos pueden ser útiles en nuestros proyectos. No obstante, esperamos haber podido ayudar a esas personas que no saben cómo realizar este tipo de pruebas. Y a los que ya las conocían de sobra, a encontrar un lugar donde consultar y reforzar ideas.