---
ID: 563
title: 'Patrones de dise&ntilde;o: Repository'
author: fernandoescolar
post_date: 2013-01-07 11:13:39
post_excerpt: ""
layout: post
---
<em>En todos los asuntos de opinión, nuestros adversarios están locos</em> (Oscar Wilde). Por suerte los locos con los que puedes compartir opiniones en la lista de correo de la fundación <a href="http://www.techdencias.net" target="_blank">[T]echdencias</a>, son magníficos profesionales como <a href="https://twitter.com/Marc_Rubino" target="_blank">@Marc_Rubino</a> o <a href="https://twitter.com/mserrate" target="_blank">@mserrate</a>. Hace unos días tuvimos la oportunidad de discutir sobre el patrón "Repository".
<!--break-->
Y aunque nuestras opiniones pueden diferir, me gustaría compartir algunas conclusiones personales:
<h3>Un poco de historia</h3>
La primera vez que oímos hablar del patrón "Repository" fue en el famoso libro de <a href="http://www.martinfowler.com" target="_blank">Martin Fowler</a>, <a href="http://www.martinfowler.com/books/eaa.html" target="_blank">Patterns of Enterprise Application Architecture</a>, y la autoría se le atribuye a Edward Hieatt y Rob Mee.

Para el que no se haya leído este libro (ya está tardando <img class="wlEmoticon wlEmoticon-winkingsmile" style="border-style: none;" src="/assets/uploads/2012/12/wlEmoticon-winkingsmile.png" alt="Guiño" />) lo resumiremos diciendo que se nos plantean varios patrones de diseño que ayudarán a mejorar nuestras aplicaciones. Entre tantos conceptos, se nos introduce una forma de gestionar las interacciones con la capa de almacenamiento de la aplicación: la capa “Data Mapper”.
<h4>Data Mapper</h4>
Imaginemos que tenemos un sistema de almacenamiento de datos complejo, algo así como una base de datos. La gestión mediante nuestro lenguaje de programación preferido de esta información, puede resultar compleja y para nada relacionada con la forma de gestionar la información dentro de nuestra aplicación.

Por citar un ejemplo más concreto, no resulta sencillo ni natural, recoger un dato de la una base de datos SQL Server, usando c#. Básicamente porque el lenguaje c# está pensado para programar orientado a objetos y el motor de SQL Server está pensado para modelos de datos relacionales usando SQL como lenguaje de comunicación.

Una consulta sencilla, que devuelva el número de usuarios de nuestro sistema, puede ocupar varias líneas. Y además, habrá que tener en cuenta los errores que puedan surgir:
<pre class="brush: csharp">try
{
   using(var con = new SqlConnection(connetionString))
   {
      using (var cmd = new SqlCommand("select count(*) from [dbo].[Users]", con))
      {
         var count = Convert.ToInt32(cmd.ExecuteScalar());
         return count;
      }
   }
}
catch (Exception ex)
{
   // manage exception
}</pre>
Para que no se complique nuestro código, el señor Fowler nos propone crear una capa dentro de nuestra aplicación cuya misión sea mover la información entre los objetos de c# y la base de datos. Además esta capa va a aislar el comportamiento de la base de datos, del de nuestros objetos, haciendo que nuestra aplicación no esté acoplada con nuestra fuente de almacenamiento (SQL Server en el ejemplo).

De esta forma crearíamos una implementación simple y genérica de nuestra capa de "Data Mapper":
<pre class="brush: csharp">public interface IDataMapper&lt;TObject&gt; where TObject : class
{
   void Insert(TObject obj);
   void Update(TObject obj);
   void Delete(TObject obj);

   IEnumerable&lt;TObject&gt; GetAll();
}

public class UserDataMapper : IDataMapper&lt;TObject&gt;
{
   private string connetionString;

   public UserDataMapper(string connetionString)
   {
      this.connetionString = connetionString;
   }

