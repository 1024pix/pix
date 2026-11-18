import { expect } from 'chai';

import { ComponentStepper } from '../../../../../../src/devcomp/domain/models/component/ComponentStepper.js';

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
});
