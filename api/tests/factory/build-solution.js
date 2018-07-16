const faker = require('faker');
const Solution = require('../../lib/domain/models/Solution');

module.exports = function buildSolution({
  id = `rec${faker.random.uuid()}`,
  type = 'QCM',
  value = '1',
  isT1Enabled = false,
  isT2Enabled = false,
  isT3Enabled = false,
  scoring = '',
} = {}) {

  return new Solution({
    id,
    type,
    value,
    isT1Enabled,
    isT2Enabled,
    isT3Enabled,
    scoring,
  });
};
