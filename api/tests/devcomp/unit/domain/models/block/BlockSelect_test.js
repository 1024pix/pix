import { expect } from 'chai';

import { BlockSelect } from '../../../../../../src/devcomp/domain/models/block/BlockSelect.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockSelect', function () {
  describe('#constructor', function () {
    it('should create a select block and keep attributes', function () {
      // given
      const constructor = {
        input: 'symbole',
        display: 'inline',
        placeholder: 'a placeholder',
        ariaLabel: 'Réponse 1',
        tolerances: ['t1'],
        options: [Symbol('option')],
        solutions: ['@'],
      };

      // when
      const select = new BlockSelect(constructor);

      // then
      expect(select.type).to.equal('select');
      expect(select.input).to.equal(constructor.input);
      expect(select.display).to.equal(constructor.display);
      expect(select.placeholder).to.equal(constructor.placeholder);
      expect(select.ariaLabel).to.equal(constructor.ariaLabel);
      expect(select.tolerances).to.equal(constructor.tolerances);
      expect(select.options).to.equal(constructor.options);
      expect(select.solutions).to.equal(constructor.solutions);
    });
  });
});
