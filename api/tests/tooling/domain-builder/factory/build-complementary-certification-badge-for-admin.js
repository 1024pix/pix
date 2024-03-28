import { ComplementaryCertificationBadgeForAdmin } from '../../../../lib/domain/models/ComplementaryCertificationBadgeForAdmin.js';

const buildComplementaryCertificationBadgeForAdmin = function ({
  id = 1,
  complementaryCertificationBadgeId,
  label = 'badge Cascade',
  level = 1,
  imageUrl = 'http://badge-image-url.fr',
  minimumEarnedPix = 0,
}) {
  return new ComplementaryCertificationBadgeForAdmin({
    id,
    complementaryCertificationBadgeId,
    label,
    level,
    imageUrl,
    minimumEarnedPix,
  });
};

export { buildComplementaryCertificationBadgeForAdmin };
