import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';

class Answer {
  constructor({ id, result, challengeId } = {}) {
    this.id = id;
    this.result = AnswerStatus.from(result);
    this.challengeId = challengeId;
  }

  isOk() {
    return this.result.isOK();
  }
}

export { Answer };
