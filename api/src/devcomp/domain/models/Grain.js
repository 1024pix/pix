import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class Grain {
  constructor({ id, title, type, elements }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un grain");
    assertNotNullOrUndefined(title, 'Le titre est obligatoire pour un grain');
    assertNotNullOrUndefined(elements, `Une liste d'éléments est obligatoire pour un grain`);
    this.#assertElementsIsAnArray(elements);

    this.id = id;
    this.title = title;
    this.type = type;
    this.elements = elements;
  }

  #assertElementsIsAnArray(elements) {
    if (!Array.isArray(elements)) {
      throw new Error(`Un Grain doit forcément posséder une liste d'éléments`);
    }
  }
}

export { Grain };
