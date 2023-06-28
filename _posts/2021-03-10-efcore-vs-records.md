---
published: true
ID: 202103101
title: 'EF Core vs. Records'
author: fernandoescolar
post_date: 2021-03-10 03:21:02
layout: post
tags: ef efcore entity-framework record net5 dotnet
background: '/assets/uploads/bg/storage.jpg'
---
No cabe duda de que los *tipos registro* son la funcionalidad más molona de C# 9. Es el abrazo definitivo que necesitábamos para poder mezclar, de una vez por todas, el paradigma funcional con el orientado a objetos. Es la expresión con nombre propio de la inmutabilidad en el mundo *.Net*<!--break-->. Es una oda de rima libre, que une `record` con `with`, y allí donde no llega aparece `init`, a la forma en la que nos gustaría programar.

Todo son palabras bonitas a la hora de hablar de `record`. Porque ha venido para quedarse y utilizarse en todos los lugares posibles de nuestros desarrollos. Y te preguntarás: ¿en todos?

Bueno, existe una pequeña aldea poblada de irreductibles ensamblados que aún no hemos probado. Nos referimos a **Entity Framework Core** (EF). Y en este artículo lo vamos a poner a prueba.

> **TL;DR** todo funciona bien, pero el `ChangeTracker` no es fiable del todo debido a la inmutabilidad.

* TOC
{:toc}

## Primeros pasos

Para empezar a probar esta dupla de `record`s con **EF** comenzaremos creando una "Entity" llamada `Item`:

```csharp
public record Item(Guid Id, string Name, bool IsDone);
```

Para integrar este objeto con **EF** crearemos un nuevo `DbContext`:

```csharp
public class TodoContext : DbContext
{
  public TodoContext(DbContextOptions<TodoContext> options)
    : base(options)
  {
  }

  public DbSet<Item> Items { get; set; }
}
```

Para probar nuestro escenario en un entorno lo más aproximado al mundo real, usaremos una instancia de **Sql Express** que tenemos instalada en la máquina local:

```csharp
const string SqlConnectionString = @"Server=.\SQLEXPRESS;Database=Test;Trusted_Connection=True;MultipleActiveResultSets=true";

private TodoContext CreateContext()
{
  var options = new DbContextOptionsBuilder<TodoContext>();
  options.UseSqlServer(SqlConnetionString);
  return new TodoContext(options.Options);
}
```

Y finalmente, nos aseguraremos de que creamos la base de datos que va a necesitar nuestra aplicación con el método `EnsureDatabaseIsCreated`:

```csharp
private void EnsureDatabaseIsCreated()
{
  using var context = CreateContext();
  if (context != null && context.Database != null)
  {
    context.Database.EnsureCreated();
  }
}
```

Ahora ya estamos listos para empezar a probar las diferentes funcionalidades:

## Insert

La operación de insertar en **EF** es muy sencilla. Consiste en instanciar la entidad que queremos añadir y llamar al método `Add` del `DbSet` correspondiente en nuestro contexto:

```csharp
private const string TodoItemName = "publish a new post";

private async Task CreateItemAsync(Guid id)
{
  using var context = CreateContext();

  var item = new Item(id, TodoItemName, false);
  context.Items.Add(item);

  await context.SaveChangesAsync();
}
```

Para comprobar que, hemos creado la instancia en la base de datos, vamos a realizar una comprobación de lectura, comprobando que el estado en la base de datos es el mismo que creamos en el método anterior:

```csharp
private async Task AssertItemAsync(Guid id, bool isDone)
{
  using var context = CreateContext();

  var item = await context.Items.FindAsync(id);
  Assert.Equal(TodoItemName, item.Name);
  Assert.Equal(isDone, item.IsDone);
}
```
Para terminar, creamos una prueba de integración donde: crearemos la base de datos, un nuevo `id` y un `Item` en base de datos; para comprobar que esta operación ha tenido éxito:

```csharp
[Fact]
public async Task IntegrationTest()
{
  EnsureDatabaseIsCreated();

  var id = Guid.NewGuid();
  await CreateItemAsync(id);
  await AssertItemAsync(id, false);
}
```

Y al ejecutar: ¡Sorpresa! ¡Todo funciona correctamente si ningún problema! Igual que si hubiéramos usado `class` en lugar de `record`.

