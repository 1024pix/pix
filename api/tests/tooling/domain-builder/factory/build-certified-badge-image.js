const CertifiedBadgeImage = require('../../../../lib/domain/read-models/CertifiedBadgeImage');

const buildCertifiedBadgeImage = function buildCertifiedBadgeImage({
  path = 'path',
  isTemporaryBadge = false,
  levelName,
} = {}) {
  return new CertifiedBadgeImage({
    path,
    isTemporaryBadge,
    levelName,
  });
};

buildCertifiedBadgeImage.temporary = function ({ path, levelName }) {
  return buildCertifiedBadgeImage({ path, levelName, isTemporaryBadge: true });
};

buildCertifiedBadgeImage.notTemporary = function ({ path }) {
  return buildCertifiedBadgeImage({ path, isTemporaryBadge: false });
};

module.exports = buildCertifiedBadgeImage;
