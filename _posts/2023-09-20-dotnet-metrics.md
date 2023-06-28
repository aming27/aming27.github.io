---
published: true
ID: 202309201
title: 'Observabilidad en .Net: Métricas'
author: fernandoescolar
post_date: 2023-09-20 01:04:36
layout: post
tags: observability dotnet csharp net7 metrics
background: '/assets/uploads/bg/golang.jpg'
---

Dentro de la rama de la observabilidad existen tres pilares fundamentales: métricas, logs y trazas. En este artículo vamos a hablar de métricas y cómo podemos medir diferentes factores de nuestras aplicaciones de manera efectiva. Pero espera, ¿qué tienen que ver las métricas con la programación? Bueno, todo. Las métricas son importantes para cualquier tipo de proyecto, y más aún si se trata de programación. Y en .Net existe un sistema muy completo que nos permite medir casi todo tipo de cosas<!--break-->.

- [Introducción](#introducción)
- [Visualizando métricas](#visualizando-métricas)
- [Métricas personalizadas](#métricas-personalizadas)
- [Tipos de métricas](#tipos-de-métricas)
  - [Counter](#counter)
  - [UpDownCounter](#updowncounter)
  - [ObservableCounter](#observablecounter)
  - [ObservableUpDownCounter](#observableupdowncounter)
  - [ObservableGauge](#observablegauge)
  - [Histogram](#histogram)
- [Conclusiones](#conclusiones)


Así que siéntete libre de abrir tu cerveza favorita y sigue leyendo, porque aquí vamos a enseñarte cómo medir ~~tus cervezas~~ tus aplicaciones:

## Introducción

Primero, vamos a hablar un poco de qué son las métricas y por qué son importantes. Las métricas son simplemente medidas numéricas que nos permiten conocer el estado de algo en particular. En el caso de una aplicación, esto podría ser el número de solicitudes por segundo, la cantidad de memoria utilizada, el tiempo de respuesta, entre otras cosas.

Las métricas son importantes porque nos permiten detectar problemas en nuestra aplicación y solucionarlos antes de que se conviertan en un problema mayor. Además, también nos ayudan a entender mejor cómo se comporta nuestra aplicación, los usuarios dentro de la misma y cómo podemos mejorarla.

## Visualizando métricas

La herramienta `dotnet-counters` es una herramienta de línea de comandos que nos permite visualizar y recolectar métricas de nuestras aplicaciones .Net en tiempo real. Esta herramienta forma parte del conjunto de herramientas de diagnóstico de .Net Core, y se encuentra disponible desde la versión 2.2. Por tanto está disponible en .Net 5, 6, 7 y posteriores.

El funcionamiento básico de la herramienta `dotnet-counters` es muy sencillo. Primero, necesitamos instalar la herramienta utilizando el siguiente comando:

```bash
dotnet tool install --global dotnet-counters
```

Despues tendremos que econtrar el `ID` del proceso del que queremos ver las métricas. Esta herramienta nos permite ver una lista de los procesos en ejecución en nuestra máquina utilizando el comando `ps`. Por ejemplo, si queremos ver una lista de los procesos en ejecución:

```bash
dotnet counters ps
```

Esto mostrará una lista de los procesos en ejecución, junto con su ID de proceso y otros detalles relevantes.

Una vez hemos detectado el `ID` del proceso que nos interesa, podemos utilizar la herramienta para monitorizar las métricas de nuestros procesos en ejecución con el siguiente comando:

```bash
dotnet counters monitor -p <ID de proceso>
```

Esto mostrará en tiempo real una serie de métricas para el proceso seleccionado, como el uso de CPU, la cantidad de memoria utilizada y la cantidad de solicitudes recibidas por nuestra aplicación. Algo parecido a esto:

```bash
Press p to pause, r to resume, q to quit.
    Status: Running

[System.Runtime]
    % Time in GC since last GC (%)                                   0
    Allocation Rate (B / 1 sec)                                  4.160
    CPU Usage (%)                                                    0,009
    Exception Count (Count / 1 sec)                                  0
    GC Committed Bytes (MB)                                          0
    GC Fragmentation (%)                                             0
    GC Heap Size (MB)                                                0,574
    Gen 0 GC Count (Count / 1 sec)                                   0
    Gen 0 Size (B)                                                   0
    Gen 1 GC Count (Count / 1 sec)                                   0
    Gen 1 Size (B)                                                   0
    Gen 2 GC Count (Count / 1 sec)                                   0
    Gen 2 Size (B)                                                   0
    IL Bytes Jitted (B)                                         40.799
    LOH Size (B)                                                     0
    Monitor Lock Contention Count (Count / 1 sec)                    0
    Number of Active Timers                                          0
    Number of Assemblies Loaded                                     13
    Number of Methods Jitted                                       330
    POH (Pinned Object Heap) Size (B)                                0
    ThreadPool Completed Work Item Count (Count / 1 sec)             0
    ThreadPool Queue Length                                          0
    ThreadPool Thread Count                                          0
    Time spent in JIT (ms / 1 sec)                                   0
    Working Set (MB)                                                27,41
```

Además, también podemos recolectar métricas en un momento determinado utilizando el comando `collect`. Por ejemplo, si queremos recolectar métricas en formato `JSON` para un proceso con un `ID` de proceso determinado, podemos ejecutar el siguiente comando:

```bash
dotnet counters collect -p <ID de proceso> --format json
```

Esto nos permitirá recolectar las métricas en un archivo `JSON`, que podemos analizar posteriormente o integrar con otras herramientas de análisis.

El frameowork nos provee de una serie de métricas por defecto para nuestras aplicaciones que puedes consultar con el comando `dotnet counters list`.

## Métricas personalizadas

Ahora, vamos a enseñarte cómo puedes crear tus propias métricas personalizadas en .Net. Para esto, vamos a necesitar el paquete de nuget `System.Diagnostics.DiagnosticSource`, que es la librería recomendada para crear métricas personalizadas en .Net en las últimas versiones del runtime.

Estas librerías sustituyen a las antiguas `EventCounters` y `System.Diagnostics.PerformanceCounter`.

Empecemos con un ejemplo sencillo. Digamos que queremos medir la cantidad de cervezas que hemos bebido en un día. Para esto, podemos crear un contador simple con la siguiente línea de código:

```csharp
using System.Diagnostics.Metrics;

var myMeter = new Meter("beer-meter");
var beersDrank = myMeter.CreateCounter<int>("beers-meter-drank");
```
Aquí, hemos creado un `Meter` con el nombre `beer_meter`, y un contador con el nombre `beers_drank`. Los tipos aceptados para los contadores son `byte`, `short`, `int`, `long`, `float`, `double` o `decimal`. Ahora, cada vez que bebamos una cerveza, simplemente tenemos que aumentar nuestro contador con la siguiente línea de código:

```csharp
Console.WriteLine("Press any key to exit");
while(!Console.KeyAvailable)
{
	Thread.Sleep(1000);
	beersDrank.Add(1);
}
```

Y eso es todo. Ahora podemos ver cuántas cervezas hemos bebido.

> Se recomienda crear una única instancia de `Meter` y almacenarla en una variable estática o contenedor de dependencias para su reutilización. Cada biblioteca o subcomponente debe crear su propio `Meter`. Se sugiere usar un nombre jerárquico para evitar conflictos e incluso proporcionar una versión. No hay un esquema de nomenclatura definido para las métricas en .Net, pero se recomienda el uso de "-" como separador por convención. Todas estas APIs se son *thread safe* y se pueden utilizar en cualquier parte de la aplicación.

Si queremos dar más detalle al `Meter` y el `Counter<int>` podemos hacerlo con los parámetros de los métodos `CreateMeter` y `CreateCounter`:

```csharp
var myMeter = new Meter("beer-meter", "1.0.0");
var beersDrank = myMeter.CreateCounter<int>(name: "beers-meter-drank",
											description: "Number of beers drank",
											unit: "beer");
```

Si definimos una unidad de medida `unit` la especificaremos usando el nombre de una sola unidad de medida. En este caso `beer` o "cerveza".

También podemos añadirle eiquetas a un contador para poder filtrar las métricas por ellas:

```csharp
beersDrank.Add(2,
				new KeyValuePair<string,object>("Person", "Fer"),
				new KeyValuePair<string,object>("Liters", 1));
```

Si queremos ver estas métricas en `dotnet-counters` podemos ejecutar el siguiente comando:

```bash
dotnet counters monitor -p <ID de proceso> -n beer_meter
```

Y obtendremos una salida como esta:

```bash
Press p to pause, r to resume, q to quit.
    Status: Running

[beer-meter]
    beers-meter-drank (beer / 1 sec)
        Liters=1,Person=Fer                      2
```

## Tipos de métricas

Hasta aquí hemos visto cómo crear un contador simple, pero .Net nos permite crear otros tipos de métricas más complejas. Estos son los tipos de métricas que podemos crear:

### Counter

El contador es el tipo de métrica más básico. El que hemos usado en el ejemplo anterior. Simplemente cuenta la cantidad de veces que un evento ha ocurrido. Por ejemplo, podríamos utilizar un contador para medir la cantidad de solicitudes que nuestra aplicación ha recibido.

El ejemplo de uso es:

```csharp
var myMeter = new Meter("beer-meter");
var beersDrank = myMeter.CreateCounter<int>("beers-meter-drank");

beerDrank.Add(1);
```

### UpDownCounter

El contador *UpDown* es similar al contador normal, pero nos permite aumentar y disminuir el valor de nuestra métrica. Por ejemplo, podríamos utilizar un contador *UpDown* para medir la cantidad de cervezas que hemos bebido, y restar cervezas si nos arrepentimos de haber bebido demasiado.

```csharp
var myMeter = new Meter("beer-meter");
var beersDrank = myMeter.CreateUpDownCounter<int>("beers-meter-drank");

beerDrank.Add(1); // suma como un contador normal
beerDrank.Add(-1); // se resta con un valor negativo
```

### ObservableCounter

El contador *Observable* nos permite registrar una función para recoger el valor del contador. Esta valor se recogerá cada vez que se evalúe la métrica. Si por ejemplo estamos observando este valor cada 3 segundo con un comando de `dotnet counters` la función de evaluación se ejecutará cada 3 segundos:

```csharp
var myMeter = new Meter("beer-meter");
var beersDrank = myMeter.CreateObservableCounter<int>("beers-meter-drank", () => GetValue());

int GetValue()
{
	return new Random().Next(0, 100);
}
```

### ObservableUpDownCounter

Este contador es una mezcla entre los anteriores. Por un lado tendresmos que definir la función que recoge el valor y por otro lado podremos aumentar o disminuir el valor su valor:

```csharp
var myMeter = new Meter("beer-meter");
var beersDrank = myMeter.CreateObservableUpDownCounter<int>("beers-meter-drank", () => GetValue());

int GetValue()
{
	return new Random().Next(-100, 100);
}
```

### ObservableGauge

El *Gauge* nos permite registrar una función para recoger el valor de la métrica. En este caso no es un contador, sino que es un valor que se evalúa en un momento determinado. La diferencia con los otros contadores es que estos incrementan o decrementan su valor. En este caso el valor es el que nosotros definamos:

```csharp
var myMeter = new Meter("beer-meter");
var beersDrankTimer = myMeter.CreateObservableGauge<int>("beers-meter-drank-timer", () => GetValue());

int GetValue()
{
	return DateTime.Now.Second;
}
```

En este ejemplo el valor de la métrica será el segundo actual. Un valor absoluto con respecto a ese momento.

### Histogram

El histograma nos permite medir la distribución de valores para una métrica en particular. Por ejemplo, podríamos utilizar un histograma para medir el tiempo que tarda nuestra aplicación en responder a las solicitudes. Esto nos permitiría ver cómo se distribuyen los tiempos de respuesta, y detectar posibles problemas en nuestra aplicación.

```csharp
var myMeter = new Meter("beer-meter");
var beersHistogram = myMeter.CreateHistogram<int>("beers-meter-histogram");

beersHistogram.Record(1);
```

Un histograma, usando `dotnet counters` nos responderá con lo el 99, 95 y 50 percentil:

```bash
beers-meter-histogram
        Percentile=50                                          4
        Percentile=95                                          8
        Percentile=99                                          9
```

## Conclusiones

En este artículo hemos visto cómo podemos crear métricas en .Net. Hemos visto los diferentes tipos de métricas que podemos crear y cómo podemos usarlas. Estas métricas nos permiten medir el rendimiento de nuestra aplicación y detectar posibles problemas. Y al ser el estándar de .Net actual, podremos usarlas con cualquier recolector de métricas, como por ejemplo OpenTelemetry.

Si quieres controlar y aprender del uso y funcionamiento de tus aplicaciones, no dudes en crear y consumir tus propias métricas.