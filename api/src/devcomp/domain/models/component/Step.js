import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';

class Step {
  constructor({ elements }) {
    assertNotNullOrUndefined(elements, 'A step should contain elements');
    this.#assertElementsNotEmpty(elements);

    this.elements = elements;
  }

  #assertElementsNotEmpty(elements) {
    if (!Array.isArray(elements)) {
      throw new ModuleInstantiationError('step.elements should be an array');
    }
    if (elements.length === 0) {
      throw new ModuleInstantiationError('A step should contain at least one element');
    }
  }
}

export { Step };
