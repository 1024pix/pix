import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QrocmSolutions {
  constructor(proposals) {
    proposals
      .filter((proposal) => ['input', 'select'].includes(proposal.type))
      .forEach((proposal) => {
        assertNotNullOrUndefined(
          proposal.solutions,
          'Les solutions sont obligatoires pour toutes les solutions de QROCM',
        );
        assertNotNullOrUndefined(
          proposal.tolerances,
          'Les tolérances sont obligatoires pour toutes les solutions de QROCM',
        );
        if (!Array.isArray(proposal.solutions)) {
          throw new Error('Une solution de QROCM doit forcément posséder une liste de solutions');
        }
        if (!Array.isArray(proposal.tolerances)) {
          throw new Error('Une solution de QROCM doit forcément posséder une liste de tolérances');
        }
      });

    this.value = {};
    this.tolerances = [];

    proposals.forEach((proposal) => {
      if (['select', 'input'].includes(proposal.type)) {
        this.value[proposal.input] = proposal.solutions;
        this.tolerances.push(...proposal.tolerances);
      }
    });

    this.tolerances = Array.from(new Set(this.tolerances));
  }
}

export { QrocmSolutions };
