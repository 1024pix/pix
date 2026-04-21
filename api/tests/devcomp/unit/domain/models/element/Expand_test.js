import { Expand } from '../../../../../../src/devcomp/domain/models/element/Expand.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | Expand', function () {
  describe('#constructor', function () {
    it('should create a valid Expand object', function () {
      // given
      const attributes = {
        id: '39f28a81-290c-440c-b8b9-1762112fbde3',
        content: '<p> My Content </p>',
        title: 'Expand title',
      };

      // when
      const result = new Expand(attributes);

      // then
      expect(result.id).to.equal(attributes.id);
      expect(result.content).to.equal(attributes.content);
      expect(result.title).to.equal(attributes.title);
      expect(result.type).to.equal('expand');
    });
  });

  describe('An expand without a title', function () {
    it('should throw an error', function () {
      const attributes = {
        id: '39f28a81-290c-440c-b8b9-1762112fbde3',
      };
      // when
      const error = catchErrSync(() => new Expand(attributes))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The title is required for an Expand element');
    });
  });

  describe('An expand without a content', function () {
    it('should throw an error', function () {
      const attributes = {
        id: '39f28a81-290c-440c-b8b9-1762112fbde3',
        title: 'A title',
      };
      // when
      const error = catchErrSync(() => new Expand(attributes))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The content is required for an Expand element');
    });
  });
});
