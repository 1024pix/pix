const Validator = require('../../../lib/domain/models/Validator');
const ValidatorQCU = require('../../../lib/domain/models/ValidatorQCU');
const buildSolution = require('./build-solution');

function buildValidator({
  solution = buildSolution(),
} = {}) {

  return new Validator({
    solution,
  });
}

buildValidator.ofTypeQCU = function({
  solution = buildSolution(),
} = {}) {
  return new ValidatorQCU({
    solution,
  });
};

module.exports = buildValidator;
