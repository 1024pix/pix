import { ComponentStepper } from '../../../../../../src/devcomp/domain/models/component/ComponentStepper.js';
import { expect } from '../../../../../test-helper.js';

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
      expect(() => new ComponentStepper({})).to.throw('Steps are required for a componentStepper');
    });
  });

  describe('when a componentStepper does not have an array of Steps', function () {
    it('should throw an error', function () {
      // given
      const steps = 'steps';

      // when/then
      expect(() => new ComponentStepper({ steps })).to.throw('Steps should be an array');
    });
  });
});
