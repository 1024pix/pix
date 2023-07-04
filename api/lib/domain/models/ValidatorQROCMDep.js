import * as solutionServiceQROCMDep from '../services/solution-service-qrocm-dep.js';
import { Validator } from './Validator.js';

class ValidatorQROCMDep extends Validator {
  constructor({ solution, dependencies = { solutionServiceQROCMDep } } = {}) {
    super({ solution });
    this.dependencies = dependencies;
  }

  assess({ answer }) {
    return this.dependencies.solutionServiceQROCMDep.match({
      answerValue: answer.value,
      solution: this.solution,
    });
  }
}

export { ValidatorQROCMDep };
