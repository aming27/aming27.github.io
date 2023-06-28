---
published: false
---
Sucedió que estaba creando un proceso de build en VSTS. Necesitaba comprimir unos archivos de resultado de la compilación. Va y no existe la cajita. Seguro que a más de uno le habrá ocurrido esto alguna vez. Quizá no creando un zip, pero sí con otro tipo de acción. Menos mal que tenemos tareas genéricas: powershell, shellscript o batch. Pero puede pasar que esto no sea suficiente.

Por suerte Team Services (VSTS y TFS) tiene extensibilidad. Y una de las cosas que nos deja extender los las tareas de build y release.

Para empezar a trabajar nos vendrá muy bien una herramienta en forma de comandos llamada TFX. Instalarla es muy fácil si tienes node. Abre una consola y escribe:

```bash
$ sudo npm install -g tfx-cli
```

Si no estamos en macos o linux, el "sudo" nos lo podemos ahorrar :).

Una vez se haya instalado, si estamos en Windows no habrá ningún problema. Aunque esto no es así en otros sistemas operativos. Si al ejecutar el nuevo comando "tfx" te encuentras con este error:

```bash
$ tfx
env: node\r: No such file or directory
```

Es relativamente sencillo de solucionar con el siguiente workaround:

```bash
$ brew install dos2unix
$ sudo dos2unix -F $(which tfx)
dos2unix: converting file /usr/local/bin/tfx to Unix format...
```

Lo que hemos hecho con estas dos líneas es instalar una tool llamada dos2unix. Esta utilidad modifica los archivos generados en Windows, para que sistemas unix no encuentren caracteres extraños. Despues hemos ejecutado esta herramienta sobre los archivos del comando "tfx".

A partir de aquí, al ejecutar "tfx" todos deberíamos ver la ayuda del comando.

Esta herramienta nos ofrece una forma rápida de crear una plantilla para luego programar nuestra tarea, ejecutamos el comando de "tfx build tasks create". Este comando nos irá solicitando los datos necesarios para crear nuestra tarea.

```bash
$ tfx build tasks create
TFS Cross Platform Command Line Interface v0.3.39
Copyright Microsoft Corporation
> Task Name: Zip
> Friendly Task Name: Zip Task
> Task Description: This creates a Zip file
> Task Author: fernandoescolar

created task @ /Users/fernandoescolar/Zip
id   : f5d62250-a510-11e6-9d90-21c7a4a70529
name: Zip

A temporary task icon was created.  Replace with a 32x32 png with transparencies
```

Si echamos un vistazo veremos que nos ha creado una carpeta con el nombre de tarea que indicamos. Si miramos el contenido de esa carpeta debería ser semejante al siguiente:

![New VSTS Task](/assets/uploads/2016/11/vsts-tasks-folder.png)

- **icon.png**: será el logo de nuestro step en la web de Team Services. Es una imagen de 32x32 pixels.
- **sample.js**: es un script de nodejs que se ejecutará. Es la tarea en sí.
- **sample.ps1**: es un script de powershell que se ejecutará.
- **task.json**: es el archivo de definición de nuestra tarea.


# Definiendo: task.json

Al abrir el archivo "task.json" encontraremos al principio los datos que insertamos al crearla con tfx:

```json
{
  "id": "f5d62250-a510-11e6-9d90-21c7a4a70529",
  "name": "Zip",
  "friendlyName": "Zip Task",
  "description": "This creates a Zip File",
  "author": "fernandoescolar",
  "helpMarkDown": "Replace with markdown to show in help",
```

Donde:

- **id**: es el identificador único de nuestra tarea.
- **name**: el nombre que le hemos dado
- **friendlyName**: es el nombre con el que se mostrará la nueva tarea
- **description**: la descripción de sus funcionalidades
- **author**: nuestro nombre válido para publicar la tarea
- **helpmarkDown**: es el texto de ayuda en formato markdown

Si seguimos más adelante en el archivo encontraremos:

