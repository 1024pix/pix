import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { QrocmCorrectionResponse } from '../QrocmCorrectionResponse.js';
import { QrocmSolutions } from '../QrocmSolutions.js';
import { ValidatorQROCMInd } from '../validator/ValidatorQROCMInd.js';
import { QROCM } from './QROCM.js';

class QROCMForAnswerVerification extends QROCM {
  userResponse;

  constructor({ id, instruction, feedbacks, proposals, locales, validator }) {
    super({ id, instruction, proposals, locales });

    assertNotNullOrUndefined(feedbacks, 'The feedbacks are required for a verification QROCM.');

    this.feedbacks = feedbacks;

    this.solution = new QrocmSolutions(proposals);

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQROCMInd({
        solution: {
          value: this.solution.value,
          enabledTolerances: this.solution.tolerances,
        },
      });
    }
  }

  setUserResponse(userResponse) {
    this.#validateUserResponseFormat(userResponse);

    const answer = {};
    for (const response of userResponse) {
      answer[response.input] = response.answer;
    }
    this.userResponse = answer;
  }

  assess() {
    const validation = this.validator.assess({ answer: { value: this.userResponse } });

    return new QrocmCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solution: this.solution.value,
    });
  }

  #validateUserResponseFormat(userResponse) {
    const qrocmResponseSchema = Joi.object({
      input: Joi.string().required(),
      answer: Joi.string().required(),
    }).required();

    const validUserResponseSchema = Joi.array().items(qrocmResponseSchema).required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { QROCMForAnswerVerification };
