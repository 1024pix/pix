const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({
  id = 123,
  name = 'Profil cible super cool',
  imageUrl = 'ImageURL',
  isPublic = true,
  isSimplifiedAccess = false,
  ownerOrganizationId = 456,
  outdated = false,
  stages = [],
  badges = [],
} = {}) {
  return new TargetProfile({
    id,
    name,
    imageUrl,
    isPublic,
    isSimplifiedAccess,
    ownerOrganizationId,
    outdated,
    stages,
    badges,
  });
};
