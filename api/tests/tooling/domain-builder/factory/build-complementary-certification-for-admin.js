import { ComplementaryCertificationForAdmin } from '../../../../lib/domain/models/ComplementaryCertificationForAdmin.js';

const buildComplementaryCertificationForAdmin = function ({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  currentTargetProfile = { id: 12, name: 'Target' },
} = {}) {
  return new ComplementaryCertificationForAdmin({
    id,
    label,
    key,
    currentTargetProfile,
  });
};

export { buildComplementaryCertificationForAdmin };
