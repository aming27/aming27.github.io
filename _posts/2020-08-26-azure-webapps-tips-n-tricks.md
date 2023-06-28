---
published: true
ID: 202008261
title: 'Azure WebApps Tips & Tricks'
author: fernandoescolar
post_date: 2020-08-26 01:03:24
layout: post
tags: azure webapp appservice
background: '/assets/uploads/bg/cloud3.jpg'
---

*Si no nos anticipamos a los imprevistos, si no esperamos lo inesperado en una nube con infinitas posibilidades, podríamos hallarnos a merced de cualquiera y de cualquier cosa que no pueda ser programada, etiquetada o clasificada*.<!--break-->

![X-Files](/assets/uploads/2020/08/x-files.jpg)

*A fin de cuentas, todos los servicios de Azure son parte de un todo mucho más grande que los integra, todos llevan dentro el caos y el orden, la creación y la destrucción. Todos son al mismo tiempo víctimas y responsables de su propia vida*<abbr title="parafraseando de nuevo a la serie Expediente X">*</abbr>.

El problema es que no podemos ni sabemos cómo anticiparnos a todo. A veces los errores ocurren. Y a veces necesitamos lanzar un comando `kill` (para matar un proceso) o un `reboot` (para reiniciar una máquina) en una instancia de una Azure Web App.

Este es el caso que nos ocurrió hace unos días. En una de nuestras Web Apps de producción, una instancia empezó a dar errores 500 (*Server Error*). Eso significaba que una serie de usuarios estaban recibiendo páginas de error en lugar de respuestas correctas a sus peticiones. No todos, pero sí algunos.

![Monitoring Web App Errors](/assets/uploads/2020/08/monitoring-errors.png)

Antes de ponernos a analizar e intentar identificar el problema, teníamos la obligación de dar servicio a nuestros clientes. Y como algunas instancias sí funcionaban y otras no, decidimos que lo mejor era reiniciar el proceso de dotnet core de esa instancia.

Pero a veces eso no es suficiente. Así que hoy os mostraremos diferentes trucos operacionales relacionados con las Azure Web Apps:

