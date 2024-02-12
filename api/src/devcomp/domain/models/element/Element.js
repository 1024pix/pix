import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Element {
  constructor({ id, type }) {
    assertNotNullOrUndefined(id, 'The id is required for an element');
    assertNotNullOrUndefined(type, 'The type is required for an element');

    this.id = id;
    this.type = type;
    this.isAnswerable = false;
  }
}

export { Element };
