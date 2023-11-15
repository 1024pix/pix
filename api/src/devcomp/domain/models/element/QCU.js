import { Element } from './Element.js';
import { Feedbacks } from '../Feedbacks.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ValidatorQCU } from '../validator/ValidatorQCU.js';
import { QcuCorrectionResponse } from '../QcuCorrectionResponse.js';
import { ElementAnswer } from '../ElementAnswer.js';

class QCU extends Element {
  constructor({ id, instruction, locales, proposals, solution, feedbacks, validator }) {
    super({ id });

    assertNotNullOrUndefined(instruction, "L'instruction est obligatoire pour un QCU");
    this.#assertProposalsIsAnArray(proposals);
    this.#assertProposalsAreNotEmpty(proposals);
    assertNotNullOrUndefined(solution, 'La solution est obligatoire pour un QCU');

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
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

  assess(userResponse) {
    const selectedQcuProposalId = userResponse[0];
    const validation = this.validator.assess({ answer: { value: selectedQcuProposalId } });

    const correction = new QcuCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solutionId: this.solution,
    });

    return new ElementAnswer({
      elementId: this.id,
      userResponseValue: selectedQcuProposalId,
      correction,
    });
  }

  #assertProposalsAreNotEmpty(proposals) {
    if (proposals.length === 0) {
      throw new Error('Les propositions sont obligatoires pour un QCU');
    }
  }

  #assertProposalsIsAnArray(proposals) {
    if (!Array.isArray(proposals)) {
      throw new Error('Les propositions doivent apparaître dans une liste');
    }
  }
}

export { QCU };
