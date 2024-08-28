import { BlockText } from '../../../../../../src/devcomp/domain/models/block/BlockText.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Block | BlockText', function () {
  describe('#constructor', function () {
    it('should create a block text and keep attributes', function () {
      // when
      const text = new BlockText({ content: 'content' });

      // then
      expect(text.type).to.equal('text');
      expect(text.content).to.equal('content');
    });
  });

  describe('If content is missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new BlockText({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The content is required for a text block');
    });
  });
});
