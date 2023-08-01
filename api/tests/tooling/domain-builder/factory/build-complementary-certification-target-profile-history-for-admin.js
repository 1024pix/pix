import { ComplementaryCertificationTargetProfileHistory } from '../../../../lib/domain/models/ComplementaryCertificationTargetProfileHistory.js';

const buildComplementaryCertificationTargetProfileHistory = function ({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  currentTargetProfileBadges = [],
  targetProfilesHistory = [],
} = {}) {
  return new ComplementaryCertificationTargetProfileHistory({
    id,
    label,
    key,
    currentTargetProfileBadges,
    targetProfilesHistory,
  });
};

export { buildComplementaryCertificationTargetProfileHistory };