- [Advanced Application Restart](#advanced-application-restart)
- [Azure REST API](#azure-rest-api)
  - Reiniciar los procesos específicos de una instancia de una Web App
    - [Get Web Apps instances](#get-web-apps-instances)
    - [Get Web Apps instance Processes](#get-web-apps-instance-processes)
    - [Restart Web App Instance Process](#restart-web-app-instance-process)
  - Cambiar la instancia de una Web App por otra
    - [Get Web App Instance Process Details](#get-web-app-instance-process-details)
    - [Replace Worker](#replace-worker)
- [Auto-Healing](#auto-healing)

## Advanced Application Restart

La forma más sencilla de reiniciar los procesos que sirven nuestra página web en una Web App de Azure es ir al portal y seleccionar la opción de "Diagnose and solve problems" dentro de la propia Web App:

![Diagnose and solve problems](/assets/uploads/2020/08/diagnose-and-solve-problems.png)

Una vez ahí, se nos mostrará un buscador y varias opciones. Si en el buscador escribimos "Advanced Application Restart", nos aparecerá la opción que estamos buscando. Al hacer clic sobre ella navegaremos a un panel de control:

![Advanced Application Restart](/assets/uploads/2020/08/advanced-application-restart.png)

Aquí se nos mostrarán 3 secciones y la forma de fijarnos en ellas es a la inversa:

1. Primero marcaremos la instancia que está generando errores. En este caso, como podemos comprobar en las gráficas anteriores es `RD2818783C1B19`.

2. Si vamos a reiniciar más de una instancia podemos decidir el `Restart Sleep timer` que es el tiempo que pasa entre que se reinicia una y otra.

3. Cuando tenemos todo listo, le damos al botón de `Restart`.

Al cabo de un poco tiempo, se nos mostrará un aviso de que las instancias han sido reiniciadas correctamente y podremos comprobar si está dando o no errores.

## Azure REST API

Todo el proceso  anteriormente descrito ([Advanced Application Restart](#advanced-application-restart)) se puede realizar usando las [Azure REST APIs](https://docs.microsoft.com/en-us/rest/api/azure/). Además, estas APIs nos proveen de otro tipo de acciones más complejas, para cuando el problema parezca un poco más difícil de resolver.

Para consumir estos servicios tenemos que conseguir un *access token* mediante *oauth* en nuestro Azure AD (https://docs.microsoft.com/en-us/rest/api/azure/) o, como mostraremos a continuación, podremos usar el portal de documentación:

### Get Web Apps instances

La jerarquía de recursos necesarios para tener disponible una Web App en Azure se podría definir de la siguiente forma:

- **App Service Plan**: Hosting de Web Apps
  - **Web App**: Aplicación Web que se aloja en un App Service Plan. Pueden ser varias, en dependencia del tamaño y tipo de plan.
    - **Worker**: Cada App Service Plan tiene un conjunto de Workers, donde se ejecutan los procesos de las Web Apps.
      - **Web App Instance**: cada Web App contiene una instancia por Worker. Esta instancia representa uno de los procesos en ejecución.
        - **Processes**: cada instancia tiene una serie de procesos en ejecución, como por ejemplo el portal de SCM o el proceso de IIS que hospeda nuestra Web App.

Por lo tanto, antes de poder llegar a reiniciar un proceso, tendremos que saber qué procesos existen en las diferentes instancias de nuestra Web App. Y antes de poder conocer esos procesos, tendremos primero que saber qué instancias tenemos.

Para eso sirve el primer método de la API. Para listar las instancias de nuestra Web App.

Si navegamos [aquí](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/listinstanceidentifiers), nos encontraremos una definición del servicio:

![Get Web Apps instances](/assets/uploads/2020/08/api-webapp-list-instances.png)

Al pulsar en el botón verde de `Try It` podremos hacer identificarnos en Azure y conseguir autorización para usar este servicio desde el propio navegador:

![Get Web Apps instances - try](/assets/uploads/2020/08/api-webapp-list-instances-try.png)

Para poder ejecutarlo tendremos que introducir:

- **name**: el nombre de nuestra Web App (lo que viene antes del `.azurewebsites.net`).
- **resourceGroupName**: el nombre de grupo de recursos al que pertenece la Web App.
- **subscriptionId**: es un selector donde si tenemos más de una suscripción de Azure, tendremos que elegir la que contiene la Web App.

Al ejecutar el comando veremos que en la parte inferior de la pantalla nos aparece el resultado en formato `json`:

![Get Web Apps instances - result](/assets/uploads/2020/08/api-webapp-list-instances-try-result.png)

Aquí lo más importante es conocer el nombre de cada una de las instancias, en el campo `name`.

### Get Web Apps instance Processes

Cada una de las instancias de una Web App tiene varios procesos en funcionamiento. La idea es coger un listado de los mismos.

A tal fin navegaremos [aquí](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/listinstanceprocesses):

![Get Web Apps instances Processes](/assets/uploads/2020/08/api-webapp-list-instance-processes.png)

Repetiremos la acción de darle al botón de `Try It` e identificarnos, si hiciera falta:

![Get Web Apps instances Processes - try](/assets/uploads/2020/08/api-webapp-list-instance-processes-try.png)

En este caso tendremos que indicar:

- **instanceId**: es la propiedad `name` que recogimos del listado de instancias como resultado del paso anterior.
- **name**: el nombre de nuestra Web App (el mismo que introdujimos en el paso anterior).
- **resourceGroupName**: el nombre de grupo de recursos al que pertenece la Web App (el mismo que introdujimos en el paso anterior).
- **subscriptionId**: la suscripción que tiene nuestra Web App (la misma que introdujimos en el paso anterior).

Al ejecutar obtendremos un listado de procesos:

![Get Web Apps instances Processes - result](/assets/uploads/2020/08/api-webapp-list-instance-processes-try-result.png)

Cuando estamos hablando de IIS los procesos se llaman `w3wp`. Tendremos que buscar los procesos con ese nombre y guardar su `id` para poder realizar operaciones con él.

Es posible que existan dos procesos con el `"name": "w3wp"`. Esto se debe a que *Kudu* (el portal SCM de nuestra Web App) es un proceso a parte de nuestra aplicación dentro de IIS. Para poder diferenciarlos correctamente tendremos que llamar al servicio de [Get Web App Instance Process Details](#get-web-app-instance-process-details) y buscar el valor de la propiedad `is_scm_site`.

### Restart Web App Instance Process

Una vez hemos llegado a este paso, ya podemos *matar* el proceso que nos causa problemas. Después de eliminarlo, el propio IIS lo volverá a lanzar automáticamente (en la próxima petición o directamente, en dependencia del estado del parámetro `AlwaysOn` de la Web App). Por lo tanto, aunque esta operación sea borrar un proceso, el efecto que se obtiene es que se reinicia.

Nos dirigiremos a [esta página](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/deleteinstanceprocess):

![Restart Web App Instance Processes](/assets/uploads/2020/08/api-webapp-list-instance-process-delete.png)

Haremos clic en el botón de `Try It`:

![Restart Web App Instance Processes - try](/assets/uploads/2020/08/api-webapp-list-instance-process-delete-try.png)

Rellenaremos los siguientes parámetros:

- **instanceId**: el nombre de la instancia de la Web App (el mismo que introdujimos en los pasos anteriores).
- **name**: el nombre de nuestra Web App (el mismo que introdujimos en los pasos anteriores).
- **processId**: es el campo `id` del proceso que recuperamos en el paso anterior.
- **resourceGroupName**: el nombre de grupo de recursos al que pertenece la Web App (el mismo que introdujimos en los pasos anteriores).
- **subscriptionId**: la suscripción que tiene nuestra Web App (la misma que introdujimos en los pasos anteriores).

Después de ejecutar esperaremos dos tipos de resultado:

- **200**: cuando se ha borrado el proceso correctamente.
- **404**: cuando ese proceso no existe o ya se ha borrado.

### Get Web App Instance Process Details

Si queremos conocer más detalles sobre los procesos, como por ejemplo, su relación con los App Service Workers (las máquinas virtuales donde se ejecutan nuestras instancias, por así decirlo), tendremos que visitar [esta página](https://docs.microsoft.com/en-us/rest/api/appservice/webapps/getinstanceprocess):

![Get Web App Instance Process Details](/assets/uploads/2020/08/api-webapp-list-instance-process-details.png)

Aquí encontraremos un servicio que nos devuelve los detalles de un proceso dentro de una instancia de una Web App de Azure.

![Get Web App Instance Process Details - try](/assets/uploads/2020/08/api-webapp-list-instance-process-details-try.png)

Para ejecutarla, introduciremos:

- **instanceId**: el nombre de la instancia de la Web App (el mismo que introdujimos en los pasos anteriores).
- **name**: el nombre de nuestra Web App (el mismo que introdujimos en los pasos anteriores).
- **processId**: es el campo `id` del proceso (el mismo que introdujimos en el paso anterior).
- **resourceGroupName**: el nombre de grupo de recursos al que pertenece la Web App (el mismo que introdujimos en los pasos anteriores).
- **subscriptionId**: la suscripción que tiene nuestra Web App (la misma que introdujimos en los pasos anteriores).

![Get Web App Instance Process Details - result](/assets/uploads/2020/08/api-webapp-list-instance-process-details-try-result.png)

Y en el resultado, entre muchos parámetros, dentro de las variables de entorno, encontraremos `COMPUTERNAME` que coincide con el nombre del App Service Worker y a su vez es el nombre que encontramos en la herramienta de *monitoring* cuando realizamos el *split* por instancia.

### Replace Worker

Cuando los problemas parecen no solucionarse dentro de una instancia, quizá es que se ha quedado corrupta por alguna razón. Así que podríamos necesitar cambiarla.

Si ya tenemos el nombre del Worker, podemos realizar un cambio. Para ello usaremos el servicio de [reboot worker](https://docs.microsoft.com/en-us/rest/api/appservice/appserviceplans/rebootworker):

![Reboot app service plan worker](/assets/uploads/2020/08/api-appserviceplan-worker-reboot.png)

Este servicio reinicia un App Service Plan Worker, que es donde se hospedan nuestras instancias de Web App. Al reiniciarlo, el sistema no espera a que vuelva a estar disponible, lo sustituye automáticamente por otro Worker que sí que está funcionando. Así que podríamos interpretar esta acción como un reemplazo de una instancia:

![Reboot app service plan worker - try](/assets/uploads/2020/08/api-appserviceplan-worker-reboot-try.png)

Introduciremos:

- **name**: el nombre del App Service Plan que hospeda nuestra Web App.
- **resourceGroupName**: el nombre de grupo de recursos al que pertenece el App Service Plan.
- **subscriptionId**: un selector donde tendremos que elegir la suscripción que contiene nuestro App Service Plan.
- **workerName**: el nombre del Worker que recogimos en el paso anterior.

Después de ejecutar, podremos comprobar en la herramienta de *monitoring* cómo el worker que hemos reiniciado para de recibir peticiones y estas pasan a un Worker nuevo que entra en juego (líneas rosa y morada respectivamente):

![App service plan requests/worker](/assets/uploads/2020/08/monitoring-change-instance.png)

Y también podríamos apreciar cómo han dejado de suceder errores al cambiar de Worker.

## Auto-Healing

Si estamos experimentando problemas de forma periódica, lo más recomendable, mientras se estudian y solucionan, es usar una de las *features* ocultas que más valor aportan a una Web App: el Auto-Healing.

Esta herramienta nace sabiendo que algunos comportamientos inesperados pueden resolverse temporalmente con algunos simples pasos de mitigación (reiniciar el proceso, iniciar otro ejecutable o requerir la recopilación de datos adicionales). Esto es lo que nos va a permitir esta utilidad.

![Diagnose and solve problems](/assets/uploads/2020/08/diagnose-and-solve-problems.png)

Para acceder a ella tan solo tendremos que ir a la opción de "Diagnose and solve problems" dentro de nuestra Web App en el portal de Azure y en el buscador introducir "Auto-Healing". Al hacer clic en la opción que aparece encontraremos un nuevo panel:

![Auto Healing](/assets/uploads/2020/08/auto-healing.png)

Aquí podremos configurar diferentes acciones (reciclar procesos, añadir trazas de log o acciones customizadas), para diferentes eventos (duración de una *request*, límite de memoria, *response status codes* ...).

Dentro de esta configuración, hay ciertos detalles que los podemos especificar a nivel de código en el archivo `web.config` de nuestra Web App. Si bien es muy completa la configuración, hay algún caso que no termina de funcionar bien, pero puedes leer más sobre el tema [aquí](https://azure.microsoft.com/es-es/blog/auto-healing-windows-azure-web-sites/).

## Conclusiones

Está claro que, como seres humanos, no somos perfectos. Y por lo tanto nuestro software tampoco lo es. Nunca sabemos cuándo vamos a tener un problema en producción. Pero estos apuntes es posible que puedan salvarte en un momento de aprieto, convirtiendo una larga caída en unos minutos de respuestas erróneas parciales.

No obstante, si estos trucos se convierten en una práctica habitual, es posible que estemos escondiendo otro tipo de problemas en nuestro software que deberíamos analizar más a fondo.