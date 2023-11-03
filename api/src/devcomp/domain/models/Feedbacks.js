import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Feedbacks {
  constructor({ valid, invalid }) {
    assertNotNullOrUndefined(valid, 'Le message de feedback valide est obligatoire');
    assertNotNullOrUndefined(invalid, 'Le message de feedback invalide est obligatoire');

    this.valid = valid;
    this.invalid = invalid;
  }
}

export { Feedbacks };
