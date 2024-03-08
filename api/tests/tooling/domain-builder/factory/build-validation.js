import { Validation } from '../../../../lib/domain/models/Validation.js';
import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';

const buildValidation = function ({ result = AnswerStatus.OK, resultDetails = 'Bravo' } = {}) {
  return new Validation({
    result,
    resultDetails,
  });
};

export { buildValidation };
