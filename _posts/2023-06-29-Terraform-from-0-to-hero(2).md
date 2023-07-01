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

Ya tenemos Terraform instalado y nuestro service principal para poder crear recursos en Azure, si no leíste el primer post(https://aming27.github.io/que-es-terraform), este es un buen momento para hacerlo ;-). Vamos empezar a jugar un poquito.
No te preocupes mucho si de momento no te queda algo claro, en los siguientes posts iremos refrescando los conceptos.
<!--break-->


  - [¿Qué es Terraform"?](#que-es-terraform)
  - [¿Que es un provider?](#qué-es-un-provider)
  - [¿Que es un resource?](#que-es-un-resource)
  - [Instalando Terraform](#instalando-terraform)
  - [Configurar Terraform](#configurar-terraform)


## Creando nuestros primeros recursos

Vamos a empezar con algo sencillo. Crearemos un resource group y dentro del resource group pondremos un storage, una virtual network con una subnet y securizaremos nuestro storage account.

![El esquema quedaría así:](/assets/uploads/2023/05/diagram.png)

Para ello vamos a crear un directorio al que yo en mi caso llamaré test_terraform y dentro crearemos los siguientes ficheros: main.tf, provider.tf y vars.tf 

```bash
$ mkdir test_terraform 
$ touch main.tf
$ touch provider.tf
$ touch vars.tf
```

```ini
#provider.tf
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
```ini
#main.tf
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
```ini
#vars.tf
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









