import { Flashcards } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Flashcards.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Flashcards | Flashcards', function () {
  describe('#constructor', function () {
    it('should create a Flashcards element and keep attributes', function () {
      // when
      const flashcards = new Flashcards({ id: 'id' });

      // then
      expect(flashcards.id).to.equal('id');
    });
  });
});
