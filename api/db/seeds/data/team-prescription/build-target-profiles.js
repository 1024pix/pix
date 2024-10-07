import { SCO_MANAGING_ORGANIZATION_ID } from '../common/constants.js';
import { createBadge, createStages, createTargetProfile } from '../common/tooling/target-profile-tooling.js';
import {
  BADGES_CAMP_ID,
  BADGES_TUBES_CAMP_ID,
  TARGET_PROFILE_BADGES_STAGES_ID,
  TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
} from './constants.js';

async function _createTargetProfileWithoutBadgesStages(databaseBuilder) {
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
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    ownerOrganizationId: null,
    name: 'Pix (Niv3 ~ 5) - NO Badges - NO Stages',
    isSimplifiedAccess: false,
    description: 'Pix (Niv3 ~ 5)',
    configTargetProfile,
  });
}

async function _createTargetProfileWithBadgesStages(databaseBuilder) {
  const configTargetProfile = {
    frameworks: [
      {
        chooseCoreFramework: true,
        countTubes: 10,
        minLevel: 1,
        maxLevel: 5,
      },
    ],
  };

  const configBadge = {
    criteria: [
      {
        scope: 'CappedTubes',
        threshold: 60,
      },
      {
        scope: 'CampaignParticipation',
        threshold: 50,
      },
    ],
  };
  const { targetProfileId, cappedTubesDTO } = await createTargetProfile({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    ownerOrganizationId: SCO_MANAGING_ORGANIZATION_ID,
    name: 'Pix (Niv1 ~ 5) - Badges - Stages',
    isSimplifiedAccess: false,
    description: 'Pix (Niv1 ~ 5)',
    configTargetProfile,
  });

  await createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: BADGES_TUBES_CAMP_ID,
    altMessage: '1 RT double critère Campaign & Tubes',
    imageUrl: 'some_image.svg',
    message: '1 RT double critère Campaign & Tubes',
    title: '1 RT double critère Campaign & Tubes',
    key: `SOME_KEY_FOR_RT_${BADGES_TUBES_CAMP_ID}`,
    isCertifiable: false,
    isAlwaysVisible: true,
    configBadge,
  });
  await createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: BADGES_CAMP_ID,
    altMessage: '1 RT simple critère Campaign',
    imageUrl: 'some_other_image.svg',
    message: '1 RT simple critère Campaign',
    title: '1 RT simple critère Campaign',
    key: `SOME_KEY_FOR_RT_${BADGES_CAMP_ID}`,
    isCertifiable: false,
    isAlwaysVisible: true,
    configBadge,
  });
  await createStages({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    type: 'LEVEL',
    countStages: 5,
    includeFirstSkill: true,
    shouldInsertPrescriberTitleAndDescription: true,
  });
}

export async function buildTargetProfiles(databaseBuilder) {
  await _createTargetProfileWithoutBadgesStages(databaseBuilder);
  await _createTargetProfileWithBadgesStages(databaseBuilder);
  return databaseBuilder.commit();
}
