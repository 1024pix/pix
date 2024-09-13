import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
import { Feedbacks } from '../Feedbacks.js';
import { QcuCorrectionResponse } from '../QcuCorrectionResponse.js';
import { ValidatorQCU } from '../validator/ValidatorQCU.js';
import { QCU } from './QCU.js';

class QCUForAnswerVerification extends QCU {
  userResponse;
  constructor({ id, instruction, locales, proposals, solution, feedbacks, validator }) {
    super({ id, instruction, locales, proposals });

    assertNotNullOrUndefined(solution, 'The solution is required for a verification QCU');
    this.#assertSolutionIsAnExistingProposal(solution, proposals);

    this.solution = { value: solution };

    if (feedbacks) {
      this.feedbacks = new Feedbacks(feedbacks);
    }

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQCU({ solution: this.solution });
    }
  }

  #assertSolutionIsAnExistingProposal(solution, proposals) {
    const isSolutionAnExistingProposal = proposals.find(({ id: proposalId }) => proposalId === solution);
    if (!isSolutionAnExistingProposal) {
      throw new ModuleInstantiationError('The QCU solution id is not an existing proposal id');
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
      feedback: this.#getFeedback(validation),
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

  #getFeedback(validation) {
    const specificFeedback = this.#getSpecificFeedbackByProposalId(this.userResponse);
    if (specificFeedback) {
      return specificFeedback;
    }

    return validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid;
  }
}

export { QCUForAnswerVerification };
