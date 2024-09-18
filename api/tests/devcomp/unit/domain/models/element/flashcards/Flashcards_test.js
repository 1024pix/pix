import { Card } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { Flashcards } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Flashcards.js';
import { validateFlashcards } from '../../../../../shared/validateFlashcards.js';

describe('Unit | Devcomp | Domain | Models | Element | Flashcards | Flashcards', function () {
  describe('#constructor', function () {
    it('should create a Flashcards element and keep attributes', function () {
      // given
      const attributes = {
        id: 'id',
        title: 'title',
        instruction: 'instruction',
        introImage: {
          url: 'https://...',
        },
        cards: [
          new Card({
            id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
            recto: { image: { url: 'https://...' } },
            verso: {
              image: {
                url: 'https://...',
              },
            },
          }),
        ],
      };

      // when
      const flashcards = new Flashcards(attributes);

      // then
      validateFlashcards(flashcards, attributes);
    });
  });
});
