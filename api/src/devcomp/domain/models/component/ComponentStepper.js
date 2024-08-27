import { DomainError } from '../../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class ComponentStepper {
  constructor({ steps }) {
    assertNotNullOrUndefined(steps, 'Steps are required for a componentStepper');
    this.#assertStepsAreAnArray(steps);

    this.steps = steps;
    this.type = 'stepper';
  }

  #assertStepsAreAnArray(steps) {
    if (!Array.isArray(steps)) {
      throw new DomainError('Steps should be an array');
    }
  }
}

export { ComponentStepper };
