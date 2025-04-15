import { assertHasUuidLength, assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { PassageEventWithElementInstantiationError } from '../../errors.js';
import { PassageEvent } from './PassageEvent.js';

/**
 * @abstract PassageElementEvent
 * See PassageEvent for more info.
 *
 * This is the base class for all PassageElementEvent.
 * It's syntaxic sugar for a `PassageEvent` that contains an element, it exists because lots of events happen on a element that we store in the `data` key..
 * Subclasses should be named in past tense.
 */
class PassageEventWithElement extends PassageEvent {
  constructor({ id, type, occurredAt, createdAt, passageId, elementId, data } = {}) {
    super({ id, type, occurredAt, createdAt, passageId, data: { ...data, elementId } });

    if (this.constructor === PassageEventWithElement) {
      throw new PassageEventWithElementInstantiationError();
    }

    assertNotNullOrUndefined(elementId, 'The elementId property is required for a PassageEventWithElement');
    assertHasUuidLength(elementId, 'The elementId property should be exactly 36 characters long');
  }
}

export { PassageEventWithElement };
