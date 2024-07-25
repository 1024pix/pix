import { CertifiableBadgeAcquisition } from '../../../../src/shared/domain/models/CertifiableBadgeAcquisition.js';

const buildCertifiableBadgeAcquisition = function ({
  badgeId = 123,
  badgeKey = 'PIX_DROIT_MAITRE',
  campaignId = 456,
  complementaryCertificationId = 789,
  complementaryCertificationKey = 'PIX_DROIT',
  complementaryCertificationBadgeId = 159,
  complementaryCertificationBadgeImageUrl = 'image/droit.svg',
  complementaryCertificationBadgeLabel = 'Pix+ droit avance',
  isOutdated = false,
} = {}) {
  return new CertifiableBadgeAcquisition({
    badgeId,
    badgeKey,
    campaignId,
    complementaryCertificationId,
    complementaryCertificationKey,
    complementaryCertificationBadgeId,
    complementaryCertificationBadgeImageUrl,
    complementaryCertificationBadgeLabel,
    isOutdated,
  });
};

export { buildCertifiableBadgeAcquisition };
