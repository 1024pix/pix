import { ComplementaryCertification } from '../../../../lib/shared/domain/models/ComplementaryCertification.js';

const buildComplementaryCertification = function ({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
} = {}) {
  return new ComplementaryCertification({
    id,
    label,
    key,
  });
};

export { buildComplementaryCertification };
