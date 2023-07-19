---
published: true
ID: 202309062
title: 'Terraform from 0 to Hero!(2) - Creando nuestros primeros recursos - '
author: 'Alfonso Ming'
post_date: 2023-06-29 19:30:00
layout: post
tags: terraform
background: '/assets/uploads/bg/terraform.png'
---

Ya tenemos Terraform instalado y nuestro service principal para poder crear recursos en Azure, si no leíste el primer ([post](https://aming27.github.io/2023/06/29/Terraform-from-0-to-hero(1)/)), este es un buen momento para hacerlo ;-). Vamos empezar a jugar un poquito.
No te preocupes mucho si de momento no te queda algo claro, en los siguientes posts iremos refrescando los conceptos.

<!--break-->


  - [Creando nuestros primeros recursos](#Creando-nuestros-primeros-Recursos)
  - [Comandos básicos terrafom](#comandos-terraform)

## Creando nuestros primeros recursos

Vamos a empezar con algo sencillo. Crearemos un resource group y dentro del resource group pondremos un storage, una virtual network con una subnet y securizaremos nuestro storage account.

El esquema quedaría así:
![Terraform](/assets/uploads/bg/diagram.png)

Para ello vamos a crear un directorio al que yo en mi caso llamaré test_terraform y dentro crearemos los siguientes ficheros: main.tf, provider.tf y vars.tf 

```bash
$ mkdir test_terraform 
$ touch main.tf
$ touch provider.tf
$ touch vars.tf
```
provider.tf

```ini

terraform {
  required_providers {
    azurerm = "= 3.63.0"
  }
}
provider "azurerm" {

  features {}

  subscription_id = var.subscription_id
  client_id       = var.client_id
  client_secret   = var.client_secret
  tenant_id       = var.tenant_id
}
```
main.tf

```ini

resource "azurerm_resource_group" "rg" {
  name     = "rg_test"
  location = "West Europe"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "my-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
}

resource "azurerm_subnet" "subnet" {
  name                 = "subnet1"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  virtual_network_name = "${azurerm_virtual_network.vnet.name}"
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Storage"]
}

resource "azurerm_storage_account" "storage" {
  name                     = "storageaccountname"
  resource_group_name      = "${azurerm_resource_group.rg.name}"
  location                 = "${azurerm_resource_group.rg.location}"
  account_tier             = "Standard"
  account_replication_type = "GRS"

  tags = {
    environment = "staging"
  }
}

resource "azurerm_storage_account_network_rules" "rules" {
  storage_account_id = azurerm_storage_account.storage.id
  default_action             = "Allow"
  virtual_network_subnet_ids = ["${azurerm_subnet.subnet.id}"]

}
```
vars.tf

```ini

variable subscription_id {
  description = "The azure account subscription id"
  type        = string
  default     = "xxxxxxxxxxxxxxxx"
}

variable client_id {
  description = "The azure account client application id"
  type        = string
  default     = "xxxxxxxxxxxxxxxx"
}

variable client_secret {
  description = "The azure account client secret"
  type        = string
  default     = "xxxxxxxxxxxxxxxx"

}

variable tenant_id {
  description = "The azure account tenant guid"
  type        = string
  default     = "xxxxxxxxxxxxxxxx"
}

```



## Comandos terraform: init

El primer comando a ejecutar para inicializar nuestro proyecto de Terraform es:

```bash
terraform init
```
No hay que preocuparse, un terraform init nunca nos borrará nuestro estado ni ninguna configuración existente. Básicamente el comando escanea la configuración en busca de referencias a providers, en el caso de que los providers estén publicados en el registry, Terraform descargará e instalará automáticamente los plugins de providers necesarios.


El siguiente comando a ejecutar será un plan:

```bash
terraform plan
```

Cuando ejecutas el comando "terraform plan", Terraform analiza los archivos de configuración y genera un plan detallado de los cambios que se aplicarán en tu infraestructura. En lugar de realizar los cambios de inmediato, Terraform examina el estado actual de la infraestructura y compara con la definición deseada en los archivos de configuración. Este comando no nos generará ningún cambio en nuestra infra, pero si nos ayudará para saber exactamente que cambios se van a realizar.

Y por último, ahora sí, vamos a desplegar los cambios con el comando:

```bash
terraform apply
```

El plan de ejecución de Terraform consta de varias etapas que ocurren cuando ejecutas el comando "terraform plan". Estas etapas son las siguientes:

- Configuración y carga de proveedores: Terraform lee y carga los proveedores necesarios según la configuración definida en los archivos de configuración. Los proveedores son los complementos que Terraform utiliza para interactuar con diferentes servicios y tecnologías, como proveedores de nube (AWS, Azure, Google Cloud, etc.) o servicios específicos (base de datos, DNS, etc.).

- Análisis de archivos de configuración: Terraform analiza los archivos de configuración (generalmente escritos en el lenguaje de configuración de Terraform) y crea una representación interna del estado deseado de la infraestructura. Esto incluye recursos, variables, módulos, etc. Terraform también consulta el estado actual de la infraestructura almacenado en el archivo de estado.

- Descubrimiento de dependencias: Terraform determina las dependencias entre los recursos definidos en los archivos de configuración. Esto es importante para establecer un orden correcto de creación y modificación de los recursos.

- Generación del plan: Utilizando la información recopilada, Terraform genera un plan detallado de los cambios que se aplicarán a la infraestructura. El plan muestra las acciones que Terraform tomará, como crear, modificar o eliminar recursos, así como los recursos y configuraciones involucrados en cada acción.

- Validación de variables: Terraform verifica que todas las variables requeridas estén definidas y tengan valores válidos. Si hay alguna variable faltante o inválida, Terraform mostrará un mensaje de error y no continuará con la ejecución.

- Salida del plan: Una vez que el plan está completo, Terraform muestra en la salida estándar un resumen de los cambios propuestos. Esto incluye información sobre los recursos afectados, las acciones que se tomarán y cualquier cambio asociado, como direcciones IP, grupos de seguridad, etc.






