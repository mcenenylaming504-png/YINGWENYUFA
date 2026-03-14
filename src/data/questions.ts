import { Question } from '../types';

export const QUESTIONS: Question[] = [
  {
    id: '1',
    category: 'Adverbial Clause',
    difficulty: 'Intermediate',
    sentenceParts: ['', ' tired, she still finished the report.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'Although',
        options: ['Because', 'Although', 'Unless', 'Since'],
        explanation: {
          rule: "Although 引导让步状语从句，表示“尽管”。句意为：尽管很累，她还是完成了报告。",
          example: "Although it was raining, they went out for a walk.",
          commonMistake: "在英语中 although 和 but 不能同时出现在一个句子中。"
        }
      }
    ]
  },
  {
    id: '2',
    category: 'Non-finite Verbs',
    difficulty: 'Advanced',
    sentenceParts: ['I saw him ', ' into the library just now.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'go',
        options: ['to go', 'go', 'went', 'goes'],
        explanation: {
          rule: "see sb. do sth. 强调看到动作发生的全过程；see sb. doing sth. 强调看到动作正在进行。此处用省略 to 的不定式。",
          example: "I saw her cross the street.",
          commonMistake: "容易误用 to go，感官动词 see, hear, watch 等后接不定式作宾补时要省去 to。"
        }
      }
    ]
  },
  {
    id: '3',
    category: 'Attributive Clause',
    difficulty: 'Intermediate',
    sentenceParts: ['The girl ', ' is talking to our teacher is my sister.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'who',
        options: ['which', 'who', 'whose', 'whom'],
        explanation: {
          rule: "who 引导定语从句，先行词是人（The girl），且在从句中作主语。",
          example: "The man who lives next door is a doctor.",
          commonMistake: "which 用于指代物，不能指代人。"
        }
      }
    ]
  },
  {
    id: '4',
    category: 'Adverbial Clause of Time',
    difficulty: 'Beginner',
    sentenceParts: ['I will call you as soon as I ', ' there.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'get',
        options: ['will get', 'get', 'got', 'getting'],
        explanation: {
          rule: "在时间状语从句和条件状语从句中，常用一般现在时表示将来（主将从现）。",
          example: "If it rains tomorrow, we won't go out.",
          commonMistake: "初学者容易在从句中也使用 will get。"
        }
      }
    ]
  },
  {
    id: '5',
    category: 'Object Clause',
    difficulty: 'Intermediate',
    sentenceParts: ['Do you know ', ' the meeting will start?'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'when',
        options: ['that', 'if', 'when', 'whether'],
        explanation: {
          rule: "when 引导宾语从句，表示“什么时候”。句意：你知道会议什么时候开始吗？",
          example: "I don't know where he lives.",
          commonMistake: "宾语从句要用陈述句语序，虽然这道题主要考察引导词。"
        }
      }
    ]
  },
  {
    id: '6',
    category: 'Passive Voice',
    difficulty: 'Intermediate',
    sentenceParts: ['The bridge ', ' in 2010.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'was built',
        options: ['built', 'was built', 'is built', 'has built'],
        explanation: {
          rule: "句子主语 The bridge 是动作的承受者，且时间状语 in 2010 表示过去，因此用一般过去时的被动语态。",
          example: "This book was written by Lu Xun.",
          commonMistake: "容易忽略 be 动词或时态错误。"
        }
      }
    ]
  },
  {
    id: '7',
    category: 'Comparative Degree',
    difficulty: 'Beginner',
    sentenceParts: ['This book is ', ' than that one.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'more interesting',
        options: ['interesting', 'more interesting', 'most interesting', 'the most interesting'],
        explanation: {
          rule: "than 是比较级的标志词。多音节词 interesting 的比较级是在前面加 more。",
          example: "He is taller than me.",
          commonMistake: "误用最高级或忘记加 more。"
        }
      }
    ]
  },
  {
    id: '8',
    category: 'Prepositions',
    difficulty: 'Beginner',
    sentenceParts: ['We usually have a rest ', ' noon.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'at',
        options: ['in', 'on', 'at', 'for'],
        explanation: {
          rule: "at noon 是固定搭配，意为“在中午”。",
          example: "at night, at the weekend.",
          commonMistake: "误用 in noon（in the morning/afternoon/evening 是正确的，但 noon 用 at）。"
        }
      }
    ]
  },
  {
    id: '9',
    category: 'Conditional Clause',
    difficulty: 'Intermediate',
    sentenceParts: ['If it ', ' sunny tomorrow, we will go for a picnic.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'is',
        options: ['is', 'will be', 'be', 'was'],
        explanation: {
          rule: "在 if 引导的条件状语从句中，主句用将来时，从句用一般现在时表示将来（主将从现）。",
          example: "If you study hard, you will pass the exam.",
          commonMistake: "受中文思维影响，容易在从句中也使用 will be。"
        }
      }
    ]
  },
  {
    id: '10',
    category: 'Non-finite Verbs',
    difficulty: 'Advanced',
    sentenceParts: ['The teacher told us ', ' too much noise in class.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'not to make',
        options: ['not make', 'to not make', 'not to make', 'don\'t make'],
        explanation: {
          rule: "tell sb. (not) to do sth. 是固定搭配。不定式的否定形式是在 to 前加 not。",
          example: "My mother told me not to play with fire.",
          commonMistake: "否定词 not 的位置放错，或者误用 don't。"
        }
      }
    ]
  },
  {
    id: '11',
    category: 'Attributive Clause',
    difficulty: 'Advanced',
    sentenceParts: ['This is the very book ', ' I am looking for.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'that',
        options: ['which', 'that', 'who', 'whom'],
        explanation: {
          rule: "当先行词被 the very, the only, the same 等词修饰时，关系代词只能用 that 而不能用 which。",
          example: "This is the only thing that I can do for you.",
          commonMistake: "习惯性使用 which，忽略了 the very 的特殊限制。"
        }
      }
    ]
  },
  {
    id: '12',
    category: 'Noun Clause',
    difficulty: 'Intermediate',
    sentenceParts: ['I wonder ', ' he will come or not.'],
    blanks: [
      {
        id: 0,
        correctAnswer: 'whether',
        options: ['if', 'whether', 'that', 'when'],
        explanation: {
          rule: "whether...or not 是固定搭配。虽然 if 也可以引导宾语从句表示“是否”，但与 or not 连用时通常只用 whether。",
          example: "I don't know whether it is true or not.",
          commonMistake: "混淆 if 和 whether 的用法限制。"
        }
      }
    ]
  }
];
