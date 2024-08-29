import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { Step } from '../../../../../../src/devcomp/domain/models/component/Step.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Component | Step', function () {
  describe('#constructor', function () {
    it('should create a step', function () {
      // given
      const elements = [{ id: Symbol('toto') }];

      // when
      const step = new Step({ elements });

      // then
      expect(step.elements).to.equal(elements);
    });
  });

  describe('when a step does not have elements', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Step({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('A step should contain elements');
    });
  });

  describe('when the elements of a Step is not a list', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Step({ elements: 'not a list' }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('step.elements should be an array');
    });
  });

  describe('when a step has an empty list of elements', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Step({ elements: [] }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('A step should contain at least one element');
    });
  });
});
