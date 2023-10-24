import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QCU {
  constructor({ id, instruction, locales, proposals }) {
    assertNotNullOrUndefined(id, "L'id est obligatoire pour un QCU");
    assertNotNullOrUndefined(instruction, "L'instruction est obligatoire pour un QCU");
    this.#assertProposalsIsAnArray(proposals);
    this.#assertProposalsAreNotEmpty(proposals);

    this.id = id;
    this.instruction = instruction;
    this.locales = locales;
    this.proposals = proposals;
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
