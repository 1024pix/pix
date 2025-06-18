import { expect } from 'chai';

import { PassageEventFactory } from '../../../../../src/devcomp/domain/factories/passage-event-factory.js';
import { QCUDeclarativeAnsweredEvent } from '../../../../../src/devcomp/domain/models/passage-events/answerable-element-events.js';
import {
  FlashcardsCardAutoAssessedEvent,
  FlashcardsRectoReviewedEvent,
  FlashcardsRetriedEvent,
  FlashcardsStartedEvent,
  FlashcardsVersoSeenEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/flashcard-events.js';
import {
  PassageStartedEvent,
  PassageTerminatedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/passage-events.js';
import {
  QABCardAnsweredEvent,
  QABCardRetriedEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/qab-events.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockInput', function () {
  describe('#build', function () {
    describe('when given an event with unknown type', function () {
      it('should return a DomainError with correct message', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          contentHash: 'module-version',
          type: 'UNKNOWN',
        };

        // when
        const error = catchErrSync(PassageEventFactory.build)(rawEvent);

        // then
        expect(error).to.be.instanceof(DomainError);
        expect(error.message).to.equal('Passage event with type UNKNOWN does not exist');
      });
    });

    describe('when given a PASSAGE_STARTED event', function () {
      it('should return a PassageStartedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          contentHash: 'module-version',
          type: 'PASSAGE_STARTED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(PassageStartedEvent);
      });
    });

    describe('when given a PASSAGE_TERMINATED event', function () {
      it('should return a PassageTerminatedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          contentHash: 'module-version',
          type: 'PASSAGE_TERMINATED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(PassageTerminatedEvent);
      });
    });

    describe('when given a FLASHCARDS_STARTED event', function () {
      it('should return a FlashcardsStartedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          type: 'FLASHCARDS_STARTED',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsStartedEvent);
      });
    });

    describe('when given a FLASHCARDS_VERSO_SEEN event', function () {
      it('should return a FlashcardsVersoSeenEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_VERSO_SEEN',
        };

        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsVersoSeenEvent);
      });
    });

    describe('when given a FLASHCARDS_AUTO_ASSESSED event', function () {
      it('should return a FlashcardsAutoAssessedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_CARD_AUTO_ASSESSED',
          autoAssessment: 'yes',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsCardAutoAssessedEvent);
      });
    });

    describe('when given a FLASHCARDS_RECTO_REVIEWED event', function () {
      it('should return a FlashcardsRectoReviewedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
          type: 'FLASHCARDS_RECTO_REVIEWED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsRectoReviewedEvent);
      });
    });

    describe('when given a FLASHCARDS_RETRIED event', function () {
      it('should return a FlashcardsRetriedEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 1,
          elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
          type: 'FLASHCARDS_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(FlashcardsRetriedEvent);
      });
    });

    describe('when given a QCU_DECLARATIVE_ANSWERED event', function () {
      it('should return a QCUDeclarativeAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QCU_DECLARATIVE_ANSWERED',
          answer: 'Tous les mercredis',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QCUDeclarativeAnsweredEvent);
      });
    });

    describe('when given a QAB_CARD_ANSWERED event', function () {
      it('should return a QabCardAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QAB_CARD_ANSWERED',
          cardId: '34b916b9-9103-4060-818d-98b2dc67111d',
          chosenProposal: 'A',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QABCardAnsweredEvent);
      });
    });

    describe('when given a QAB_CARD_RETRIED event', function () {
      it('should return a QabCardAnsweredEvent instance', function () {
        // given
        const rawEvent = {
          occurredAt: new Date(),
          passageId: 2,
          sequenceNumber: 3,
          elementId: 'c505e7c9-327e-4be5-9c62-ce4627b85f98',
          type: 'QAB_CARD_RETRIED',
        };
        // when
        const builtEvent = PassageEventFactory.build(rawEvent);

        // then
        expect(builtEvent).to.be.instanceOf(QABCardRetriedEvent);
      });
    });
  });
});
