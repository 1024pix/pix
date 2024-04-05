import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QrocmSolutions {
  constructor(proposals) {
    proposals
      .filter((proposal) => ['input', 'select'].includes(proposal.type))
      .forEach((proposal) => {
        assertNotNullOrUndefined(
          proposal.solutions,
          'The solutions are required for each QROCM proposal in QROCM solutions',
        );
        assertNotNullOrUndefined(
          proposal.tolerances,
          'The tolerances are required for each QROCM proposal in QROCM solutions',
        );
        if (!Array.isArray(proposal.solutions)) {
          throw new Error('Each proposal in QROCM solutions should have a list of solutions');
        }
        if (!Array.isArray(proposal.tolerances)) {
          throw new Error('A QROCM solution should have a list of tolerances');
        }
      });

    this.value = {};
    this.tolerances = {};

    proposals.forEach((proposal) => {
      if (['select', 'input'].includes(proposal.type)) {
        this.value[proposal.input] = proposal.solutions;
        this.tolerances[proposal.input] = proposal.tolerances;
      }
    });
  }
}

export { QrocmSolutions };
