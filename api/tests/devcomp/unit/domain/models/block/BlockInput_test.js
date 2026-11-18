import { expect } from 'chai';

import { BlockInput } from '../../../../../../src/devcomp/domain/models/block/BlockInput.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockInput', function () {
  describe('#constructor', function () {
    it('should create a input block and keep attributes', function () {
      // given
      const constructor = {
        input: 'symbole',
        inputType: 'text',
        size: 1,
        display: 'inline',
        placeholder: 'a placeholder',
        ariaLabel: 'Réponse 1',
        tolerances: ['t1'],
        solutions: ['@'],
      };

      // when
      const input = new BlockInput(constructor);

      // then
      expect(input.type).to.equal('input');
      expect(input.input).to.equal(constructor.input);
      expect(input.inputType).to.equal(constructor.inputType);
      expect(input.size).to.equal(constructor.size);
      expect(input.display).to.equal(constructor.display);
      expect(input.placeholder).to.equal(constructor.placeholder);
      expect(input.ariaLabel).to.equal(constructor.ariaLabel);
      expect(input.tolerances).to.equal(constructor.tolerances);
      expect(input.solutions).to.equal(constructor.solutions);
    });
  });
});
