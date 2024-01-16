import { QCU } from './QCU.js';
import { Feedbacks } from '../Feedbacks.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ValidatorQCU } from '../validator/ValidatorQCU.js';
import { QcuCorrectionResponse } from '../QcuCorrectionResponse.js';
import { ElementAnswer } from '../ElementAnswer.js';
import Joi from 'joi';
import { EntityValidationError } from '../../../../shared/domain/errors.js';

class QCUForAnswerVerification extends QCU {
  constructor({ id, instruction, locales, proposals, solution, feedbacks, validator }) {
    super({ id, instruction, locales, proposals });

    assertNotNullOrUndefined(solution, 'La solution est obligatoire pour un QCU de vérification');

    this.solution = solution;

    if (feedbacks) {
      this.feedbacks = new Feedbacks(feedbacks);
    }

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQCU({ solution: { value: this.solution } });
    }
  }

  validateUserResponseFormat(userResponse) {
    const qcuResponseSchema = Joi.string()
      .pattern(/^[0-9]+$/)
      .required();

    const validUserResponseSchema = Joi.array().items(qcuResponseSchema).min(1).max(1).required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }

  assess(userResponse) {
    const selectedQcuProposalId = userResponse[0];
    const validation = this.validator.assess({ answer: { value: selectedQcuProposalId } });

    const correction = new QcuCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solution: this.solution,
    });

    return new ElementAnswer({
      elementId: this.id,
      userResponseValue: selectedQcuProposalId,
      correction,
    });
  }
}

export { QCUForAnswerVerification };
