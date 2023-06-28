---
published: true
ID: 202104271
title: 'Azure WebApps: Ip estática de salida'
author: fernandoescolar
post_date: 2021-04-27 01:20:57
layout: post
tags: azure webapp ip vnet nat gateway
background: '/assets/uploads/bg/street.jpg'
---

Uno de los grandes inconvenientes de usar Azure Web Apps ha sido el de configurar una IP estática de salida. Simplemente no se podía. Ha habido soluciones de lo más variopintas: usar un ASE, montar una máquina virtual tipo pasarela, Application Gateway, proxies... Pero ninguna de ellas se ha visto como una solución verdaderamente aceptable, hasta hoy<!--break-->.

Seguro que si integras con servicios de terceros o que si estás implementando comunicaciones seguras te habrán preguntado por las IP de salida. La intención es crear un listado de posibles direcciones IP de consumo de una API y así protegerla de conexiones no deseadas. El problema de Azure App Services y concretamente las Web Apps, es que teníamos un rango de IPs que podían cambiar según el tamaño de la instancia o cómo tuviera el día el administrador del datacenter.

Cuando les contabas esto, el efecto resultante se dividía a partes iguales entre pena y risas.

Pero hoy traemos la solución. Bueno, realmente lleva anunciada desde finales del año 2020. El caso es que no habíamos tenido tiempo para probarla todavía. Pero hoy sí. Todo se basa en un servicio llamado *NAT gateway*.

* TOC
{:toc}

## Solución

Como ocurre en otros *clouds* un _**N**etwork **A**ddress **T**ranslation **gateway**_ es un servicio que nos permite conectar una *subnet* privada con otros servicios de internet (incluido Microsoft Azure).

Para poder poner esto en marcha tendremos que crear una *Virtual Network* dentro de la cual encontraremos una *subnet* privada. Dentro de esta última integraremos una *Web App*. Finalmente crearemos un *NAT gateway* que redireccione el tráfico de esa *subnet* vía una *IP* pública estática.

 La topología quedaría de esta forma:

![Topología de servicios de Microsoft Azure](/assets/uploads/2021/04/nat-webapp.png)

No nos distraemos más, vamos a ponernos manos a la obra:

### Resource group

