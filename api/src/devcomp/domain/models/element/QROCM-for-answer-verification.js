import { QROCM } from './QROCM.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { QrocmCorrectionResponse } from '../QrocmCorrectionResponse.js';
import { ElementAnswer } from '../ElementAnswer.js';
import { ValidatorQROCMInd } from '../validator/ValidatorQROCMInd.js';
import { QrocmSolutions } from '../QrocmSolutions.js';

class QROCMForAnswerVerification extends QROCM {
  #solutionValue;

  constructor({ id, instruction, feedbacks, proposals, locales, validator }) {
    super({ id, instruction, proposals, locales });

    assertNotNullOrUndefined(feedbacks, 'Les feedbacks sont obligatoires pour un QROCM de vérification');

    this.feedbacks = feedbacks;

    this.#solutionValue = new QrocmSolutions(proposals);
    this.solutions = this.#solutionValue.value;
    this.tolerances = this.#solutionValue.tolerances;

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQROCMInd({ solution: { value: this.solutions } });
    }
  }

  assess(userResponse) {
    const answer = {};
    for (const response of userResponse) {
      answer[response.input] = response.answer;
    }
    const validation = this.validator.assess({ answer: { value: answer } });

    const correction = new QrocmCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solutionValue: this.solutions,
    });

    return new ElementAnswer({
      elementId: this.id,
      userResponseValue: answer,
      correction,
    });
  }
}

export { QROCMForAnswerVerification };
