import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Text', function () {
  describe('#constructor', function () {
    it('should create a text and keep attributes', function () {
      // when
      const text = new Text({ id: 'id', content: 'content' });

      // then
      expect(text.id).to.equal('id');
      expect(text.content).to.equal('content');
      expect(text.type).to.equal('text');
    });
  });

  describe('A text without id', function () {
    it('should throw an error', function () {
      expect(() => new Text({ content: 'content' })).to.throw('The id is required for an element');
    });
  });

  describe('A text without content', function () {
    it('should throw an error', function () {
      expect(() => new Text({ id: '1' })).to.throw('The content is required for a text');
    });
  });
});
