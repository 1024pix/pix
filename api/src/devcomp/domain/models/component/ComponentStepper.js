import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';

class ComponentStepper {
  constructor({ steps }) {
    assertNotNullOrUndefined(steps, 'Steps are required for a componentStepper');
    this.#assertStepsAreAnArray(steps);

    this.steps = steps;
    this.type = 'stepper';
  }

  #assertStepsAreAnArray(steps) {
    if (!Array.isArray(steps)) {
      throw new ModuleInstantiationError('Steps should be an array');
    }
  }
}

export { ComponentStepper };
