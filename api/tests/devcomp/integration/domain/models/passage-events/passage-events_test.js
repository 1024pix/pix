import {
  PassageStartedEvent,
  PassageTerminatedEvent,
} from '../../../../../../src/devcomp/domain/models/passage-events/passage-events.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | passage-events | passage-events', function () {
  describe('#PassageStartedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 1234;
      const contentHash = Symbol('contentHash');

      // when
      const passageStartedEvent = new PassageStartedEvent({ id, occurredAt, createdAt, passageId, contentHash });

      // then
      expect(passageStartedEvent.id).to.equal(id);
      expect(passageStartedEvent.type).to.equal('PASSAGE_STARTED');
      expect(passageStartedEvent.occurredAt).to.equal(occurredAt);
      expect(passageStartedEvent.createdAt).to.equal(createdAt);
      expect(passageStartedEvent.passageId).to.equal(passageId);
      expect(passageStartedEvent.contentHash).to.equal(contentHash);
      expect(passageStartedEvent.data).to.deep.equal({ contentHash });
    });

    describe('when contentHash is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = Symbol('date');
        const passageId = 1234;

        // when
        const error = catchErrSync(() => new PassageStartedEvent({ id, occurredAt, createdAt, passageId }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The contentHash is required for a PassageStartedEvent');
      });
    });
  });

  describe('#PassageTerminatedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 1234;

      // when
      const passageTerminatedEvent = new PassageTerminatedEvent({ id, occurredAt, createdAt, passageId });

      // then
      expect(passageTerminatedEvent.id).to.equal(id);
      expect(passageTerminatedEvent.type).to.equal('PASSAGE_TERMINATED');
      expect(passageTerminatedEvent.occurredAt).to.equal(occurredAt);
      expect(passageTerminatedEvent.createdAt).to.equal(createdAt);
      expect(passageTerminatedEvent.passageId).to.equal(passageId);
      expect(passageTerminatedEvent.data).to.be.undefined;
    });
  });
});
