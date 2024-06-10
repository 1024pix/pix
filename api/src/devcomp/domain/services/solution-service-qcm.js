import { AnswerStatus } from '../models/validator/AnswerStatus.js';

const match = function (answers, solutions) {
  const areAnswersEqualToSolutions = JSON.stringify(answers.sort()) === JSON.stringify(solutions.sort());

  if (areAnswersEqualToSolutions) {
    return AnswerStatus.OK;
  }

  return AnswerStatus.KO;
};

export default { match };