```json
  "category": "Utility",
  "visibility": [
    "Build",
    "Release"
  ],
  "demands": [],
  "version": {
    "Major": "0",
    "Minor": "1",
    "Patch": "0"
  },
  "minimumAgentVersion": "1.95.0",
````

Aqui encontramos:

- **category**: será el menú de clasificación de tareas que la contendrá
- **visibility**: sirve para determinar si se mostrará esta tarea en build, release o en ambas seciones
- **demands**: es un lista de necesidades para que la tarea sea ejecutada. Por ejemplo, si llamamos a "curl", lo añadiremos a esta lista. Lo mismo si usamos "nodejs" o "dotNetCore"...
- **version**: es la versión actual de nuestra tarea
- **minimumAgentVersion**: es la versión mínima necesaria para que un agente pueda ejecutar esta tarea

Seguimos avanzando en el archivo:

```json
  "instanceNameFormat": "Test $(message)",
  "inputs": [
    {
      "name": "cwd",
      "type": "filePath",
      "label": "Working Directory",
      "defaultValue": "",
      "required": false,
      "helpMarkDown": "Current working directory when Test is run."
    },
    {
      "name": "msg",
      "type": "string",
      "label": "Message",
      "defaultValue": "Hello World",
      "required": true,
      "helpMarkDown": "Message to echo out"
    }
  ],
```

Una vez hemos añadido la tarea a nuestro proceso, en el panel de edición esto es lo que veremos:

- **instanceNameFormat**: el nombre de la tarea en el listado de pasos y al ejecutarse el proceso
- **inputs**: esto son los parámetros de ejecución de nuestra tarea. Por cada uno rellenaremos:
	- **name**: nombre del parámetro
	- **type**: el tipo de parámetro. Por ahora conozco "string", "filePath", "boolean" y "multiLine"
	- **label**: es el nombre que aparecerá en pantalla
	- **defaultValue**: si queremos que tenga un valor por defecto
	- **required**: para determinar si es obligatorio rellenar esta propiedad para ejecutar la tarea
	- **helpMarkDown**: es el mensaje que aparece en el icono de ayuda al lado de input del parámetro

Para terminar, al final de nuestro archivo encontraremos:

```json
  "execution": {
    "Node": {
      "target": "sample.js",
      "argumentFormat": ""
    },
    "PowerShell3": {
      "target": "sample.ps1"
    }
  }
}
```

El parámetro de "execution" es donde se define que sucede al ejecutar nuestra tarea. En el template vienen definidos dos comandos: uno de nodejs y otro de PowerShell 3. En mi experiencia personal, PowerShell 3 siempre da error al ejecutarse. Supongo que lo corregirán pronto. Y como soy más de .Net que de js, siempre lo cambio a un formato semejante a este:

```json
  "execution": {
    "PowerShell": {
      "target": "$(currentDirectory)\\test.ps1"
    }
  }
}
```

Esto lo que indica es que al ejecutar nuestra tarea se ejecutará el archivo "test.ps1" en una consola de PowerShell. Como curiosidad he añadido el path "$(currentDirectory)\\" antes del nombre del script. Esto es porque si dejamos la ruta relativa, en un TFS on-premises no funciona correctamente. Aunque sí que lo hace en VSTS.

# Creando el proceso: test.ps1

Como ya hemos comentado antes, a mi lo que se me da bien es .Net. Así que he creado un proceso para crear un zip en c#. La parte buena es que este código se puede usar con un script de PowerShell sin demasiados problemas. Así que declararé al principio los parámetros que necesito para ejecutar y después llamaré a mi código en c#:

```bash
[CmdletBinding(DefaultParameterSetName = 'None')]
param
(
    [String] [Parameter(Mandatory = $true)]
    $src,
	[String] [Parameter(Mandatory = $true)]
    $zip,
    [String]
    $filter = "",
    [String]
    $recursive = $true
)


$Assem = (
    "System.IO.Compression, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
)

$Source = @"
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
namespace Utilities
{
    public static class Zip
    {
        public static void Create(string folder, string filter, string target, bool recursive)
        {
            if (!Directory.Exists(folder))
                throw new DirectoryNotFoundException("Folder '" + folder + "' not found");

            var searchPatterns = new List<string>();
            if (!string.IsNullOrEmpty(filter))
            {
                var filters = filter.Split(new[] { '\r', '\n', ',', ';' }, System.StringSplitOptions.RemoveEmptyEntries);
                if (filters != null) searchPatterns.AddRange(filters);
            }
            if (searchPatterns.Count == 0) searchPatterns.Add("*");
            if (File.Exists(target)) File.Delete(target);
			System.Console.WriteLine("Compressing in " + target);
            var filesToAdd = searchPatterns.SelectMany(searchPattern => Directory.EnumerateFiles(folder, searchPattern, recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly)).ToList();
            using (var zipStream = new StreamWriter(target))
            {
                using (var zip = new ZipArchive(zipStream.BaseStream, ZipArchiveMode.Create, true))
                {
                    foreach (var file in filesToAdd)
                    {
                        var name = file;
                        if (name.StartsWith(folder)) name = name.Substring(folder.Length);
                        if (name.StartsWith("\\")) name = name.Substring(1);
						System.Console.WriteLine(" Adding " + name);
                        var entry = zip.CreateEntry(name);
                        using (var writer = new StreamWriter(entry.Open()))
                        {
                            using (var reader = new StreamReader(file))
                            {
                                reader.BaseStream.CopyTo(writer.BaseStream);
                            }
                        }
                    }
                }
            }
			System.Console.WriteLine("Done");
        }
    }
}
"@

