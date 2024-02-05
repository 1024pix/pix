import { QROCM } from './QROCM.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { QrocmCorrectionResponse } from '../QrocmCorrectionResponse.js';
import { ValidatorQROCMInd } from '../validator/ValidatorQROCMInd.js';
import { QrocmSolutions } from '../QrocmSolutions.js';
import Joi from 'joi';
import { EntityValidationError } from '../../../../shared/domain/errors.js';

class QROCMForAnswerVerification extends QROCM {
  #solution;
  userResponse;

  constructor({ id, instruction, feedbacks, proposals, locales, validator }) {
    super({ id, instruction, proposals, locales });

    assertNotNullOrUndefined(feedbacks, 'Les feedbacks sont obligatoires pour un QROCM de vérification');

    this.feedbacks = feedbacks;

    this.#solution = new QrocmSolutions(proposals);
    this.solutions = this.#solution.value;
    this.tolerances = this.#solution.tolerances;

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQROCMInd({ solution: { value: this.solutions } });
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
      solution: this.solutions,
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
