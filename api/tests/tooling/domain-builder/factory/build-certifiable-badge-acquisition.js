const CertifiableBadgeAcquisition = require('../../../../lib/domain/models/CertifiableBadgeAcquisition');

const buildCertifiableBadgeAcquisition = function ({
  badgeId = 123,
  badgeKey = 'PIX_DROIT_MAITRE',
  campaignId = 456,
  complementaryCertificationId = 789,
  complementaryCertificationKey = 'PIX_DROIT',
  complementaryCertificationBadgeId = 159,
  complementaryCertificationBadgeImageUrl = 'image/droit.svg',
  complementaryCertificationBadgeLabel = 'Pix+ droit maitre',
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
  });
};

module.exports = buildCertifiableBadgeAcquisition;
