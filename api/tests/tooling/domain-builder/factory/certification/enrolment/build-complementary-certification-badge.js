import { ComplementaryCertificationBadge } from '../../../../../../src/certification/enrolment/domain/models/ComplementaryCertificationBadge.js';

const buildComplementaryCertificationBadge = function ({
  id = 123,
  requiredPixScore = 100,
  offsetVersion = 0,
  currentAttachedComplementaryCertificationBadgeId = 123,
} = {}) {
  return new ComplementaryCertificationBadge({
    id,
    requiredPixScore,
    offsetVersion,
    currentAttachedComplementaryCertificationBadgeId,
  });
};

export { buildComplementaryCertificationBadge };
