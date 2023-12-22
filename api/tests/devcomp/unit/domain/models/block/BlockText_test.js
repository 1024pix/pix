import { BlockText } from '../../../../../../src/devcomp/domain/models/block/BlockText.js';
import { expect } from '../../../../../test-helper.js';

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
      expect(() => new BlockText({})).to.throw('Le contenu est obligatoire pour un bloc de texte');
    });
  });
});
