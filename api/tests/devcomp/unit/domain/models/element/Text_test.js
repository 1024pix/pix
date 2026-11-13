import { expect } from 'chai';

import { Text } from '../../../../../../src/devcomp/domain/models/element/Text.js';

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
});