Add-Type -ReferencedAssemblies $Assem -TypeDefinition $Source -Language CSharp

if ($recursive -eq "true" -or $recursive -eq "True" -or $recursive -eq "TRUE" -or $recursive -eq 1) { $recursive = $true }
else { $recursive = $false }


[Utilities.Zip]::Create($src, $filter, $zip, $recursive)
```

Y como este script usa más y diferentes parámetros de los que hemos definido en el "task.json" lo que haré es modificar este archivo, la propiedad "inputs" añadiendo los parámetros de entrada que requiere el script. Como se muestra a continuación:


```json
"inputs": [
    {
      "name": "src",
      "type": "filePath",
      "label": "Source Folder",
      "defaultValue": "",
      "required": true,
      "helpMarkDown": "The root folder to compress into a zip file."
    },
    {
      "name": "filter",
      "type": "multiLine",
      "label": "Contents",
      "defaultValue": "*.*",
      "required": false,
      "helpMarkDown": "File or folder paths to include as part of the artifact.  Supports multiple lines or minimatch patterns."
    },
	{
	  "name": "recursive",
      "type": "boolean",
      "label": "Recursive",
      "defaultValue": "true",
      "required": false,
      "helpMarkDown": "Explore also subfolders."
    },
	{
	  "name": "zip",
      "type": "filePath",
      "label": "Zip File",
      "defaultValue": "",
      "required": true,
      "helpMarkDown": "Zip File will be created."
    }
  ],
```

# Probando la nueva tarea

Podemos probar nuestra tarea subiendola a nuestro VSTS. Para ello primero tendremos que identificarnos en el servidor usando el comando 'login':

```bash
$ tfx login
```
Para este comando tendremos que usar tokens de acceso personales. Podemos leer la siguiente web para saber en cómo hacernos con uno:

http://roadtoalm.com/2015/07/22/using-personal-access-tokens-to-access-visual-studio-online

La otra variante es usar tipo de autentificación básica, usando usuario y contraseña:

```bash
$ tfx login --auth-type basic
```

Para usarlo con TFS 2017 tendremos que realizar unos pequeños cambios en el servidor de IIS que podemos leer en la siguiente página:
https://github.com/Microsoft/tfs-cli/blob/master/docs/configureBasicAuth.md

Una vez hemos hecho login podemos subir nuestra tarea con el siguiente comando, indicando la carpeta donde se encuentra nuestra extensión:

```bash
$ tfx build tasks upload --task-path ./Zip
```

Si ahora entramos en el TFS/VSTS veremos que aparece una nueva "cajita" con la tarea que hemos creado :)

Por último, si queremos borrar la tarea del TFS/VSTS tendremos que llamar al comando "delete" e indicando el  id de la misma:

```bash
$ tfx build tasks delete --task-id f5d62250-a510-11e6-9d90-21c7a4a70529
```


# Creando una extensión

```json
{
    "manifestVersion": 1,
    "id": "build-tasks",
    "name": "Zip Build Tools",
    "version": "1.0.0",
    "publisher": "fernandoescolar",
    "targets": [
        {
            "id": "Microsoft.VisualStudio.Services"
        }
    ],
    "description": "New build task for zip.",
    "categories": [
        "Build and release"
    ],
    "icons": {
        "default": "icon.png"
    },
    "files": [
        {
            "path": "Zip"
        }
    ],
    "contributions": [
        {
            "id": "f5d62250-a510-11e6-9d90-21c7a4a70529",
            "type": "ms.vss-distributed-task.task",
            "targets": [
                "ms.vss-distributed-task.tasks"
            ],
            "properties": {
                "name": "Zip"
            }
        }
    ]
}
```

```bash
$ tfx extension create --manifest-globs vss-extension.json
```

http://aka.ms/vsmarketplace-manage
