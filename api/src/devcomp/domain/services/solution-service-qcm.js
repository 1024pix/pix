import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';
import { AnswerStatus } from '../models/validator/AnswerStatus.js';

const match = function (answer, solution) {
  if (_.areCSVequivalent(answer, solution)) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
};

export { match };
