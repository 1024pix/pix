import { ElementAnswer } from '../../../../../src/devcomp/domain/models/ElementAnswer.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | ElementAnswer', function () {
  describe('#constructor', function () {
    it('should create an element answer and keep attributes', function () {
      // given
      const id = 12;
      const elementId = 1;
      const userResponseValue = 'foo';
      const correction = Symbol('correction');

      // when
      const answer = new ElementAnswer({ id, elementId, userResponseValue: 'foo', correction });

      // then
      expect(answer.id).to.equal(id);
      expect(answer.elementId).to.equal(elementId);
      expect(answer.userResponseValue).to.equal(userResponseValue);
      expect(answer.correction).to.equal(correction);
    });

    describe('An element answer without element id', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new ElementAnswer({}))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The id of the element is required for an element answer.');
      });
    });

    describe('An element answer without user response value', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new ElementAnswer({ elementId: 'elementId' }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The user response is required for an element answer.');
      });
    });

    describe('An element answer without correction', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () => new ElementAnswer({ elementId: 'elementId', userResponseValue: 'userResponseValue' }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The correction is required for an element answer.');
      });
    });
  });
});
