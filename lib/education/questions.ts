import {
  getLanguage,
  getLesson,
  type Language,
  type Lesson,
} from "@/lib/content";
export type Question = {
  id: string;
  lessonId: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};
export function questionBank(
  lesson: Lesson,
  language: Language,
  english = false,
): Question[] {
  const t = (es: string, en: string) => (english ? en : es);
  const q = (
    n: number,
    prompt: string,
    options: string[],
    answer: number,
    explanation: string,
  ): Question => ({
    id: lesson.id + "-" + n,
    lessonId: lesson.id,
    prompt,
    options,
    answer,
    explanation,
  });
  const index = language.id === "lua" ? 1 : 0;
  const examples = lesson.code;
  switch (lesson.concept) {
    case "inicio":
      return [
        q(
          1,
          t("¿Qué hace este programa?", "What does this program do?") +
            "\n" +
            examples,
          [
            t("Muestra un saludo", "Prints a greeting"),
            t("Lee una contraseña", "Reads a password"),
            t("Repite para siempre", "Repeats forever"),
          ],
          0,
          t(
            "La llamada de salida muestra el saludo. No hay lectura ni bucle.",
            "The output call prints the greeting. There is no input or loop.",
          ),
        ),
        q(
          2,
          t(
            "¿Qué distingue un texto literal de un identificador?",
            "What distinguishes a string literal from an identifier?",
          ),
          [
            t("El literal lleva comillas", "The literal is quoted"),
            t(
              "Todos los nombres son texto literal",
              "All names are string literals",
            ),
            t("No existe diferencia", "There is no difference"),
          ],
          0,
          t(
            "Las comillas delimitan el texto; un identificador refiere a un nombre del programa.",
            "Quotes delimit text; an identifier refers to a program name.",
          ),
        ),
        q(
          3,
          t(
            "¿Cuál es una buena forma de investigar un error?",
            "What is a useful way to investigate an error?",
          ),
          [
            t("Cambiar todo al azar", "Change everything randomly"),
            t(
              "Leer el mensaje y reducir el ejemplo",
              "Read the error and reduce the example",
            ),
            t("Borrar todos los signos", "Delete all punctuation"),
          ],
          1,
          t(
            "Un ejemplo pequeño permite aislar el problema y comprobar una hipótesis.",
            "A small example isolates the issue and lets you test a hypothesis.",
          ),
        ),
      ];
    case "variables":
      return [
        q(
          1,
          t("¿Qué valor se muestra?", "Which value is printed?") +
            "\n" +
            examples,
          ["12", "15", "3"],
          1,
          t(
            "Primero se asigna 12; después se suman 3.",
            "First assign 12, then add 3.",
          ),
        ),
        q(
          2,
          t(
            "Empiezas con 20 puntos y restas 4. ¿Qué queda?",
            "Start with 20 points and subtract 4. What remains?",
          ),
          ["24", "16", "4"],
          1,
          t(
            "La asignación posterior conserva el resultado de 20 − 4.",
            "The later assignment stores the result of 20 − 4.",
          ),
        ),
        q(
          3,
          t(
            "¿Qué afirmación es correcta en este lenguaje?",
            "Which statement is correct in this language?",
          ),
          language.id === "lua"
            ? [
                t("local limita el alcance", "local limits scope"),
                t("Toda variable debe ser int", "Every variable must be int"),
                t("nil es el número cero", "nil is the number zero"),
              ]
            : language.id === "javascript"
              ? [
                  t(
                    "const impide reasignar el vínculo",
                    "const prevents rebinding",
                  ),
                  t(
                    "const congela todos los objetos",
                    "const freezes every object",
                  ),
                  t("let solo guarda números", "let only stores numbers"),
                ]
              : language.id === "python"
                ? [
                    t(
                      "El tipo pertenece al objeto",
                      "The type belongs to the object",
                    ),
                    t(
                      "Toda variable se declara con int",
                      "Every variable is declared with int",
                    ),
                    t('"12" siempre es un número', '"12" is always a number'),
                  ]
                : [
                    t(
                      "Los tipos se comprueban antes de ejecutar",
                      "Types are checked before execution",
                    ),
                    t("Los tipos no importan", "Types do not matter"),
                    t("Todo texto es un entero", "All text is an integer"),
                  ],
          0,
          lesson.bodyEn && english ? lesson.bodyEn : lesson.body,
        ),
      ];
    case "condicionales":
      return [
        q(
          1,
          t(
            "¿Qué rama ejecuta el ejemplo?",
            "Which branch does the example execute?",
          ) +
            "\n" +
            examples,
          ["Mayor", "Menor", t("Ambas", "Both")],
          1,
          t(
            "17 no es mayor ni igual a 18. Se ejecuta else.",
            "17 is not at least 18. The else branch runs.",
          ),
        ),
        q(
          2,
          t(
            "Si la condición es temperatura > 25 y temperatura vale 25, ¿entra en if?",
            "If the condition is temperature > 25 and temperature is 25, does if run?",
          ),
          [
            t("Sí", "Yes"),
            t("No", "No"),
            t("Siempre se ejecutan ambas ramas", "Both branches always run"),
          ],
          1,
          t(
            "Mayor que excluye la igualdad. 25 > 25 es falso.",
            "Greater than excludes equality. 25 > 25 is false.",
          ),
        ),
        q(
          3,
          language.id === "lua"
            ? t(
                "¿Se considera verdadero el valor 0 en Lua?",
                "Is 0 truthy in Lua?",
              )
            : language.id === "java"
              ? t(
                  "¿Qué debes usar para comparar el contenido de String?",
                  "What should you use to compare String contents?",
                )
              : t(
                  "¿Qué operación necesitas para preguntar si dos valores son iguales?",
                  "Which operation asks whether two values are equal?",
                ),
          language.id === "lua"
            ? [t("Sí", "Yes"), t("No", "No"), "nil"]
            : language.id === "java"
              ? ["equals", "==", "="]
              : [
                  t("Comparación de igualdad", "Equality comparison"),
                  t("Asignación", "Assignment"),
                  t("Concatenación", "Concatenation"),
                ],
          0,
          english ? lesson.bodyEn : lesson.body,
        ),
      ];
    case "bucles":
      return [
        q(
          1,
          t("¿Cuántas líneas imprime?", "How many lines does it print?") +
            "\n" +
            examples,
          ["4", "5", "6"],
          1,
          t(
            "Los valores son 1, 2, 3, 4 y 5: cinco iteraciones.",
            "The values are 1, 2, 3, 4 and 5: five iterations.",
          ),
        ),
        q(
          2,
          t(
            "¿Qué secuencia corresponde a los pares del 2 al 10, incluidos ambos extremos?",
            "Which sequence contains the even numbers from 2 through 10?",
          ),
          ["2, 4, 6, 8, 10", "0, 2, 4, 6, 8", "2, 3, 4, 5, 6"],
          0,
          t(
            "Empieza en 2, aumenta 2 y termina al llegar a 10.",
            "Start at 2, add 2 and stop at 10.",
          ),
        ),
        q(
          3,
          language.id === "python"
            ? t("¿Qué produce range(2, 6)?", "What does range(2, 6) produce?")
            : language.id === "lua"
              ? t(
                  "¿Qué valores toma i en for i = 2, 6, 2 do?",
                  "Which values does i take in for i = 2, 6, 2 do?",
                )
              : t(
                  "Si la condición del for es falsa al comienzo, ¿cuántas veces se ejecuta el cuerpo?",
                  "If the for condition starts false, how many times does its body run?",
                ),
          language.id === "python"
            ? ["2, 3, 4, 5", "2, 3, 4, 5, 6", "0, 1, 2, 3, 4, 5"]
            : language.id === "lua"
              ? ["2, 4, 6", "2, 4", "1, 2, 3, 4, 5, 6"]
              : ["0", "1", t("Para siempre", "Forever")],
          0,
          english ? lesson.bodyEn : lesson.body,
        ),
      ];
    case "funciones":
      return [
        q(
          1,
          t("¿Qué devuelve doble(7)?", "What does doble(7) return?") +
            "\n" +
            examples,
          ["7", "14", "2"],
          1,
          t(
            "Se multiplica el parámetro 7 por 2.",
            "The parameter 7 is multiplied by 2.",
          ),
        ),
        q(
          2,
          t(
            "Una función triple devuelve n * 3. ¿Qué devuelve con n = 0?",
            "A triple function returns n * 3. What does it return when n = 0?",
          ),
          ["3", "0", t("No se puede llamar", "It cannot be called")],
          1,
          t(
            "Cero multiplicado por tres es cero; conviene probar este caso.",
            "Zero times three is zero; this is a useful test case.",
          ),
        ),
        q(
          3,
          t(
            "¿Qué diferencia hay entre mostrar y devolver un resultado?",
            "How does printing differ from returning?",
          ),
          [
            t(
              "Mostrar escribe en la salida; devolver entrega un valor al llamador",
              "Printing writes output; returning gives a value to the caller",
            ),
            t("Son siempre idénticos", "They are always identical"),
            t("return solo sirve para texto", "return only works for text"),
          ],
          0,
          t(
            "El llamador puede usar un valor devuelto en otra operación.",
            "The caller can use a returned value in another operation.",
          ),
        ),
      ];
    default:
      return [
        q(
          1,
          t(
            "¿Qué valor ocupa la primera posición?",
            "Which value occupies the first position?",
          ) +
            "\n" +
            examples,
          ["12", "16", "18"],
          0,
          t(
            "La colección se construye empezando por 12.",
            "The collection is constructed starting with 12.",
          ),
        ),
        q(
          2,
          t(
            "En la colección del ejemplo, ¿qué índice identifica el primer elemento?",
            "In this example’s collection, which index identifies the first element?",
          ),
          ["0", "1", "3"],
          index,
          t(
            "En este ejemplo, el primer índice es ",
            "In this example, the first index is ",
          ) +
            index +
            ".",
        ),
        q(
          3,
          t(
            "¿Es correcto suponer que acceder fuera de los límites siempre devuelve cero?",
            "Is it correct to assume an out-of-bounds read always returns zero?",
          ),
          [
            t(
              "No; el comportamiento depende del lenguaje y la operación",
              "No; behavior depends on the language and operation",
            ),
            t("Sí, en todos los lenguajes", "Yes, in every language"),
            t(
              "Solo si la colección tiene tres elementos",
              "Only if the collection has three elements",
            ),
          ],
          0,
          english ? lesson.bodyEn : lesson.body,
        ),
      ];
  }
}
export function createQuestions(
  lessonId: string,
  locale: string,
  exam = false,
): Question[] {
  const language = getLanguage(exam ? lessonId : lessonId.split("-")[0]);
  if (!language) return [];
  const selected = exam
    ? language.lessons
    : ([getLesson(lessonId)].filter(Boolean) as Lesson[]);
  return selected
    .flatMap((l) =>
      questionBank(l, language, locale === "en").slice(0, exam ? 2 : 3),
    )
    .map((q) => {
      const order = q.options.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const n = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
        [order[i], order[n]] = [order[n], order[i]];
      }
      return {
        ...q,
        options: order.map((i) => q.options[i]),
        answer: order.indexOf(q.answer),
      };
    });
}
