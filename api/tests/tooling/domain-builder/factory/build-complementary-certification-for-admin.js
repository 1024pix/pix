import { ComplementaryCertificationForAdmin } from '../../../../lib/domain/models/ComplementaryCertificationForAdmin.js';

const buildComplementaryCertificationForAdmin = function ({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  currentTargetProfileBadges = [],
  targetProfilesLog = [],
} = {}) {
  return new ComplementaryCertificationForAdmin({
    id,
    label,
    key,
    currentTargetProfileBadges,
    targetProfilesLog,
  });
};

export { buildComplementaryCertificationForAdmin };