![Wow](/assets/uploads/2021/03/wow-will-smith.gif)

## Delete

La operación de borrar es otra de esas que **EF** nos facilita muchísimo. Su funcionamiento es igual que el de añadir una entidad: cargamos la entidad y llamamos al método `Remove` dentro del `DbSet` correspondiente a nuestro objeto en el contexto:

```csharp
private async Task DeleteItemAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items.FindAsync(id);
  context.Items.Remove(item);

  await context.SaveChangesAsync();
}
```

Una vez lo hemos borrado, podemos comprobar que al intentar volver a cargar la misma entidad, obtendremos un valor `null`:

```csharp
private async Task AssertItemDoesNotExistsAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items.FindAsync(id);
  Assert.Null(item);
}
```

Si completamos nuestra prueba inicial con la operación de borrado, tendremos un código como el siguiente:

```csharp
[Fact]
public async Task IntegrationTest()
{
  EnsureDatabaseIsCreated();

  var id = Guid.NewGuid();
  await CreateItemAsync(id);
  await AssertItemAsync(id, false);
  await DeleteItemAsync(id);
  await AssertItemDoesNotExistsAsync(id);
}
```

Y al ejecutar: ¡Sorpresa de nuevo! ¡Todo funciona correctamente si ningún problema! Podemos crear y borrar entidades de la misma forma que hacíamos antes.

![Wow](/assets/uploads/2021/03/wow.gif)

## Update

Estamos en racha: dos de dos. Vamos a modificar el contenido de una entidad existente.

El caso es que un `record` es un objeto inmutable. Para modificar cualquier propiedad de este objeto, tenemos que crear una copia del mismo, modificando el valor de la propiedad que queremos cambiar. Aquí es donde entra en juego la palabra clave `with`:

```csharp
private async Task MarkItemAsDoneAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items.FindAsync(id);
  item = item with { IsDone = true };

  await context.SaveChangesAsync();
}
```

Ahora vamos a añadir a la prueba el marcar una tarea como terminada y además comprobaremos que en base de datos hemos realizado ese cambio con el método de comprobación que creamos al principio `AssertItemAsync`:

```csharp
[Fact]
public async Task IntegrationTest()
{
  EnsureDatabaseIsCreated();

  var id = Guid.NewGuid();
  await CreateItemAsync(id);
  await AssertItemAsync(id, false);
  await MarkItemAsDoneAsync(id);
  await AssertItemAsync(id, true);
  await DeleteItemAsync(id);
  await AssertItemDoesNotExistsAsync(id);
}
```

Al ejecutar veremos que esta comprobación falla. La prueba esperaba que después de llamar a `MarkItemAsDoneAsync` el valor de la propiedad `IsDone` fuera `true`, pero se ha encontrado con que no se han realizado cambios.

**Entity Framework Core** usa un artefacto llamado `ChangeTracker` que se dedica a observar las entidades que estamos usando y a detectar los cambios que realizamos en ellas. Cuando llamamos a `SaveChangesAsync` sondea estos cambios y actúa en consecuencia.

¡Claro! ¿Cómo vamos a realizar la operación de modificación creando una nueva instancia de nuestro `Item` si no informamos debidamente a **EF** de que hemos cambiado la instancia?

Para ello añadiremos la llamada al método `Attach` que nos ayudará a indicarle al `ChangeTracker` que hemos modificado esta entidad:

```csharp
private async Task MarkItemAsDoneAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items.FindAsync(id);
  item = item with { IsDone = true };
  context.Items.Attach(item).State = EntityState.Modified;

  await context.SaveChangesAsync();
}
```

Al ejecutar:

> **System.InvalidOperationException**: The instance of entity type 'Item' cannot be tracked because another instance with the same key value for {'Id'} is already being tracked. When attaching existing entities, ensure that only one entity instance with a given key value is attached.

Resulta que como hemos cargado una instancia de nuestra entidad desde el contexto de **EF** y luego hemos añadido otra instancia que representa el mismo objeto, el `ChangeTracker` ha decidido que esto no puede ser.

![Bofetada inesperada](/assets/uploads/2021/03/slapping.gif)

La solución está en no usar el `ChangeTracker` cuando vamos a realizar modificaciones en una entidad de tipo `record`. Esto lo conseguiremos con el método `AsNoTracking` cuando recogemos valores desde la base de datos:

