import { AnswerStatus } from '../../../../lib/shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../../lib/shared/domain/models/Validation.js';

const buildValidation = function ({ result = AnswerStatus.OK, resultDetails = 'Bravo' } = {}) {
  return new Validation({
    result,
    resultDetails,
  });
};

export { buildValidation };
