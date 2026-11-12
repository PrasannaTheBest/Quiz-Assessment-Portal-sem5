// Each quiz: id, title, description, time limit (seconds) and questions.
// `answer` is the index of the correct option.
export const quizzes = [
  {
    id: "javascript",
    title: "JavaScript Basics",
    description: "Core language concepts: types, scope, arrays and functions.",
    timeLimit: 120,
    questions: [
      {
        question: "Which keyword declares a block-scoped variable that can be reassigned?",
        options: ["var", "let", "const", "static"],
        answer: 1,
      },
      {
        question: "What does typeof null return?",
        options: ["\"null\"", "\"undefined\"", "\"object\"", "\"number\""],
        answer: 2,
      },
      {
        question: "Which array method returns a new array with only the items that pass a test?",
        options: ["map()", "filter()", "reduce()", "forEach()"],
        answer: 1,
      },
      {
        question: "What is the result of 2 + \"2\" in JavaScript?",
        options: ["4", "\"22\"", "NaN", "Error"],
        answer: 1,
      },
      {
        question: "Which operator checks both value and type equality?",
        options: ["==", "=", "===", "!="],
        answer: 2,
      },
    ],
  },
  {
    id: "react",
    title: "React Fundamentals",
    description: "Components, props, state, hooks and routing.",
    timeLimit: 120,
    questions: [
      {
        question: "Which hook is used to add state to a function component?",
        options: ["useEffect", "useState", "useRef", "useMemo"],
        answer: 1,
      },
      {
        question: "What is JSX?",
        options: [
          "A database query language",
          "A syntax extension that looks like HTML inside JavaScript",
          "A CSS preprocessor",
          "A testing library",
        ],
        answer: 1,
      },
      {
        question: "Which hook runs side effects such as timers or data fetching?",
        options: ["useState", "useContext", "useEffect", "useReducer"],
        answer: 2,
      },
      {
        question: "Props in React are...",
        options: [
          "Mutable state owned by the child",
          "Read-only inputs passed from parent to child",
          "Global variables",
          "CSS classes",
        ],
        answer: 1,
      },
      {
        question: "Which React Router component renders a URL-based navigation link without a page reload?",
        options: ["<a>", "<Link>", "<Route>", "<Switch>"],
        answer: 1,
      },
    ],
  },
  {
    id: "dbms",
    title: "DBMS Essentials",
    description: "SQL, keys, normalization and transactions.",
    timeLimit: 90,
    questions: [
      {
        question: "Which key uniquely identifies each row in a table?",
        options: ["Foreign key", "Primary key", "Candidate index", "Composite view"],
        answer: 1,
      },
      {
        question: "Which SQL command removes all rows but keeps the table structure?",
        options: ["DROP", "DELETE TABLE", "TRUNCATE", "REMOVE"],
        answer: 2,
      },
      {
        question: "ACID stands for...",
        options: [
          "Atomicity, Consistency, Isolation, Durability",
          "Accuracy, Consistency, Integrity, Data",
          "Atomicity, Control, Isolation, Data",
          "Access, Consistency, Index, Durability",
        ],
        answer: 0,
      },
      {
        question: "Which normal form removes partial dependencies?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        answer: 1,
      },
    ],
  },
];

export const getQuiz = (id) => quizzes.find((q) => q.id === id);
