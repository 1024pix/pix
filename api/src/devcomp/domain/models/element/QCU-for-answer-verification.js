import { QCU } from './QCU.js';
import { Feedbacks } from '../Feedbacks.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ValidatorQCU } from '../validator/ValidatorQCU.js';
import { QcuCorrectionResponse } from '../QcuCorrectionResponse.js';
import { ElementAnswer } from '../ElementAnswer.js';

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
