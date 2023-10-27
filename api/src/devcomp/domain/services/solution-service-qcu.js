import { AnswerStatus } from '../models/validator/AnswerStatus.js';

const match = function (answer, solution) {
  if (answer === solution) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
};

export { match };
