import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
import { Element } from './Element.ts';

export class QCUDeclarative extends Element {
  constructor({ id, instruction, proposals, hasShortProposals = false } = {}) {
    super({ id, type: 'qcu-declarative' });

    assertNotNullOrUndefined(instruction, 'The instruction is required for a QCU declarative');
    if (proposals.length === 0) {
      throw new ModuleInstantiationError('The proposals are required for a QCU declarative');
    }
    if (!Array.isArray(proposals)) {
      throw new ModuleInstantiationError('The QCU declarative proposals should be a list');
    }

    this.instruction = instruction;
    this.proposals = proposals;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }
}
