export type Question =
  | {
      id?: number;
      type: "MCQ";
      text: string;
      answer: string;
      category: number;
      details: MCQDetails;
    }
  | {
      id?: number;
      type: "TF";
      text: string;
      answer: string;
      category: number;
      details: TFDetails;
    }
  | {
      id?: number;
      type: "FIB";
      text: string;
      answer: string;
      category: number;
      details: FIBDetails;
    };

export type QuestionType = "MCQ" | "TF" | "FIB";

export type MCQDetails = {
  options: MCQOption[]
}

type MCQOption = {
  text: string,
  is_correct: boolean
}

export type TFDetails = {
  is_true: boolean
}

export type FIBDetails = {
  correct_answer: string
}

export type Current = {
  id: number,
  order: number,
  question: Question,
  type: QuestionType,
  text: string,
  details?: {
    options?: { id: number; text: string }[];
  }; 
}

export type Answers = {
  [key: string|number]: string | number
}

export type ResultAnswer = {
  question_text: string,
  user_answer: null | string,
  is_correct: boolean,
  correct_answer: string
}