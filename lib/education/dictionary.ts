export type Definition = {
  name: string;
  meaning: string;
  here: string;
  example: string;
  related: string[];
};
type Entry = [string, string, string, string[]];
const common: Record<string, Entry> = {
  "=": [
    "Asignación",
    "Guarda el valor de la derecha en el nombre de la izquierda.",
    "puntos = 12",
    ["variable", "+", "=="],
  ],
  "==": [
    "Igualdad",
    "Compara dos valores; no modifica la variable. En Java, aplicado a objetos compara referencias.",
    "puntos == 12",
    ["=", "!=", "if"],
  ],
  ">=": [
    "Mayor o igual",
    "Produce una condición verdadera si el valor izquierdo alcanza o supera al derecho.",
    "edad >= 18",
    ["if", ">", "<="],
  ],
  ">": [
    "Mayor que",
    "Compara dos valores y excluye la igualdad.",
    "temperatura > 25",
    [">=", "if"],
  ],
  "<": [
    "Menor que",
    "Compara dos valores. En declaraciones genéricas como vector<int>, delimita argumentos de tipo.",
    "i < 5",
    ["<=", "for"],
  ],
  "<=": [
    "Menor o igual",
    "Comprueba si el valor izquierdo no supera al derecho.",
    "i <= 5",
    ["<", "for"],
  ],
  "+": [
    "Suma o concatenación",
    "Combina los dos operandos. Su significado depende de sus tipos y del lenguaje.",
    "2 + 3",
    ["+=", "-", "*"],
  ],
  "-": [
    "Resta",
    "Resta el operando derecho del izquierdo, o cambia el signo si se usa de forma unaria.",
    "20 - 4",
    ["+", "-="],
  ],
  "*": [
    "Multiplicación / puntero",
    "En una expresión aritmética multiplica. En C/C++, en una declaración puede indicar puntero y en una expresión puede desreferenciarlo.",
    "numero * 2",
    ["&", "/", "int"],
  ],
  "/": [
    "División",
    "Divide los operandos. El resultado depende de los tipos y las reglas del lenguaje.",
    "8 / 2",
    ["//", "%", "*"],
  ],
  "%": [
    "Resto",
    "Obtiene el resto de una división según las reglas del lenguaje.",
    "7 % 3",
    ["/", "//"],
  ],
  "+=": [
    "Actualizar sumando",
    "Suma a la variable izquierda y guarda el nuevo resultado.",
    "puntos += 3",
    ["=", "+"],
  ],
  "++": [
    "Incrementar",
    "Aumenta una unidad en lenguajes que admiten este operador. En un for suele ser la actualización.",
    "i++",
    ["+=", "for"],
  ],
  "(": [
    "Abrir paréntesis",
    "Abre una lista de parámetros o argumentos, una condición o una agrupación. Mira lo que aparece antes.",
    "doble(7)",
    [")", ",", "función"],
  ],
  ")": [
    "Cerrar paréntesis",
    "Cierra la agrupación abierta con (.",
    "doble(7)",
    ["(", "argumento"],
  ],
  "[": [
    "Abrir índice o colección",
    "Puede iniciar un acceso por índice o un literal de colección; depende de la expresión.",
    "notas[0]",
    ["]", "índice"],
  ],
  "]": [
    "Cerrar índice o colección",
    "Termina el acceso o literal iniciado con [.",
    "notas[0]",
    ["[", "índice"],
  ],
  "{": [
    "Abrir bloque o colección",
    "Delimita el comienzo de un bloque, inicializador, objeto o tabla según el lenguaje.",
    "{12, 16, 18}",
    ["}", "bloque"],
  ],
  "}": [
    "Cerrar bloque o colección",
    "Cierra la región iniciada por {.",
    "if (listo) { trabajar(); }",
    ["{", "bloque"],
  ],
  ";": [
    "Final de instrucción",
    "Termina una instrucción. En un for clásico separa sus tres partes.",
    "int puntos = 12;",
    ["for", "instrucción"],
  ],
  ",": [
    "Separador",
    "Separa argumentos, parámetros o elementos.",
    "doble(7), doble(0)",
    ["(", "argumento"],
  ],
  if: [
    "Condición",
    "Elige si se ejecuta un bloque a partir de una condición.",
    "if edad >= 18:",
    ["else", ">=", "bloque"],
  ],
  else: [
    "Rama alternativa",
    "Se ejecuta cuando no se cumple la condición anterior.",
    "if listo: ...\nelse: ...",
    ["if", "condición"],
  ],
  for: [
    "Bucle",
    "Organiza repeticiones. La forma exacta de recorrer o contar depende del lenguaje.",
    "for i in range(5):",
    ["range", "while", "++"],
  ],
  while: [
    "Bucle condicional",
    "Repite mientras su condición siga siendo verdadera.",
    "while quedan > 0:",
    ["for", "condición"],
  ],
  return: [
    "Devolver",
    "Termina esta llamada y entrega un resultado al código que la llamó.",
    "return numero * 2",
    ["función", "parámetro"],
  ],
  int: [
    "Entero",
    "Tipo para números enteros en los lenguajes que lo declaran así; en Python también es un constructor de conversión.",
    "int puntos = 12;",
    ["double", "bool", "tipo"],
  ],
  double: [
    "Punto flotante",
    "Tipo para números de punto flotante. No representa exactamente todas las fracciones decimales.",
    "double precio = 2.5;",
    ["int", "float"],
  ],
  bool: [
    "Booleano",
    "Representa verdadero o falso en los lenguajes que usan este nombre.",
    "bool listo = true;",
    ["if", "true", "false"],
  ],
  class: [
    "Clase",
    "Comienza una definición de tipo que puede agrupar datos y métodos.",
    "class Program { ... }",
    ["static", "método"],
  ],
  static: [
    "Miembro de tipo",
    "En métodos de Java/C# permite llamar sin crear una instancia. En C/C++ su significado depende del ámbito.",
    "static int doble(int n) { return n * 2; }",
    ["class", "función"],
  ],
  public: [
    "Acceso público",
    "Permite acceso desde otros ámbitos según las reglas del lenguaje.",
    "public class Main",
    ["class", "private"],
  ],
  void: [
    "Sin resultado",
    "Indica que la función o método no devuelve un valor.",
    "static void Main() { }",
    ["return", "int"],
  ],
  ".": [
    "Acceso a miembro",
    "Permite acceder a un atributo, método o miembro. En Lua también permite acceder a claves de una tabla.",
    "notas.append(20)",
    ["método", "objeto"],
  ],
  print: [
    "Mostrar salida",
    "Escribe valores en la salida estándar. Mostrar un valor no es lo mismo que devolverlo.",
    "print(15)",
    ["return", "stdout"],
  ],
};
const byLanguage: Record<string, Record<string, Entry>> = {
  python: {
    def: [
      "Definir función",
      "Crea una función con un nombre, parámetros y un cuerpo indentado.",
      "def doble(numero):\n    return numero * 2",
      ["return", "parámetro", ":"],
    ],
    ":": [
      "Inicio de bloque",
      "Al final de def, if o for abre el bloque que se define con indentación.",
      "if edad >= 18:",
      ["if", "def", "indentación"],
    ],
    in: [
      "Pertenencia o recorrido",
      "En un for conecta la variable con el iterable que se recorre. En una expresión puede comprobar pertenencia.",
      "for numero in range(5):",
      ["for", "range"],
    ],
    range: [
      "Secuencia de enteros",
      "Genera un rango de enteros; el límite stop está excluido.",
      "range(1, 6)",
      ["for", "in"],
    ],
    len: [
      "Cantidad de elementos",
      "Devuelve el número de elementos de una colección.",
      "len(notas)",
      ["lista", "índice"],
    ],
    append: [
      "Añadir a lista",
      "Añade un único elemento al final de la lista y devuelve None.",
      "notas.append(20)",
      ["lista", "len"],
    ],
    lambda: [
      "Función expresión",
      "Crea una función anónima cuyo resultado es una expresión.",
      "lambda n: n * 2",
      ["def", "return"],
    ],
    yield: [
      "Generar un valor",
      "Entrega un valor de un generador y pausa su ejecución hasta que se solicite el siguiente.",
      "yield numero",
      ["for", "generador"],
    ],
    "**": [
      "Potencia / desempaquetado",
      "En aritmética eleva a una potencia. En argumentos puede desempaquetar un mapeo.",
      "2 ** 3",
      ["*", "parámetro"],
    ],
    "//": [
      "División al piso",
      "Divide y redondea hacia menos infinito. No es simplemente truncar con números negativos.",
      "7 // 2",
      ["/", "%"],
    ],
    import: [
      "Importar módulo",
      "Hace disponible un módulo por su nombre.",
      "import math",
      ["from", "módulo"],
    ],
  },
  cpp: {
    cout: [
      "Salida estándar",
      "Es el flujo de salida de la biblioteca estándar de C++.",
      "std::cout << puntos;",
      ["std", "::", "<<"],
    ],
    cin: [
      "Entrada estándar",
      "Es el flujo de entrada; >> intenta extraer un valor hacia una variable.",
      "std::cin >> edad;",
      ["std", ">>"],
    ],
    "::": [
      "Resolución de ámbito",
      "Indica en qué ámbito buscar un nombre. std::cout busca cout dentro de std.",
      "std::cout",
      ["std", "cout"],
    ],
    "<<": [
      "Inserción / desplazamiento",
      "Con std::cout inserta un valor en el flujo. Entre enteros puede ser desplazamiento de bits.",
      'std::cout << "Hola";',
      ["cout", "::"],
    ],
    ">>": [
      "Extracción / desplazamiento",
      "Con std::cin extrae entrada. Entre enteros puede desplazar bits.",
      "std::cin >> numero;",
      ["cin", "<<"],
    ],
    auto: [
      "Deducción de tipo",
      "Pide al compilador deducir el tipo a partir del inicializador. No vuelve dinámico al tipo.",
      "auto puntos = 12;",
      ["int", "tipo"],
    ],
    template: [
      "Plantilla",
      "Define una familia parametrizada de funciones o tipos.",
      "template<class T> T doble(T n) { return n + n; }",
      ["class", "tipo"],
    ],
    vector: [
      "Colección dinámica",
      "Contenedor de la biblioteca estándar que puede crecer y almacena elementos contiguos.",
      "std::vector<int> notas;",
      ["push_back", "at", "size"],
    ],
    push_back: [
      "Añadir al final",
      "Añade un elemento al final de un vector.",
      "notas.push_back(20);",
      ["vector", "size"],
    ],
    at: [
      "Acceso comprobado",
      "Accede por índice verificando límites; puede lanzar una excepción.",
      "notas.at(0)",
      ["vector", "índice"],
    ],
    size: [
      "Cantidad de elementos",
      "Devuelve la cantidad de elementos del contenedor.",
      "notas.size()",
      ["vector", "at"],
    ],
    std: [
      "Ámbito estándar",
      "Espacio de nombres de la biblioteca estándar de C++.",
      "std::cout",
      ["::", "cout"],
    ],
    "#include": [
      "Incluir cabecera",
      "Hace disponibles las declaraciones de una cabecera durante el preprocesado.",
      "#include <iostream>",
      ["iostream", "biblioteca"],
    ],
  },
  c: {
    printf: [
      "Salida con formato",
      "Escribe una cadena de formato sustituyendo especificadores por los argumentos. Los tipos deben coincidir.",
      'printf("%d", puntos);',
      ["%d", "stdio.h"],
    ],
    scanf: [
      "Entrada con formato",
      "Lee valores con un formato. Hay que comprobar el número de conversiones y limitar la entrada.",
      'scanf("%d", &numero);',
      ["&", "printf"],
    ],
    "&": [
      "Dirección / AND",
      "Delante de una variable puede obtener su dirección; entre enteros puede realizar AND de bits.",
      "&numero",
      ["*", "scanf"],
    ],
    "->": [
      "Miembro a través de puntero",
      "Accede a un miembro del objeto al que apunta el puntero.",
      "persona->edad",
      ["*", "."],
    ],
    sizeof: [
      "Tamaño en bytes",
      "Obtiene el tamaño de un tipo o expresión. Sobre un puntero no obtiene el tamaño del array apuntado.",
      "sizeof notas / sizeof notas[0]",
      ["array", "size_t"],
    ],
    size_t: [
      "Tipo de tamaño",
      "Tipo entero sin signo usado para tamaños; printf usa %zu.",
      "size_t cantidad = 3;",
      ["sizeof", "%zu"],
    ],
    puts: [
      "Mostrar línea",
      "Escribe una cadena y añade un salto de línea.",
      'puts("Hola");',
      ["printf", "stdout"],
    ],
    "#include": [
      "Incluir cabecera",
      "Incluye declaraciones durante el preprocesado.",
      "#include <stdio.h>",
      ["printf", "stdio.h"],
    ],
  },
  javascript: {
    const: [
      "Vínculo constante",
      "Declara una variable que no puede reasignarse; el contenido de un objeto sí puede cambiar.",
      "const notas = [];",
      ["let", "push"],
    ],
    let: [
      "Variable reasignable",
      "Declara una variable con ámbito de bloque que puede reasignarse.",
      "let puntos = 12;",
      ["const", "+="],
    ],
    "===": [
      "Igualdad estricta",
      "Compara sin convertir implícitamente los tipos.",
      '5 === "5" // false',
      ["==", "if"],
    ],
    "=>": [
      "Función flecha",
      "Define una función con reglas propias para this y una sintaxis abreviada.",
      "n => n * 2",
      ["function", "return"],
    ],
    async: [
      "Función asíncrona",
      "Declara una función que devuelve una promesa.",
      "async function cargar() { return 1; }",
      ["await", "Promise"],
    ],
    await: [
      "Esperar promesa",
      "Suspende esta función asíncrona hasta que la promesa se resuelva o rechace.",
      "const dato = await cargar();",
      ["async", "Promise"],
    ],
    function: [
      "Definir función",
      "Declara una función con parámetros y un cuerpo.",
      "function doble(numero) { return numero * 2; }",
      ["return", "parámetro"],
    ],
    console: [
      "Consola",
      "Objeto que ofrece métodos para escribir diagnósticos, como log.",
      "console.log(puntos);",
      ["log", "stdout"],
    ],
    log: [
      "Mostrar en consola",
      "Envía valores a la consola de este programa.",
      "console.log(15);",
      ["console", "return"],
    ],
    push: [
      "Añadir al array",
      "Añade elementos al final y devuelve la nueva longitud.",
      "notas.push(20);",
      ["length", "array"],
    ],
    length: [
      "Longitud",
      "En un array representa su longitud, que puede incluir posiciones vacías.",
      "notas.length",
      ["push", "índice"],
    ],
  },
  lua: {
    local: [
      "Ámbito local",
      "Declara un nombre local al bloque; evita crear una variable global.",
      "local puntos = 12",
      ["function", "variable"],
    ],
    function: [
      "Definir función",
      "Inicia una función; el cuerpo se cierra con end.",
      "local function doble(numero)\n return numero * 2\nend",
      ["local", "end", "return"],
    ],
    end: [
      "Cerrar bloque",
      "Cierra bloques de función, condición o bucle.",
      'if listo then print("sí") end',
      ["then", "do", "function"],
    ],
    then: [
      "Inicio de rama",
      "Separa la condición de if del bloque que se ejecutará.",
      "if edad >= 18 then",
      ["if", "end"],
    ],
    do: [
      "Inicio del cuerpo",
      "Abre el cuerpo de un bucle o un bloque explícito.",
      "for i = 1, 5 do",
      ["for", "end"],
    ],
    "..": [
      "Concatenación",
      "Une representaciones de texto. No uses + para concatenar.",
      '"Hola, " .. nombre',
      ["string", "print"],
    ],
    "#": [
      "Longitud de secuencia",
      "Obtiene un borde de una tabla; con huecos no es un contador general de elementos.",
      "#notas",
      ["table", "nil"],
    ],
    table: [
      "Biblioteca de tablas",
      "Ofrece funciones para manipular tablas y secuencias.",
      "table.insert(notas, 20)",
      ["insert", "#"],
    ],
    insert: [
      "Insertar elemento",
      "Inserta en una secuencia; sin posición explícita añade al final.",
      "table.insert(notas, 20)",
      ["table", "#"],
    ],
  },
  java: {
    System: [
      "Clase del sistema",
      "Contiene recursos estándar, entre ellos el flujo out.",
      "System.out.println(15);",
      ["out", "println"],
    ],
    out: [
      "Flujo de salida",
      "Campo que representa la salida estándar en System.",
      "System.out",
      ["println", "System"],
    ],
    println: [
      "Mostrar línea",
      "Escribe un valor y termina la línea.",
      "System.out.println(15);",
      ["out", "return"],
    ],
    String: [
      "Texto",
      "Clase inmutable para cadenas. Para comparar contenido usa equals.",
      'String nombre = "Ada";',
      ["equals", "=="],
    ],
    ArrayList: [
      "Lista dinámica",
      "Lista que puede crecer. En genéricos usa Integer para enteros.",
      "ArrayList<Integer> notas = new ArrayList<>();",
      ["Integer", "get", "add"],
    ],
    Integer: [
      "Entero como objeto",
      "Clase envoltorio para int, utilizable en parámetros genéricos.",
      "ArrayList<Integer>",
      ["int", "ArrayList"],
    ],
    new: [
      "Crear objeto",
      "Construye una instancia llamando al constructor.",
      "new ArrayList<>()",
      ["class", "constructor"],
    ],
    import: [
      "Importar nombre",
      "Permite usar un nombre de tipo sin escribir toda su ruta.",
      "import java.util.ArrayList;",
      ["ArrayList", "paquete"],
    ],
    get: [
      "Acceder por índice",
      "En la lista del ejemplo, obtiene el elemento de una posición.",
      "notas.get(0)",
      ["ArrayList", "size"],
    ],
    add: [
      "Añadir a lista",
      "En ArrayList añade un elemento al final con esta sobrecarga.",
      "notas.add(12);",
      ["ArrayList", "size"],
    ],
    size: [
      "Cantidad de elementos",
      "En la lista del ejemplo devuelve el número de elementos.",
      "notas.size()",
      ["ArrayList", "get"],
    ],
  },
  csharp: {
    using: [
      "Importar espacio de nombres",
      "En este ejemplo permite escribir Console sin el prefijo System. También existe using para gestión de recursos.",
      "using System;",
      ["System", "Console"],
    ],
    Console: [
      "Consola estándar",
      "Clase que ofrece métodos de entrada y salida.",
      "Console.WriteLine(15);",
      ["WriteLine", "System"],
    ],
    WriteLine: [
      "Mostrar línea",
      "Escribe un valor y un salto de línea.",
      "Console.WriteLine(15);",
      ["Console", "return"],
    ],
    var: [
      "Tipo inferido",
      "El compilador deduce un tipo fijo a partir del inicializador.",
      "var puntos = 12;",
      ["int", "tipo"],
    ],
    List: [
      "Lista dinámica",
      "Colección genérica que puede crecer.",
      "new List<int> {12, 16, 18}",
      ["Add", "Count", "int"],
    ],
    Add: [
      "Añadir a lista",
      "Añade un elemento al final de la lista.",
      "notas.Add(20);",
      ["List", "Count"],
    ],
    Count: [
      "Cantidad de elementos",
      "En una List cuenta los elementos; los arrays usan Length.",
      "notas.Count",
      ["List", "Add"],
    ],
    new: [
      "Crear objeto",
      "Construye una instancia del tipo indicado.",
      "new List<int>()",
      ["class", "List"],
    ],
  },
};
const foundations: Record<string, Entry> = {
  "#include": [
    "Traer declaraciones antes de compilar",
    "Piensa en preparar una caja de herramientas. # indica una instrucción para el preprocesador; include pide incorporar un archivo de cabecera. La cabecera declara herramientas disponibles. Esta línea no imprime ni ejecuta esas herramientas.",
    "#include <stdio.h>",
    ["#", "include", "<", ">", "stdio.h"],
  ],
  "#includd": [
    "Posible error de escritura",
    "En C y C++ se escribe #include. #includd no es una directiva válida: el compilador señalará un error y no se generará el programa.",
    "#include <stdio.h>",
    ["#include"],
  ],
  "#": [
    "Almohadilla",
    "En C y C++ inicia una directiva del preprocesador. En Python inicia un comentario. En Lua es el operador de longitud; una tabla con huecos tiene reglas especiales.",
    "#include <stdio.h>",
    ["#include"],
  ],
  include: [
    "Incluir una cabecera",
    "Con # delante, pide al preprocesador incorporar el contenido de una cabecera antes de compilar. No ejecuta una función.",
    "#include <iostream>",
    ["#include"],
  ],
  "stdio.h": [
    "Herramientas de entrada y salida de C",
    "Cabecera que declara funciones como printf (mostrar texto) y scanf (leer datos). .h identifica habitualmente una cabecera. Incluirla permite al compilador conocer esas declaraciones; la implementación se enlaza después.",
    '#include <stdio.h>\nint main(void) { printf("Hola"); return 0; }',
    ["printf", "scanf", "#include"],
  ],
  iostream: [
    "Entrada y salida de C++",
    "Cabecera que declara herramientas de flujos: std::cout escribe en la consola y std::cin lee. Incluirla no muestra nada hasta usar una de esas herramientas.",
    '#include <iostream>\nint main() { std::cout << "Hola"; }',
    ["std", "cout", "cin"],
  ],
  main: [
    "Punto de entrada",
    "En estos programas C, C++ y Java, este es el nombre de la función o método por el que empieza la ejecución. El código entre sus llaves se ejecuta en orden.",
    "int main(void) { return 0; }",
    ["int", "void", "return"],
  ],
  Main: [
    "Entrada o nombre de clase",
    "En C# Main es el método inicial. En los ejemplos Java, Main es el nombre de la clase y main, con minúscula, es el método inicial. Las mayúsculas importan.",
    "class Main { public static void main(String[] args) {} }",
    ["class", "main", "static"],
  ],
  Program: [
    "Nombre de la clase del ejemplo",
    "Agrupa el método Main de este ejemplo C#. Program es un nombre elegido por el autor; no es una palabra reservada.",
    "class Program { static void Main() {} }",
    ["class", "Main"],
  ],
  args: [
    "Argumentos del programa",
    "Nombre elegido para el array de textos que puede recibir el programa al arrancar. En estos ejemplos no se usa.",
    "public static void main(String[] args) {}",
    ["String", "[", "]"],
  ],
  nombre: [
    "Variable con un nombre",
    'Es una etiqueta para guardar o consultar el nombre usado en el saludo. En nombre = "Ada", la etiqueta es nombre y el dato es Ada.',
    'nombre = "Ada"',
    ["=", "print"],
  ],
  edad: [
    "Variable con una edad",
    "Guarda un número. La condición edad >= 18 consulta ese número para decidir qué rama ejecutar; no cambia la edad.",
    "edad = 20",
    [">=", "if"],
  ],
  puntos: [
    "Variable de puntuación",
    "Guarda los puntos del ejemplo. puntos += 3 lee lo que había, suma tres y guarda el nuevo valor.",
    "puntos = 12",
    ["=", "+="],
  ],
  numero: [
    "Parámetro o valor",
    "En la definición de doble, numero es un parámetro: un hueco con nombre que recibe el argumento de cada llamada. doble(4) hace que numero valga 4 durante esa llamada.",
    "def doble(numero):\n    return numero * 2",
    ["def", "return", "doble"],
  ],
  doble: [
    "Nombre de una función",
    "Función creada en este ejemplo, no una herramienta automática del lenguaje. Recibe un número, lo multiplica por dos y devuelve el resultado.",
    "doble(4)  # devuelve 8",
    ["numero", "return", "*"],
  ],
  Doble: [
    "Nombre de una función",
    "Nombre elegido para la función de C# que recibe un número y devuelve su doble. C# distingue Doble de doble.",
    "static int Doble(int numero) { return numero * 2; }",
    ["numero", "return"],
  ],
  notas: [
    "Colección de notas",
    "Nombre elegido para reunir varias notas. Su tipo cambia según el lenguaje: lista, array, vector o tabla. Usa un índice para consultar una nota concreta.",
    "notas = [12, 16, 18]",
    ["[", "]"],
  ],
  cantidad: [
    "Número de elementos",
    "En este ejemplo C, sizeof calcula bytes. Dividir los bytes del array entre los bytes de un elemento permite contar los elementos. Esto no funciona igual con un puntero.",
    "sizeof(notas) / sizeof(notas[0])",
    ["sizeof", "notas"],
  ],
  i: [
    "Contador del bucle",
    "Nombre corto para el contador del ejemplo. Cambia en cada vuelta y ayuda a decidir cuándo terminar.",
    "for (int i = 1; i <= 5; i++) {}",
    ["for", "<=", "++"],
  ],
  java: [
    "Paquete raíz de Java",
    "Primera parte de java.util.ArrayList: localiza una clase de la biblioteca estándar. Los puntos separan partes del nombre.",
    "import java.util.ArrayList;",
    ["import", "util", "ArrayList"],
  ],
  util: [
    "Paquete de utilidades",
    "En java.util se encuentran clases de utilidad como ArrayList. Importar la clase permite escribir su nombre corto.",
    "import java.util.ArrayList;",
    ["java", "ArrayList"],
  ],
  Collections: [
    "Colecciones de .NET",
    "Parte del espacio de nombres System.Collections.Generic. Organiza tipos usados para guardar grupos de valores.",
    "using System.Collections.Generic;",
    ["using", "Generic", "List"],
  ],
  Generic: [
    "Colecciones con tipo de elemento",
    "En System.Collections.Generic están colecciones como List<int>. <int> indica que la lista guarda enteros.",
    "List<int> notas = new List<int>();",
    ["List", "int", "<", ">"],
  ],
};
export const tokenize = (line: string) =>
  line.match(
    /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#include\b|#includd\b|[A-Za-z_]\w*\.h\b|===|!==|>=|<=|==|!=|\+=|-=|\+\+|--|<<|>>|::|=>|->|\*\*|\/\/|\.\.|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|\s+|.)/g,
  ) || [];
