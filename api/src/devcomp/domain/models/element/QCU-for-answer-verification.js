import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { QcuCorrectionResponse } from '../QcuCorrectionResponse.js';
import { ValidatorQCU } from '../validator/ValidatorQCU.js';
import { QCU } from './QCU.js';

class QCUForAnswerVerification extends QCU {
  userResponse;
  constructor({ id, instruction, locales, proposals, solution, validator }) {
    super({ id, instruction, locales, proposals, solution: { value: solution } });

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQCU({ solution: this.solution });
    }
  }

  setUserResponse(userResponse) {
    this.#validateUserResponseFormat(userResponse);
    this.userResponse = userResponse[0];
  }

  assess() {
    const validation = this.validator.assess({ answer: { value: this.userResponse } });

    return new QcuCorrectionResponse({
      status: validation.result,
      feedback: this.#getFeedback(),
      solution: this.solution.value,
    });
  }

  #validateUserResponseFormat(userResponse) {
    const qcuResponseSchema = Joi.string()
      .pattern(/^[0-9]+$/)
      .required();

    const validUserResponseSchema = Joi.array().items(qcuResponseSchema).min(1).max(1).required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }

  #getSpecificFeedbackByProposalId(proposalId) {
    const proposalFound = this.proposals.find((proposal) => proposal.id === proposalId);
    if (proposalFound) {
      return proposalFound.feedback;
    }
  }

  #getFeedback() {
    return this.#getSpecificFeedbackByProposalId(this.userResponse);
  }
}

export { QCUForAnswerVerification };
