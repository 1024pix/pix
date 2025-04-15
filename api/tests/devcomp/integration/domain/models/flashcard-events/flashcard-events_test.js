import {
  FlashcardsCardAutoAssessedEvent,
  FlashcardsRectoReviewedEvent,
  FlashcardsRetriedEvent,
  FlashcardsStartedEvent,
  FlashcardsVersoSeenEvent,
} from '../../../../../../src/devcomp/domain/models/passage-events/flashcard-events.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | passage-events | flashcard-events', function () {
  describe('#FlashcardsStartedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

      // when
      const flashcardsStartedEvent = new FlashcardsStartedEvent({ id, occurredAt, createdAt, passageId, elementId });

      // then
      expect(flashcardsStartedEvent.id).to.equal(id);
      expect(flashcardsStartedEvent.type).to.equal('FLASHCARDS_STARTED');
      expect(flashcardsStartedEvent.occurredAt).to.equal(occurredAt);
      expect(flashcardsStartedEvent.createdAt).to.equal(createdAt);
      expect(flashcardsStartedEvent.passageId).to.equal(passageId);
      expect(flashcardsStartedEvent.elementId).to.equal(elementId);
      expect(flashcardsStartedEvent.data).to.deep.equal({ elementId });
    });
  });

  describe('#FlashcardsVersoSeenEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const cardId = 'c4675f66-97f1-4202-8aeb-0388edf102d5';

      // when
      const flashcardsCardAnswerSeenEvent = new FlashcardsVersoSeenEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        elementId,
        cardId,
      });

      // then
      expect(flashcardsCardAnswerSeenEvent.id).to.equal(id);
      expect(flashcardsCardAnswerSeenEvent.type).to.equal('FLASHCARDS_VERSO_SEEN');
      expect(flashcardsCardAnswerSeenEvent.occurredAt).to.equal(occurredAt);
      expect(flashcardsCardAnswerSeenEvent.createdAt).to.equal(createdAt);
      expect(flashcardsCardAnswerSeenEvent.passageId).to.equal(passageId);
      expect(flashcardsCardAnswerSeenEvent.elementId).to.equal(elementId);
      expect(flashcardsCardAnswerSeenEvent.data).to.deep.equal({ cardId, elementId });
    });

    describe('when cardId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

        // when
        const error = catchErrSync(
          () => new FlashcardsVersoSeenEvent({ id, occurredAt, createdAt, passageId, elementId }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId is required for a FlashcardsVersoSeenEvent');
      });
    });

    describe('when cardId is not a valid uuid', function () {
      it('should throw an error', function () {
        // given
        const cardId = '00e0c3fa-d812-45c8-b0cc-f317004988f';

        // when
        const error = catchErrSync(
          () =>
            new FlashcardsVersoSeenEvent({
              id: Symbol('id'),
              occurredAt: new Date(),
              createdAt: new Date(),
              passageId: 2,
              elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
              cardId,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId property should be exactly 36 characters long');
      });
    });
  });

  describe('#FlashcardsCardAutoAssessedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const cardId = 'c4675f66-97f1-4202-8aeb-0388edf102d5';
      const autoAssessment = 'yes';

      // when
      const flashcardsCardAutoAssessedEvent = new FlashcardsCardAutoAssessedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        elementId,
        cardId,
        autoAssessment,
      });

      // then
      expect(flashcardsCardAutoAssessedEvent.id).to.equal(id);
      expect(flashcardsCardAutoAssessedEvent.type).to.equal('FLASHCARDS_CARD_AUTO_ASSESSED');
      expect(flashcardsCardAutoAssessedEvent.occurredAt).to.equal(occurredAt);
      expect(flashcardsCardAutoAssessedEvent.createdAt).to.equal(createdAt);
      expect(flashcardsCardAutoAssessedEvent.passageId).to.equal(passageId);
      expect(flashcardsCardAutoAssessedEvent.elementId).to.equal(elementId);
      expect(flashcardsCardAutoAssessedEvent.data).to.deep.equal({ cardId, autoAssessment, elementId });
    });

    describe('when cardId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

        // when
        const error = catchErrSync(
          () => new FlashcardsCardAutoAssessedEvent({ id, occurredAt, createdAt, passageId, elementId }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId is required for a FlashcardsCardAutoAssessedEvent');
      });
    });

    describe('when cardId is not a valid uuid', function () {
      it('should throw an error', function () {
        // given
        const cardId = '00e0c3fa-d812-45c8-b0cc-f317004988f';

        // when
        const error = catchErrSync(
          () =>
            new FlashcardsCardAutoAssessedEvent({
              id: Symbol('id'),
              occurredAt: new Date(),
              createdAt: new Date(),
              passageId: 2,
              elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
              cardId,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId property should be exactly 36 characters long');
      });
    });

    describe('when autoAssessment is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
        const cardId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8666';

        // when
        const error = catchErrSync(
          () => new FlashcardsCardAutoAssessedEvent({ id, occurredAt, createdAt, passageId, elementId, cardId }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The autoAssessment is required for a FlashcardsCardAutoAssessedEvent');
      });
    });

    describe('when autoAssessment is not an acceptable value', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
        const cardId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8666';
        const autoAssessment = 'wrong_value';

        // when
        const error = catchErrSync(
          () =>
            new FlashcardsCardAutoAssessedEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              elementId,
              cardId,
              autoAssessment,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(TypeError);
        expect(error.message).to.equal('The autoAssessment value must be one of these : [‘yes‘, ‘maybe‘, ‘no‘]');
      });
    });
  });

  describe('#FlashcardsRectoReviewedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const cardId = 'c4675f66-97f1-4202-8aeb-0388edf102d5';

      // when
      const flashcardsCardQuestionReviewedEvent = new FlashcardsRectoReviewedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        elementId,
        cardId,
      });

      // then
      expect(flashcardsCardQuestionReviewedEvent.id).to.equal(id);
      expect(flashcardsCardQuestionReviewedEvent.type).to.equal('FLASHCARDS_RECTO_REVIEWED');
      expect(flashcardsCardQuestionReviewedEvent.occurredAt).to.equal(occurredAt);
      expect(flashcardsCardQuestionReviewedEvent.createdAt).to.equal(createdAt);
      expect(flashcardsCardQuestionReviewedEvent.passageId).to.equal(passageId);
      expect(flashcardsCardQuestionReviewedEvent.elementId).to.equal(elementId);
      expect(flashcardsCardQuestionReviewedEvent.data).to.deep.equal({ cardId, elementId });
    });

    describe('when cardId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

        // when
        const error = catchErrSync(
          () => new FlashcardsRectoReviewedEvent({ id, occurredAt, createdAt, passageId, elementId }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId is required for a FlashcardsRectoReviewedEvent');
      });
    });

    describe('when cardId is not a valid uuid', function () {
      it('should throw an error', function () {
        // given
        const cardId = 'not-a-valid-uuid';

        // when
        const error = catchErrSync(
          () =>
            new FlashcardsRectoReviewedEvent({
              id: Symbol('id'),
              occurredAt: new Date(),
              createdAt: new Date(),
              passageId: 2,
              elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
              cardId,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId property should be exactly 36 characters long');
      });
    });
  });

  describe('#FlashcardsRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';

      // when
      const flashcardsRetriedEvent = new FlashcardsRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        elementId,
      });

      // then
      expect(flashcardsRetriedEvent.id).to.equal(id);
      expect(flashcardsRetriedEvent.type).to.equal('FLASHCARDS_RETRIED');
      expect(flashcardsRetriedEvent.occurredAt).to.equal(occurredAt);
      expect(flashcardsRetriedEvent.createdAt).to.equal(createdAt);
      expect(flashcardsRetriedEvent.passageId).to.equal(passageId);
      expect(flashcardsRetriedEvent.elementId).to.equal(elementId);
      expect(flashcardsRetriedEvent.data).to.deep.equal({ elementId });
    });
  });
});
