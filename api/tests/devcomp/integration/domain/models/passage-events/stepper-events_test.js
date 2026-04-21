import { StepperNextStepEvent } from '../../../../../../src/devcomp/domain/models/passage-events/stepper-events.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Domain | Models | passage-events | stepper-events', function () {
  describe('#StepperNextStepEvent', function () {
    it('should init and keep attributes', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 2;
      const sequenceNumber = 3;
      const grainId = '05112f63-0b47-4774-b638-6669c4e3a26d';
      const stepNumber = 1;

      // when
      const stepperNextStepEvent = new StepperNextStepEvent({
        id,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        grainId,
        stepNumber,
      });

      // then
      expect(stepperNextStepEvent.id).to.equal(id);
      expect(stepperNextStepEvent.type).to.equal('STEPPER_NEXT_STEP');
      expect(stepperNextStepEvent.occurredAt).to.equal(occurredAt);
      expect(stepperNextStepEvent.createdAt).to.equal(createdAt);
      expect(stepperNextStepEvent.passageId).to.equal(passageId);
      expect(stepperNextStepEvent.sequenceNumber).to.equal(sequenceNumber);
      expect(stepperNextStepEvent.data).to.deep.equal({ grainId, stepNumber });
    });

    describe('when grainId is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const stepNumber = 0;

        // when
        const error = catchErrSync(
          () =>
            new StepperNextStepEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              stepNumber,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The grainId property is required for a StepperNextStepEvent');
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
        const stepNumber = 0;

        // when
        const error = catchErrSync(
          () =>
            new StepperNextStepEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              grainId,
              stepNumber,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The grainId property should be exactly 36 characters long');
      });
    });

    describe('when stepNumber is not given', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const grainId = '05112f63-0b47-4774-b638-6669c4e3a26d';

        // when
        const error = catchErrSync(
          () =>
            new StepperNextStepEvent({
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
        expect(error.message).to.equal('The stepNumber property is required for a StepperNextStepEvent');
      });
    });

    describe('when stepNumber is invalid', function () {
      it('should throw an error', function () {
        // given
        const id = Symbol('id');
        const occurredAt = new Date();
        const createdAt = new Date();
        const passageId = 2;
        const sequenceNumber = 3;
        const grainId = '05112f63-0b47-4774-b638-6669c4e3a26d';
        const stepNumber = 0;

        // when
        const error = catchErrSync(
          () =>
            new StepperNextStepEvent({
              id,
              occurredAt,
              createdAt,
              passageId,
              sequenceNumber,
              grainId,
              stepNumber,
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The stepNumber property must be a positive integer');
      });
    });
  });
});
