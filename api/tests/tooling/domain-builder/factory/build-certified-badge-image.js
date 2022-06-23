const CertifiedBadgeImage = require('../../../../lib/domain/read-models/CertifiedBadgeImage');

const buildCertifiedBadgeImage = function buildCertifiedBadgeImage({
  path = 'path',
  isTemporaryBadge = false,
  levelName,
  message = null,
} = {}) {
  return new CertifiedBadgeImage({
    path,
    isTemporaryBadge,
    levelName,
    message,
  });
};

buildCertifiedBadgeImage.temporary = function ({ path, levelName, message }) {
  return buildCertifiedBadgeImage({ path, levelName, isTemporaryBadge: true, message });
};

buildCertifiedBadgeImage.notTemporary = function ({ path }) {
  return buildCertifiedBadgeImage({ path, isTemporaryBadge: false });
};

module.exports = buildCertifiedBadgeImage;