```csharp
private async Task MarkItemAsDoneAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items
                          .AsNoTracking()
                          .SingleOrDefaultAsync(x => x.Id == id);

  item = item with { IsDone = true };
  context.Items.Attach(item).State = EntityState.Modified;

  await context.SaveChangesAsync();
}
```

¡Por fin funciona!

## Ejemplo complejo

Muy bonito el ejemplo simple de una sola entidad. ¿Pero qué pasaría si tuviéramos un grafo un poco más complejo?

Para enfrentarnos con un escenario más complejo vamos a añadir a un `Item` un listado de `ItemTask` con una relación de *Many To One*:

```csharp
public record ItemTask(Guid Id, string Name);

public record Item(Guid Id, string Name, bool IsDone, ReadOnlyCollection<ItemTask> Tasks);
```

Si somos consecuentes con el comportamiento de un `record`, deberíamos crear una `ReadOnlyCollection<>` para almacenar *child items*. Pero añadir una propiedad de navegación en el constructor no le va a gustar demasiado a **EF**. Afortunadamente es casi lo mismo separarlo:

```csharp
public record ItemTask(Guid Id, string Name);

public record Item(Guid Id, string Name, bool IsDone)
{
  public ReadOnlyCollection<ItemTask> Tasks { get; init; }
}
```

El problema ahora lo tendremos con la `ReadOnlyCollection<>`. A **EF** no le gusta este tipo de objetos para hacer propiedades de navegación. Lo que sí que nos permitirá es usar `List<>` o `Collection<>`. Para poder seguir siendo inmutables, se nos ha ocurrido esta implementación:

```csharp
public record ItemTask(Guid Id, string Name);

public record Item(Guid Id, string Name, bool IsDone)
{
  private List<ItemTask> _tasks = new List<ItemTask>();

  public IEnumerable<ItemTask> Tasks
  {
    get => new ReadOnlyCollection<ItemTask>(_tasks);
    init => _tasks = value.ToList();
  }
}
```

Para añadir una `ItemTask` a un `Item` existente se nos ha complicado un poco. Tendremos que crear una nueva lista de `ItemTask` a partir de la lista de solo lectura que ya existe, añadirle nuestro nuevo objeto y crear una copia del objeto `Item` que tenga este listado y no el anterior. Evidentemente, como todo son objetos inmutables, el `ChangeTracker` no se va a enterar de nada, así que tendremos que ignorarlo y adjuntar finalmente tanto el objeto padre como el objeto hijo que estamos creando:

```csharp
private async Task AddItemTaskAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items
                          .AsNoTracking()
                          .Include(nameof(Item.Tasks))
                          .SingleOrDefaultAsync(x => x.Id == id);
  var task = new ItemTask(Guid.NewGuid(), TodoItemTaskName);
  var list = item.Tasks.ToList();
  list.Add(task);

  item = item with { Tasks = list };

  context.Items.Attach(item).State = EntityState.Modified;
  context.Set<ItemTask>().Attach(task).State = EntityState.Added;
  await context.SaveChangesAsync();
}
```

Y para modificar alguna de las propiedades de una `ItemTask` existente, tendremos que volver a ignorar el `ChangeTracker` y actuar de la misma manera que en el ejemplo más simple:

```csharp
private async Task ModifyItemTaskAsync(Guid id)
{
  using var context = CreateContext();

  var item = await context.Items
                          .AsNoTracking()
                          .Include(nameof(Item.Tasks))
                          .SingleOrDefaultAsync(x => x.Id == id);

  var task = item.Tasks.FirstOrDefault();
  task = task with { Name = TodoItemTaskUpdatedName };
  context.Set<ItemTask>().Attach(task).State = EntityState.Modified;

  await context.SaveChangesAsync();
}
```

Si os interesa el ejemplo completo podéis echarle un vistazo aquí:

[Código fuente completo en *gist*](https://gist.github.com/fernandoescolar/53df9ac1bf71ff032c1b9284f6890530)

![Deal with it](/assets/uploads/2021/03/deal-with-it.gif)

## Conclusiones

En lo relacionado con `record` y **Entity Framework Core** parece ser que podemos añadir y borrar, entidades o entidades hijas, sin necesidad de cambiar nuestro código. Pero si queremos modificar una entidad existente, tendremos que dejar de lado el `ChangeTracker`. Fin.