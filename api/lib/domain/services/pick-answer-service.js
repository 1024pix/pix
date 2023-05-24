import { AnswerStatus } from '../models/index.js';

function pickAnswersFromArray(array) {
  return function ({ answerIndex }) {
    return array[answerIndex];
  };
}

function pickAnswerForCapacity(capacity) {
  return function ({ nextChallenge }) {
    const successProbability = 1 / (1 + Math.exp(-nextChallenge.discriminant * (capacity - nextChallenge.difficulty)));
    return successProbability > Math.random() ? AnswerStatus.OK : AnswerStatus.KO;
  };
}

export const pickAnswersService = {
  pickAnswersFromArray,
  pickAnswerForCapacity,
};
