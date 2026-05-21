import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.js';

class QCMDeclarative extends Element {
  constructor({ id, instruction, proposals, hasShortProposals = false } = {}) {
    super({ id, type: 'qcm-declarative' });

    assertNotNullOrUndefined(instruction, 'The instruction is required for a QCU declarative');

    this.instruction = instruction;
    this.proposals = proposals;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }
}

export { QCMDeclarative };
