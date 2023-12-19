import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Element {
  constructor({ id, type }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un élément");
    assertNotNullOrUndefined(type, 'Le type est obligatoire pour un élément');

    this.id = id;
    this.type = type;
    this.isAnswerable = false;
  }
}

export { Element };