   public void Insert(User user)
   {
      try
      {
         using(var con = new SqlConnection(connetionString))
         {
            var sql = "INSERT INTO USER (UserId, [Name], LastName, Email) VALUES (@userId, @name, @lastName, @email)";
            using (var cmd = new SqlCommand(sql, con))
            {
               cmd.Parameters.Add(new SqlParameter("userId", user.UserId));
               cmd.Parameters.Add(new SqlParameter("name", user.Name));
               cmd.Parameters.Add(new SqlParameter("lastName", user.LastName));
               cmd.Parameters.Add(new SqlParameter("email", user.Emaild));

               cmd.ExecuteNonQuery();
            }
         }
      }
      catch(Exception ex)
      {
         throw new DataMapperException("Error inserting a User", ex);
      }
   }
   public void Update(TObject obj) { /*...*/ }
   public void Delete(TObject obj) { /*...*/ }

   public IEnumerable&lt;TObject&gt; GetAll() { /*...*/ }
}</pre>
Un objeto "Data Mapper" es un tipo de implementación de "DAO" (Data Access Object). La peculiaridad es que hace uso de un patrón "Metadata Mapper". La idea es añadir una especie de diccionario (o "Hashtable") que contenga las equivalencias entre los objetos de c# y las tablas de SQL Server. Pero esto quizá sea otra historia…
<h4>Repository</h4>
Una vez hemos montado nuestra capa de "Data Mapper", al ir construyendo el resto de la aplicación, nos vamos dando cuenta de que necesitamos crear un método que acepte condiciones y filtros para realizar un gran número de consultas diferentes. Por ejemplo, necesitamos listados de usuarios paginados, listados de usuarios para mostrar en un control de tipo "ComboBox", e incluso los usuarios que su nombre sea "Pepe". Entonces, como resultado de este requerimiento tan genérico, tendríamos una función parecida a esta:
<pre class="brush: csharp">public interface IDataMapper&lt;TObject&gt; where TObject : class
{
   /* ... */

   IEnumerable&lt;TObject&gt; GetFiltered(string conditions, string order, int pageSize, int pageIndex);
}</pre>
Así tendríamos la libertad de llamar a nuestro objeto "UserDataMapper" de formas diferentes:
<pre class="brush: csharp">var userDataMapper = new UserDataMapper(conStr);

// seleccionar los usuarios de nombre 'Pepe', ordenados por el apellido, paginando de 10 en 10, y quiero la primera página
userDataMapper.GetFiltered("Name = 'Pepe'", "LastName", 10, 1);
// seleccionar los usuarios de apellido 'Perez',sin orden, con el tamaño de página más grande que pueda, dame la página
userDataMapper.GetFiltered("LastName = 'Perez' AND Email LIKE '%@mail.com'", "", int.MaxValue, 1);</pre>
Pero el lenguaje de nuestro almacén de información (SQL), no debería ser manejado desde la capa que gestiona el negocio de la aplicación.

Es entonces cuando quizá nos vendría bien implementar otra capa nueva de abstracción por encima de "Data Mapper". Una capa que nos ayude gestionar estas consultas de forma transparente, sin necesidad de acabar escribiendo código SQL y manteniendo desacoplado el código de negocio, de la forma de almacenar la información.

El "Repository" surge como un sofisticado patrón que da solución a este problema. Decimos sofisticado porque se podría definir como una combinación de otros patrones.

La idea es que un objeto "Repository" actúe como una colección en memoria del modelo de dominio. A esta colección de objetos podremos añadirle o quitarle elementos y además realizar búsquedas filtradas utilizando el patrón "Specification":
<pre class="brush: csharp">public interface IRepository&lt;TEntity&gt; : ICollection&lt;TEntity&gt;
    where TEntity : class
{
    IEnumerable&lt;TEntity&gt; FilterBy(ICriteria criteria);
}</pre>
La primera característica que puede llamarnos la atención al definir "Repository" es el concepto de <strong>modelo de dominio</strong>. Esto es un término muy común cuando hablamos de <strong>DDD</strong> (Domain Driven Design), y quiere decir que nuestra aplicación tiene un modelo principal al que llamaremos dominio. Este modelo se diferencia del modelo de la base de datos en su concepción. En lugar de pensar cómo vamos a almacenar las tablas y sus relaciones dentro de una base de datos, lo que vamos a hacer es pensar en la mejor forma de gestionar los objetos dentro del contexto de nuestro lenguaje de programación y de la forma que mejor se adapte a las tareas de negocio.

