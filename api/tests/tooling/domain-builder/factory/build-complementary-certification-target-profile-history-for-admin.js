import { ComplementaryCertificationTargetProfileHistory } from '../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationTargetProfileHistory.js';

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