export function explainLine(line: string, language: string): string {
  const s = line.trim();
  if (!s)
    return "Esta línea vacía separa visualmente partes del programa; no ejecuta una operación.";
  if (s.startsWith("#include"))
    return `Incorpora las declaraciones de ${s.replace("#include", "").trim()} para utilizar su biblioteca en las líneas siguientes.`;
  if (s.startsWith("import ") || s.startsWith("using "))
    return "Hace accesibles los nombres de la biblioteca o espacio indicado. No imprime un resultado.";
  if (/^def |^local function |^function |^(?:static )?int doble/.test(s))
    return "Une la declaración de función, el nombre elegido y sus parámetros. Define una operación reutilizable; el cuerpo no se ejecuta hasta llamar a la función.";
  if (/\bfor\b/.test(s))
    return language === "python"
      ? "Asigna cada elemento de range al contador, uno por uno, y ejecuta el bloque indentado. El límite final de range se excluye."
      : language === "lua"
        ? "Recorre los números desde el inicio hasta el límite inclusivo, con el paso indicado o uno por defecto. Ejecuta el bloque hasta end en cada vuelta."
        : "Inicializa el contador una vez. Antes de cada vuelta comprueba la condición; al terminar el cuerpo lo actualiza. Estas tres piezas controlan cuántas veces se repite.";
  if (/\bif\b/.test(s))
    return "Evalúa la comparación. Si se cumple, ejecuta su rama; si no se cumple, pasa a la alternativa cuando existe. La variable, el operador y el límite forman juntos la condición.";
  if (/\belse\b/.test(s))
    return "Esta es la alternativa de la condición anterior: se ejecuta cuando aquella condición es falsa.";
  if (/\breturn\b/.test(s) && !s.includes("main"))
    return "Evalúa la expresión que sigue a return y entrega ese resultado al llamador. No lo imprime por sí sola; esta llamada termina aquí.";
  if (/print|cout|WriteLine|puts\(/.test(s))
    return "Evalúa los argumentos o valores del flujo y los muestra en la salida. Si un argumento contiene una llamada, primero obtiene su resultado.";
  if (/append|push_back|\.push\(|\.Add\(|\.add\(|table.insert/.test(s))
    return "Llama a una operación sobre la colección para añadir el valor indicado. La colección queda modificada para las instrucciones siguientes.";
  if (/\+=/.test(s))
    return "Lee el valor actual, le suma el valor derecho y guarda el resultado en la misma variable.";
  if (/=(?!=)/.test(s))
    return "Evalúa el lado derecho y lo vincula o asigna al nombre de la izquierda. La declaración de tipo, si existe, determina qué valores son válidos.";
  if (/main\(|Main\(/.test(s))
    return "Define el punto de entrada de este ejemplo. Las instrucciones de su cuerpo comenzarán al ejecutar el programa.";
  if (/class /.test(s))
    return "Define una clase que agrupa los métodos del ejemplo. Las llaves delimitan su contenido.";
  if (/^[}\s;]+$/.test(s) || s === "end")
    return "Cierra el bloque abierto anteriormente. La posición de este cierre delimita qué instrucciones pertenecen al bloque.";
  return "Lee esta instrucción junto con su bloque: los nombres aportan valores, los operadores los combinan y las llamadas realizan operaciones. No hay un análisis semántico completo para esta línea; usa el ejemplo y la ejecución para comprobarla.";
}
export function lookupToken(
  token: string,
  line: string,
  language: string,
): Definition {
  let entry =
    foundations[token] || byLanguage[language]?.[token] || common[token];
  if ((token === "<" || token === ">") && /^\s*#include/.test(line))
    entry = [
      token === "<" ? "Abrir nombre de cabecera" : "Cerrar nombre de cabecera",
      "Estos signos enmarcan el nombre de la cabecera que se busca en las rutas de inclusión del compilador. Aquí no comparan números.",
      "#include <stdio.h>",
      ["#include", "stdio.h"],
    ];
  const here = explainLine(line, language);
  if (entry)
    return {
      name: entry[0],
      meaning: entry[1],
      example: entry[2],
      related: entry[3],
      here,
    };
  if (/^\d/.test(token))
    return {
      name: "Valor numérico literal",
      meaning: `El programa usa aquí el número ${token}. No es el nombre de una variable.`,
      here,
      example: token,
      related: ["variable", "operador"],
    };
  if (/^["']/.test(token))
    return {
      name: "Texto literal",
      meaning:
        "Las comillas delimitan el texto. Secuencias como \\n pueden representar caracteres especiales.",
      here,
      example: token,
      related: ["print", "+", ".."],
    };
  if (/^[A-Za-z_]\w*$/.test(token))
    return {
      name: token,
      meaning: /\((?:[^)]*\b)?/.test(line.slice(0, line.indexOf(token)))
        ? "Es un nombre utilizado dentro de esta expresión. En una definición puede ser un parámetro; en una llamada representa un argumento o una función."
        : "Es un identificador: un nombre para un valor, función o tipo. Su declaración y posición determinan su papel.",
      here,
      example: line.trim(),
      related: ["declaración", "parámetro", "argumento"],
    };
  return {
    name: token,
    meaning:
      "Símbolo del código. Su papel depende de la construcción que lo contiene; consulta la explicación de la línea completa.",
    here,
    example: line.trim(),
    related: [],
  };
}
export function traceFor(
  concept: string,
  language: string,
): { label: string; value: string; output: string }[] {
  if (concept === "bucles")
    return Array.from({ length: 5 }, (_, i) => ({
      label: `Iteración ${i + 1}`,
      value: `${language === "python" ? "numero" : "i"} = ${i + 1}`,
      output: Array.from({ length: i + 1 }, (_, j) => String(j + 1)).join("\n"),
    }));
  if (concept === "variables")
    return [
      { label: "Asignar", value: "puntos = 12", output: "" },
      { label: "Actualizar", value: "puntos = 15", output: "" },
      { label: "Mostrar", value: "puntos = 15", output: "15" },
    ];
  if (concept === "condicionales")
    return [
      { label: "Entrada", value: "edad = 17", output: "" },
      { label: "Comparación", value: "17 >= 18 → falso", output: "" },
      { label: "Rama alternativa", value: "else", output: "Menor" },
    ];
  if (concept === "funciones")
    return [
      { label: "Definir", value: "doble: función disponible", output: "" },
      { label: "Llamar", value: "numero = 7", output: "" },
      { label: "Operar", value: "7 × 2 = 14", output: "" },
      { label: "Devolver y mostrar", value: "return → 14", output: "14" },
    ];
  if (concept === "colecciones")
    return [
      { label: "Crear", value: "notas: 12, 16, 18", output: "" },
      {
        label: "Leer",
        value: `primer índice: ${language === "lua" ? "1" : "0"}`,
        output: "12",
      },
      {
        label: "Contar",
        value: `cantidad = ${["c", "java"].includes(language) ? 3 : 4}`,
        output: `12\n${["c", "java"].includes(language) ? 3 : 4}`,
      },
    ];
  return [
    { label: "Texto", value: "El saludo queda listo para mostrar", output: "" },
    {
      label: "Mostrar",
      value: "salida estándar",
      output: ["python", "javascript", "lua"].includes(language)
        ? "Hola, Ada"
        : "Hola, Sintavra",
    },
  ];
}
