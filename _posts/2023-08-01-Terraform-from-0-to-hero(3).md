---
published: true
ID: 202309062
title: 'Terraform from 0 to Hero!(3) - Tfstate - '
author: 'Alfonso Ming'
post_date: 2023-06-29 19:30:00
layout: post
tags: terraform
background: '/assets/uploads/bg/terraform.png'
---

En el post anterior vimos como generar una infraestructura básica y aprendimos los comandos básicos de Terraform. Si no has leído el ([post anterior](https://aming27.github.io/2023/06/29/Terraform-from-0-to-hero(2)/)), ahora es buen momento ;-)

Si recuerdas lo último que hicimos fue hacer un `terraform import`. Si miras ahora en tu directorio verás que te ha aparecido un nuevo ficherete: terraform.tfstate . Y te preguntarás, ¿ para que sirve este fichero ? Pues eso es lo que vamos a tratar de ver en este artículo ;-)

<!--break-->

 - [Que es el tfstate](#que-es-el-tfstate)
 - [Casos de usos](#casos-de-uso)
  

## Que es el tfstate

 El archivo "terraform.tfstate" es un recurso esencial proporcionado por Terraform para rastrear, almacenar y mantener el estado actual de la infraestructura definida en el código. Se presenta en formato JSON y actúa como un repositorio central que almacena información detallada sobre los recursos creados en la nube, como máquinas virtuales, redes, almacenamiento, entre otros. Este archivo, en esencia, se convierte en un registro de la infraestructura en su estado actual, lo que permite una administración más eficiente y una planificación precisa de futuros cambios y actualizaciones.

Funciones clave del archivo terraform.tfstate:

- Seguimiento de recursos: Cuando Terraform crea recursos en la nube a partir de la definición del código, registra sus atributos y configuraciones en el archivo "terraform.tfstate". Esta funcionalidad es vital para garantizar la sincronización entre el estado deseado en el código y el estado real de la infraestructura en la nube. Al mantener un registro detallado de los recursos creados, evitamos discrepancias y aseguramos una infraestructura confiable y coherente.

- Gestión de versiones: El archivo "terraform.tfstate" juega un papel crucial en la gestión de versiones de la infraestructura. A medida que el código evoluciona y se realizan modificaciones en la infraestructura, Terraform actualiza este archivo con los cambios correspondientes. De este modo, se crea un historial que permite rastrear y revertir cambios en caso de ser necesario, brindando mayor control y seguridad a los despliegues.

- Planificación y ejecución precisa: Cuando se realizan modificaciones en el código de infraestructura, Terraform utiliza el archivo "terraform.tfstate" para calcular y planificar los cambios requeridos. Este proceso se conoce como "planificación", y es una de las características más valiosas de Terraform. Al analizar el estado actual y el estado deseado, Terraform identifica las diferencias y determina las acciones necesarias para alcanzar el estado deseado sin afectar la estabilidad del sistema.

Hasta aquí la explicación académica, ahora vamos a ver como trabajar con este ficherete. Este fichero no es aconsejable editarlo a mano, que tentaciones tenemos todos, de hecho para ser honestos, yo alguna vez lo he tocado a mano. Para ello Terraform provee del comando:

```bash
terraform state [list, rm, mv]
```

Con este comando podemos listar, mover y eliminar recursos de nuestro fichero de estado sin comprometer el ficherete en cuestión.
![tfstatelist](/assets/uploads/2023/08/tfstate.png)

## Casos de usos 

 ¿ Que pasaría si por ejemplo intento eliminar manualmente el storage ?

Si eliminamos manualmente el storage e intentamos hacer un plan, Terraform nos dirá que falta un storage por crear, porque lo hemos eliminado manualmente del portal de Azure pero no lo hemos eliminado del terraform.tfstate.

Así quedaría el tf plan:

![tfplan](/assets/uploads/2023/08/tfplan.png)

Y si borramos el recurso del fichero de estado de Terraform pero no de Azure y ejecutamos un plan, ¿ que sucedería ? 

```bash
terraform state rm azurerm_storage_account.storage
```

Si volvemos a ejecutar el tf plan el resultado sería el mismo que el de la imagen anterior. Con una diferencia, al hacer un terraform apply nos fallaría porque Terraform intentaría crear un recurso ya existente. Por como funciona Terraform, para eliminar un recurso completamente debemos de eliminarlo del fichero de estado pero también fisícamente del portal. Pero a ver, ¿ me estás diciendo que para borrar recursos en Terraform tengo que hacer dos pasos ? Lógicamente no, para borrar recursos tenemos un nuevo comando: 

`terraform destroy`

Ojo porque este comando ejecutado literalmente:

```bash
terraform destroy
```

Nos eliminaría toda la infraestructura contenida en el proyecto de Terraform.

Si queremos borrar un recurso específico haríamos lo siguiente:

```bash
terraform destroy -target='resource.name'”. 
```

Otra opción es directamente eliminar el recurso del proyecto de Terraform, lo cuál Terraform lo interpretará como que ese recurso ha sido eliminado y procederá a eliminarse del fichero de estado y del cloud de Azure.

Vale, pero entonces, ¿ para que vale toda la movida de los comandos de terraform state para manejar el fichero de estado de Terraform ? En mi experiencia a mi me ha resultado muy útil para mover recursos de un proyecto de Terraform a otro diferente en el que los ficheros de estado lógicamente son diferentes. En el próximo post prometo hablar de esto, y de un nuevo comando: `terraform import`




