import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';

export class CertificationAnswer {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {string} params.challengeId
   * @param {AnswerStatus|string} params.result
   * @param {string} params.value
   */
  constructor({ id, challengeId, result, value }) {
    this.id = id;
    this.challengeId = challengeId;
    this.result = AnswerStatus.from(result);
    this.value = value;
  }

  isOk() {
    return this.result.isOK();
  }
}
