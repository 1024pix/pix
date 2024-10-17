import { ComplementaryCertificationBadgeWithOffsetVersion } from '../../../../../../src/certification/enrolment/domain/models/ComplementaryCertificationBadge.js';

const buildComplementaryCertificationBadgeWithOffsetVersion = function ({
  id = 123,
  requiredPixScore = 100,
  offsetVersion = 0,
  level = 1,
  label = 'Pix+ Toto',
  imageUrl = 'pix+.toto.fr',
  isOutdated = false,
} = {}) {
  return new ComplementaryCertificationBadgeWithOffsetVersion({
    id,
    requiredPixScore,
    offsetVersion,
    level,
    label,
    imageUrl,
    isOutdated,
  });
};

export { buildComplementaryCertificationBadgeWithOffsetVersion };
