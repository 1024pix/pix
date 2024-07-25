import { ReproducibilityRate } from '../../../../src/shared/domain/models/ReproducibilityRate.js';

const buildReproducibilityRate = function ({ value = 10 } = {}) {
  return new ReproducibilityRate(value);
};

export { buildReproducibilityRate };
