import { Validator } from '../../../../src/evaluation/domain/models/Validator.js';
import { ValidatorQCM } from '../../../../src/evaluation/domain/models/ValidatorQCM.js';
import { ValidatorQCU } from '../../../../src/evaluation/domain/models/ValidatorQCU.js';
import { ValidatorQROC } from '../../../../src/evaluation/domain/models/ValidatorQROC.js';
import { ValidatorQROCMDep } from '../../../../src/evaluation/domain/models/ValidatorQROCMDep.js';
import { ValidatorQROCMInd } from '../../../../src/evaluation/domain/models/ValidatorQROCMInd.js';
import { buildSolution } from './build-solution.js';

// todo move me lolo
export function buildValidator({ solution = buildSolution() } = {}) {
  return new Validator({
    solution,
  });
}

buildValidator.ofTypeQCU = function ({ solution = buildSolution() } = {}) {
  return new ValidatorQCU({
    solution,
  });
};

buildValidator.ofTypeQCM = function ({ solution = buildSolution() } = {}) {
  return new ValidatorQCM({
    solution,
  });
};

buildValidator.ofTypeQROC = function ({ solution = buildSolution() } = {}) {
  return new ValidatorQROC({
    solution,
  });
};

buildValidator.ofTypeQROCMInd = function ({ solution = buildSolution() } = {}) {
  return new ValidatorQROCMInd({
    solution,
  });
};

buildValidator.ofTypeQROCMDep = function ({ solution = buildSolution() } = {}) {
  return new ValidatorQROCMDep({
    solution,
  });
};
