import { Element } from '../Element.js';

class Flashcards extends Element {
  constructor({ id, title, instruction, introImage, cards }) {
    super({ id, type: 'flashcards' });

    this.title = title;
    this.instruction = instruction;
    this.introImage = introImage;
    this.cards = cards;
  }
}
export { Flashcards };
