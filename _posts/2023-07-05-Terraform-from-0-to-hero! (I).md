---
published: true
ID: 202309062
title: 'Terraform from 0 to Hero!(1) - Que es Terraform - '
author: 'Alfonso Ming'
post_date: 2023-06-29 19:30:3p
layout: post
tags: terraform
background: '/assets/uploads/bg/terraform.png'
---

Con vistas puestas a la próxima Net Core Conf de Madrid donde me gustaría hablar de Terraform, vamos a iniciar una serie de artículos que van desde lo más elemental de Terraform a como lo utilizamos en un entorno como el de SCRM donde hay mucha gente creando infraestructura de forma diaria. <!--break-->.

  - [¿Qué es Terraform"?](#que-es-terraform)
  - [¿Que es un provider?](#qué-es-un-provider)
  - [¿Que es un resource?](#que-es-un-resource)
  - [Instalando Terraform](#instalando-terraform)
  - [Configurar Terraform](#configurar-terraform)


## Que es Terraform

Terraform es una herramienta que te permite crear y gestionar fácilmente la infraestructura en la nube. Para que te hagas una idea de forma rápida, todo aquello que puedes hacer a golpe de click en Azure, AWS o cualquier proveedor cloud lo puedes hacer mediante instrucciones con Terraform. Con Terraform, puedes automatizar el proceso de creación y administración de tu infraestructura, lo que te ahorra tiempo y esfuerzo. 
Utilizar Terraform tiene varias ventajas, la primera que es que tendrás tu infraestructura en el código, de forma declarativa. Imagina que empiezas a levantar servidores, bases de datos, redes etc ... de forma manual mediante el portal de Azure, de locos, verdad? Otras de las ventajas es que podemos tener nuestro código en un repositorio de Git con las ventajas que eso nos proporciona, histórico de cambios etc ...

## Que es un provider

Un provider es una extensión que permite a Terraform interactucar con un proveedor de infraestructura específico como AWS,Azure,GCP ... Los provider de Terraform se encargan de la comunicación con la API del proveedor, dicho en palabras más llanas, el provider de Azure por ejemplo nos sirve para crear recursos con Terraform en Azure. El provider de Terraform que usemos tiene una versión que cada proveedor va actualizando y lleva cierta relación con la versión de Terraform que estemos usando. Por ejemplo, si estamos usando la version de Terraform 0.13 no podremos trabajar con la última versión del provider de Azure. Es por ello, que siempre es muy recomendable ir actualizando nuestros proyectos de Terraform a las últimas versiones disponibles, tanto del provider como del propio Terraform.

Vale pero ¿Como declaramos nuestro provider? Ya entraremos en más detalle en los sisguientes posts, pero por ahora, si por ejemplo queremos hacerlo con Azure, podríamos hacerlo así:

```ini
terraform {
  required_providers {
    azurerm = "= 3.33.0"
  }
}
```

```ini
provider "azurerm" {

  features {}

  subscription_id = var.subscription_id
  client_id       = var.client_id
  client_secret   = var.client_secret
  tenant_id       = var.tenant_id
}
```

## Que es un resource

Pues un resource no es ni más ni menos que un objecto de infrasestructura de nuestro cloud. Por ejemplo, si queremos crear un resource de tipe "resource_group" en Azure sería así:

```ini
resource "azurerm_resource_group" "resource_groups" {
  name     = "test"
  location = "West Europe"
}

```
Ahora que ya sabemos que es Terraform, ¿ que tal si lo instalamos y empezamos a jugar?

## Instalando Terraform

Pues la verdad tampoco hay mucho que explicar, la instalación de Terraform es muy sencilla. Si vas con Windows puedes ir a la [web oficial](https://www.terraform.io/downloads.html) descargarte el .exe e instalar. En mi caso que utilizo mac es tan sencillo como hacer:

```bash
$ brew install terraform
```
Pero, espera, un momento ... ¿que pasa si estamos trabajando con diferentes proyectos que usan versiones diferentes de terraform? Pues para esto hay una solución muy chula que se llama **tdenv**. TFenv nos permite tener varias versiones del binario de Terraform instaladas en nuestro sistema y cambiar de una versión a otra de forma sencilla.
Para instalarla en Mac:

```bash
$ brew install terraform
```
Puedes visitar el github de la aplicación para ver otras formas de instalar la tool [tfenv](https://github.com/tfutils/tfenv)

## Configurar Terraform ( para trabajar con Azure)

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



Ahora que ya tenemos terraform instalado en nuestro sistema y configurado nuestro service principal para poder crear recursos en nuestra subscripción de Azure es el momento para empezar a trastear ;-) Pero eso lo dejamos para el siguiente post, donde crearemos nuestros primeros recursos y veremos los comandos básicos de Terraform!





