import { assertIsArray, assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
import { Feedbacks } from '../Feedbacks.js';
import { Element } from './Element.ts';

class QCM extends Element {
  constructor({ id, instruction, locales, proposals, feedbacks, solutions, hasShortProposals = false } = {}) {
    super({ id, type: 'qcm' });

    assertNotNullOrUndefined(instruction, 'The instruction is required for a QCM');
    assertIsArray(proposals, 'The proposals should be in a list');
    this.#assertProposalsAreNotEmpty(proposals);
    assertNotNullOrUndefined(feedbacks, 'The feedbacks is required for a QCM');
    assertIsArray(solutions, 'The solutions should be in a list');
    this.#assertSolutionsAreNotEmpty(solutions);
    this.#assertSolutionsAreExistingProposals(solutions, proposals);

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
    this.isAnswerable = true;
    this.hasShortProposals = Boolean(hasShortProposals);

    this.feedbacks = new Feedbacks(feedbacks);
    this.solutions = solutions;
  }

  #assertSolutionsAreNotEmpty(solutions) {
    if (solutions.length === 0) {
      throw new ModuleInstantiationError('The solutions are required for a QCM');
    }
  }

  #assertProposalsAreNotEmpty(proposals) {
    if (proposals.length === 0) {
      throw new ModuleInstantiationError('The proposals are required for a QCM');
    }
  }

  #assertSolutionsAreExistingProposals(solutions, proposals) {
    const proposalIds = proposals.map((proposal) => proposal.id);
    if (!solutions.every((solution) => proposalIds.includes(solution))) {
      throw new ModuleInstantiationError('At least one QCM solution is not an existing proposal');
    }
  }
}

export { QCM };
