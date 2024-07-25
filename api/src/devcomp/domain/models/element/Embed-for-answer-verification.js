import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { EmbedCorrectionResponse } from '../EmbedCorrectionResponse.js';
import { ValidatorEmbed } from '../validator/ValidatorEmbed.js';
import { Embed } from './Embed.js';

class EmbedForAnswerVerification extends Embed {
  userResponse;
  constructor({ id, instruction, solution, validator, title, url, height }) {
    super({ id, instruction, isCompletionRequired: true, title, url, height });

    assertNotNullOrUndefined(solution, 'The solution is required for a verification embed');

    this.solution = { value: solution };

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorEmbed({ solution: this.solution });
    }
  }

  setUserResponse(userResponse) {
    this.#validateUserResponseFormat(userResponse);
    this.userResponse = userResponse[0];
  }

  assess() {
    const validation = this.validator.assess({ answer: { value: this.userResponse } });

    return new EmbedCorrectionResponse({
      status: validation.result,
      solution: this.solution.value,
    });
  }

  #validateUserResponseFormat(userResponse) {
    const embedSchema = Joi.string()
      .pattern(/^[a-z]+$/)
      .required();

    const validUserResponseSchema = Joi.array().items(embedSchema).min(1).max(1).required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { EmbedForAnswerVerification };
