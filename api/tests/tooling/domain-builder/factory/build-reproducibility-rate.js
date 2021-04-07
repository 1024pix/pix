const { ReproducibilityRate } = require('../../../../lib/domain/models/ReproducibilityRate');

module.exports = function buildReproducibilityRate({
  value = 10,
} = {}) {
  return new ReproducibilityRate(value);
};
