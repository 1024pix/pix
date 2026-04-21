import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Element | Text', function () {
  describe('#constructor', function () {
    it('should create a text and keep attributes', function () {
      // when
      const text = new Text({ id: 'id', content: 'content', tag: ' ' });

      // then
      expect(text.id).to.equal('id');
      expect(text.content).to.equal('content');
      expect(text.type).to.equal('text');
      expect(text.tag).to.equal(' ');
    });

    it('should accept all valid tag values', function () {
      const validTags = [' ', 'context', 'did-you-know', 'further-information', 'tip'];

      for (const tag of validTags) {
        const text = new Text({ id: 'id', content: 'content', tag });
        expect(text.tag).to.equal(tag);
      }
    });
  });

  describe('A text without id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Text({ content: 'content', tag: ' ' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for an element');
    });
  });

  describe('A text without content', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Text({ id: '1', tag: ' ' }))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The content is required for a text');
    });
  });

  describe('A text with an invalid tag', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Text({ id: '1', content: 'content', tag: 'invalid-tag' }))();

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equal(
        "The tag value must be one of: ' ', 'context', 'did-you-know', 'further-information', 'tip'",
      );
    });
  });

  describe('A text without tag', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new Text({ id: '1', content: 'content' }))();

      // then
      expect(error).to.be.instanceOf(TypeError);
    });
  });
});
