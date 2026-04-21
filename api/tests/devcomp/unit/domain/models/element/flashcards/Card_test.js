import { Card } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { validateCard } from '../../../../../shared/validateFlashcards.js';

describe('Unit | Devcomp | Domain | Models | Element | Flashcards | Card', function () {
  describe('#constructor', function () {
    it('should create a card and keep attributes', function () {
      // given
      const attributes = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          image: {
            url: 'https://example.org/image.jpeg',
            information: { width: 300, height: 300, type: 'vector' },
          },
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: {
            url: 'https://example.org/image.jpeg',
            information: {},
          },
          text: "Parce que c'est joli",
        },
      };

      // when
      const card = new Card(attributes);

      // then
      validateCard(card, attributes);
    });

    describe('when the image‘s url is empty or null for ‘recto‘ or ‘verso‘ field', function () {
      it('should create a card without image field', function () {
        // given
        const attributes = {
          id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
          recto: {
            image: {
              url: '',
            },
            text: "A quoi sert l'arobase dans mon adresse email ?",
          },
          verso: {
            image: {
              url: null,
            },
            text: "Parce que c'est joli",
          },
        };

        // when
        const card = new Card(attributes);

        // then
        expect(card.recto.image).to.be.undefined;
        expect(card.verso.image).to.be.undefined;
      });
    });
  });
});
