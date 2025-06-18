import {
  QABCardAnsweredEvent,
  QABCardRetriedEvent,
} from '../../../../../../src/devcomp/domain/models/passage-events/qab-events.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | passage-events | qab-events', function () {
  describe('#QABCardAnsweredEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';
      const cardId = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';
      const chosenProposal = 'A';

      // when
      const qabCardAnsweredEvent = new QABCardAnsweredEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        cardId,
        chosenProposal,
      });

      // then
      expect(qabCardAnsweredEvent.id).to.equal(id);
      expect(qabCardAnsweredEvent.type).to.equal('QAB_CARD_ANSWERED');
      expect(qabCardAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qabCardAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qabCardAnsweredEvent.passageId).to.equal(passageId);
      expect(qabCardAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qabCardAnsweredEvent.data).to.deep.equal({ cardId, chosenProposal, elementId });
    });

    describe('when cardId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';
        const chosenProposal = 'A';

        // when
        const error = catchErrSync(
          () =>
            new QABCardAnsweredEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              elementId,
              chosenProposal,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The cardId is required for a QABCardAnsweredEvent');
      });
    });

    describe('when chosenProposal is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';
        const cardId = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';

        // when
        const error = catchErrSync(
          () =>
            new QABCardAnsweredEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              elementId,
              cardId,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The chosenProposal is required for a QABCardAnsweredEvent');
      });
    });
  });

  describe('#QABCardRetriedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const elementId = '05112f63-0b47-4774-b638-6669c4e3a26d';

      // when
      const qabCardAnsweredEvent = new QABCardRetriedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
      });

      // then
      expect(qabCardAnsweredEvent.id).to.equal(id);
      expect(qabCardAnsweredEvent.type).to.equal('QAB_CARD_RETRIED');
      expect(qabCardAnsweredEvent.occurredAt).to.equal(occurredAt);
      expect(qabCardAnsweredEvent.createdAt).to.equal(createdAt);
      expect(qabCardAnsweredEvent.passageId).to.equal(passageId);
      expect(qabCardAnsweredEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(qabCardAnsweredEvent.data).to.deep.equal({ elementId });
    });
  });
});
