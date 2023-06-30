import { AnswerStatus } from '../../../src/shared/domain/models/AnswerStatus.js';

const match = function (answer, solution) {
  if (answer === solution) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
};

export { match };
