import { NotFoundError } from '../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Grain {
  constructor({ id, title, type, elements, components }) {
    assertNotNullOrUndefined(id, 'The id is required for a grain');
    assertNotNullOrUndefined(title, 'The title is required for a grain');
    assertNotNullOrUndefined(elements, `A list of elements is required for a grain`);
    this.#assertElementsIsAnArray(elements);
    this.#assertComponentsIsDefinedAndAnArray(components);

    this.id = id;
    this.title = title;
    this.type = type;
    this.elements = elements;
    this.components = components;
  }

  getElementById(elementId) {
    // ToDo PIX-12363 migrate to components
    const foundElement = this.elements.find(({ id }) => id === elementId);

    if (foundElement === undefined) {
      throw new NotFoundError();
    }

    return foundElement;
  }

  #assertElementsIsAnArray(elements) {
    if (!Array.isArray(elements)) {
      throw new Error(`A grain should have a list of elements`);
    }
  }

  #assertComponentsIsDefinedAndAnArray(components) {
    if (components !== undefined && !Array.isArray(components)) {
      throw new Error(`Grain components should be a list of components`);
    }
  }
}

export { Grain };
