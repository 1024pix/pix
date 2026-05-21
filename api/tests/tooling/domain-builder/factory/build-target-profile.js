import { TargetProfile } from '../../../../src/shared/domain/models/TargetProfile.js';

const buildTargetProfile = function ({
  id = 123,
  name = 'Profil cible super cool',
  category = 'category',
  internalName = 'Profil cible super cool (interne)',
  imageUrl = 'ImageURL',
  isSimplifiedAccess = false,
  estimatedTime,
  outdated = false,
  stages = [],
  badges = [],
  frameworks = [],
  description = 'La description du profil cible',
} = {}) {
  return new TargetProfile({
    id,
    category,
    description,
    name,
    estimatedTime,
    internalName,
    imageUrl,
    isSimplifiedAccess,
    outdated,
    stages,
    badges,
    frameworks,
  });
};

export { buildTargetProfile };
