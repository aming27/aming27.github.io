---
ID: 16020900
title: Un vistazo a Roslyn
author: fernandoescolar
post_date: 2016-02-09T19:24:03.000Z
post_excerpt: ""
layout: post
tags: dotnet roslyn
---

El número de resultados que encuentras al buscar "Roslyn" es de 9-13 millones. Está claro que está de moda. Pero ¿qué es Roslyn? ¿y por qué debería importarme?
<!--break-->

Roslyn es un compilador de .Net. Es un analizador semántico de código. Es un binder. Es un refactorizador. Es open source. Es el segundo advenimiento del desarrollo. Emite IL. Está integrado con Visual Studio. Pero funciona en cualquier plataforma. Es como el famoso "jamón" al que [cantaban Los Berzas](https://www.youtube.com/watch?v=PMxdM38QxUY "Los Berzas - Yo amo el jamón").

Cuando escucho la palabra "Roslyn" me viene a la mente La Hora Chanante. Pienso en Joaquín Reyes repitiendo esta palabra. Primero más agudo. Luego más grave. Y para terminar alargando las vocales mientras agudiza el tono.

Últimamente he estado jugando un poco con Roslyn. Sobre todo porque el próximo 24 de febrero tengo una charla junto con mi compañero [Juan Bacardit](https://twitter.com/juanbacardit "Juan Bacardit") en la [DotNet Spain Conference 2016](https://www.desarrollaconmicrosoft.com/Dotnetspain2016 "DotNet Spain Conference 2016") en Madrid. Y he aquí los resultados de mis experimentos:

Una vez nos hemos instalado [Roslyn en Visual Studio](https://github.com/dotnet/roslyn/wiki/Getting-Started-on-Visual-Studio-2015 "Instalar Roslyn en Visual Studio"), las [plantillas y el SDK](https://visualstudiogallery.msdn.microsoft.com/2ddb7240-5249-4c8c-969e-5d05823bcb89 "Instalar plantillas y el SDK de Roslyn"); es muy fácil empezar a trabajar. Tan solo tenemos que elegir una de esas plantillas y ya tendremos un ejemplo de lo que podemos hacer:

![Roslyn templates](/assets/uploads/2016/02/templates.png)


## Como hacer tu IDE más lento

La plantilla que más me fascina es la de "Analyzer with Code Fix (NuGet+VSIX)". Es un todo en uno para enlentecer tu entorno. Automáticamente te crea una regla de análisis de código y un refacor para corregirlo. Como resultado de compilarlo: un paquete NuGet y un VSIX. Todo listo para ser instalado en todos los Visual Studio del mundo.

Pero el analizador de demostración no me gusta. Así que vamos a implementar el nuestro propio. La idea es que cada vez que detectemos un nombre que NO contenga palabrotas, nos avise. Así que he añadido este archivo:

```csharp
public static class BadWordService
{
    public static readonly string[] BadWords = new string[] { "shit", "crap", "dick", "asshole", "motherfucker", "bastard", "prick", "jerk", "bitch", "damn", "fuck", "hell" };

    public static bool ContainsBadWords(this string source)
    {
        return BadWords.Any(s => source.ToLowerInvariant().Contains(s.ToLowerInvariant()));
    }

    public static string AddBadWord(this string source)
    {
        var r = new Random();
        var word = BadWords[r.Next(0, BadWords.Length - 1)];
        return string.Format("{0}{1}{2}", source, char.ToUpperInvariant(word[0]), word.Substring(1));
    }
}
```

Y he modificado el código del analyzer a algo como esto:

```csharp
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class BadWordsRulesAnalyzer : DiagnosticAnalyzer
{
    public const string DiagnosticId = "BadWordsRules";
    private const string Title = "No Bad Words in Name";
    private const string MessageFormat = "There is no Bad Word in this name: '{0}'";
    private const string Description = "There is no Bad Word in this name";
    private const string Category = "Naming";

    private static DiagnosticDescriptor Rule = new DiagnosticDescriptor(DiagnosticId, Title, MessageFormat, Category, DiagnosticSeverity.Warning, isEnabledByDefault: true, description: Description);

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get { return ImmutableArray.Create(Rule); } }

    public override void Initialize(AnalysisContext context)
    {
        context.RegisterSymbolAction(AnalyzeBadWordsInSymbolName, SymbolKind.NamedType);
    }

    private static void AnalyzeBadWordsInSymbolName(SymbolAnalysisContext context)
    {
        var namedTypeSymbol = context.Symbol;
        var name = namedTypeSymbol.Name;
        AnalyzeName(context, name, namedTypeSymbol.Locations[0]);
    }

    private static void AnalyzeName(SymbolAnalysisContext context, string name, Location location)
    {
        if (!name.ContainsBadWords())
        {
            var diagnostic = Diagnostic.Create(Rule, location, name);
            context.ReportDiagnostic(diagnostic);
        }
    }
}
```

Al ejecutar se nos abrirá una nueva instancia de Visual Studio. Si abrimos un proyecto, veremos que nos marcará los nombres de las clases que no contengan palabras mal sonantes.

Y a partir de aquí es donde viene lo bueno. Podemos hacer que el sistema nos proponga cómo corregir estos errores. Esto lo podríamos hacer modificando el archivo "CodeFix":

```csharp
[ExportCodeFixProvider(LanguageNames.CSharp, Name = nameof(BadWordsRulesCodeFixProvider)), Shared]
public class BadWordsRulesCodeFixProvider : CodeFixProvider
{
    private const string title = "Add Bad Word";

    public sealed override ImmutableArray<string> FixableDiagnosticIds
    {
        get { return ImmutableArray.Create(BadWordsRulesAnalyzer.DiagnosticId); }
    }

    public sealed override FixAllProvider GetFixAllProvider()
    {
        return WellKnownFixAllProviders.BatchFixer;
    }

    public sealed override async Task RegisterCodeFixesAsync(CodeFixContext context)
    {
        var root = await context.Document.GetSyntaxRootAsync(context.CancellationToken).ConfigureAwait(false);
        var diagnostic = context.Diagnostics.First();
        var diagnosticSpan = diagnostic.Location.SourceSpan;
        var token = root.FindToken(diagnosticSpan.Start);

        context.RegisterCodeFix(
            CodeAction.Create(
                title: title,
                createChangedSolution: c => AddBadWord(context.Document, token, c),
                equivalenceKey: title),
            diagnostic);
    }

    private static Task<Solution> AddBadWord(Document document, SyntaxToken token, CancellationToken cancellationToken)
    {
        var newName = token.Text.AddBadWord();
        return RenameAsync(document, token, cancellationToken, newName);
    }

    private static async Task<Solution> RenameAsync(Document document, SyntaxToken token, CancellationToken cancellationToken, string newName)
    {
        var semanticModel = await document.GetSemanticModelAsync(cancellationToken);
        var typeSymbol = semanticModel.GetDeclaredSymbol(token.Parent, cancellationToken);

        var originalSolution = document.Project.Solution;
        var optionSet = originalSolution.Workspace.Options;
        var newSolution = await Renamer.RenameSymbolAsync(document.Project.Solution, typeSymbol, newName, optionSet, cancellationToken).ConfigureAwait(false);

        return newSolution;
    }
}
```

Si ejecutamos este último código nos propondrá poner una palabrota al final de cada nombre de clase. Y al hacerlo, buscará una aleatoría y la añadira. Haciendo el correspondiente refactor en todo el proyecto.

![Ejemplo Analyzer y Code Fix](/assets/uploads/2016/02/badwords-analyzer.png)

Si al ejecutar no aparece esto instantaneamente, dadle algo de tiempo. Como rezaba el título, es una forma de hacer que Visual Studio vaya un poco más lento.

Una forma de no perder agilidad a la hora de programar es gastar este tiempo a la hora de compilar. Para esto sustituiremos

```csharp
context.RegisterSymbolAction(...);
```

Por:

```csharp
context.RegisterCompilationAction(action);
```

Donde en "action" tendremos que tener un rastreador del arbol de sintaxis en busca de objetos de tipo "TypeDeclarationSyntax". Este es el tipo de objeto que almacena las declaraciones de las clases. Lo que nos lleva a lo más importante a la hora de trabajar con roslyn: **conocer el arbol de sintaxis**.

A día de hoy, imagino que este árbol solo lo conocen los programadores de Roslyn. Si quieres empezar a jugar, te recomiendo que abras en Visual Studio la ventana de "Syntax Visualizer". Esta ventana se instala con el SDK de Roslyn. Y nos ayudará a entender qué forma tiene un árbol de sintaxis para el documento que tengamos abierto.


## Como hacer lo mismo de antes, con la mitad de trabajo

Otra de las opciones es elegir el template de "Code Refactoring (VSIX)". Esto es un template semejante al anterior. Pero haciendo solo la mitad del trabajo. Y lo mejor de todo es que más de la mitad del código que ya hemos escrito, nos sirve aquí.

Cuando quieres proponer una modificación, pero no quieres que aparezca un aviso o que se marque aquel trozo de código que quieres modificar, tenemos que usar los objetos "CodeRefactoringProvider".

Para tener la misma funcionalidad que en el ejemplo anterior, solo tendríamos que insertar este código en la clase que se nos ha generado:

```csharp
[ExportCodeRefactoringProvider(LanguageNames.CSharp, Name = nameof(BadWordsRefactorProvider)), Shared]
internal class BadWordsRefactorProvider : CodeRefactoringProvider
{
    public sealed override async Task ComputeRefactoringsAsync(CodeRefactoringContext context)
    {
        var root = await context.Document.GetSyntaxRootAsync(context.CancellationToken).ConfigureAwait(false);
        var node = root.FindNode(context.Span);
        var classDeclaration = node as ClassDeclarationSyntax;

        if (classDeclaration == null) return;

        var token = classDeclaration.Identifier;
        if (token.Text.ContainsBadWords()) return;

        var action = CodeAction.Create("Add a Bad Word", c => AddBadWord(context.Document, token, c));
        context.RegisterRefactoring(action);
    }

    private static Task<Solution> AddBadWord(Document document, SyntaxToken token, CancellationToken cancellationToken)
    {
        // igual que arriba
    }

    private static async Task<Solution> RenameAsync(Document document, SyntaxToken token, CancellationToken cancellationToken, string newName)
    {
        // igual que arriba
    }
```

Es fácil ¿verdad?. El secreto de esta clase es que solo se evalua cuando estamos en una línea en concreto. Por eso el contexto tiene un "Span". Esta marca nos dice donde está el cursor en ese momento. Tan solo tenemos que comprobar que en nuestra posición haya un tipo de objeto que esperamos.

En este punto te plantearás la pregunta de ¿cómo es que [los desarrolladores de Resharper no van usar Roslyn](https://blog.jetbrains.com/dotnet/2014/04/10/resharper-and-roslyn-qa/)? Inconcebible. Me voy a hacer mi propio Resharper. Con casinos. Y furcias. Es más, paso de Resharper.

## Mi propio analizador out-of-the-box

Imagina que quieres analizar tu código. Pero no quieres usar Visual Studio. Imagina que estás en Linux. ¿Cómo puedo analizar mi código entonces? Muy fácil. Con la tercera plantilla que se instala: "Stand-Alone Code Analysis Tool".

La primera sensación cuando generas este tipo de proyecto es extraña. Un proyecto de consola vacío. ¿En serio?. Sí en serio. Pero escondidas entre bastidores están todas las referencias del mundo a todo lo que es compilar. Así que a partir de aquí es fácil seguir trabajando. Tan solo tenemos que añadir en el flamente método vacío "Main" este código:

```csharp
static void Main(string[] args)
{
    var solutionFile = args[1]; // valid VS Solution (.sln)
    var ws = MSBuildWorkspace.Create();
    var soln = ws.OpenSolutionAsync(solutionFile).Result;
    var proj = soln.Projects.Single();
    var compilation = proj.GetCompilationAsync().Result;

    foreach (var tree in compilation.SyntaxTrees)
    {
        var classes = tree.GetRoot().DescendantNodesAndSelf().Where(x => x.IsKind(SyntaxKind.ClassDeclaration));
        foreach (var c in classes)
        {
            var classDeclaration = (ClassDeclarationSyntax)c;
            var token = classDeclaration.Identifier;
            if (token.Text.ContainsBadWords()) continue;
            Console.WriteLine(string.Format("There is no Bad Word in this name: '{0}'", token.Text));
        }
    }

    Console.ReadKey();
}
```

Esta aplicación, al ejecutarla con la ruta de una solución de Visual Studio, nos dirá que clases no tienen palabrotas en sus nombres. Creo que es una utilidad indispensable para todo _Badass Developer_.

## Rompiéndose la cabeza

La última de las andanzas con Roslyn ha sido mirar el código fuente. Es open source. Lo tenéis aquí [https://github.com/dotnet/roslyn](https://github.com/dotnet/roslyn).

El código fuente de Roslyn es grande. Pero simple. Simplemente muy grande. Se puede entender. Pero hay que conocerlo. Simplemente lo conocen los que lo programan. Si quieres invertir horas y añadir una feature totalmente loca como cambiar la palabra clave "static" por "motherfucker", no será demasiado trabajo. Solo tienes que saber qué línea tocar.

Tampoco me quiero extender mucho más con este punto. El código fuente de Roslyn se actualiza cada poco. Y si escribimos un ejemplo con una línea en concreto, quizá mañana esa línea ya no esté ahí.

Lo que sí que os recomiendo es que le echéis un vistazo. Es muy interesante. Aunque solo sea por curiosidad.

## Mis conclusiones

Roslyn me gusta. La idea que hay detrás también. Las herramientas que podemos crear son muy flexibles. Solo hay que esperar a que otros hagan lo que necesitamos. O si somos valientes y queremos cacharrear un poco, hacerlo nosotros mismos.

Si queréis ver algunos analyzers que ya está implementando la comunidad, solo tenéis que echar un vistazo a esta web: [https://github.com/DotNetAnalyzers](https://github.com/DotNetAnalyzers). Tiene muy buena pinta. Y aunque no está todo al completo, sí que tienen muchas normas ya escritas.

Pd. Para acceder a la demo final, con todo, tendréis que venir a vernos a la [DotNet Spain Conference 2016](https://www.desarrollaconmicrosoft.com/Dotnetspain2016 "DotNet Spain Conference 2016"). Sin presión ;P
