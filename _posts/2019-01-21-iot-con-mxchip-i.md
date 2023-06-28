---
published: true
ID: 201901211
title: 'IoT con MxChip (I)'
author: fernandoescolar
post_date: 2019-01-21 14:02:53
post_excerpt: ""
layout: post
---

Hoy empezamos una pequeña serie sobre IoT usando un dispositivo MxChip y la plataforma Azure. Nada como empezar el año escribiendo un nuevo artículo sobre una tecnología de la que nunca antes lo había hecho.<!--break-->

¡Hola! Soy Troy McClure y tal vez me recuerden de otros artículos en internet como "Los decimales que el sistema robó a mi 'float'" o "Por qué 'Linq to Entities' apesta".

> Señor McClure

¡Caramba! Hola Bobby...

> Soy Jimmy... Me gustaría saber como hacer chorradas de esas de IoT en Azure.

¡Woow! ¡Woow! ¡Más despacio Jimmy! Eso es como querrer programar el alma...

![Troy McClure y Jimmy](/assets/uploads/2019/01/iot-mcclure-start.jpg)

Si queremos graduarnos en la "Universidad de las Cosas" necesitaremos una "Cosa" que utilizar. La "Thing" más recomendable, es una placa llamada "MxChip IoT DevKit".

Esta placa ya viene certificada para trabajar con Azure IoT. Además tiene un montón de sensores incorporados: humedad, temperatura, presión, acelerómetro, giroscopio, micrófono... Las suelen regalar en eventos de Microsoft con temáticas de IoT. Pero siempre podremos adquirir una comprándola online.

No es obligatorio usarla. Pero simplificará toda la interacción con el hardware. De esta forma podremos centrarnos en lo interesante: el desarrollo.

Una vez tengamos una placa MxChip, tendremos que empezar a trabajar con ella:

## Configurar la wifi

Enchufaremos el MxChip a una fuente de alimentación (por ejemplo un puerto USB de nuestro ordenador). Entonces mantendremos pulsado el botón "B". Pulsaremos el botón "reset" y lo soltaremos. Después soltaremos el botón "B":

![configure wifi](/assets/uploads/2019/01/iot-mxchip-wifi1.png)

La placa entrará en un modo especial en el que sirve una red wifi. Deberemos conectar nuestro ordenador con la red wifi que dice la pantalla de la placa:

![configure wifi](/assets/uploads/2019/01/iot-mxchip-wifi3.png)

Y una vez conectado deberemos abrir un navegador de internet y dirigirnos a "http://" más la IP que aparece en la pantalla de la placa:

![configure wifi](/assets/uploads/2019/01/iot-mxchip-wifi2.png)

Una vez en esa página solo debemos configurar la Wifi a la que deseamos que se conecte la placa.

## Actualizar firmware

Actualizar el firmware es de las operaciones más simples que se pueden encontrar. Lo único que hay que hacer es descargar la última versión desde la página oficial:

[https://aka.ms/devkit/prod/firmware/latest](https://aka.ms/devkit/prod/firmware/latest)

Después conectar el MxChip a nuestro ordenador usando el cable USB. De esta forma se montará una unidad de disco. Finalmente, copiaremos el archivo del firmware en la unidad de disco de la placa:

![copy the file in the mxchip folder](/assets/uploads/2019/01/iot-copy-firmware.png)

Automáticamente el dispositivo se actualizará usando ese archivo y se reiniciará.

![Troy McClure approves](/assets/uploads/2019/01/iot-mcclure-middle.jpg)

## Preparar el entorno de desarrollo

La placa MxChip trae como microcontrolador una unidad SMT32, de arquitectura ARMv7-M y un core Cortex-M3. Un modelo que podemos programar usando el amigable IDE de arduino.

Aunque usaremos como herramienta principal [Visual Studio Code](https://code.visualstudio.com/) (vscode), necesitaremos instalar previamente el IDE de arduino. Esto es porque todas las herramientas de vscode están basadas en librerías de este IDE. Así que nos dirigiremos a [la web del IDE de arduino](https://www.arduino.cc/en/Main/Software), descargaremos el "Windows installer" y lo instalaremos:

![install arduino IDE for windows](/assets/uploads/2019/01/iot-arduino-ide.png)

Después en vscode, en las extensiones buscaremos una llamada "Arduino", desarrollada por Microsoft, y la instalaremos:

![install arduino vscode extension](/assets/uploads/2019/01/iot-vscode-arduino.png)

Ahora tendremos que configurar la extensión de arduino para que use las librerías del IDE que instalamos al inicio. Nos dirigiremos al menu: File -> Preferences -> Settings. Una vez ahí pulsaremos sobre el icono de editar el archivo "settings.json":

![edit vscode settings.json](/assets/uploads/2019/01/iot-vscode-settings.png)

Y añadiremos dentro de las llaves el siguiente par de parejas clave-valor:

```json
"arduino.path": "C:\\Program Files (x86)\\Arduino",
"arduino.additionalUrls": "https://raw.githubusercontent.com/VSChina/azureiotdevkit_tools/master/package_azureboard_index.json"
```

También instalaremos la extensión "Azure IoT Tools" para tener instegración con la plataforma en la nube para IoT de Microsoft:

![install azure iot tools vscode extension](/assets/uploads/2019/01/iot-vscode-tools.png)

Y por último, instalaremos un driver de windows que nos servirá de interfaz USB para poder comunicarnos entre el MxChip y nuestra máquina: ST-Link/V2. Lo podréis descargar, después de introducir vuestro email desde la página oficial:

[http://www.st.com/en/development-tools/stsw-link009.html](http://www.st.com/en/development-tools/stsw-link009.html)

Una vez hemos completado todos estos pasos desconectamos de nuestro ordenador el MxChip y reiniciamos vscode (Ctrl+ Shift + P y "Reload Window"). Al conectar de nuevo el MxChip con nuestro ordenador y estando vscode abierto, veremos como se abre automáticamente una página con ejemplos de desarrollo:

![vscode examples for IoT](/assets/uploads/2019/01/iot-vscode-workbench.png)

Lo que querrá decir que ya estamos listos para programar el MxChip.

> Señor McClure, pero esto es muy aburrido...

## Continuará

No te engañes Jimmy, aunque este artículo haya sido un peñazo, es una información muy útil para lo que puede venir.

> Tiene razón. Con esa afirmación he demostrado que soy un auténtico pardillo.

Ha, ha, ha! Sí que lo eres Jimmy... sí que lo eres...

![Troy McClure & Jimmy](/assets/uploads/2019/01/iot-mcclure-end.jpg)