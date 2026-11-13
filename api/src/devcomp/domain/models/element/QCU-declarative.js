import { Element } from './Element.js';

export class QCUDeclarative extends Element {
  constructor({ id, instruction, proposals, hasShortProposals = false } = {}) {
    super({ id, type: 'qcu-declarative' });

    this.instruction = instruction;
    this.proposals = proposals;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }
}
