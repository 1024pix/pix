import { ComplementaryCertificationBadge } from '../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationBadge.js';

const buildComplementaryCertificationBadge = function ({
  id = 1,
  label = 'badge Cascade',
  level = 1,
  imageUrl = 'http://badge-image-url.fr',
  minimumEarnedPix = 0,
  createdAt = '2021-01-01',
  complementaryCertificationId = 123,
  badgeId = 456,
  certificateMessage = 'bravo',
  temporaryCertificateMessage = 'super',
  stickerUrl = 'sticker.fr',
  detachedAt = null,
  createdBy = 12345,
}) {
  return new ComplementaryCertificationBadge({
    id,
    label,
    level,
    imageUrl,
    minimumEarnedPix,
    createdAt,
    complementaryCertificationId,
    badgeId,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    detachedAt,
    createdBy,
  });
};

export { buildComplementaryCertificationBadge };
