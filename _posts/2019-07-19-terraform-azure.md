---
published: true
ID: 201907191
title: 'Terraform con Azure'
author: fernandoescolar
post_date: 2019-07-19 07:51:23
layout: post
tags: azure terraform
---

La terraformación es una serie de técnicas que, aplicadas en conjunto, conseguirían dotar a un planeta o asteroide inerte, de una serie de características semejantes a las de la tierra. De esta forma se conseguiría un planeta habitable. Y aunque pueda parecer pomposo (que lo es), Terraform va de eso mismo, pero con el *cloud*.<!--break--> No es que queramos que la nube sea habitable para un ser humano, pero sí para nuestras aplicaciones.

Terraform es una herramienta que nos ayuda a gestionar infraestructura como código. Hereda las características de esta práctica: la capacidad de versionar, construir, actualizar o borrar infraestructura, sin tener que interactuar físicamente con el hardware o con herramientas interactivas. Así conseguimos una forma de administración de sistemas informáticos más potente y sencilla. Al menos para un programador.

![Terraform](/assets/uploads/2019/07/hashicorp-terraform.png)

Y ¿cómo se usa esto con Azure?

## Instalando

Instalar [Terraform](https://www.terraform.io) en **Windows**, como dice un colega, es un poco *tricky*. Básicamente consiste en:

- Descargar el archivo .exe de su [web oficial](https://www.terraform.io/downloads.html).
- Almacenar ese archivo en un directorio local.
- Añadir a la variable de entorno `PATH` la ruta de esa carpeta.

Para el resto de sistemas operativos, recomendaría usar los repositorios de paquetes habituales. Por ejemplo en **macOS**, puedes usar `brew`:

```bash
$ brew install terraform
```

## Proyecto para Azure

### Creando un *service principal*

Para empezar a usar Terraform con Microsoft Azure lo primero que tendremos que hacer es tener unas credenciales de una cuenta de *service principal* para nuestra suscripción de Azure. Para obtenerlas podemos usar la herramienta [Azure CLI](https://docs.microsoft.com/es-es/cli/azure/install-azure-cli?view=azure-cli-latest):

```bash
$ az login
```

Después de introducir nuestra credenciales, se listarán las suscripciones a las que pertenecemos. De ahí hay que leer el parámetro `id` de la que nos interese. Después seleccionamos esa suscripción para trabajar con ella:

```bash
$ az account set --subscription="SUBSCRIPTION_ID"
````

Y finalmente creamos la cuenta de *service principal*:

```bash
$ az ad sp create-for-rbac --role="Contributor" --scopes="/subscriptions/SUBSCRIPTION_ID"
```

Esta petición nos devolverá algo como esto:

```json
{
  "appId": "...",
  "displayName": "...",
  "name": "...",
  "password": "...",
  "tenant": "..."
}
````

Donde:

- `appId` equivale a `client_id`
- `password` es el `client_secret`
- `tenant` es en realidad el `tenant_id`

### Inicializando Terraform

Antes de inicializar Terraform, tendremos que crear un archivo ".tf" (pe. "main.tf"). En este archivo introduciremos el proveedor que queremos utilizar y las credenciales de *service principal* necesarias para su uso:

```ini
provider "azurerm" {
  subscription_id = "..."
  client_id       = "..."
  client_secret   = "..."
  tenant_id       = "..."
}
```

Ahora ejecutaremos en la consola o el terminal, el comando de inicialización:

```bash
$ terraform init
```

Esto descargará todo lo necesario para poder conectar con Azure e interactuar. Los archivos se almacenarán en una carpeta con el nombre ".terraform" que podrá ser excluida del repositorio de código fuente.

## Codificando

Como habremos podido observar ya, el formato para crear infraestructura en Terraform es el `HCL` ([HashiCorp configuration language](https://github.com/hashicorp/hcl)). La idea es utilizar la siguiente estructura:

```ini
resource "tipo_de_recurso" "nombre_interno_recurso" {
    propiedad1  = valor1
    propiedad2  = valor2
    propiedad3 {
        sub_propiedad1 = sub_valor1
        sub_propiedad2 = sub_valor2
    }
}
```

De esta forma, si quisiera crear un `Resource Group` de Azure, podría añadir a mi archivo ".tf" algo como esto:

```ini
resource "azurerm_resource_group" "mi_resource_group" {
  name     = "prueba-terraform"
  location = "West Europe"
}
```

Si ahora quisiera añadir a este grupo, un `App Service Plan` donde alojar mi página web, añadiría:

```ini
resource "azurerm_app_service_plan" "mi_app_service_plan" {
  name                = "prueba-terraform-service-plan"
  location            = azurerm_resource_group.mi_resource_group.location
  resource_group_name = azurerm_resource_group.mi_resource_group.name
  kind                = "Windows"

  sku {
    tier      = "Standard"
    size      = "S1"
  }
}
```

Como podemos observar en este caso, para definir los parámetros `location` y `resource_group_name`, estoy llamando directamente a las variables de salida de la creación del grupo de recursos. Cada recurso, por tanto, tienes unos parámetros de entrada, que son los que escribimos en su definición, y unos de salida que podemos utilizar llamando a `tipo_de_recurso.nombre_interno_recurso.parametro_salida`.

Finalmente, para este ejemplo, crearíamos una `Web App` de `App Services`:

```ini
resource "azurerm_app_service" "mi_app_service" {
  name                = "prueba-terraform-web"
  location            = azurerm_resource_group.mi_resource_group.location
  resource_group_name = azurerm_resource_group.mi_resource_group.name
  app_service_plan_id = azurerm_app_service_plan.mi_app_service_plan.id

  site_config {
    always_on         = true
    default_documents = ["default.aspx","default.html","index.html","hostingstart.html"]
  }
}
```

Todos estos bloques que código se pueden añadir a un mismo archivo con extensión ".tf" o se pueden almacenar en varios.

## Operando

Terraform es una herramienta de consola, por lo que para realizar operaciones, es necesario usar los diferentes comandos que tiene, en un terminal. Los que más veces vamos a utilizar son:

### plan

Cuando consideremos que ya tenemos listo nuestro código, es el momento de probar que sintácticamente es correcto. Para ello ejecutaremos el comando `plan`:

```bash
$ terraform plan
```

La salida de este comando, si es correcto el contenido de los ".tf", será un `json` descriptivo con la infraestructura que se va a crear, modificar y/o borrar. Y en caso de errores, nos señalará donde se encuentran y nos informará de la causa.

El comando `plan`, al igual que todos los demás comando de Terraform, buscará en el directorio donde lo ejecutemos todos los archivos con extensión ".tf" y los tratará como uno solo. Además, tampoco tenemos que preocuparnos por el orden en el que declaramos los recursos. Terraform buscará cual es el orden correcto, qué tareas puede paralelizar y cómo realizar la creación de la infraestructura lo más eficientemente que pueda.

### apply

Una vez que estamos satisfechos con la propuesta que hemos visto en el plan, es el momento de llevar esos recursos a la nube. Para ello usaremos el comando `apply`. Este comando realiza un incremental de actualización sobre nuestra infraestructura:

- Si no existe, lo crea todo
- Si ya existe, planifica la creación, modificación y borrado de los recursos ya existentes con respecto los propuestos en nuestro código.

```bash
$ terraform apply -auto-approve
```

![Terraform](/assets/uploads/2019/07/terraform-apply.jpg)

Haber realizado un `plan` previamente, no nos garantiza que no pueda fallar el apply. El primero calcula que la sintaxis sea correcta, y `apply` se enfrenta directamente con Microsoft Azure. En esta plataforma existen más normas, como por ejemplo, que el nombre de nuestro *app service* no exista previamente. Si estas normas de la plataforma no se ven satisfechas, nos encontraremos ante errores en este punto.

Hay que tener en cuenta que el comando `apply` se basa en la existencia de un estado almacenado. Si en un momento determinado, el estado de nuestros recursos en Azure ha evolucionado de forma diferente a la última vez que ejecutamos el comando `apply`, lo más recomendable es sincronizar el estado usando el comando `import`.

### destroy

Si en un momento determinado queremos borrar todos los recursos que creamos anteriormente, el comando que tendremos que utilizar es `destroy`. Este comando realizará la operación contraria al `apply`, dejando nuestra cuenta de Azure limpia de infraestructura. Es un comando muy útil para crear y borrar entorno de desarrollo o prueba. La sintaxis es semejante a los anteriores comandos:

```bash
$ terraform destroy
```

## Uso algo más avanzado

Hasta aquí hemos visto un *quick start* del uso de Terraform con Microsoft Azure. Pero los archivos de código ".tf" tienen mucha más miga de lo que puede parecer en un principio:

### Variables de entrada

Las variables que más vamos a utilizar son las de entrada (*Input Variables*). Estas funciones se declaran como:

```ini
variable "nombre_variable" {
  description = "una descripción de para qué es esta variable"
  default = "un valor por defecto"
}
```

> Podemos prescindir de escribir un valor por defecto si es que no es necesario. Pero por favor, no prescindas de poner una descripción.

Para usar este tipo de variables en código es tan fácil como escribir `var.nombre_variable`:

```ini
variable "resource_group_name" {
  description = "The resource group name"
  default = "test-terraform"
}

resource "azurerm_resource_group" "my_resource_group" {
  name     = var.resource_group_name
  location = "West Europe"
}
```

Si queremos modificar el valor de una variable, podemos hacerlo utilizando:

- El argumento `-var="nombre_variable=valor"` en nuestro comando:

```bash
terraform apply -var="nombre_variable=valor"
```

- Usando un archivo ".tfvars" que podremos referenciar con el argumento `-var-file="mi_archivo.tfvars"`:

```bash
terraform apply -var-file="mi_archivo.tfvars"
```

También podemos hacer que nuestro archivo sea cargado automáticamente nombrándolo "terraform.tfvars" o terminando en "auto.tfvars".

Este archivo de tipo ".tfvars", contendrá claves y valores en este formato:

```ini
nombre_variable_texto   = "valor variable"
nombre_variable_bool    = false
nombre_variable_numero  = 1
nombre_variable_lista   = ["uno", "dos"]
nombre_variable_objeto  = { parametro = "valor" }
```

### Variables locales

Las variables locales se declaran dentro de un bloque llamado `locals`:

```ini
locals {
  nombre_variable1 = "valor 1"
  nombre_variable2 = "valor 2"
}
```

Y para su uso se referencian con el formato `local.nombre_variable1`.

Estas variables se pueden usar para componer otros valores diferentes a partir de variables de entrada o de salida. El ejemplo más común sería el de concatenar cadenas de texto:

```ini
variable "environment" {}

variable "application" {}

locals {
    name = "${var.environment}-{var.application}-resource-group"
}
```

### Funciones

También tenemos [funciones de Terraform](https://www.terraform.io/docs/configuration/functions.html) que nos permiten hacer operaciones más complejas:

Desde buscar máscaras de un rango de *IPs* en formato *CIDR*:

```ini
variable "cidr" { default = "10.12.127.0/20" }

locals {
    ip   = cidrhost(var.cidr, 16) # 10.12.112.16
    mask = cidrnetmask(var.cidr)  # 255.255.240.0
}
```

Hasta abrir archivos como base64:

```ini
variable "filepath" { default = "./certificate.pfx" }

locals {
    certificate_base64 = filebase64(var.filepath)
}
```

### Bucles

Terraform nos permite realizar la creación de el mismo recurso varias veces usando el parámetro `count`:

```ini
resource "azurerm_resource_group" "mi_resource_group" {
  count    = 2
  name     = "prueba-terraform-${count.index}"
  location = "West Europe"
}
```

Este código crearía dos grupos de recursos en mi cuenta de Azure: uno con el nombre de "prueba-terraform-0" y otro "prueba-terraform-1". Recordad generar diferentes nombres para los recursos que se generan con el `count` si queréis evitar errores.

Si quisiera referenciar el nombre de los recursos que acabo de crear, tengo varias formas diferentes:

```ini
azurerm_resource_group.mi_resource_group[0].name            # prueba-terraform-0
element(azurerm_resource_group.mi_resource_group, 1).name   # prueba-terraform-1
element(azurerm_resource_group.mi_resource_group.*.name, 0) # prueba-terraform-0
azurerm_resource_group.mi_resource_group.*.name[1]          # prueba-terraform-1
```

El parámetro `count` también se puede utilizar como condicional asignándole los valores `1` o `0` en dependencia de un ternario:

```ini
variable "create_resource_group" {
  default = false
}

resource "azurerm_resource_group" "mi_resource_group" {
  count    = var.create_resource_group ? 1 : 0
  name     = "prueba-terraform"
  location = "West Europe"
}
```

Y también tenemos bucles `for` para la creación de variables. Su comportamiento es semejante a un `for each` y nos da mucha versatilidad:

```ini
variable "ip_cidr" {
  default = [ "10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24" ]
}

locals {
  subnets = [for x in var.ip_cidr: {
    ip   = element(split("/", x), 0)
    mask = cidrnetmask(x)
  }]
}
```

En este código convertiríamos una lista de rangos de IP en formato CIDR, en un listado de objetos con las propiedades "ip" y "mask".

### Módulos

Ya sabemos que podemos crear todos los archivos ".tf" que queramos. No es de extrañar entonces, que muchos desarrolladores piensen en dividir la creación de una infraestructura completa en varios archivos clasificados por tipo de recurso. Algo como esto:

```bash
main.tf
group.tf
database.tf
cache.tf
webapp.tf
waf.tf
traffic.tf
```

Tampoco creo que fuera descabellado pensar que, si tengo ya archivos ".tf" especializados en una sola tarea ¿por qué no iba a reusar estos archivos en otros proyectos o infraestructuras?.

Los módulos de terraform vienen a solucionar las problemáticas derivadas de este uso tan impío.

Un módulo de terraform se define con una serie compuesta por: variables de entrada, definición de recursos y variables de salida. Por lo que es muy común encontrarnos (y recomendable usar) una estructura de ficheros como la siguiente:

```bash
mi_modulo/vars.tf
mi_modulo/main.tf
mi_modulo/output.tf
```

Si quisiéramos crear un módulo para la creación de una Web App, crearíamos una nueva carpeta llamada "webapp" dentro de la carpeta "modules":

```ini
# modules/webapp/vars.tf
variable "resource_group_name" {}
variable "location" {}
variable "tier" {}
variable "size" {}

# modules/webapp/main.tf
resource "azurerm_app_service_plan" "mi_app_service_plan" {
  name                = "prueba-terraform-service-plan"
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "Windows"

  sku {
    tier      = var.tier
    size      = var.size
  }
}
resource "azurerm_app_service" "mi_app_service" {
  name                = "prueba-terraform-web"
  location            = var.location
  resource_group_name = var.resource_group_name
  app_service_plan_id = azurerm_app_service_plan.mi_app_service_plan.id
}

# modules/webapp/output.tf
output "id" {
  value = azurerm_app_service_plan.mi_app_service_plan.id
}

output "name" {
  value = azurerm_app_service.mi_app_service.name
}
```

Aquí podemos observar una novedad: las variables de salida.

Como se puede ver, es muy simple declararlas: basta con poner `output`, el nombre de la variable y una propiedad donde encontraremos el valor.

Si ahora queremos utilizar nuestro módulo, lo haremos usando el bloque `module`. Este bloque tiene una propiedad llamada `source` en la que indicamos el *path* de la carpeta que contiene nuestro módulo. Y después podemos añadir como parámetros el resto de variables de entrada que creamos en el propio módulo:

```ini
resource "azurerm_resource_group" "mi_resource_group" {
  name     = "prueba-terraform"
  location = "West Europe"
}

module "webapp" {
  source              = "./modules/webapp"

  resource_group_name = azurerm_resource_group.mi_resource_group.name
  location            = azurerm_resource_group.mi_resource_group.location
  tier                = "Standard"
  size                = "S1"
}
```

Si quisiéramos ahora utilizar los valores de salida de este módulo, los tendremos disponibles en:

```ini
module.nombre_modulo.nombre_variable_salida
module.webapp.name # prueba-terraform-web
```

![Terraform](/assets/uploads/2019/07/terraform-modules.jpg)

Como bola extra, un módulo de Terraform no tiene por qué encontrarse en el sistema de ficheros de la máquina. En dependencia de cómo formemos el *path* de la propiedad `source` podremos ir a:

- El registro público de Terraform:

```ini
module "un_modulo" {
  source  = "hashicorp/mi_modulo/azurerm"
  version = "1.0.0"
}
```

- Una URL:

```ini
module "un_modulo" {
  source = "https://www.ejemplo.com/mi-modulo.zip"
}
```

- O incluso un repositorio de *git*:

```ini
module "un_modulo" {
  source = "git::https://www.ejemplo.com/repositorio.git//modules/mi-modulo"
}
module "otro_modulo" {
  source = "git::ssh://username@ejemplo.com/repositorio.git"
}
```

### Workspaces

La última característica que vamos a comentar son los *workspaces* de Terraform. Generalmente suelo utilizar esta característica como punto de división y gestión de diferentes entornos.

Terraform crea un archivo con el estado actual de la infraestructura. Por defecto este archivo se llama "terraform.tfstate". Como decíamos anteriormente, es gracias a este archivo que podemos hacer incrementales al ejecutar un `apply` y en caso de tener una desincronización con el entorno real existente deberíamos actualizarlo usando un comando `import`.

El problema viene cuando tenemos más de un entorno que se distribuye con el mismo proyecto de Terraform. En este caso, nuestro estado almacenado quedaría sobre escrito continuamente por los diferentes entornos, terminando en errores sin solución. Y aquí es donde un *workspace* nos va a resultar muy útil.

Un *workspace* es un nuevo espacio donde almacenamos un estado propio. El estado de un *workspace* está aislado del estado del resto de *workspaces*. Y podemos tener todos los *workspaces* que necesitemos/queramos.

Para crear un nuevo *workspace* bastará con ejecutar el siguiente comando:

```bash
$ terraform workspace new dev
```

Así crearemos un nuevo espacio de trabajo llamado "dev". A su vez, veremos que se ha creado una carpeta llamada "terraform.tfstate.d" donde encontraremos una carpeta con el nombre "dev". Aquí se almacenará el archivo de "terraform.state" de nuestro *workspace*.

Si queremos saber cuales son los *workspaces* que tenemos ejecutaremos:

```bash
$ terraform workspace list
  default
* dev
```

Con un asterisco se marcará el *workspace* que tenemos selecciona.

Si queremos cambiar el seleccionado:

```bash
$ terraform workspace select dev
```

Y por último, si queremos borrar un *workspace* ejecutaremos:

```bash
$ terraform workspace delete dev
```

Si quisieramos saber dentro del código de un ".tf" cual es el *workspace* actual usaríamos la variable `terraform.workspace`:

```ini
resource "azurerm_resource_group" "mi_resource_group" {
  name     = "prueba-terraform-${terraform.workspace}"
  location = "West Europe"
}
```

## Conclusiones

Terraform como plataforma de infraestructura como código es una herramienta muy competente. Hereda las ventajas de IaC y les saca un mayor partido:

- Automatización de proceso de creado de infraestructura: la nube nos permite prescindir de la interacción física con el hardware. Herramientas como Terraform añaden la automatización a la nube.
- Poder crear la infraestructura fácilmente: nos permite generar infraestructura y actualizarla de una forma simple y rápida.
- La capacidad de replicar entornos de una forma sencilla: si por ejemplo, tenemos entornos de *DEV*, *PRE* y *PRO*, podemos generarlos como replicas y mantener las mismas características en unos y otros.
- Versionar la infraestructura a la vez que se versiona el código: cuando se añade una nueva característica como por ejemplo una caché distribuida, tendremos el código fuente asociado a la modificación de la infraestructura necesaria.
- Independencia de un desarrollador para generar sus propios entornos de prueba.
- Descripción clara de la infraestructura: el formato *hcl* de Terraform hace sencillo leer y hacerse a la idea de qué hay montado.

Pero también hereda sus retos y añade otra serie de problemas:

- Los límites de la plataforma los sigues teniendo. Y no se avisa de los mismos hasta la ejecución de `apply`.
- Una desincronización de la infraestructura o un error en la ejecución de un `apply` puede resultar en un estado de Terraform erróneo e irrecuperable.
- Las dependencias circulares: un límite que hoy en día que no tiene una solución ni simple y, ni mucho menos, elegante.
- No tiene soporte para todas las características y tipos de recursos de Azure.
- Es un verdadero reto mantener infraestructuras complejas que se creen y actualicen a partir de la misma versión de archivos de Terraform.

### Terraform vs ARM vs Azure CLI

Pero vamos a lo que a todos interesa: la pelea de gallos.

**Terraform vs ARM**

```diff
+ El "hcl" de Terraform es más legible, sencillo y por tanto mantenible, que el "json" de ARM
+ Los módulos de Terraform y sus diferentes fuentes dan mucha más versatilidad que los "nested templates" de ARM
+ La validación sintáctica previa con el comando "plan" de Terraform
+ Soporta ejecución de ciertas partes de infraestructura vía plantillas ARM
+ Terraform vale para otras nubes diferentes a Azure
= Herramienta de comandos multi plataforma
- Mejores herramientas para edición de ARM (hoy en día)
- Puedes sacar plantillas ARM de recursos ya creados en Azure
- ARM da más detalles en los mensajes de error de Azure
- Con ARM tienes todos los recursos que existen en Azure
```

ARM y Terraform son herramientas semejantes. Vienen a solucionar el problema de IaC. Uno de forma general y otro solo para Azure. Pero las ventajas de Terraform las encontramos en que todo es mucho más sencillo y mantenible que en ARM. Y a una mala, siempre puedes encapsular una plantilla ARM en un recurso de Terraform.

**Terraform vs Azure CLI**

```diff
+ El "hcl" de Terraform está muy bien preparado para los problemas de IaC, mientras que los ShellScript o Batch no tienen ese objetivo en un principio
+ Cuando se crea o se está modificando infraestructura con Terraform, podemos verlo en el portal de Azure
+ Los módulos de Terraform no tienen nada que ver en comparación con el uso de archivos ".sh" o ".bat"
+ La validación sintáctica previa con el comando "plan" de Terraform
+ El "hcl" es multi plataforma, pero un ".sh" o un ".bat" no
+ Terraform vale para otras nubes diferentes a Azure
+ Si usas "Makefiles" para Azure CLI, necesitas instalar otra herramienta más
= La sintaxis es sencilla de entender, tanto en comandos como en "hcl"
= Herramientas multi plataforma
= Ninguna de las dos plataformas soporta todos los recursos de Azure
= En ambos se pueden usar plantillas de ARM
- Las dependencias circulares son un verdadero problema de Terraform y muy sencillo de solventar usando Azure CLI
- A base de usar "Makefiles", Azure CLI se puede convertir en una herramienta super potente
- Se pude usar un modo "Complete" en el deploy de Azure CLI de forma que volveríamos a replicar un mismo entorno
```

Azure CLI no es una herramienta de IaC, aunque se puede usar de esta forma. En contra de lo que se pueda pensar por la sintaxis, los comandos "create" que usa, son idempotentes (por lo tanto se comportan de una forma semejante a la incremental). Pero no deja de ser una herramienta de consola para la gestión general de Azure. Terraform es una herramienta pensada solo para gestionar infraestructura como código.

### Opinión

Terraform es una herramienta muy potente, que sirve para diferentes entornos, con una sintaxis más o menos sencilla y que funciona muy bien. Aunque no es la herramienta perfecta, en mi opinión es, hoy por hoy, de lo mejorcito que tenemos disponible.

Si no consideras que te pueda ser útil, es mejor que no uses esta herramienta. Pero si, por el contrario, crees que te puede ayudar, prepárate para enfrentarte a algunos retos que te pondrán a prueba. Eso sí, al final, te aseguro que no te arrepentirás.
