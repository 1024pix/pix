import {
  GrainContinuedEvent,
  GrainSkippedEvent,
} from '../../../../../../src/devcomp/domain/models/passage-events/grain-events.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Domain | Models | passage-events | grain-events', function () {
  describe('#GrainContinuedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const grainId = '05112f63-0b47-4774-b638-6669c4e3a26d';

      // when
      const grainContinuedEvent = new GrainContinuedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        grainId,
      });

      // then
      expect(grainContinuedEvent.id).to.equal(id);
      expect(grainContinuedEvent.type).to.equal('GRAIN_CONTINUED');
      expect(grainContinuedEvent.occurredAt).to.equal(occurredAt);
      expect(grainContinuedEvent.createdAt).to.equal(createdAt);
      expect(grainContinuedEvent.passageId).to.equal(passageId);
      expect(grainContinuedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(grainContinuedEvent.data).to.deep.equal({ grainId });
    });

    describe('when grainId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;

        // when
        const error = catchErrSync(
          () =>
            new GrainContinuedEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The grainId property is required for a GrainContinuedEvent');
      });
    });

    describe('when grainId is invalid', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const grainId = 'invalidGrainId';

        // when
        const error = catchErrSync(
          () =>
            new GrainContinuedEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              grainId,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The grainId property should be exactly 36 characters long');
      });
    });
  });

  describe('#GrainSkippedEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const grainId = '05112f63-0b47-4774-b638-6669c4e3a26d';

      // when
      const grainSkippedEvent = new GrainSkippedEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        grainId,
      });

      // then
      expect(grainSkippedEvent.id).to.equal(id);
      expect(grainSkippedEvent.type).to.equal('GRAIN_SKIPPED');
      expect(grainSkippedEvent.occurredAt).to.equal(occurredAt);
      expect(grainSkippedEvent.createdAt).to.equal(createdAt);
      expect(grainSkippedEvent.passageId).to.equal(passageId);
      expect(grainSkippedEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(grainSkippedEvent.data).to.deep.equal({ grainId });
    });

    describe('when grainId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;

        // when
        const error = catchErrSync(
          () =>
            new GrainSkippedEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The grainId property is required for a GrainSkippedEvent');
      });
    });

    describe('when grainId is invalid', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const grainId = 'invalidGrainId';

        // when
        const error = catchErrSync(
          () =>
            new GrainSkippedEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              grainId,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The grainId property should be exactly 36 characters long');
      });
    });
  });
});
