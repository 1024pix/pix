import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { PassageEventWithElement } from './PassageEventWithElement.js';

class QABCardAnsweredEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, cardId, chosenProposal }) {
    super({
      type: 'QAB_CARD_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      data: { cardId, chosenProposal },
    });

    assertNotNullOrUndefined(cardId, 'The cardId is required for a QABCardAnsweredEvent');
    assertNotNullOrUndefined(chosenProposal, 'The chosenProposal is required for a QABCardAnsweredEvent');
  }
}

class QABCardRetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({ id, type: 'QAB_CARD_RETRIED', occurredAt, createdAt, passageId, sequenceNumber, elementId });
  }
}

export { QABCardAnsweredEvent, QABCardRetriedEvent };
