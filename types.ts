
export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface FillInTheBlank {
  sentence: string; // e.g., "The process of converting light to energy is called ___."
  correctAnswer: string; // e.g., "photosynthesis"
}

export interface ScrambledSentence {
  scrambled: string[]; // e.g., ["is", "photosynthesis", "important"]
  correctSentence: string; // e.g., "photosynthesis is important"
}

export interface Lesson {
  title: string;
  content: string;
  quiz?: Quiz;
  fillInTheBlank?: FillInTheBlank;
  scrambledSentence?: ScrambledSentence;
}

export interface Course {
  title: string;
  lessons: Lesson[];
}

export enum GameState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  IN_COURSE = 'IN_COURSE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
