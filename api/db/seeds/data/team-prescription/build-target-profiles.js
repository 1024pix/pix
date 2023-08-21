import { createTargetProfile } from '../common/tooling/target-profile-tooling.js';
import { SCO_ORGANIZATION_ID, TARGET_PROFILE_ID } from './constants.js';

async function _createTargetProfile(databaseBuilder) {
  const configTargetProfile = {
    frameworks: [
      {
        chooseCoreFramework: true,
        countTubes: 5,
        minLevel: 3,
        maxLevel: 5,
      },
    ],
  };

  await createTargetProfile({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_ID,
    name: 'Profil cible Pur Pix (Niv3 ~ 5)',
    ownerOrganizationId: SCO_ORGANIZATION_ID,
    isPublic: true,
    isSimplifiedAccess: false,
    description: 'Profil cible pur pix (Niv3 ~ 5)',
    configTargetProfile,
  });
}

export async function buildTargetProfiles(databaseBuilder) {
  await _createTargetProfile(databaseBuilder);
  return databaseBuilder.commit();
}
