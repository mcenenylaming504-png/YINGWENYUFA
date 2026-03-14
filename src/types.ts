export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface GrammarOption {
  id: string;
  text: string;
}

export interface Blank {
  id: number;
  correctAnswer: string;
  options: string[];
  explanation: {
    rule: string;
    example: string;
    commonMistake: string;
  };
}

export interface Question {
  id: string;
  sentenceParts: string[]; // Parts of the sentence split by blanks
  blanks: Blank[];
  category: string;
  difficulty: Difficulty;
}

export interface UserAnswer {
  questionId: string;
  answers: Record<number, string>; // blank index -> selected option
  isCorrect: boolean[];
  submitted: boolean;
}
