import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { EmbedCorrectionResponse } from '../EmbedCorrectionResponse.js';
import { Feedbacks } from '../Feedbacks.js';
import { ValidatorEmbed } from '../validator/ValidatorEmbed.js';
import { Embed } from './Embed.js';

class EmbedForAnswerVerification extends Embed {
  userResponse;
  constructor({ id, instruction, solution, feedbacks, validator, title, url, height }) {
    super({ id, instruction, isCompletionRequired: true, title, url, height });

    assertNotNullOrUndefined(solution, 'The solution is required for a verification embed');

    this.solution = { value: solution };

    if (feedbacks) {
      this.feedbacks = new Feedbacks(feedbacks);
    }

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorEmbed({ solution: this.solution });
    }
  }

  setUserResponse(userResponse) {
    this.#validateUserResponseFormat(userResponse);
    this.userResponse = userResponse;
  }

  assess() {
    const validation = this.validator.assess({ answer: { value: this.userResponse } });

    return new EmbedCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solution: this.solution.value,
    });
  }

  #validateUserResponseFormat(userResponse) {
    const validUserResponseSchema = Joi.string()
      .pattern(/^[a-z]+$/)
      .required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { EmbedForAnswerVerification };
