import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { ComponentStepper } from '../../../../../../src/devcomp/domain/models/component/ComponentStepper.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Component | ComponentStepper', function () {
  describe('#constructor', function () {
    it('should create a componentStepper', function () {
      // given
      const steps = [{ elements: 'toto' }, { elements: 'foo' }];
      const type = 'stepper';

      // when
      const componentStepper = new ComponentStepper({ steps });

      // then
      expect(componentStepper.steps).to.equal(steps);
      expect(componentStepper.type).to.equal(type);
    });
  });

  describe('if a componentStepper does not have steps', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new ComponentStepper({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('Steps are required for a componentStepper');
    });
  });

  describe('when a componentStepper does not have an array of Steps', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new ComponentStepper({ steps: 'steps' }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('Steps should be an array');
    });
  });
});
