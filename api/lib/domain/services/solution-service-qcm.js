import { AnswerStatus } from '../../../src/shared/domain/models/AnswerStatus.js';
import { _ } from '../../../src/shared/infrastructure/utils/lodash-utils.js';

const match = function (answer, solution) {
  if (_.areCSVequivalent(answer, solution)) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
};

export { match };
