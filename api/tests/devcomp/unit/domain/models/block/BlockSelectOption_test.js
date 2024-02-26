import { BlockSelectOption } from '../../../../../../src/devcomp/domain/models/block/BlockSelectOption.js';
import { expect } from '../../../../../test-helper.js';

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

  describe('If id is missing', function () {
    it('should throw an error', function () {
      expect(() => new BlockSelectOption({})).to.throw('The id is required for a select block option');
    });
  });

  describe('If content is missing', function () {
    it('should throw an error', function () {
      expect(() => new BlockSelectOption({ id: '1' })).to.throw('The content is required for a select block option');
    });
  });
});
