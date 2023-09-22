import { ComplementaryCertificationBadgeForAdmin } from '../../../../lib/domain/models/ComplementaryCertificationBadgeForAdmin.js';

const buildComplementaryCertificationBadgeForAdmin = function ({
  id = 1,
  label = 'badge Cascade',
  level = 1,
  imageUrl = 'http://badge-image-url.fr',
}) {
  return new ComplementaryCertificationBadgeForAdmin({ id, label, level, imageUrl });
};

export { buildComplementaryCertificationBadgeForAdmin };
