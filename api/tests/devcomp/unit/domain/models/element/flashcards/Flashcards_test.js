import { Card } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { Flashcards } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Flashcards.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Flashcards | Flashcards', function () {
  describe('#constructor', function () {
    it('should create a Flashcards element and keep attributes', function () {
      // given
      const attributes = {
        id: 'id',
        title: 'title',
        instruction: 'instruction',
        introImage: Symbol('introImage'),
        cards: [
          new Card({
            id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
            recto: Symbol('recto'),
            verso: Symbol('verso'),
          }),
        ],
      };

      // when
      const flashcards = new Flashcards(attributes);

      // then
      expect(flashcards.id).to.equal(attributes.id);
      expect(flashcards.type).to.equal('flashcards');
      expect(flashcards.title).to.equal(attributes.title);
      expect(flashcards.instruction).to.equal(attributes.instruction);
      expect(flashcards.introImage).to.equal(attributes.introImage);
      expect(flashcards.cards[0]).to.be.instanceof(Card);
    });
  });
});
