import Validator from '../../../../lib/domain/models/Validator';
import ValidatorQCU from '../../../../lib/domain/models/ValidatorQCU';
import buildSolution from './build-solution';

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

export default buildValidator;
