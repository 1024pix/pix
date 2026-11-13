import { expect } from 'chai';

import { ComponentElement } from '../../../../../../src/devcomp/domain/models/component/ComponentElement.js';

describe('Unit | Devcomp | Domain | Models | Component | ComponentElement', function () {
  describe('#constructor', function () {
    it('should create a componentElement', function () {
      // given
      const element = Symbol('element');
      const type = 'element';

      // when
      const componentElement = new ComponentElement({ element });

      // then
      expect(componentElement.element).to.equal(element);
      expect(componentElement.type).to.equal(type);
    });
  });
});
