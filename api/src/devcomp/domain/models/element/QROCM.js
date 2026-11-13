import { Feedbacks } from '../Feedbacks.js';
import { Element } from './Element.js';

class QROCM extends Element {
  constructor({ id, instruction, proposals, locales, feedbacks }) {
    super({ id, type: 'qrocm' });

    this.id = id;
    this.instruction = instruction;
    this.proposals = proposals;
    this.locales = locales;
    this.isAnswerable = true;

    this.feedbacks = new Feedbacks(feedbacks);
  }
}

export { QROCM };
