import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
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
      throw new ModuleInstantiationError('The proposals are required for a QCM');
    }
  }

  #assertProposalsIsAnArray(proposals) {
    if (!Array.isArray(proposals)) {
      throw new ModuleInstantiationError('The proposals should be in a list');
    }
  }
}

export { QCM };
