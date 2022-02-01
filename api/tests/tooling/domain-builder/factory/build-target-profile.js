const buildSkill = require('./build-skill');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

module.exports = function buildTargetProfile({
  id = 123,
  name = 'Profil cible super cool',
  imageUrl = 'ImageURL',
  isPublic = true,
  isSimplifiedAccess = false,
  skills = [buildSkill()],
  ownerOrganizationId = 456,
  outdated = false,
  stages = [],
  badges,
} = {}) {
  return new TargetProfile({
    id,
    name,
    imageUrl,
    isPublic,
    isSimplifiedAccess,
    skills,
    ownerOrganizationId,
    outdated,
    stages,
    badges,
  });
};
