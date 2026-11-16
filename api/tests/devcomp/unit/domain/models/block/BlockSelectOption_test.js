import { expect } from 'chai';

import { BlockSelectOption } from '../../../../../../src/devcomp/domain/models/block/BlockSelectOption.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockSelectOption', function () {
  describe('#constructor', function () {
    it('should create a block select option and keep attributes', function () {
      // when
      const option = new BlockSelectOption({ id: '1', content: 'content' });

      // then
      expect(option.id).to.equal('1');
      expect(option.content).to.equal('content');
    });
  });
});
