import { TargetProfile } from '../../../../src/shared/domain/models/TargetProfile.js';

const buildTargetProfile = function ({
  id = 123,
  name = 'Profil cible super cool',
  imageUrl = 'ImageURL',
  isSimplifiedAccess = false,
  outdated = false,
  stages = [],
  badges = [],
} = {}) {
  return new TargetProfile({
    id,
    name,
    imageUrl,
    isSimplifiedAccess,
    outdated,
    stages,
    badges,
  });
};

export { buildTargetProfile };
