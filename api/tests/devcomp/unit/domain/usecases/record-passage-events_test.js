import {
  FlashcardsCardAutoAssessedEvent,
  FlashcardsRectoReviewedEvent,
  FlashcardsRetriedEvent,
  FlashcardsStartedEvent,
  FlashcardsVersoSeenEvent,
} from '../../../../../src/devcomp/domain/models/passage-events/flashcard-events.js';
import { recordPassageEvents } from '../../../../../src/devcomp/domain/usecases/record-passage-events.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | UseCases | record-passage-events', function () {
  it('should call passage event repository to create the events', async function () {
    // given
    const flashcardsVersoSeenEvent = {
      occurredAt: new Date(),
      passageId: 2,
      elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
      cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
      type: 'FLASHCARDS_VERSO_SEEN',
    };

    const flashcardsStartedEvent = {
      occurredAt: new Date(),
      passageId: 2,
      elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
      type: 'FLASHCARDS_STARTED',
    };

    const flashcardsCardAutoAssessedEvent = {
      occurredAt: new Date(),
      passageId: 2,
      elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
      cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
      type: 'FLASHCARDS_CARD_AUTO_ASSESSED',
      autoAssessment: 'yes',
    };

    const flashcardsRectoReviewedEvent = {
      occurredAt: new Date(),
      passageId: 2,
      elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
      cardId: 'c4675f66-97f1-4202-8aeb-0388edf102d5',
      type: 'FLASHCARDS_RECTO_REVIEWED',
    };

    const flashcardsRetriedEvent = {
      occurredAt: new Date(),
      passageId: 2,
      elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
      type: 'FLASHCARDS_RETRIED',
    };

    const events = [
      flashcardsVersoSeenEvent,
      flashcardsStartedEvent,
      flashcardsCardAutoAssessedEvent,
      flashcardsRectoReviewedEvent,
      flashcardsRetriedEvent,
    ];

    const passageEventRepositoryStub = {
      record: sinon.stub().resolves(),
    };

    // when
    await recordPassageEvents({ events, passageEventRepository: passageEventRepositoryStub });

    // then
    const flashcardsVersoSeenPassageEvent = new FlashcardsVersoSeenEvent(flashcardsVersoSeenEvent);
    const flashcardsStartedPassageEvent = new FlashcardsStartedEvent(flashcardsStartedEvent);
    const flashcardsCardAutoAssessedPassageEvent = new FlashcardsCardAutoAssessedEvent(flashcardsCardAutoAssessedEvent);
    const flashcardsRectoReviewedEventPassageEvent = new FlashcardsRectoReviewedEvent(flashcardsRectoReviewedEvent);
    const flashcardsRetriedEventPassageEvent = new FlashcardsRetriedEvent(flashcardsRetriedEvent);

    expect(passageEventRepositoryStub.record.getCall(0)).to.have.been.calledWithExactly(
      flashcardsVersoSeenPassageEvent,
    );
    expect(passageEventRepositoryStub.record.getCall(1)).to.have.been.calledWithExactly(flashcardsStartedPassageEvent);
    expect(passageEventRepositoryStub.record.getCall(2)).to.have.been.calledWithExactly(
      flashcardsCardAutoAssessedPassageEvent,
    );
    expect(passageEventRepositoryStub.record.getCall(3)).to.have.been.calledWithExactly(
      flashcardsRectoReviewedEventPassageEvent,
    );
    expect(passageEventRepositoryStub.record.getCall(4)).to.have.been.calledWithExactly(
      flashcardsRetriedEventPassageEvent,
    );
  });
  context('when type of passage event does not exist', function () {
    it('should throw an error', async function () {
      // given
      const event = {
        type: 'NON_EXISTING_TYPE',
      };

      const passageEventRepositoryStub = {
        record: sinon.stub().resolves(),
      };

      // when
      const error = await catchErr(recordPassageEvents)({
        events: [event],
        passageEventRepository: passageEventRepositoryStub,
      });

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal(`Passage event with type ${event.type} does not exist`);
      expect(passageEventRepositoryStub.record).to.not.have.been.called;
    });
  });
});
