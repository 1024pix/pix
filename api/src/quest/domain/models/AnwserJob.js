import { ObjectValidationError } from '../../../shared/domain/errors.js';

export class AnswerJob {
  constructor({ userId } = {}) {
    this.userId = userId;

    this.#validate();
  }

  #validate() {
    if (!this.userId) throw new ObjectValidationError('User id is required');
  }
}
