import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Feedbacks {
  constructor({ valid, invalid }) {
    assertNotNullOrUndefined(valid, 'The feedback message for the field valid is required');
    assertNotNullOrUndefined(invalid, 'The feedback message for the field invalid is required');

    this.valid = valid;
    this.invalid = invalid;
  }
}

export { Feedbacks };
