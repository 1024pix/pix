import { _ } from '../../infrastructure/utils/lodash-utils.js';
import { AnswerStatus } from '../../../src/shared/domain/models/AnswerStatus.js';

const match = function (answer, solution) {
  if (_.areCSVequivalent(answer, solution)) {
    return AnswerStatus.OK;
  }
  return AnswerStatus.KO;
};

export { match };
