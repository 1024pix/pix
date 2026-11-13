import { Feedbacks } from '../Feedbacks.js';
import { Element } from './Element.js';

class QCM extends Element {
  constructor({ id, instruction, locales, proposals, feedbacks, solutions, hasShortProposals = false } = {}) {
    super({ id, type: 'qcm' });

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);

    this.feedbacks = new Feedbacks(feedbacks);
    this.solutions = solutions;
  }
}

export { QCM };
