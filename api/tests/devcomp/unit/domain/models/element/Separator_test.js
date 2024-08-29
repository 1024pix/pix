import { Separator } from '../../../../../../src/devcomp/domain/models/element/Separator.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Separator', function () {
  describe('#constructor', function () {
    it('should create a separator and keep attributes', function () {
      // when
      const separator = new Separator({
        id: 'id',
      });

      // then
      expect(separator.id).to.equal('id');
      expect(separator.type).to.equal('separator');
    });
  });

  describe('A separator without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Separator({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });
});
