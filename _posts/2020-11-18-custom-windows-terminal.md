---
published: true
ID: 202011181
title: 'Personalización de Windows Terminal'
author: fernandoescolar
post_date: 2020-11-18 01:06:54
layout: post
tags: terminal bash powershell windows git cmd cmder
background: '/assets/uploads/bg/terminal.jpg'
---

Todos sabemos que, para conseguir el respeto de tus compañeros y jefes, solo hace falta tener un terminal que mole. Da igual si luego escribes usando solo los dedos índices. Si tu terminal parece *3\|173*, es que eres *3\|173*. Incluso si lo que usas en realidad es un producto de Microsoft con el nombre "Windows" delante<!--break-->.

Sí, estoy hablando de **Windows Terminal**. Una herramienta digna de Neo (aka señor Anderson) cuando aún no tenía ni idea de qué era Matrix: fondos de pantalla molones, colores tipo *hacker* e incluso la línea de *prompt* personalizada.

Y hoy estás de suerte. En este artículo le vamos a dar un repaso desde la instalación, hasta la configuración, pasando por su integración con otros terminales como **bash** o **Cmder**:

![windows terminal with git bash](/assets/uploads/2020/11/dotnet-version.gif)

Os presentamos la guía definitiva de cómo molar con **Windows Terminal**:

