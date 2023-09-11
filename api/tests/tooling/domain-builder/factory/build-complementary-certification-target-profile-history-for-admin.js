import { ComplementaryCertificationTargetProfileHistory } from '../../../../lib/domain/models/ComplementaryCertificationTargetProfileHistory.js';

const buildComplementaryCertificationTargetProfileHistory = function ({
  id = 1,
  label = 'Complementary certification name',
  key = 'COMPLEMENTARY_CERTIFICATION_KEY',
  targetProfilesHistory = [],
} = {}) {
  return new ComplementaryCertificationTargetProfileHistory({
    id,
    label,
    key,
    targetProfilesHistory,
  });
};

export { buildComplementaryCertificationTargetProfileHistory };
