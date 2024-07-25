import { Validator } from '../../../../src/shared/domain/models/Validator.js';
import { ValidatorQCU } from '../../../../src/shared/domain/models/ValidatorQCU.js';
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