- [Instalar Windows Terminal](#instalar-windows-terminal)
- [Settings](#settings)
    - [Profiles](#profiles)
    - [Schemes](#schemes)
    - [Key bindings](#key-bindings)
- [Integraciones](#integraciones)
    - [PowerShell](#powershell)
    - [Command Prompt](#command-prompt)
    - [Git Bash](#git-bash)
    - [Cmder](#cmder)
    - [Developer Command Prompt for VS 2019](#developer-command-prompt-for-vs-2019)
    - [WSL & Azure Cloud Shell](#wsl--azure-cloud-shell)
- [Conclusiones](#conclusiones)
    - [settings.json](https://gist.github.com/fernandoescolar/84bf7b749da8ce5c52d1f55848b33bb9)

## Instalar Windows Terminal

La forma más fácil de conseguir Windows Terminal es tener un Windows 10, ir a la Microsoft Store e [instalarlo desde ahí](https://aka.ms/terminal). Aunque, para los más atrevidos, también podemos descargar el código fuente desde [su página de github](https://github.com/microsoft/terminal).

![windows terminal with git bash](/assets/uploads/2020/11/wt-00.png)

Aunque seguro, que tú, que has llegado hasta este artículo oculto en la *deep web*, preferirás instalarlo usando alguna *tool* de consola como:

```bash
# winget
winget install --id=Microsoft.WindowsTerminal -e

# chocolatey:
choco install microsoft-windows-terminal

# scoop:
scoop install windows-terminal
```

Una vez instalado, tendremos que dirigirnos, en la barra superior, al menú emergente que aparece al pulsar sobre el símbolo de flechita hacía abajo al lado del símbolo de suma:

![windows terminal settings](/assets/uploads/2020/11/wt-settings.png)

Así encontraremos la opción de "Settings". Al presionar sobre ella se nos abrirá un editor de texto (o código, depende de lo que tengas instalado en tu máquina) donde podremos editar un archivo llamado `settings.json`.

## Settings

El archivo de configuración es bastante sencillo. En un principio, lo que nos debería interesar son las siguientes propiedades:

```json
{
  "$schema": "https://aka.ms/terminal-profiles-schema",

  "theme": "dark",

  "defaultProfile": "{75de88dc-a61a-4f9d-8f17-b820620e7163}",

  "profiles": [ /*...*/ ],

  "schemes": [ /*...*/ ],

  "keybindings": [ /*...*/ ]
}
```

El `$schema` es estático y tiene que tener ese valor. Si navegamos a esa URL veremos más detalles sobre las propiedades que vamos a comentar aquí y muchas otras que obviaremos.

En cuanto al `theme`, se puede elegir entre `dark` o `light`. Si eres un buen *hacker*, la opción correcta es `dark`.

Y la propiedad `defaultProfile` la usaremos para escribir el `guid` del profile que se abrirá por defecto.

### Profiles

En `profiles` encontraremos un listado de los perfiles que estamos usando. Es decir, los tipos de terminales que podemos abrir. Esos que aparecen encima de la opción de "Settings" en el menú emergente.

Cada uno de estos perfiles tendrá más o menos estos campos:

```json
{
  /* datos generales */
  "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
  "commandline": "%SystemRoot%\\System32\\cmd.exe",
  "startingDirectory": "C:\\workspace",
  "name": "Command Prompt",
  "icon": "C:\\pictures\\cmd.ico",
  "hidden": false,

  /* transparencia de ventana */
  "useAcrylic": true,
  "acrylicOpacity": 0.75,

  /* imagen de fondo */
  "backgroundImage": "C:\\pictures\\sf2.gif",
  "backgroundImageOpacity": 0.2,
  "backgroundImageStretchMode": "uniformToFill",

  /* colores */
  "colorScheme": "Campbell",

  /* cursor */
  "cursorShape": "bar",
  "cursorColor": "#FFFFFF",

  /* fuente */
  "fontFace": "Cascadia Mono",
  "fontSize": 12,

  /* márgenes */
  "padding": "8, 8, 8, 8",

  /* retro effect */
  "experimental.retroTerminalEffect": true
}
```

Evidentemente hay más, pero aquí exponemos los que hacen que tu terminal mole. Los demás no te van a aportar tanto efecto *Wow*.

Lo primero que definiremos serán los datos generales del perfil:

- `guid`: el código con el que vamos a identificar este perfil. Este es el valor que usaremos en `defaultProfile` para marcar el perfil que se abre por defecto en nuestro terminal.

- `commandline`: el comando que ejecuta nuestro terminal.

- `startingDirectory`: el directorio de inicio.

- `name`: el nombre que aparece en el menú para definir este perfil.

- `icon`: el icono que aparece en el menú para representar este perfil.

- `hidden`: si queremos ocultar este perfil en el menú. Esta opción será útil para una serie de perfiles que se crean automáticamente.

Para definir si la ventana del terminal es medio transparente usaremos:

- `useAcrylic`: `true`.

Y para definir el grado de transparencia:

- `acrylicOpacity`: con un número decimal menor de 1.

Si nuestra intención es poner una imagen de fondo para el perfil:

- `backgroundImage`: la ruta a la imagen de fondo que queremos usar. Y sí, puede ser un *gif* animado.

- `backgroundImageOpacity`: un número decimal menor de 1 que marca la opacidad.

- `backgroundImageStretchMode`: puede tener los valores `none`, `fill`, `uniform` o `uniformToFill`.

Los terminales pueden modificar los colores por defecto del sistema por unos que nos parezcan más agradables o con una temática semejante a la que esperamos, para ello usaremos el campo:

- `colorScheme`: el nombre de alguno de los esquemas por defecto o de uno personalizado que hayamos definido en la sección de `schemes`.

El cursor que se muestra parpadeando en pantalla, donde se indica que vamos a escribir es una parte fundamental de nuestro terminal. Aquí podremos elegir entre un puñado de formas que son las más comunes que podemos encontrar:

- `cursorShape`:  puede tener los valores `bar`, `underscore`, `vintage`, `filledBox` o `emptyBox`.

![windows terminal cursor shapes](/assets/uploads/2020/11/wt-cursor-shapes.png)
- `cursorColor`: especifica un color para el cursor.

Y cómo no, la fuente. Es un detalle muy importante de nuestro terminal poder determinar la fuente que vamos a usar:

- `fontFace`: el nombre de la fuente a usar
- `fontSize`: el tamaño en *pixels* de la fuente.

Para terminar un punto importante. A veces, nuestra consola puede aparecer demasiado cerca del borde de la ventana. Para ello contaremos con el siguiente campo:

- `padding`: aquí definiremos 4 números que representan la distancia con el borde de arriba, derecho, abajo e izquierdo.

Y como bonus, una característica que podrían borrar en el futuro (espero que no): el efecto *retro*. Crea un efecto tipo televisor CRT con scanlines y brillos:

- `experimental.retroTerminalEffect`: `true` o `false`.

![windows terminal efecto retro](/assets/uploads/2020/11/wt-retro.png)

### Schemes

Por defecto, Windows Terminal viene con una serie de [esquemas de color por defecto](https://docs.microsoft.com/en-us/windows/terminal/customize-settings/color-schemes#included-color-schemes). Pero eso no es para los *\|337* de verdad. Nosotros nos configuramos nuestros propios colores.

Para definir un color en un terminal estándard podemos definir 8 colores y sus variantes oscuras tanto para el color del texto como el de fondo. Los esquemas de color nos dejarán definir estos 16 más el color de fondo por y del texto por defecto.

Unos ejemplos de esos esquemas de colores molones serían:

- Ubuntu Legit:

```json
{
  "name": "UbuntuLegit",

  "foreground": "#EEEEEE",
  "background": "#2C001E",

  "black": "#4E9A06",
  "blue": "#3465A4",
  "cyan": "#06989A",
  "green": "#300A24",
  "purple": "#75507B",
  "red": "#CC0000",
  "white": "#D3D7CF",
  "yellow": "#C4A000",

  "brightBlack": "#555753",
  "brightBlue": "#729FCF",
  "brightCyan": "#34E2E2",
  "brightGreen": "#8AE234",
  "brightPurple": "#AD7FA8",
  "brightRed": "#EF2929",
  "brightWhite": "#EEEEEE",
  "brightYellow": "#FCE94F"
}
```

- Dracula:

```json
{
  "name": "Dracula",

  "foreground": "#F8F8F2",
  "background": "#282A36",

  "black": "#21222C",
  "blue": "#BD93F9",
  "cyan": "#8BE9FD",
  "green": "#50FA7B",
  "purple": "#FF79C6",
  "red": "#FF5555",
  "white": "#F8F8F2",
  "yellow": "#F1FA8C",

  "brightBlack": "#6272A4",
  "brightBlue": "#D6ACFF",
  "brightCyan": "#A4FFFF",
  "brightGreen": "#69FF94",
  "brightPurple": "#FF92DF",
  "brightRed": "#FF6E6E",
  "brightWhite": "#FFFFFF",
  "brightYellow": "#FFFFA5"
}
```

Pero seguro que tienes en mente alguno mejor.

Como se puede observar, el valor de `name` es el que usaremos en el campo `colorScheme`  de nuestro terminal para referenciarlo.

### Key bindings

Esta parte es muy interesante. Aquí podemos definir combinaciones de teclas para realizar acciones de nuestro terminal.

El listado completo de las acciones las podrás encontrar en [esta página](https://docs.microsoft.com/en-us/windows/terminal/customize-settings/actions).

Esta sección personalmente la uso para simular [tmux](https://en.wikipedia.org/wiki/Tmux), con la salvedad de que mejor no usar el shortcut `ctrl+b` porque hace que escribas la letra "B" varias veces antes de que se ejecute el comando que esperas. En mi caso me he decido por algo extraño como `alt+shift+[letra]`.

Aquí podréis encontrar los comandos relacionados con duplicar y dividir en dos (tanto horizontal como verticalmente) los terminales:

```json
"keybindings": [
  {
    "command": {
      "action": "splitPane",
      "split": "auto",
      "splitMode": "duplicate"
    },
    "keys": "alt+shift+d"
  },
  {
    "command": {
      "action": "splitPane",
      "split": "horizontal"
    },
    "keys": "alt+shift+h"
  },
  {
    "command": {
      "action": "splitPane",
      "split": "vertical"
    },
    "keys": "alt+shift+v"
  },
  {
    "command": "closePane",
    "keys": "alt+shift+q"
  }
]
```

El resultado final puede ser algo tan llamativo como esto:

![windows terminal split panels](/assets/uploads/2020/11/wt-split.png)

## Integraciones

Lo mejor de ser un super *hacker* es usar un terminal que mole. Y el que más mola es linux. Pero como estamos en una plataforma Windows vamos a listar unos cuantos que conozco, a ver si alguno de ellos te sirve:

### PowerShell

Este perfil viene por defecto, así que tanto el `guid` como el resto de sus propiedades las he sacado de ahí:

```json
{
  "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
  "name": "Windows PowerShell",
  "commandline": "%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
  "startingDirectory": "%USERPROFILE%",
  "icon": "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png"
}
```

Pero el *prompt* por defecto de PowerShell digamos que no es lo más molón del mundo. Si quieres parecer un tipo que sabe lo que está haciendo lo mejor es cambiarlo.

Para ello existen un par de módulos que tienes que instalar desde el propio PowerShell:

```bash
Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUser
```

Luego podrás activar estos módulos:

```bash
Set-Prompt
```

Y finalmente elegir el tema que más te guste:

```bash
Set-Theme Paradox
```

En la [página web del módulo](https://github.com/JanDeDobbeleer/oh-my-posh#themes) encontrarás un listado completo de temas, además de más detalles sobre cómo crear uno propio personalizado.

Para automatizar este *setup* puedes crearte un archivo de "PROFILE":

```bash
if (!(Test-Path -Path $PROFILE )) { New-Item -Type File -Path $PROFILE -Force }
notepad $PROFILE
```

y en el editor de archivo que se abre, añade:

```bash
Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Paradox
```

### Command Prompt

Otro de los perfiles que vienen por defecto es el `cmd` de toda la vida:

```json
{
  "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
  "name": "Command Prompt",
  "commandline": "cmd.exe",
  "startingDirectory": "%USERPROFILE%",
  "icon": "ms-appx:///ProfileIcons/{0caa0dad-35be-5f56-a8ff-afceeeaa6101}.png"
}
```

Lo que más te interesa al respecto de este perfil es añadir la propiedad `hidden`, la ponemos a `true` y listo.

Pero si aun así quieres seguir adelante te comentaremos como intentar hacer todo esto un poco más bonito. Básicamente vamos a cambiar el *prompt*.

Si escribes esto en el *command prompt* te encontrarás con una respuesta con símbolos raros:

```bash
C:\> echo %PROMPT%
$P$G
```

Para descifrar estos símbolos podemos usar esta tabla:

```
  $A   & (Ampersand)
  $B   | (pipe o tubería)
  $C   ( (paréntesis izquierdo)
  $D   Fecha actual
  $E   Escape code (ASCII code 27)
  $F   ) (paréntesis derecho)
  $G   > (el símbolo de mayor que)
  $H   Backspace (borra el carácter anterior)
  $L   < (el símbolo de menor que)
  $N   La unidad actual
  $P   La unidad y la ruta actual
  $Q   = (símbolo de igual)
  $S     (espacio)
  $T   Hora actual
  $V   Versión de Windows
  $_   Salto de línea
  $$   $ (el símbolo del dólar)
```

Así que deducimos que lo que estamos mostrando es la unidad y la ruta actual seguido de un símbolo mayor que:

```
C:\Folder>
```

En este punto podríamos cambiar esta variable para que pusiera otra cosa:

```
C:\> set PROMPT=$E[31mfer $E[33msays $E[32m$P$E[37m$_$$$S
```

![Un 'prompt' molón para 'cmd'](/assets/uploads/2020/11/cool-cmd.png)

Para jugar con los colores y algunas cosas más, tendremos que echar un vistazo los [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code).

Para cambiarlo de forma global, tienes que ir a las propiedades de "My Pc", de ahí ir a "Advanced system settings", en la ventana que aparece seleccionar la pestaña "Advanced" y dentro de esta buscar el botón "Environment Variables".

Ahora se abrirá una ventana donde podemos añadir o editar variables del sistema. Si no existe, tendrás que crear una nueva con nombre "PROMPT" y el valor que más te guste:

![Cambiando el 'prompt' de 'cmd'](/assets/uploads/2020/11/cmd-prompt.png)

La próxima vez que arranques un `cmd` verás los resultados.

### Git Bash

Aquí es donde empieza lo bueno. Si no tienes *Git for Windows* para de leer y cierra la ventana del navegador.

Existe una forma de tener nuestro *shell* favorito dentro de Windows Terminal:

```json
{
  "guid": "{75de88dc-a61a-4f9d-8f17-b820620e7163}",
  "name": "Bash",
  "commandline": "\"%PROGRAMFILES%\\git\\usr\\bin\\bash.exe\" -i -l",
  "startingDirectory": "%USERPROFILE%",
  "icon": "C:/Program Files/Git/mingw64/share/git/git-for-windows.ico"
}
```

El `guid` me lo he inventado, pero ya lo estás poniendo en la propiedad `defaultProfile` de la raíz del *settings.json*.

Los demás parámetros encajaran si tienes todo instalado en las carpetas por defecto, si no tendrás que modificar las rutas.

Para cambiar el *prompt* tendremos que abrir un *bash* y ejecutar estos comandos:

```bash
cd /etc/profile.d/
notepad git-prompt.sh
```

Ahora se abrirá la aplicación de `notepad` con el *shell script* de arranque por defecto. Lo importante es modificar el valor de la variable `PS1` que es la que contiene el *prompt*:

```bash
...
PS1="$PS1"'\[\033[32m\]'       # change to green
PS1="$PS1"'fer '               # fer
PS1="$PS1"'\[\033[35m\]'       # change to purple
PS1="$PS1"'says '              # show "says"
PS1="$PS1"'\[\033[33m\]'       # change to brownish yellow
PS1="$PS1"'\w'                 # current working directory
...
```

Este código a mitad del archivo creará el *prompt* tan guay que veis en la introducción de este artículo:

![Un 'bash' molón](/assets/uploads/2020/11/cool-bash.png)

Para jugar con los colores y algunas cosas más, tendremos que echar un vistazo los [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code).

### Cmder

Muchos aficionados a Windows ya usan terminales alternativos como *Cmder*. La buena noticia es que también puedes usar estas *shells* en Windows Terminal. En mi caso, tengo instalado *Cmder* en la carpeta "C:\Cmder" y la configuración del perfil queda así:

```json
{
  "guid": "{32b1ecb1-3e15-4606-9683-e0d644adb2ea}",
  "name": "Cmder",
  "commandline": "cmd.exe /k call C:\\Cmder\\vendor\\init.bat",
  "startingDirectory": "%USERPROFILE%",
  "icon": "C:\\Cmder\\icons\\cmder.ico"
}
```

Para personalizar el *prompt* nos tendremos que dirigir al directorio donde tenemos instalado *Cmder*, entrar en la carpeta "vendor" y editar el archivo "clink.lua".

Ahí encontraremos una función llamada `set_prompt_filter`, donde viene la creación del *prompt* de *Cmder*. Hay que tener en cuenta que viene en LUA. Si dejamos esta función con este código:

```lua
local function set_prompt_filter()
  local old_prompt = clink.prompt.value
  local cwd = old_prompt:match('.*(.:[^>]*)>')
  if cwd == nil then cwd = clink.get_cwd() end

  local env = old_prompt:match('.*%(([^%)]+)%).+:')
  if env == nil then env = old_prompt:match('.*%[([^%]]+)%].+:') end

  local blackbg="\x1b[1;40m"
  local green = "\x1b[1;32m"
  local yellow = "\x1b[1;33m"
  local magenta = "\x1b[1;35m"
  local cyan = "\x1b[1;36m"
  local default = "\x1b[1;39m"
  local reset = "\x1b[0m"
  local cmder_prompt = blackbg..green.."fer "..magenta.."in "..yellow.."{cwd} "..cyan.."{git}{hg}{svn} \n"..default.."{lamb} "..reset
  local lambda = "λ"
  cmder_prompt = string.gsub(cmder_prompt, "{cwd}", verbatim(cwd))

  if env ~= nil then
    lambda = "("..env..") "..lambda
  end

  clink.prompt.value = string.gsub(cmder_prompt, "{lamb}", verbatim(lambda))
end
```

Obtendremos un terminal semejante a este:

![Un 'Cmder' molón](/assets/uploads/2020/11/cool-cmder.png)

Para jugar con los colores y algunas cosas más, tendremos que echar un vistazo los [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code).

### Developer Command Prompt for VS 2019

Si eres desarrollador y usas *Visual Studio*, seguro que quieres tener dentro del terminal el famoso "Developer Command Prompt for VS 2019". Pues es muy fácil:

```json
{
  "guid": "{d192740d-3258-445c-800f-5258a0a4bb81}",
  "name": "Developer Command Prompt for VS 2019",
  "commandline": "cmd.exe /k \"C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\Common7\\Tools\\VsDevCmd.bat\"",
  "startingDirectory": "%USERPROFILE%",
  "icon": "ms-appx:///ProfileIcons/{0caa0dad-35be-5f56-a8ff-afceeeaa6101}.png"
}
```

El `guid` es de mi propia cosecha, y la forma de gestionar el prompt es la misma que para el [Command Prompt](#command-prompt).

### WSL & Azure Cloud Shell

Hay una serie de perfiles que aparecerán Windows Terminal si tienes instalados los componentes necesarios. Estos son el WSL (Windows Subsystem for Linux) y el Azure Cloud Shell.

Si por alguna razón, los necesitas y no aparecen en el listado, este código te ayudará a tenerlos:

```json
{
  "guid": "{c6eaf9f4-32a7-5fdc-b5cf-066e8a4b1e40}",
  "name": "Ubuntu-18.04",
  "source": "Windows.Terminal.Wsl"
},
{
  "guid": "{b453ae62-4e3d-5e58-b989-0a998ec441b8}",
  "name": "Azure Cloud Shell",
  "source": "Windows.Terminal.Azure"
}
```

## Conclusiones

Aquí no están, ni mucho menos, todas las opciones de configuración y personalización que nos permite Windows Terminal. Solo las que te van a resultar más importantes para poder fardar.

Sigue estos consejos y la próxima vez que compartas escritorio, abre un Windows Terminal. Deja que tus compañeros admiren lo chulo que es. Hazles saber que tú eres *\|337* y que ellos son unos p**** *n00bs*.

O si no, cópiate mi `settings.json`, que es más rápido, desde [este enlace](https://gist.github.com/fernandoescolar/84bf7b749da8ce5c52d1f55848b33bb9).
