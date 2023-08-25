import { ComplementaryCertificationBadge } from '../../../../lib/domain/models/ComplementaryCertificationBadge.js';

const buildComplementaryCertificationBadge = function ({
  id = 1,
  level = 1,
  complementaryCertificationId,
  badgeId,
  createdAt = new Date('2020-01-01'),
  imageUrl = 'http://badge-image-url.fr',
  label = 'Label par defaut',
  certificateMessage = null,
  temporaryCertificateMessage = null,
  stickerUrl = 'http://stiker-url.fr',
  detachedAt = null,
  createdBy = null,
}) {
  return new ComplementaryCertificationBadge({
    id,
    level,
    complementaryCertificationId,
    badgeId,
    createdAt,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    detachedAt,
    createdBy,
  });
};

export { buildComplementaryCertificationBadge };
