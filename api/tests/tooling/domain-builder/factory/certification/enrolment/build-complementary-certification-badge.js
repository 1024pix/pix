import { ComplementaryCertificationBadgeWithOffsetVersion } from '../../../../../../src/certification/enrolment/domain/models/ComplementaryCertificationBadge.js';

const buildComplementaryCertificationBadgeWithOffsetVersion = function ({
  id = 123,
  requiredPixScore = 100,
  offsetVersion = 0,
  currentAttachedComplementaryCertificationBadgeId = 123,
} = {}) {
  return new ComplementaryCertificationBadgeWithOffsetVersion({
    id,
    requiredPixScore,
    offsetVersion,
    currentAttachedComplementaryCertificationBadgeId,
  });
};

export { buildComplementaryCertificationBadgeWithOffsetVersion };