Y si estudiamos la implementación propuesta, encontraremos varios detalles. Entre ellos que nuestro repositorio tendrá que implementar "ICollection", por lo que implementará funciones como "Add" que añade un objeto nuevo, o "Remove" que borra el objeto de la colección.

Otro detalle es el objeto "ICriteria" que se le pasa como parámetro al método "FilterBy". Este objeto no es más que la representación del anteriormente mencionado patrón "Specification".
<h4>Specification</h4>
El patrón "Specification" viene a resolver un problema de crear diferentes reglas de negocio que puedan ser combinadas. Esto quiere decir que nos ayudará a crear diferentes normas que resolverán un problema concreto de formas diferentes. Pero para orientarnos más rápido, vamos a ver un ejemplo de implementación:
<pre class="brush: csharp">public interface ISpecification
{
   bool IsSatisfiedBy(object candidate);
}

public interface ICompositeSpecification : ISpecification
{
   ISpecification And(ISpecification other);
   ISpecification Or(ISpecification other);
   ISpecification Not();
}</pre>
Implementando de la forma correcta este patrón, el resultado que tendríamos es que si tuviéramos diferentes especificaciones, podríamos combinarlas para conseguir algo más concreto.

Imaginemos que tenemos estas implementaciones:
<pre class="brush: csharp">public class NameSpecification : ICompositeSpecification
{
   public NameSpecification(string nameToCompare) { /* ... */ }
   public bool IsSatisfiedBy(object candidate) { /* candidate.Name == this.nameToCompare ... */ }
   public ISpecification And(ISpecification other) { /* ... */ }
   public ISpecification Or(ISpecification other) { /* ... */ }
   public ISpecification Not() { /* ... */ }
}

public class PageIndexSpecification : ICompositeSpecification
{
   public NameSpecification(int pageIndex, int pageSize) { /* ... */ }
   public bool IsSatisfiedBy(object candidate) { /* candidate is un pageIndex using pageSize */ }
   public ISpecification And(ISpecification other) { /* ... */ }
   public ISpecification Or(ISpecification other) { /* ... */ }
   public ISpecification Not() { /* ... */ }
}</pre>
Ahora podríamos llamar a nuestro repositorio con un código parecido a este:
<pre class="brush: csharp">var repository = new UserRepository();
var criteria = new NameSpecification("Pepe"); // filtramos por nombre igual que "Pepe"
criteria = criteria.And(new PageIndexCriteria(1, 10)); // cogemos la primera página

var result = repositori.FilterBy(criteria);</pre>
La ventaja de este patrón es que podemos crear especificaciones muy genéricas o muy concretas, según las necesidades de cada momento:
<pre class="brush: csharp">public class PropertyEqualsSpecification : ICompositeSpecification
{
   public NameSpecification(string propertyName, object value) { /* ... */ }
   public bool IsSatisfiedBy(object candidate) { /* candidate.propertyName == value ... */ }
   public ISpecification And(ISpecification other) { /* ... */ }
   public ISpecification Or(ISpecification other) { /* ... */ }
   public ISpecification Not() { /* ... */ }
}</pre>
Dentro de este patrón, existe una implementación muy conocida para ayudarnos a realizar sentencias SQL para bases de datos, y recibe el nombre de <strong>Query Object</strong>, también expuesto en el libro de <a href="http://www.martinfowler.com/books/eaa.html" target="_blank">Patterns of Enterprise Application Architecture</a>.

Lo que se propone en el patrón "Repository" es que las especificaciones sean resueltas usando un <a href="/2012/10/03/patrones-de-diseno-strategy/" target="_blank">patrón Strategy</a> para poder determinar en última instancia una sentencia correcta que podamos enviar a nuestro objeto "Data Mapper".

