import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { Element } from './Element.js';

class QCM extends Element {
  constructor({ id, instruction, locales, proposals }) {
    super({ id, type: 'qcm' });

    assertNotNullOrUndefined(instruction, 'The instruction is required for a QCM');
    this.#assertProposalsIsAnArray(proposals);
    this.#assertProposalsAreNotEmpty(proposals);

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
    this.isAnswerable = true;
  }

  #assertProposalsAreNotEmpty(proposals) {
    if (proposals.length === 0) {
      throw new Error('The proposals are required for a QCM');
    }
  }

  #assertProposalsIsAnArray(proposals) {
    if (!Array.isArray(proposals)) {
      throw new Error('The proposals should be in a list');
    }
  }
}

export { QCM };
