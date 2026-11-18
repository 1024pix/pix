import { Element } from './Element.js';

class QCU extends Element {
  constructor({ id, instruction, locales, proposals, solution, type = 'qcu', hasShortProposals = false } = {}) {
    super({ id, type });

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
    this.solution = solution;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }
}

export { QCU };
