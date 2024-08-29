import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Step {
  constructor({ elements }) {
    assertNotNullOrUndefined(elements, 'A step should contain elements');
    this.#assertElementsNotEmpty(elements);

    this.elements = elements;
  }

  #assertElementsNotEmpty(elements) {
    if (!Array.isArray(elements)) {
      throw new DomainError('step.elements should be an array');
    }
    if (elements.length === 0) {
      throw new DomainError('A step should contain at least one element');
    }
  }
}

export { Step };
