import { PassageEventWithElementInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { PassageEventWithElement } from '../../../../../../src/devcomp/domain/models/passage-events/PassageEventWithElement.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | PassageEventWithElement', function () {
  describe('#constructor', function () {
    it('should not be able to create a PassageElementWithEvent directly', function () {
      // given
      const id = Symbol('id');
      const occurredAt = new Date();
      const createdAt = Symbol('date');
      const passageId = 3;
      const sequenceNumber = 1;

      // when
      const error = catchErrSync(
        () =>
          new PassageEventWithElement({
            id,
            type: 'PassageElementWithEvent',
            occurredAt,
            createdAt,
            passageId,
            sequenceNumber,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(PassageEventWithElementInstantiationError);
    });

    it('should throw an error if elementId is not present', function () {
      // given
      class FakePassageEventWithElement extends PassageEventWithElement {}

      // when
      const error = catchErrSync(
        () =>
          new FakePassageEventWithElement({
            id: Symbol('id'),
            type: 'PassageElementWithEvent',
            occurredAt: new Date(),
            createdAt: new Date(),
            passageId: 123,
            sequenceNumber: 2,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The elementId property is required for a PassageEventWithElement');
    });

    it('should throw an error if elementId is invalid', function () {
      // given
      class FakePassageEventWithElement extends PassageEventWithElement {}

      // when
      const error = catchErrSync(
        () =>
          new FakePassageEventWithElement({
            id: Symbol('id'),
            type: 'PassageElementWithEvent',
            occurredAt: new Date(),
            createdAt: new Date(),
            passageId: 123,
            elementId: 'abcd',
            sequenceNumber: 2,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The elementId property should be exactly 36 characters long');
    });
  });
});
