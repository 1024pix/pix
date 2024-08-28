import { BlockSelectOption } from '../../../../../../src/devcomp/domain/models/block/BlockSelectOption.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

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
      // when
      const error = catchErrSync(() => new BlockSelectOption({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for a select block option');
    });
  });

  describe('If content is missing', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new BlockSelectOption({ id: '1' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The content is required for a select block option');
    });
  });
});
