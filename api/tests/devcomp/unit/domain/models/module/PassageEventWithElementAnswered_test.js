import { PassageEventWithElementAnsweredInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { PassageEventWithElementAnswered } from '../../../../../../src/devcomp/domain/models/passage-events/PassageEventWithElementAnswered.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | PassageEventWithElementAnswered', function () {
  describe('#constructor', function () {
    it('should not be able to create a PassageEventWithElementAnswered directly', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 3;
      const sequenceNumber = 1;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = '1';
      const status = 'ok';

      // when
      const error = catchErrSync(
        () =>
          new PassageEventWithElementAnswered({
            id,
            type: 'PassageEventWithElementAnswered',
            elementId,
            occurredAt,
            createdAt,
            passageId,
            sequenceNumber,
            answer,
            status,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(PassageEventWithElementAnsweredInstantiationError);
    });

    it('should init and keep attributes', function () {
      // given
      class FakePassageEventWithElementAnswered extends PassageEventWithElementAnswered {}

      const id = Symbol('id');
      const type = 'FakePassageEventWithElementAnswered';
      const occurredAt = new Date();
      const createdAt = new Date();
      const passageId = 123;
      const sequenceNumber = 2;
      const elementId = '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095';
      const answer = '1';
      const status = 'ok';

      // when
      const event = new FakePassageEventWithElementAnswered({
        id,
        type,
        occurredAt,
        createdAt,
        passageId,
        sequenceNumber,
        elementId,
        answer,
        status,
      });

      // then
      expect(event.id).to.equal(id);
      expect(event.type).to.equal(type);
      expect(event.occurredAt).to.equal(occurredAt);
      expect(event.createdAt).to.equal(createdAt);
      expect(event.passageId).to.equal(passageId);
      expect(event.sequenceNumber).to.equal(sequenceNumber);
      expect(event.data).to.deep.equal({ elementId, answer, status });
    });

    it('should throw an error if answer is not present', function () {
      // given
      class FakePassageEventWithElementAnswered extends PassageEventWithElementAnswered {}

      // when
      const error = catchErrSync(
        () =>
          new FakePassageEventWithElementAnswered({
            id: Symbol('id'),
            type: 'FakePassageElementWithEventAnswered',
            occurredAt: new Date(),
            createdAt: new Date(),
            passageId: 123,
            sequenceNumber: 2,
            elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
            status: 'ok',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The answer property is required for a PassageEventWithElementAnswered');
    });

    it('should throw an error if status is not present', function () {
      // given
      class FakePassageEventWithElement extends PassageEventWithElementAnswered {}

      // when
      const error = catchErrSync(
        () =>
          new FakePassageEventWithElement({
            id: Symbol('id'),
            type: 'FakePassageElementWithEventAnswered',
            occurredAt: new Date(),
            createdAt: new Date(),
            passageId: 123,
            sequenceNumber: 2,
            elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
            answer: '1',
            status: undefined,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The status property is required for a PassageEventWithElementAnswered');
    });

    it('should throw an error if status is invalid', function () {
      // given
      class FakePassageEventWithElement extends PassageEventWithElementAnswered {}

      // when
      const error = catchErrSync(
        () =>
          new FakePassageEventWithElement({
            id: Symbol('id'),
            type: 'FakePassageElementWithEventAnswered',
            occurredAt: new Date(),
            createdAt: new Date(),
            passageId: 123,
            sequenceNumber: 2,
            elementId: '5ad40bc9-8b5c-47ee-b893-f8ab1a1b8095',
            answer: '1',
            status: 'not_valid_status',
          }),
      )();

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equal('The status value must be one of these : [‘ok‘, ‘ko‘]');
    });
  });
});
