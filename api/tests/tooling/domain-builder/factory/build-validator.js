import { Validator } from '../../../../src/evaluation/domain/models/Validator.js';
import { ValidatorQCU } from '../../../../src/evaluation/domain/models/ValidatorQCU.js';
import { buildSolution } from './build-solution.js';

function buildValidator({ solution = buildSolution() } = {}) {
  return new Validator({
    solution,
  });
}

buildValidator.ofTypeQCU = function ({ solution = buildSolution() } = {}) {
  return new ValidatorQCU({
    solution,
  });
};

export { buildValidator };
