import solutionServiceEmbed from '../../services/solution-service-embed.js';
import { Validation } from './Validation.js';
import { Validator } from './Validator.js';

/**
 * Traduction: Vérificateur de réponse pour un embed
 */
class ValidatorEmbed extends Validator {
  constructor({ solution, dependencies = { solutionServiceEmbed } } = {}) {
    super({ solution });
    this.dependencies = dependencies;
  }

  assess({ answer }) {
    const result = this.dependencies.solutionServiceEmbed.match(answer.value, this.solution.value);

    return new Validation({
      result,
      resultDetails: null,
    });
  }
}

export { ValidatorEmbed };
