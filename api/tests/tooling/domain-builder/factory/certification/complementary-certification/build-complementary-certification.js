import { ComplementaryCertification } from '../../../../../../src/certification/complementary-certification/domain/models/ComplementaryCertification.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

const buildComplementaryCertification = function ({
  id = 1,
  label = 'Complementary certification name',
  key = ComplementaryCertificationKeys.PIX_PLUS_DROIT,
  duration = 45,
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
    duration,
  });
};

export { buildComplementaryCertification };
