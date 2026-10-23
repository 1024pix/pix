import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ModuleInstantiationError } from '../../errors.js';
import { Feedbacks } from '../Feedbacks.js';
import { Element } from './Element.ts';

class QROCM extends Element {
  constructor({ id, instruction, proposals, locales, feedbacks }) {
    super({ id, type: 'qrocm' });

    assertNotNullOrUndefined(instruction, "L'instruction est obligatoire pour un QROCM");
    this.#assertProposalsIsAnArray(proposals);
    this.#assertProposalsAreNotEmpty(proposals);
    assertNotNullOrUndefined(feedbacks, 'The feedbacks are required for a QROCM.');

    this.id = id;
    this.instruction = instruction;
    this.proposals = proposals;
    this.locales = locales;
    this.isAnswerable = true;

    this.feedbacks = new Feedbacks(feedbacks);
  }

  #assertProposalsAreNotEmpty(proposals) {
    if (proposals.length === 0) {
      throw new ModuleInstantiationError('Les propositions sont obligatoires pour un QROCM');
    }
  }

  #assertProposalsIsAnArray(proposals) {
    if (!Array.isArray(proposals)) {
      throw new ModuleInstantiationError('Les propositions doivent apparaître dans une liste');
    }
  }
}

export { QROCM };
