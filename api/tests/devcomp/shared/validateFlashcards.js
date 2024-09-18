import { Card } from '../../../src/devcomp/domain/models/element/flashcards/Card.js';
import { Flashcards } from '../../../src/devcomp/domain/models/element/flashcards/Flashcards.js';
import { expect } from '../../test-helper.js';

function validateFlashcards(flashcards, expectedFlashcards) {
  expect(flashcards).to.be.an.instanceOf(Flashcards);
  expect(flashcards.id).to.equal(expectedFlashcards.id);
  expect(flashcards.title).to.equal(expectedFlashcards.title);
  expect(flashcards.instruction).to.equal(expectedFlashcards.instruction);
  expect(flashcards.introImage.url).to.equal(expectedFlashcards.introImage.url);
  validateCard(flashcards.cards[0], expectedFlashcards.cards[0]);
}

function validateCard(card, expectedCard) {
  expect(card).to.be.instanceOf(Card);
  expect(card.id).deep.equal(expectedCard.id);
  expect(card.recto.image.url).deep.equal(expectedCard.recto.image.url);
  expect(card.recto.text).deep.equal(expectedCard.recto.text);
  expect(card.verso.image.url).deep.equal(expectedCard.verso.image.url);
  expect(card.verso.text).deep.equal(expectedCard.verso.text);
}

export { validateCard, validateFlashcards };
