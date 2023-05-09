import { ReproducibilityRate } from '../../../../lib/domain/models/ReproducibilityRate.js';

const buildReproducibilityRate = function ({ value = 10 } = {}) {
  return new ReproducibilityRate(value);
};

export { buildReproducibilityRate };
