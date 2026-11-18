import { Element } from './Element.js';

export class QCMDeclarative extends Element {
  constructor({ id, instruction, proposals, feedback, hasShortProposals = false } = {}) {
    super({ id, type: 'qcm-declarative' });

    this.instruction = instruction;
    this.proposals = proposals;
    this.feedback = feedback;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }
}
