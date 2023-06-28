La terraformación es un conjunto de técnicas que aplicadas en conjunto conseguirían dotar a un planeta o asteroide inerte, de un conjunto de características semejantes a las de la tierra. De esta forma se conseguiría un planeta habitable. Y aunque pueda parecer pomposo (que lo es), `terraform` va de eso mismo, pero con el *cloud*.

No es que queramos que la nube sea habitable para un ser humano, pero sí para nuestra aplicaciones.

```bash
$ az login
$ az account set --subscription="SUBSCRIPTION_ID"
$ az ad sp create-for-rbac --role="Contributor" --scopes="/subscriptions/SUBSCRIPTION_ID"
```

```yaml
# environment.tf
variable "subscription_id" {}
variable "client_id" {}
variable "client_secret" {}
variable "tenant_id" {}
variable "environment" {}
variable "location" {}

# Configure the Azure Provider
provider "azurerm" {
  subscription_id = "${var.subscription_id}"
  client_id       = "${var.client_id}"
  client_secret   = "${var.client_secret}"
  tenant_id       = "${var.tenant_id}"
}

# Create Resource Groups
resource "azurerm_resource_group" "terraform-waf" {
  name     = "terraform-waf-${var.environment}"
  location = "${var.location}"
}
```

```yaml
# config.dev.tfvars
subscription_id = ".."
client_id = ".."
tenant_id = ".."
client_secret = ".."
environment = "dev"
location = "West Europe"
```

```bash
$ terraform init
$ terraform workspace new dev
$ terraform plan -var-file=config.dev.tfvars
```

```bash
$ terraform apply -var-file=config.dev.tfvars -auto-approve
```

Terraform - [Feature Request: AppService Environments (ASE) Support](https://github.com/terraform-providers/terraform-provider-azurerm/issues/438)


```bash
$ terraform import azurerm_resource_group.terraform-waf /subscriptions/b8297b52-e76b-4319-b90a-568e78a75945/resourceGroups/terraform-waf-dev
```
