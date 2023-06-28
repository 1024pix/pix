import { ReproducibilityRate } from '../../../../lib/shared/domain/models/ReproducibilityRate.js';

const buildReproducibilityRate = function ({ value = 10 } = {}) {
  return new ReproducibilityRate(value);
};

export { buildReproducibilityRate };
