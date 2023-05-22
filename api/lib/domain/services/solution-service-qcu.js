import { AnswerStatus } from '../models/AnswerStatus.js';

const match = function (answer, solution) {
  if (answer === solution) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
};

export { match };
