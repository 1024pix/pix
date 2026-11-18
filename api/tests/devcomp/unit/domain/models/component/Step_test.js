import { expect } from 'chai';

import { Step } from '../../../../../../src/devcomp/domain/models/component/Step.js';

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
});
