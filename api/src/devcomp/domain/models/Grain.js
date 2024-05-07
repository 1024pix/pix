import { NotFoundError } from '../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

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

  getElementById(elementId) {
    const foundComponent = this.components.map((component) => component.element);

    const foundElementId = foundComponent.find((element) => element.id === elementId);

    if (foundElementId === undefined) {
      throw new NotFoundError();
    }

    return foundElementId;
  }

  #assertComponentsIsDefinedAndAnArray(components) {
    if (components !== undefined && !Array.isArray(components)) {
      throw new Error(`Grain components should be a list of components`);
    }
  }
}

export { Grain };