Y como corolario a esta definición, aquellas especificaciones que sean muy comunes y se repitan muchas veces a lo largo del código, pueden pasar a formar parte de la definición del propio repositorio. Imaginemos que la búsqueda por nombre se realiza en 10 sitios diferentes. La solución más óptima será crear un método específico dentro del repositorio:
<pre class="brush: csharp">public class UserRepository : IRepository&lt;User&gt;
{
   /* ... */
   public IEnumerable&lt;User&gt; FilterByName(string name)
   {
      var criteria = new NameSpecification(name);
      return this.FilterBy(criteria);
   }
}</pre>
&nbsp;
<h3>La actualidad</h3>
Hasta este momento hemos hablado de la teoría del patrón "Repository" y como lo encontramos definido la primera vez que leímos algo sobre él. Pero probablemente, si realizamos una búsqueda por internet sobre este patrón, y más si buscamos su implementación concreta para el lenguaje de programación c#, nos encontraremos un resultado que apenas se parece con al que acabamos de definir.

Vamos a poner el ejemplo de un blog simple, en el que queremos almacenar las entradas que escribimos "Post" y los comentarios que dejan los visitantes dentro de esas entradas "Comment":

<a href="/assets/uploads/2012/12/simple-blog-class-digram.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; display: block; padding-right: 0px; margin-right: auto; border-width: 0px;" title="simple-blog-class-digram" src="/assets/uploads/2012/12/simple-blog-class-digram_thumb.png" alt="simple-blog-class-digram" width="515" height="89" border="0" /></a>

Si seguimos a rajatabla la primera implementación que encontremos en los buscadores más conocidos, el resultado será algo parecido a esto:
<pre class="brush: csharp">public interface IRepository&lt;TEntity&gt; where TEntity : class
{
    IQueryable&lt;TEntity&gt; GetAll();
    void Add(TEntity entity);
    void Update(TEntity entity);
    void Delete(TEntity entity);
}
public interface IPostRepository : IRepository&lt;Post&gt;
{
}
public interface ICommentRepository : IRepository&lt;Comment&gt;
{
}</pre>
&nbsp;
<h4>¿Qué ha pasado?</h4>
En los entornos de programación en .net, ha cambiado mucho el escenario respecto de los inicios de la plataforma con respecto las librerías y evoluciones del lenguaje de hoy en día. Y estas nuevas características han provocado que el patrón "Repository" tenga que ser adaptado a unas nuevas necesidades.

En la versión 3.5 de la framework, como gran novedad se añadió de forma nativa LINQ (Language INtegrated Query). Una nueva extensión al lenguaje que nos iba a permitir realizar sentencias muy semejantes a las de SQL, dentro de entornos de programación .net:
<pre class="brush: csharp">var results =  from c in SomeCollection
               where c.SomeProperty &lt; 10
               select new {c.SomeProperty, c.OtherProperty};</pre>
Si tenemos una colección, un array o cualquier objeto que implemente el patrón "Iterator" (objetos que implementan "IEnumerable"), podemos recorrerla de forma sencilla y hacer una gestión de sus datos de una forma similar a como trabajamos en los entornos de bases de datos.

Este tipo de consultas funcionan gracias a unas extensiones del lenguaje que transforman las sentencias en llamadas a una serie de funciones nuevas. Por ejemplo, al compilar el ejemplo anterior, lo que en realidad tenemos como resultado es:
<pre class="brush: csharp">var results = SomeCollection
                    .Where(c =&gt; c.SomeProperty &lt; 10)
                    .Select( c =&gt; new { c.SomeProperty, c.OtherProperty });</pre>
Algunos rápidamente habrán encontrado que este código podría ser una implementación válida del patrón "Specification" que antes estamos mencionando. Además LINQ trabaja con colecciones, por lo que podríamos decir que esta tecnología realiza por nosotros la mitad del trabajo de crear un repositorio.

