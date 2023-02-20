import { ReproducibilityRate } from '../../../../lib/domain/models/ReproducibilityRate';

export default function buildReproducibilityRate({ value = 10 } = {}) {
  return new ReproducibilityRate(value);
}
