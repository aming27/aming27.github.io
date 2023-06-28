---
published: true
ID: 202009161
title: 'SOLID menos mola (S)'
author: fernandoescolar
post_date: 2020-09-16 02:16:54
layout: post
tags: solid best-practices
background: '/assets/uploads/bg/solid5.jpg'
---
 La *S* de *SOLID* se refiere al principio de responsabilidad única o **SRP** por sus siglas en inglés (**S**ingle **R**esponsibility **P**rinciple). Se puede definir como que una clase debe tener una sola responsabilidad, o como diría [Robert C. Martin](https://twitter.com/unclebobmartin), "una clase debe tener solo una razón para cambiar"<!--break-->.

Es un concepto muy simple. Algo que todo el mundo entiende. Y, por lo tanto, un concepto muy fuerte. Una clase, una responsabilidad. Y qué demonios: un método, una sola responsabilidad también. Pero siempre dentro de una clase con una responsabilidad.

Si definimos una responsabilidad como un eje de un cambio, podemos determinar que cuantas más responsabilidades asuma una clase, esta será más susceptible al cambio. Y cuando las clases de nuestra aplicación son muy susceptibles al cambio, decimos que nuestro código está acoplado.

Así que desacoplar el código implica separar las responsabilidades y crear un objeto para cada una de ellas. De esta forma nuestro código será más legible y, en consecuencia, más sencillo de mantener.

Pero vamos a ver todo esto en código:

```csharp
public class Order
{
    public Guid Id { get; }
    public Customer Customer { get; }
    public IEnumerable<OrderLine> Lines { get; }
    public decimal TotalAmount { get; }
    public decimal Taxes { get; }

    public void AddLine(Product product, int quantity) { ... }
    public void RemoveLine(OrderLine line) { ... }
    public void CalculateAmountAndTaxes() { ... }
    public bool Validate() { ... }
    public void Load() { ... }
    public void Save() { ... }
    public Invoice CreateInvoice() { ... }
}
```

Si pensáramos en responsabilidades podríamos decir que la clase `Order` tiene las siguientes:
- Almacenar los datos de un pedido en las propiedades `Customer`, `Lines`, `TotalAmount` y `Taxes`.
- Añadir líneas del pedido con el método `AddLine`.
- Borrar líneas del pedido con el método `RemoveLine`.
- Cálculo del importe total del pedido con el método `CalculateAmountAndTaxes`.
- Cálculo de los impuestos con el mismo método que el anterior: `CalculateAmountAndTaxes`.
- Validación de un pedido con el método `Validate`.
- Carga de un pedido desde la base de datos con el método `Load`.
- Guardado de un pedido en la base de datos con el método `Save`.
- Creación de una factura para el pedido con el método `CreateInvoice`.

Aplicando el principio de responsabilidad única, no sería una locura decir que cada una de estas responsabilidades las podríamos separar en un objecto diferente. Porque son responsabilidades únicas todas ellas. Así que dividiríamos nuestro código en:
- `Order`: clase de tipo *POCO* que almacena los datos de un pedido.
- `OrderAddLineService`: clase de tipo servicio que añade una línea a un pedido.
- `OrderRemoveLineService`: clase de tipo servicio que borra una línea a un pedido.
- `CalculateAmountService`: clase de tipo servicio para el cálculo del importe total del pedido.
- `CalculateTaxesService`: clase de tipo servicio para el cálculo de los impuestos.
- `OrderValidator`: clase de tipo validador de un pedido.
- `OrderStoreReader`: clase para cargar de un pedido de la base de datos.
- `OrderStoreWriter`: clase para el guardado de un pedido en la base de datos.
- `InvoiceFactory`: clase de tipo *factory* para la creación de una factura.

Cuando empecemos a usar este conjunto de artefactos, es posible que añadamos una clase de tipo *façade* para poder orquestarlo todo: `OrderFacade`. Aunque seguro que más de uno está pensando que se nos ha ido de las manos...

Es muy difícil determinar qué es una responsabilidad. [Uncle Bob](https://twitter.com/unclebobmartin) la [define como "una razón para cambiar"](https://web.archive.org/web/20110912055122/http://www.objectmentor.com/resources/articles/srp.pdf). Se me ocurren dos razones para cambiar código en un proyecto: *bug fixing* o *new feature*. Y podríamos tener que cambiar uno o varios artefactos por cualquiera de ellas.

Es por eso que en 2014 escribió [un nuevo artículo](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html) sobre el tema. Aquí menciona que "Este principio es sobre las personas". Donde habla de que hay que preguntarse por quién es el responsable de ese código en cuestión. Si es un tema del director de finanzas, del director de tecnología, del de operaciones... Y en mi caso personal puedo afirmar, sin miedo a equivocarme, que el responsable siempre es el desarrollador. Y a poder ser el que ya no está en la empresa.

Comentarios jocosos aparte, otra lección que podemos extraer de este último artículo es que las responsabilidades en realidad no están pensadas para tener tanta granularidad como representamos anteriormente. Todo este código quedaría mucho mejor agrupando ciertas características por responsabilidades a más alto nivel:

- `Order`: clase que almacena los datos de un pedido. Tendrá además los métodos que la modifican: `AddLine` y `RemoveLine`.
- `OrderService`: aquí montaremos una clase de tipo servicio que nos ayudará a operar con nuestro pedido. Tendrá los métodos para calcular el importe, los impuestos y para generar las facturas.
- `OrderValidator`: esta clase la dejaremos como está, ya que valida nuestro objeto `Order`.
- `OrderStore`: una clase que nos permitirá guardar y cargar objectos `Order` de la base de datos.

Podríamos describirlo en código como algo así:

```csharp
public class Order
{
    public Guid Id { get; }
    public Customer Customer { get; }
    public IEnumerable<OrderLine> Lines { get; }

    public void AddLine(Product product, int quantity) { ... }
    public void RemoveLine(OrderLine line) { ... }
}

public class OrderService
{
    public decimal CalculateAmount(Order order) { ... }
    public decimal CalculateTaxes(Order order) { ... }
    public Invoice CreateInvoice(Order order) { ... }
}

public class OrderValidator
{
    public ValidationResult Validate(Order order) { ... }
}

public class OrderStore
{
    public void Load(Guid id) { ... }
    public void Save(Order order) { ... }
}
```

Supongo, que esta última implementación será con la que la mayoría estará más de acuerdo. Es una forma de crear artefactos muy común, que divide muy bien los conceptos, que genera poco acoplamiento y que hace nuestro código más mantenible. No hay duda de que seguir el *Single Responsibility Principle* nos ha ayudado a crear un mejor código.

Pero tal vez tengáis en mente una separación de responsabilidades mucho mejor de las que hemos propuesto aquí...

Es muy difícil determinar qué es una responsabilidad. Y creo que aún más, después del tema este de lo de las personas. Son definiciones muy vagas que llevan a confusión, que generan diferentes puntos de vista y diferentes verdades encontradas. Y es muy difícil llegar a un acuerdo cuando, sobre un mismo tema, hay dos interpretaciones que son válidas al mismo tiempo.

A lo que hace el primer enfoque algunos lo llamarán sobre-arquitectura o sobre-ingeniería. A lo que hace el segundo otros lo señalarán como código acoplado que no se rige por el SRP. Y habrá quien piense que ambos ejemplos son basura y que la implementación debería ser totalmente diferente. Lo mejor es que todos tienen razón.

## Hay vida después de SRP

He de reconocer que el trabajo de [Uncle Bob](https://twitter.com/unclebobmartin) (Robert C. Martin) me ayuda a ser mejor programador. Cada vez que leo uno de sus libros o veo una de sus charlas, aprendo algo. Incluso si no es la primera vez que lo hago. Y los principios **SOLID**, y en concreto el **SRP**, no son una excepción. Mi consejo es que:

- Si consideras que este principio es una mierda, acostúmbrate a seguirlo siempre.
- Si siempre lo sigues y consideras que este artículo es una mierda, sigue aplicándolo.
- Y si lo has aplicado hasta la extenuación y te surgen dudas, sigue leyendo.

Debemos ser críticos con todo lo que hacemos y encontrar esos puntos débiles en las "reglas" que seguimos al programar:

- ¿Qué es exactamente una responsabilidad única? Resulta un concepto demasiado abierto a todo tipo de interpretaciones.
- Si una responsabilidad es una razón para cambiar ¿Cómo puedo predecir qué código va a cambiar?
- Si una responsabilidad es sobre las personas ¿Cómo puedo determinar quién es el responsable de esa porción de código si me informo por un *backlog*?
- ¿Tener muchas clases muy pequeñas es siempre mejor que una sola más grande?
- Y si nos ponemos a dividir mucho una clase para desencapsular ¿Podríamos estar ignorando activamente una de las propiedades de la orientación a objetos como es la cohesión?

El principio de responsabilidad única creo que es una forma de intentar simplificar el código. Aunque seguirlo sin sentido puede llevarnos a conseguir todo lo contrario.

Afortunadamente no todo en este mundo es **SOLID**. Existen multitud de principios y reglas de programación que son muy válidas también. Antes que seguir el **SRP** creo que sería interesante pensar en uno de [los valores en los que se basa XP](http://www.extremeprogramming.org/values.html) (e**X**treme **P**rogramming):

- *simplicity*: Es mejor hacer una cosa simple hoy y pagar un poco más mañana para cambiarlo, que hacer una cosa más complicada hoy que jamás vaya a ser utilizada.

Y después tendría en cuenta seguir el principio de responsabilidad única procurando no contradecir dos de las [*four rules of simple design*](https://martinfowler.com/bliki/BeckDesignRules.html) de [Kent Beck](https://twitter.com/kentbeck): *Reveals intention* y *Fewest elements*. Las cuatro me parecen muy importantes, pero una aplicación agresiva de **SRP** podría llevarnos a ocultar la intención y comportamiento de nuestro código por encontrarse demasiado dividida en muchos artefactos.

El caso es que hoy en día me parece más importante aplicar estos valores y reglas, que el principio de responsabilidad única. Pero eso no quiere decir que no tenga en cuenta este último.

Y lo que me pueda parecer mañana, ya lo veremos...

## Ejemplo en el mundo real

Hace poco hicimos un *code review* en un proyecto en el que usamos [Vertical Slice](/video/2020/04/09/n-texture-chocolate-cake-architecture/) como arquitectura. Cuando trabajamos con este tipo de arquitectura y creamos una API, cada feature al menos debe implementar cuatro artefactos:

- `Request`: una petición a nuestro sistema.
- `Handler`: el artefacto que gestiona una petición y responde correctamente.
- `Response`: la respuesta a la petición.
- `Controller`: para gestionar el flujo de navegación. Desde que llega una petición hasta que se envía la respuesta.

Pero tener estos objetos es solo la base, a partir de aquí vamos añadiendo todo lo que necesitemos. En este contexto, se añadió:
- `Validator` para validar la `Request`
- `IRepository` y `Repository` para recoger datos de la base de datos.
- `Mapper` para transformar los datos de base de datos en la `Response` del `Handler`.

Así que la *Feature* que analizamos tenía esta estructura:

- **GetProductById**
  - *Controller.cs*
  - *Handler.cs*
  - *IRepository.cs*
  - *Map.cs*
  - *Repository.cs*
  - *Request.cs*
  - *Response.cs*
  - *Validator.cs*

El artefacto donde transcurre la acción de nuestra *feature* es el `Handler`, y este fue el código que empezamos a analizar:

```csharp
public class Handler: IRequestHandler<Request, CommandResult<Response>>
{
    private readonly IRepository _repository;

    public Handler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<CommandResult<Response>> Handle(Request request, CancellationToken cancellationToken)
    {
        var product = await GetProduct(request);
        var dto = Map.MapToDto(product);
        return GenerateResponse(dto);
    }


    private CommandResult<Response> GenerateResponse(ProductDto product)
        => CommandResult<Response>.Success(new Response(product));


    public Task<Product> GetProduct(Request request)
        => _repository.GetProduct(request.ProductId);
}
```

Este código, desde un punto de vista de **SRP** es muy bueno. Pero quizá hemos complicado demasiado ciertas partes que hacen que tengamos que recorrer más camino del necesario para terminar haciendo lo mismo:

### Si una función es una línea de código tal vez no haga falta una función

Estamos hablando de este método:

```csharp
public Task<Product> GetProduct(Request request)
      => _repository.GetProduct(request.ProductId);
```

Nos referimos a ese tipo de funciones que llaman a otro método con el mismo nombre dentro de otro artefacto y que su gran valor es envolver una llamada algo más larga. Esto nos llamó la atención y pensamos que no era muy diferente poner:

```csharp
var product = await GetProduct(request);
```

Que:

```csharp
var product = await _repository.GetProduct(request.ProductId);
```

Así que nos deshicimos de ese método.

### Si una línea de código no se entiende de un primer vistazo tal vez haga falta simplificarla

Por la misma razón intentamos cambiar este otro método:

```csharp
private CommandResult<Response> GenerateResponse(ProductDto product)
     => CommandResult<Response>.Success(new Response(product));
```

Pero esta vez, sustituir esta línea de código:

```csharp
return GenerateResponse(dto);
```

Por esta otra:

```csharp
return CommandResult<Response>.Success(new Response(product));
```

No nos dejaba tan claro qué es lo que hacía.

Analizando más profundamente nos dimos cuenta de que aquí entraban en juego 3 artefactos y que para darle claridad, antes de realizar el cambio, tendríamos que refactorizar esta parte.

### Si necesitamos 3 artefactos para montar una respuesta, tal vez podamos simplificar a uno

Los artefactos a los que nos referimos son:
- `CommandResult<T>`: una clase genérica que usamos para recubrir respuestas estándares del sistema. Básicamente tiene un listado de errores y un *payload*.
- `Response`: es el objeto de respuesta de la *feature*. Cada una tiene el suyo. Y aquí contiene un DTO (**D**ata **T**ransfer **O**bject) de tipo `ProductDto`.
- `ProductDto`: es el DTO que se encapsula dentro del objeto `Response`.

Lo primero que nos llama la atención es que en este caso no estamos gestionando errores. Solo hay dos posibilidades: devolvemos un `CommandResult<Response>` exitoso o lanzamos una excepción que no hemos gestionado. Por lo que, en realidad, no estamos usando las características de este objeto. Así que lo desechamos.

Por otro lado, que un objeto `Response` contenga otro de tipo `ProductDto`, tampoco nos aportaba valor. Así que decidimos crear un objeto `Response` con las propiedades que necesitábamos del `ProductDto`. De esta forma nos quedamos con un solo objeto y pudimos cambiar nuestro código:

```csharp
var product = await _repository.GetProduct(request.ProductId);;
var response = Map.MapToResponse(product);
return response;
```

Así solucionábamos dos problemas de un tiro.

### Si necesitamos una clase con un solo método que se usa en un solo lugar tal vez esa clase no haga falta

Resulta que los objetos `IRepository` y `Repository`, solo se usaban dentro de esta *feature*. Además, solo tenían un método: `GetProduct`. Al analizarlo por dentro, todo parecía ser una llamada simple a un método de búsqueda de un artefacto de Mongo.Driver: `IMongoCollection<Product>`.

```csharp
internal class Repository : IRepository
{
  public Repository(IMongoCollection<Product> mongoCollection)
  {
    _mongoCollection = mongoCollection;
  }

  public Task<Project> GetProduct(string productId)
  {
    return _mongoCollection.Find(x => x.ProductId == request.ProductId)
                           .FirstOrDefaultAsync();
  }
}
```

Como el código parecía muy simple, pensamos en cogerlo y aplicarlo directamente al `Handler`, pero ¿esto complicaría mucho el código?

```csharp
public class Handler : IRequestHandler<Request, Response>
{
  private readonly IMongoCollection<Product> _mongoCollection;

  public Handler(IMongoCollection<Product> mongoCollection)
  {
    _mongoCollection = mongoCollection;
  }

  public Task<Response> Handle(Request request, CancellationToken cancellationToken)
  {
    var product = _mongoCollection.Find(x => x.ProductId == request.ProductId)
                                  .FirstOrDefaultAsync(cancellationToken);
    var response = Map.MapToResponse(product);
    return response;
  }
}
```

La verdad es que visto con perspectiva es bastante parecido a lo que teníamos al inicio, pero nos hemos quitado de en medio dos dependencias: la de la abstracción `IRepsository` y la concreción `Repository`.

### Si estamos usando un Mapper para convertir un objeto de base de datos a otra cosa, tal vez podríamos usar una proyección

Como ahora mismo, no teníamos un repositorio que nos ocultara el comportamiento con respecto la base de datos, nos encontramos con que el método `Find` de una `IMongoCollection<T>` acepta proyecciones. Así que quizá podríamos quitarnos también el objeto `Mapper`:

```csharp
_mongoCollection.Find(x => x.ProductId == request.ProductId)
                .Project(new ClientSideDeserializationProjectionDefinition<Product, Response>())
                .FirstOrDefaultAsync(cancellationToken);
```

### Resultado final

El resultado final de esta sesión fue la simplificación del código tanto en número de artefactos:

- **GetProductById**
  - *Controller.cs*
  - *Handler.cs*
  - *Request.cs*
  - *Response.cs*
  - *Validator.cs*

Como en número de líneas en el `Handler`. Además de, en nuestra opinión, ser un código más legible:

```csharp
public class Handler : IRequestHandler<Request, Response>
{
  private readonly IMongoCollection<Product> _mongoCollection;

  public Handler(IMongoCollection<Product> mongoCollection)
  {
    _mongoCollection = mongoCollection;
  }

  public Task<Response> Handle(Request request, CancellationToken cancellationToken)
  {
    return _mongoCollection.Find(x => x.ProductId == request.ProductId)
                           .Project(new ClientSideDeserializationProjectionDefinition<Product, Response>())
                           .FirstOrDefaultAsync(cancellationToken);
  }
}
```

Todo este *code review* te hace pensar. Si todo lo que estaba hecho al principio era correcto... ¿significa que este código está más acoplado?

Si pensamos en cuanto me implica realizar un cambio, como por ejemplo añadir una propiedad nueva en la base de datos, antiguamente hubiera implicado cambiar: `Product`, `ProductDto` y `Mapper`. Con el código que hemos desarrollado solo tendríamos que cambiar `Product` y `Response` ¿Es esto mejor? Pero si tenemos un cambio más grande en el futuro, quizá tenga que pasar por todas mis *features* y cambiarlas una a una. Entonces esto podría ser un mal cambio.

¿Sería mejor tener más clases y métodos pequeños, como hemos tenido al principio? ¿O es mejor tener un código como el resultado final?

El equipo finalmente prefirió este resultado. La razón principal era porque resultaba más fácil de leer. También añadía menos pasos para encontrar una línea de código concreta. Cumplía con que una *feature* encapsule una sola acción completa con el mínimo código imprescindible. En definitiva, se sentían más cómodos con esta implementación.
