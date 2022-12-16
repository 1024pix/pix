const buildBadge = require('./build-badge');
const buildComplementaryCertification = require('./build-complementary-certification');
const CertifiableBadgeAcquisition = require('../../../../lib/domain/models/CertifiableBadgeAcquisition');

const buildCertifiableBadgeAcquisition = function ({
  id = 123,
  userId = 456,
  campaignId = 456,
  badge,
  complementaryCertification,
} = {}) {
  badge = badge || buildBadge({ id: 1234 });
  complementaryCertification = complementaryCertification || buildComplementaryCertification();
  return new CertifiableBadgeAcquisition({
    id,
    userId,
    campaignId,
    badge,
    complementaryCertification,
  });
};

module.exports = buildCertifiableBadgeAcquisition;