Primero vamos a crear un *Resource group* donde agruparemos todos los recursos que crearemos. Para ello podremos acceder al [portal de Azure](https://portal.Azure.com/) y presionar el botón de crear un nuevo recurso.

![Microsoft Azure -> Create a resource: Resource group](/assets/uploads/2021/04/outboundip-rg-1.png)

Después de seleccionar el tipo "Resource Group", le daremos un nombre y elegiremos una región:

![Create Resource group](/assets/uploads/2021/04/outboundip-rg-2.png)

Para finalizar lo creamos y listo.

### Virtual Network

Las redes virtuales de Azure son muy sencillas de configurar. Como es habitual, tendremos que buscar "Virtual Network" en el [portal de Azure](https://portal.Azure.com/).

![Microsoft Azure -> Create a resource: Virtual Network](/assets/uploads/2021/04/outboundip-vnet-1.png)

En el primer paso del asistente de creación tendremos que introducir el nombre y la región:

![Create Virtual Network](/assets/uploads/2021/04/outboundip-vnet-2.png)

En el siguiente paso podremos asignar los rangos de IP para nuestra red virtual y podremos gestionar las *subnets* que necesitamos:

![Configure IP ranges](/assets/uploads/2021/04/outboundip-vnet-3.png)

En este caso podemos dejar los valores por defecto ya que no necesitamos ninguna configuración especial.

El resto de los valores, como es habitual, podremos obviarlos y terminar con la creación de nuestros recursos.

### Web App

Ha llegado la hora de crear un *Azure App Service* donde hospedar nuestra aplicación web. Nos dirigiremos al [portal de Azure](https://portal.Azure.com/) y en la opción de crear un nuevo recurso buscaremos "Web App":

![Microsoft Azure -> Create a resource: Web App](/assets/uploads/2021/04/outboundip-web-1.png)

En el primer paso definiremos el nombre de la aplicación, la región y podremos crear un plan de hospedaje para la misma. Este plan solo hay que recordar que tiene que ser un entorno productivo de tamaño `S` o `P`. En este ejemplo usaremo el más barato de ellos: `S1`.

![Create Web App](/assets/uploads/2021/04/outboundip-web-2.png)

El resto de los valores que encontremos en el asistente podremos dejarlos como vienen por defecto. Finalmente crearemos la aplicación web.

Una vez el recurso esté listo tendremo que integrarlo con la *subnet* privada que creamos en el anterior paso.

Tendremos que dirigirnos a la página de configuración de la *Web App*. Allí buscaremos en el menú de la izquierda la opción de "Networking". Y al cargar en el panel principal esta opción, buscaremos "VNet Integration" y dentro de esta sección presionaremos "Click here to configure":

![Web App Networking](/assets/uploads/2021/04/outboundip-web-3.png)

Una vez hayamos navegado al panel de "VNet Integration", haremos clic en la opción de "Add VNet":

![Web App VNet integration](/assets/uploads/2021/04/outboundip-web-4.png)

Entonces aparecerá un modal a la derecha donde tendremos que buscar la red virtual que creamos en el paso anterior y seleccionar la *subnet* donde queremos integrar la Web App. Hay que tener en cuenta que solo se puede asignar una WebApp por *subnet*.

![Web App private subnet integration](/assets/uploads/2021/04/outboundip-web-5.png)

Una vez guardados estos cambios ya tendremos la aplicación dentro de la *subnet*, pero eso no quiere decir que estemos usándo la red virtual para redirigir el tráfico.

Para hacer que el tráfico interno sea redireccionado por la *vnet* tendremos que dirigirnos a la sección de "Configuration" dentro del menú de la izquierda y añadir un nuevo "application setting":

![Web App application settings](/assets/uploads/2021/04/outboundip-web-6.png)

El nombre de este parámetro será "WEBSITE_VNET_ROUTE_ALL" y su valor "1":

![Web App New application setting](/assets/uploads/2021/04/outboundip-web-7.png)

Al terminar de añadirlo, recuerdapresionar el botón de "Save" de la barra de herramientas que encontrarás en la parte superior.

### Public IP

Si queremos tener una IP pública y estática de salida, ahora será el momento de crearla. Para ello tendremos que buscar "Public IP address" en la opción de crear un nuevo recurso del [portal de Azure](https://portal.Azure.com/).

![Microsoft Azure -> Create a resource: Public IP address](/assets/uploads/2021/04/outboundip-pip-1.png)

Seleccionaremos un nombre y nos aseguraremos de que tenga marcado que la IP queremos que sea estática:

![Create Public IP address](/assets/uploads/2021/04/outboundip-pip-2.png)

Los demás valores los podemos dejar como vienen por defecto.

### NAT gateway

El último paso será la creación del *NAT gateway*. Este servicio nos permitirá vincular la *subnet* privada donde está hospedada nuestra *Web App* con la *IP* pública que hemos creado en el paso anterior.

Como siempre, nos dirigiremos al [portal de Azure](https://portal.Azure.com/), a la opción de crear nuevo recurso y buscaremos "NAT gateway":

![Microsoft Azure -> Create a resource: NAT gateway](/assets/uploads/2021/04/outboundip-nat-1.png)

En el primer paso le daremos un nombre y lo asignaremos a una región:

![Create NAT gateway](/assets/uploads/2021/04/outboundip-nat-2.png)

En el segundo paso, lo vincularemos con la IP pública que hemos creado para que la use como salida del tráfico. Y podremos ignorar el tema de los prefijos si no nos interesa.

![NAT gateway outbound IP](/assets/uploads/2021/04/outboundip-nat-3.png)

En el tercer paso lo vincularemos con la *subnet* privada donde se encuentra nuestra aplicación web:

![NAT gateway subnet](/assets/uploads/2021/04/outboundip-nat-4.png)

El resto de los pasos no tendremos por qué configurar nada. Así que solo quedará crear el recurso nuevo.

Una vez se haya creado en *NAT gateway* os recomiendo que vayais a su página de configuración y elijais la opción del menú de la izquierda de "Subnets". En este panel es muy posible que NO encontremos la configuración que añadimos en el paso de creación. Si este es el caso buscaremos nuestra red virtual, marcaremos la *subnet* y presionaremos el botón de "Save":

![Actually NAT gateway subnet](/assets/uploads/2021/04/outboundip-nat-5.png)

Huelga decir que si os encontrais la configuración correcta no tenéis por qué hacer nada.

Y con este último paso ya tendremos creado el entorno para que nuestra *Web App* tenga una IP de salida estática.

## Probando la solución

Una forma muy rápida de comprobar que nuestra *Web App* está usando la IP que configuramos es usar el terminal de *kudu*. Así que, abriremos en el  [portal de Azure](https://portal.Azure.com/) la página de configuración de nuestra aplicación, buscaremos la opción de "Advanced Tools" en el menú de la izquierda y presionaremos el botón de "Go ->":

![Web App > kudu](/assets/uploads/2021/04/outboundip-web-8.png)

Entonces se abrirá una nueva pestaña en el navegador. En el menú superior encontraremos la opción de "Debug console" y en el desplegable seleccionaremos "CMD".

En este momento veremos un listado de directorios y debajo tendremos un terminal donde podremos ejecutar este comando:

```bash
curl https://api.myip.com/
```

Lo que vamos a hacer es llamar a una API que nos devuelve la IP pública desde donde la hemos llamado. De esta forma, podremos comparar ese valor con el de la IP pública:

![Web App > kudu > CMD](/assets/uploads/2021/04/outboundip-web-9.png)

Si en la primera ejecución no coincide os invito a intentarlo un par de minutos más tarde para comprobar que se han realizado los cambios en Azure.

## Conclusiones

Os propondré un juego: buscad en google "azure webapp static outbound ip".

¿Veis toda esa gente preguntando como se puede hacer? Solo puedo decir:

Por fin...
