import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../errors.js';

class Grain {
  constructor({ id, title, type, components }) {
    assertNotNullOrUndefined(id, 'The id is required for a grain');
    assertNotNullOrUndefined(title, 'The title is required for a grain');
    this.#assertComponentsIsDefinedAndAnArray(components);

    this.id = id;
    this.title = title;
    this.type = type;
    this.components = components;
  }

  #assertComponentsIsDefinedAndAnArray(components) {
    if (components !== undefined && !Array.isArray(components)) {
      throw new ModuleInstantiationError(`Grain components should be a list of components`);
    }
  }
}

export { Grain };
