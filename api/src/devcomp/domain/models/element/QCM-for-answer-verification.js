import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Feedbacks } from '../Feedbacks.js';
import { QcmCorrectionResponse } from '../QcmCorrectionResponse.js';
import { ValidatorQCM } from '../validator/ValidatorQCM.js';
import { QCM } from './QCM.js';

class QCMForAnswerVerification extends QCM {
  userResponse;

  constructor({ id, instruction, locales, proposals, solutions, feedbacks, validator }) {
    super({ id, instruction, locales, proposals });

    assertNotNullOrUndefined(solutions, 'The solutions are required for a QCM for verification');

    this.solution = {
      value: solutions,
    };

    if (feedbacks) {
      this.feedbacks = new Feedbacks(feedbacks);
    }

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQCM({ solution: this.solution });
    }
  }

  setUserResponse(userResponse) {
    this.#validateUserResponseFormat(userResponse);
    this.userResponse = userResponse;
  }

  assess() {
    const validation = this.validator.assess({ answer: { value: this.userResponse } });

    return new QcmCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solution: this.solution.value,
    });
  }

  #validateUserResponseFormat(userResponse) {
    const qcmResponseSchema = Joi.string()
      .pattern(/^[0-9]+$/)
      .required();

    const validUserResponseSchema = Joi.array().items(qcmResponseSchema).min(2).required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { QCMForAnswerVerification };
