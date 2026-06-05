import { ComplementaryCertification } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

export function buildComplementaryCertification({
  id = 1,
  label = 'Complementary certification name',
  key = ComplementaryCertificationKeys.PIX_PLUS_DROIT,
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
  });
}
