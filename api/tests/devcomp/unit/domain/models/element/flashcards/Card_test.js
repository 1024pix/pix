import { Card } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Flashcards | Card', function () {
  describe('#constructor', function () {
    it('should create a card and keep attributes', function () {
      // given
      const attributes = {
        id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
        recto: {
          image: {
            url: 'https://example.org/image.jpeg',
          },
          text: "A quoi sert l'arobase dans mon adresse email ?",
        },
        verso: {
          image: {
            url: 'https://example.org/image.jpeg',
          },
          text: "Parce que c'est joli",
        },
      };

      // when
      const card = new Card(attributes);

      // then
      expect(card.id).deep.equal(attributes.id);
      expect(card.recto.image.url).deep.equal(attributes.recto.image.url);
      expect(card.recto.text).deep.equal(attributes.recto.text);
      expect(card.verso.image.url).deep.equal(attributes.verso.image.url);
      expect(card.verso.text).deep.equal(attributes.verso.text);
    });
  });
});
