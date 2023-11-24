import { BadgeToAttach } from '../../../../src/certification/complementary-certification/domain/models/BadgeToAttach.js';

const buildBadgeToAttach = function ({
  level = 1,
  complementaryCertificationId,
  badgeId,
  imageUrl = 'http://badge-image-url.fr',
  label = 'Label par defaut',
  certificateMessage = null,
  temporaryCertificateMessage = null,
  stickerUrl = 'http://stiker-url.fr',
  createdBy = null,
  minimumEarnedPix = 0,
}) {
  return new BadgeToAttach({
    level,
    complementaryCertificationId,
    badgeId,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    createdBy,
    minimumEarnedPix,
  });
};

export { buildBadgeToAttach };
