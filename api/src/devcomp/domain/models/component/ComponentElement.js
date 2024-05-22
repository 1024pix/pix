import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class ComponentElement {
  constructor({ element }) {
    assertNotNullOrUndefined(element, 'An element is required for a componentElement');

    this.element = element;
    this.type = 'element';
  }
}

export { ComponentElement };
