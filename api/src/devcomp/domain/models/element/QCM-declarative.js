import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
import { Element } from './Element.ts';

export class QCMDeclarative extends Element {
  constructor({ id, instruction, proposals, feedback, hasShortProposals = false } = {}) {
    super({ id, type: 'qcm-declarative' });

    assertNotNullOrUndefined(instruction, 'The instruction is required for a QCM declarative');
    if (!Array.isArray(proposals)) {
      throw new ModuleInstantiationError('The QCM declarative proposals should be a list');
    }
    if (proposals.length === 0) {
      throw new ModuleInstantiationError('The proposals are required for a QCM declarative');
    }
    assertNotNullOrUndefined(feedback, 'The feedback is required for a QCM declarative');

    this.instruction = instruction;
    this.proposals = proposals;
    this.feedback = feedback;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }
}
