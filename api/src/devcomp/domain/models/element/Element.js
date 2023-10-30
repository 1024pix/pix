import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Element {
  constructor({ id }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un élément");

    this.id = id;
  }
}

export { Element };
