import { SCO_MANAGING_ORGANIZATION_ID } from '../common/constants.js';
import { createBadge, createStages, createTargetProfile } from '../common/tooling/target-profile-tooling.js';
import {
  BADGES_CAMP_ID,
  BADGES_CAMPAIGN_UNACQUIRED_ID,
  BADGES_TUBES_CAMP_ID,
  TARGET_PROFILE_BADGES_STAGES_ID,
  TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
} from './constants.js';

function _buildConfigTargetProfile({ countTubes = 2, minLevel = 1, maxLevel = 2, chooseCoreFramework = true }) {
  return {
    frameworks: [
      {
        chooseCoreFramework,
        countTubes,
        minLevel,
        maxLevel,
      },
    ],
  };
}

async function _createTargetProfileWithoutBadgesStages(databaseBuilder) {
  await createTargetProfile({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
    ownerOrganizationId: null,
    name: 'Pix (Niv3 ~ 5) - NO Badges - NO Stages',
    isSimplifiedAccess: false,
    description: 'Pix (Niv3 ~ 5)',
    configTargetProfile: _buildConfigTargetProfile({ minLevel: 3, maxLevel: 5 }),
  });
}

async function _createTargetProfileWithBadgesStages(databaseBuilder) {
  const { targetProfileId, cappedTubesDTO } = await createTargetProfile({
    databaseBuilder,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
    ownerOrganizationId: SCO_MANAGING_ORGANIZATION_ID,
    name: 'Pix (Niv1 ~ 5) - Badges - Stages',
    isSimplifiedAccess: false,
    description: 'Pix (Niv1 ~ 5)',
    configTargetProfile: _buildConfigTargetProfile({ countTubes: 2, minLevel: 1, maxLevel: 5 }),
  });

  await createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: BADGES_TUBES_CAMP_ID,
    altMessage: '1 RT double critère Campaign & Tubes',
    imageUrl: 'https://images.pix.fr/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
    message: '1 RT double critère Campaign & Tubes',
    title: '1 RT double critère Campaign & Tubes',
    key: `SOME_KEY_FOR_RT_${BADGES_TUBES_CAMP_ID}`,
    isCertifiable: false,
    isAlwaysVisible: true,
    configBadge: {
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
    },
  });

  await createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: BADGES_CAMP_ID,
    altMessage: '1 RT simple critère Campaign',
    imageUrl: 'https://images.pix.fr/badges/Pix_plus_Droit-%20Pret-certif_Bronze--Initie.svg',
    message: '1 RT simple critère Campaign',
    title: '1 RT simple critère Campaign',
    key: `SOME_KEY_FOR_RT_${BADGES_CAMP_ID}`,
    isCertifiable: false,
    isAlwaysVisible: true,
    configBadge: {
      criteria: [
        {
          scope: 'CampaignParticipation',
          threshold: 20,
        },
      ],
    },
  });
  await createBadge({
    databaseBuilder,
    targetProfileId,
    cappedTubesDTO,
    badgeId: BADGES_CAMPAIGN_UNACQUIRED_ID,
    altMessage: 'Badge DadiCool',
    imageUrl: 'https://images.pix.fr/badges/abcpix_je_navigue_sur_internet.svg',
    message: '1 RT Campaign 100',
    title: '1 RT Campaign 100',
    key: `SOME_KEY_FOR_RT_${BADGES_CAMPAIGN_UNACQUIRED_ID}`,
    isCertifiable: false,
    isAlwaysVisible: true,
    configBadge: {
      criteria: [
        {
          scope: 'CampaignParticipation',
          threshold: 100,
        },
      ],
    },
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
