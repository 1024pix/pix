import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
import { Element } from './Element.ts';

class QCU extends Element {
  constructor({ id, instruction, locales, proposals, solution, type = 'qcu', hasShortProposals = false } = {}) {
    super({ id, type });

    assertNotNullOrUndefined(instruction, 'The instruction is required for a QCU');
    this.#assertProposalsIsAnArray(proposals);
    this.#assertProposalsAreNotEmpty(proposals);
    assertNotNullOrUndefined(solution, 'The solution is required for a QCU');

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
    this.solution = solution;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);
  }

  #assertProposalsAreNotEmpty(proposals) {
    if (proposals.length === 0) {
      throw new ModuleInstantiationError('The proposals are required for a QCU');
    }
  }

  #assertProposalsIsAnArray(proposals) {
    if (!Array.isArray(proposals)) {
      throw new ModuleInstantiationError('The QCU proposals should be a list');
    }
  }
}

export { QCU };
