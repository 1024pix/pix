import { QCM } from './QCM.js';
import { Feedbacks } from '../Feedbacks.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ValidatorQCM } from '../validator/ValidatorQCM.js';
import { QcmCorrectionResponse } from '../QcmCorrectionResponse.js';
import Joi from 'joi';
import { EntityValidationError } from '../../../../shared/domain/errors.js';

class QCMForAnswerVerification extends QCM {
  userResponse;

  constructor({ id, instruction, locales, proposals, solutions, feedbacks, validator }) {
    super({ id, instruction, locales, proposals });

    assertNotNullOrUndefined(solutions, 'The solutions are required for a QCM for verification');

    this.solutionsValue = solutions;

    if (feedbacks) {
      this.feedbacks = new Feedbacks(feedbacks);
    }

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQCM({ solution: { value: this.solutionsValue } });
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
      solutions: this.solutionsValue,
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
