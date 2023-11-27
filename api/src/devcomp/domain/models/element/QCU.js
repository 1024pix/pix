import { Element } from './Element.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class QCU extends Element {
  constructor({ id, instruction, locales, proposals }) {
    super({ id });

    assertNotNullOrUndefined(instruction, "L'instruction est obligatoire pour un QCU");
    this.#assertProposalsIsAnArray(proposals);
    this.#assertProposalsAreNotEmpty(proposals);

    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
    this.isAnswerable = true;
  }

  #assertProposalsAreNotEmpty(proposals) {
    if (proposals.length === 0) {
      throw new Error('Les propositions sont obligatoires pour un QCU');
    }
  }

  #assertProposalsIsAnArray(proposals) {
    if (!Array.isArray(proposals)) {
      throw new Error('Les propositions doivent apparaître dans une liste');
    }
  }
}

export { QCU };