La otra gran novedad son los ORM (Object Relational Mapping) modernos, que antiguamente nos ayudaban a crear objetos DAO, pero que hoy en día han llegado mucho más lejos. Librerías como Entity Framework o nHibernate han conseguido implementar complejos sistemas que gestionan las conexiones con las bases de datos, mapeo automático de todo lo que podamos encontrar a objetos planos y simples, cachés, generación de bases de datos automática, … e incluso su propio lenguaje intermedio para realizar sentencias estándares de bases de datos.

Además uniendo estos ORM con LINQ, se ha cerrado el círculo. Por ejemplo, un contexto de EF tiene colecciones de entidades de la base de datos. A estas colecciones uno puede añadirle o quitarle elementos, y también se pueden realizar consultas complejas expresadas en un lenguaje cercano al natural y al de una base de datos:
<pre class="brush: csharp">public class MyDbContext : DbContext
{
   public DbSet&lt;MyEntity&gt; MyEntities { get; set; }
}</pre>
<pre class="brush: csharp">var context = new MyDbContext();
var myEntity = new MyEntity { Name = "Test" };

// añade la entidad a la base de datos
context.MyEntities.Add(myEntity);

// borra la entidad de la base de datos
context.MyEntities.Delete(myEntity);

// seleccionamos valores de la base de datos con condiciones
var results = context.MyEntities.Where( e =&gt; e.Name.StartsWith("T") );</pre>
Las conclusiones que podemos sacar de esto es que los ORMs modernos ya han implementado el patrón "Repository" por nosotros y lo han dotado de más características.
<h4>El nuevo "Repository"</h4>
Pero ahora imaginemos que queremos realizar pruebas unitarias en nuestra aplicación o que por ejemplo quisiéramos migrar a un nuevo motor de base de datos NoSQL. El ejemplo de contexto anterior ¿no estaría demasiado acoplado al ORM?

Para solucionar esto existen varias formas, pero una de ellas es la de crear un objeto intermediario al que llamaremos "Repository". Se usará ese nombre ya que va compartir ciertas características del patrón original y además porque servirá de repositorio de información para nuestra aplicación.

Un repositorio dentro de una aplicación actual va a aislar al dominio del ORM (o de la conexión con la base de datos). Va a proveer de interfaces que puedan ser probadas y simuladas, además de ocultar cualquier detalle relacionado con la forma de almacenar la información en nuestra aplicación.

Volviendo al ejemplo del blog:
<pre class="brush: csharp">public interface IRepository&lt;TEntity&gt;
{
    IQueryable&lt;TEntity&gt; GetAll();
    void Add(TEntity entity);
    void Update(TEntity entity);
    void Delete(TEntity entity);
}</pre>
Todo repositorio de la aplicación expondrá, al menos, los métodos para añadir, borrar y listar elementos.

En dependencia del ORM, un repositorio se implementará de una forma u otra, pudiendo gestionar transacciones, ciclo de vida de las conexiones, mapeo de objetos, etc.
<h4>Otra propuesta</h4>
Personalmente esta última definición no me convence del todo por varias razones:

La primera es que no aporta valor real. Por lo general, crear repositorios se ha convertido en copiar y pegar código, generarlo automáticamente con plantillas t4 o cualquier herramienta semejante, y no nos paramos a pensar que es lo que esperamos de este tipo de artefacto.

La segunda razón está relacionado con devolver objetos que implementan "IQueryable". Estos objetos pueden ser gestionados usando LINQ, de tal forma que generen diferentes sentencias SQL en la base de datos, que por lo general son muy complejas y no todo lo eficientes que deberían.

Además, al usar objetos "IQueryable" en niveles lejanos al ORM o el repositorio, estamos dando responsabilidades extra a artefactos de nuestra aplicación, que no están preparados para estas responsabilidades. O dicho de otra forma, la última capa responsable de componer sentencias SQL (directa o indirectamente), debería ser el repositorio.

Quizá sea muy atrevido entender LINQ como la implementación más correcta del patrón "Specification" dentro del contexto de un repositorio. Es posible que fuera más correcto implementarla de nuevo, para poder aislar realmente el problema de las sentencias de consulta de base de datos eficientes a un solo lugar.

