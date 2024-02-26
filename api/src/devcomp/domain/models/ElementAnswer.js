import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class ElementAnswer {
  constructor({ id, elementId, userResponseValue, correction }) {
    assertNotNullOrUndefined(elementId, 'The id of the element is required for an element answer.');
    assertNotNullOrUndefined(userResponseValue, 'The user response is required for an element answer.');
    assertNotNullOrUndefined(correction, 'The correction is required for an element answer.');

    this.id = id;
    this.elementId = elementId;
    this.userResponseValue = userResponseValue;
    this.correction = correction;
  }
}

export { ElementAnswer };
