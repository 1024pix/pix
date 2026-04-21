import { Card } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { Flashcards } from '../../../../../../../src/devcomp/domain/models/element/flashcards/Flashcards.js';

import { validateFlashcards } from '../../../../../shared/validateFlashcards.js';

describe('Unit | Devcomp | Domain | Models | Element | Flashcards', function () {
  describe('#constructor', function () {
    it('should create a Flashcards element and keep attributes', function () {
      // given
      const attributes = {
        id: 'id',
        title: 'title',
        instruction: 'instruction',
        introImage: {
          url: 'https://...',
          information: { width: 300, height: 300, type: 'vector' },
        },
        cards: [
          new Card({
            id: 'e1de6394-ff88-4de3-8834-a40057a50ff4',
            recto: { image: { url: 'https://...', information: { width: 300, height: 300, type: 'vector' } } },
            verso: {
              image: {
                url: 'https://...',
                information: {},
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

    describe('when ‘introImage.url‘ is empty or undefined', function () {
      it('should create a Flashcards without ‘introImage‘', function () {
        const attributes = {
          id: 'id',
          title: 'title',
          instruction: 'instruction',
          introImage: {
            url: '',
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
        const attributesWithUndefinedIntroImageUrl = { ...attributes, introImage: { url: undefined } };
        const flashcardsAttributes = [attributes, attributesWithUndefinedIntroImageUrl];

        // when
        const flashcards = flashcardsAttributes.map((flashcardAttribute) => new Flashcards(flashcardAttribute));

        // then
        flashcards.forEach((flashcard) => expect(flashcard.introImage).to.be.undefined);
      });
    });
  });
});