La última razón por la que no termina de convencerme esta implementación es el asunto de la existencia de un repositorio por cada una de las entidades de la base de datos. Algo que no tiene por qué adaptarse realmente a las necesidades de negocio. En el ejemplo del blog, si en lugar de tener un repositorio para objetos tipo "Post" y otro para "Comment", podría ser más lógico tener uno solo para gestionar las operaciones del blog. Porque si un comentario no tiene sentido si no está asociado con una entrada de un post, tampoco tendrá sentido que tenga su propio repositorio.

Aplicando estas premisas, personalmente y simplificando mucho el problema de la gestión de un blog, propondría un repositorio que aportara valor y no expusiera objetos "IQueryable" e implementara su propio sistema de especificaciones. Algo más parecido a esto:
<pre class="brush: csharp">public abstract class BaseRepository
{
    protected virtual IQueryable&lt;TEntity&gt; GetAll&lt;TEntity&gt;()
          where TEntity : class
    {
        /* ... */
    }
    protected virtual void Add&lt;TEntity&gt;(TEntity entity)
          where TEntity : class
    {
        /* ... */
    }
    protected virtual void Update&lt;TEntity&gt;(TEntity entity)
          where TEntity : class
    {
        /* ... */
    }
    protected virtual void Delete&lt;TEntity&gt;(TEntity entity)
          where TEntity : class
    {
        /* ... */
    }
}
public interface IBlogRepository : IBlogRepository
{
    List&lt;Post&gt; GetAllPosts();
    List&lt;Post&gt; GetPostsByCriteria(ICriteria criteria);
    Post GetPostWithComments(Guid postId);

    void AddPost(Post post);
    void UpdatePost(Post post);
    void DeletePost(Post post);
    void InsertComment(Post post, Comment comment);
    void DeleteComment(Comment comment);

   /* ... */
}
public class BlogRepository : BaseRepository, IBlogRepository
{
   /* ... */
}
public class LastPostCritera : ICriteria
{
   /* ... */
}
public class CategorizedCritera : ICriteria
{
   /* ... */
}
public class DatedCritera : ICriteria
{
   /* ... */
}</pre>
En esta implementación crearíamos un repositorio base que contendría los métodos genéricos de añadir, borrar y listar. Pero estos métodos han sido declarados como "protected", lo que repercutirá en que no puedan ser invocados desde fuera del contexto de un repositorio.

En cuanto repositorio, expondrá una interfaz diferente al típico CRUD (Create, Read, Update, Delete), y usando las funciones protegidas de la base realizaría tareas específicas de gestión de la información. Además, los listados y filtros se podrán realizar con un patrón "Specification", ocultando en realidad el código específico y necesario para realizar la comunicación con la base de datos.

Y en definitiva, así conseguiríamos un código testeable, y desacoplar el acceso a los datos, del resto de la aplicación.

&nbsp;
<h3>Conclusiones</h3>
Es posible que el concepto de "Repository" esté pervertido hoy en día, con respecto al concepto inicial. Pero se ha ido adaptando a los diferentes progresos de las plataformas y los lenguajes.

Hay gente que no está de acuerdo con el nombre de "Repository" y que piensan que es simplemente un DAO. Aunque creo que no es del todo ni lo uno ni lo otro, simplemente coge algo de cada uno.

Los objetos de este tipo son muy útiles para desacoplar la aplicación y separar los datos del negocio de verdad. Además nos proveen de una forma probada y que funciona para resolver este problema, sin que tengamos que inventar nada nuevo. Son fáciles de probar y una abstracción muy útil para proyectos grandes. Así que si de verdad se implementa de forma que contenga la información acerca del almacenamiento, quitando esa responsabilidad al resto de componentes, es una opción muy válida.

Pero evidentemente y como pasa con todos los patrones de diseño, hay que ceñirse a las necesidades reales y no caer en los típicos antipatrones de aplicarlo cuando no es necesario o aplicarlo de una forma que no resulta del todo correcta.