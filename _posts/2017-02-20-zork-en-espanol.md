---
published: true
ID: 2002171
title: 'Zork (en Español) - Bot'
author: fernandoescolar
post_date: 2017-02-20 10:47:23
post_excerpt: ""
layout: post
tags: zork bot azure
---
> Corriendo, rodeé la casa hasta su parte trasera, donde encontré una ventana mal cerrada. La abrí y me colé. Como esperaba, había entrado por la cocina. En el centro de aquel espacio había una mesa de madera y sobre ella reposaba un saco marrón, alargado, y una botella de agua. Aun lado había una chimenea y una escalera que conducía al desván. Un distribuidor, situado a la izquierda, conducíaalsalón. Igual que en eljuego.<!--break-->

> Ernest Cline - Ready Player One

Si os habéis leido el libro "Ready Player One" (si no, ya estáis tardando) sabréis de qué estamos hablando. Quizá también si habéis visto un capitulo de la segunda temporada de "The Big Bang Theory".

<iframe class="youtube" src="https://www.youtube.com/embed/Z-YFHHG4cvg" frameborder="0" allowfullscreen></iframe>

[Zork](https://es.wikipedia.org/wiki/Zork) fue uno de los primeros videojuegos de ficción interactiva en modo texto. Por lo que tenía muchos números para ser portado a Bot Framework de Microsoft. Y este post trata de eso exactamente.

Como prueba de concepto, juntando un [emulador de Z-Machine](https://github.com/thiloplanz/glulx-typescript), añadiendo alguna implementación más, descargando [el juego de Zork](https://juegosdetexto.wordpress.com/al-oeste-de-la-casa/salon-de-juegos/) traducido y usando el [Bot Framework](https://dev.botframework.com/); puedo decir que ya está terminado. Al menos ha terminado [la prueba](https://github.com/fernandoescolar/zork-spanish-bot).

<iframe src='https://webchat.botframework.com/embed/zork-spanish?s=hW9r9ekFv7w.cwA.5Ek.1UR7-opzpI3gcs4rLaObhZhcYcKiI2XLhTj4hPL3wQE' style="width: 100%;height: 400px;"></iframe>

Además guarda las partidas en un Azure Storage. Para ver el código fuente o más información, puedes visitar [el repositorio](https://github.com/fernandoescolar/zork-spanish-bot) en github.

Si no has jugado, ya no tienes excusas :). Espero que lo disfrutéis...
