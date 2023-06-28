import { Validator } from '../../../../lib/shared/domain/models/Validator.js';
import { ValidatorQCU } from '../../../../lib/shared/domain/models/ValidatorQCU.js';
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
