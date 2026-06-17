import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { PassageEventWithElement } from './PassageEventWithElement.js';
import { PassageEventWithElementAnswered } from './PassageEventWithElementAnswered.js';

class CustomDraftRetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({
      type: 'CUSTOM_DRAFT_RETRIED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
    });
  }
}

class CustomRetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({
      type: 'CUSTOM_RETRIED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
    });
  }
}

class EmbedAnsweredEvent extends PassageEventWithElementAnswered {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer, status }) {
    super({
      type: 'EMBED_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      answer,
      status,
    });
  }
}

class EmbedRetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({
      type: 'EMBED_RETRIED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
    });
  }
}

class QCMAnsweredEvent extends PassageEventWithElementAnswered {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer, status }) {
    super({
      type: 'QCM_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      answer,
      status,
    });
  }
}

class QCMRetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({
      type: 'QCM_RETRIED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
    });
  }
}

class QCUAnsweredEvent extends PassageEventWithElementAnswered {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer, status }) {
    super({
      type: 'QCU_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      answer,
      status,
    });
  }
}

class QCURetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({
      type: 'QCU_RETRIED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
    });
  }
}

class QCUDeclarativeAnsweredEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer }) {
    super({
      type: 'QCU_DECLARATIVE_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      data: { answer },
    });

    assertNotNullOrUndefined(answer, 'The answer is required for a QCUDeclarativeAnsweredEvent');
  }
}

class QCUDiscoveryAnsweredEvent extends PassageEventWithElementAnswered {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer, status }) {
    super({
      type: 'QCU_DISCOVERY_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      answer,
      status,
    });
  }
}

class QROCMAnsweredEvent extends PassageEventWithElementAnswered {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer, status }) {
    super({
      type: 'QROCM_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      answer,
      status,
    });
  }
}

class QROCMRetriedEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId }) {
    super({
      type: 'QROCM_RETRIED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
    });
  }
}

class QCMDeclarativeAnsweredEvent extends PassageEventWithElement {
  constructor({ id, occurredAt, createdAt, passageId, sequenceNumber, elementId, answer }) {
    super({
      type: 'QCM_DECLARATIVE_ANSWERED',
      id,
      occurredAt,
      createdAt,
      passageId,
      sequenceNumber,
      elementId,
      data: { answer },
    });

    assertNotNullOrUndefined(answer, 'The answer is required for a QCMDeclarativeAnsweredEvent');
  }
}

export {
  CustomDraftRetriedEvent,
  CustomRetriedEvent,
  EmbedAnsweredEvent,
  EmbedRetriedEvent,
  QCMAnsweredEvent,
  QCMDeclarativeAnsweredEvent,
  QCMRetriedEvent,
  QCUAnsweredEvent,
  QCUDeclarativeAnsweredEvent,
  QCUDiscoveryAnsweredEvent,
  QCURetriedEvent,
  QROCMAnsweredEvent,
  QROCMRetriedEvent,
};
