import { ComponentElement } from '../../../../../src/devcomp/domain/models/ComponentElement.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | ComponentElement', function () {
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

  describe('if a componentElement does not have an element', function () {
    it('should throw an error', function () {
      expect(() => new ComponentElement({})).to.throw('An element is required for a componentElement');
    });
  });
});
