import { ComplementaryCertificationTargetProfileHistory } from '../../../../lib/domain/models/ComplementaryCertificationTargetProfileHistory.js';

const buildComplementaryCertificationTargetProfileHistory = function ({
  id = 1,
  label = 'Complementary certification name',
  hasExternalJury = false,
  targetProfilesHistory = [],
} = {}) {
  return new ComplementaryCertificationTargetProfileHistory({
    id,
    label,
    hasExternalJury,
    targetProfilesHistory,
  });
};

export { buildComplementaryCertificationTargetProfileHistory };
