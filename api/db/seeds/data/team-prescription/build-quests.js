import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { ATTESTATIONS } from '../../../../src/profile/domain/constants.js';
import { REWARD_TYPES } from '../../../../src/quest/domain/constants.js';
import {
  CRITERION_COMPARISONS,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../../../src/quest/domain/models/Quest.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';
import { knex } from '../../../knex-database-connection.js';
import {
  ADMINISTRATION_TEAM_SOLO_ID,
  AEFE_TAG,
  COUNTRY_FRANCE_CODE,
  FEATURE_ATTESTATIONS_MANAGEMENT_ID,
  PRO_ORGANIZATION_ID,
  SCO_ORGANIZATION_ID,
  USER_ID_ADMIN_ORGANIZATION,
  USER_ID_MEMBER_ORGANIZATION,
} from '../common/constants.js';
import { TARGET_PROFILE_BADGES_STAGES_ID, TARGET_PROFILE_NO_BADGES_NO_STAGES_ID } from './constants.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

async function buildParenthoodQuest(databaseBuilder) {
  const { id: rewardId } = databaseBuilder.factory.buildAttestation({
    templateName: 'parenthood-attestation-template',
    key: ATTESTATIONS.PARENTHOOD,
  });

  const cappedTubes = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', TARGET_PROFILE_NO_BADGES_NO_STAGES_ID);

  databaseBuilder.factory.buildQuest({
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
    successRequirements: [
      {
        requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
        data: {
          cappedTubes,
          threshold: 50,
        },
      },
    ],
    eligibilityRequirements: [
      {
        requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          targetProfileId: {
            data: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
          status: {
            data: [CampaignParticipationStatuses.SHARED, CampaignParticipationStatuses.TO_SHARE],
            comparison: CRITERION_COMPARISONS.ONE_OF,
          },
        },
      },
    ],
  });
  return rewardId;
}

const USERS = [
  {
    firstName: 'attestation-success',
    lastName: 'attestation',
    email: 'attestation-success@example.net',
  },
  {
    firstName: 'attestation-success-shared',
    lastName: 'attestation',
    email: 'attestation-success-shared@example.net',
  },
  {
    firstName: 'attestation-failed',
    lastName: 'attestation',
    email: 'attestation-failed@example.net',
  },
  {
    firstName: 'attestation-pending',
    lastName: 'attestation',
    email: 'attestation-pending@example.net',
  },
  {
    firstName: 'attestation-blank',
    lastName: 'attestation',
    email: 'attestation-blank@example.net',
  },
  {
    firstName: 'Disabled',
    lastName: 'Attestation',
    email: 'disabled-attestation@example.net',
  },
];
const ORGANIZATION = {
  name: 'Attestation',
  type: 'SCO',
  isManagingStudents: true,
  administrationTeamId: ADMINISTRATION_TEAM_SOLO_ID,
  countryCode: COUNTRY_FRANCE_CODE,
};

const CAMPAIGN = [
  { code: 'ATTEST001', multipleSendings: true, name: 'campagne attestation 1' },
  { code: 'ATTEST002', multipleSendings: true, name: 'campagne attestation 2' },
  { code: 'ATTEST003', multipleSendings: true, name: 'campagne attestation 3' },
];

const TARGET_PROFILE_TUBES = [
  [
    {
      id: 'tube2e715GxaaWzNK6',
      level: 2,
    },
    {
      id: 'recs1vdbHxX8X55G9',
      level: 2,
    },
    {
      id: 'recBbCIEKgrQi7eb6',
      level: 2,
    },
    {
      id: 'recpe7Y8Wq2D56q6I',
      level: 2,
    },
  ],
  [
    {
      id: 'tube2e715GxaaWzNK6',
      level: 2,
    },
    {
      id: 'recs1vdbHxX8X55G9',
      level: 2,
    },
  ],
  [
    {
      id: 'recBbCIEKgrQi7eb6',
      level: 2,
    },
    {
      id: 'recpe7Y8Wq2D56q6I',
      level: 2,
    },
  ],
];

const CAMPAIGN_SKILLS = [
  ['reczOCGv8pz976Acl', 'skill1QAVccgLO16Rx8', 'skill2wQfMYrOHlL6HI', 'skillX5Rpk2rucNfnF'],
  ['skill1QAVccgLO16Rx8', 'skill2wQfMYrOHlL6HI', 'skillX5Rpk2rucNfnF'],
  ['reczOCGv8pz976Acl'],
];

const buildUsers = (databaseBuilder) => USERS.map((user) => databaseBuilder.factory.buildUser.withRawPassword(user));

const buildOrganization = (databaseBuilder) => databaseBuilder.factory.buildOrganization(ORGANIZATION);

const buildOrganizationLearners = (databaseBuilder, organization, users) =>
  users.map((user) =>
    databaseBuilder.factory.buildOrganizationLearner({
      ...user,
      organizationId: organization.id,
    }),
  );

const buildCampaignParticipations = (databaseBuilder, users) =>
  users.map(async ({ user, organizationLearner, status, sharedAt, campaignId }) => {
    const stages = await databaseBuilder.knex('stages').where({ targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID });
    const stageZero = stages.find((stage) => stage.level === 0 || stage.threshold === 0);

    const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({
      userId: user.id,
      campaignId,
      masteryRate: 1,
      organizationLearnerId: organizationLearner.id,
      status,
      sharedAt,
    });
    databaseBuilder.factory.buildAssessment({
      userId: user.id,
      type: Assessment.types.CAMPAIGN,
      campaignParticipationId: participationId,
    });

    databaseBuilder.factory.buildStageAcquisition({
      stageId: stageZero.id,
      campaignParticipationId: participationId,
    });
  });

const buildSixthGradeQuests = async (
  databaseBuilder,
  rewardId,
  [firstTargetProfile, secondTargetProfile, thirdTargetProfile],
) => {
  const questEligibilityRequirements = [
    {
      requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
      data: {
        type: {
          data: 'SCO',
          comparison: CRITERION_COMPARISONS.EQUAL,
        },
      },
      comparison: REQUIREMENT_COMPARISONS.ALL,
    },
    {
      requirement_type: REQUIREMENT_TYPES.OBJECT.ORGANIZATION,
      data: {
        isManagingStudents: {
          data: true,
          comparison: CRITERION_COMPARISONS.EQUAL,
        },
        tags: {
          data: [AEFE_TAG.name],
          comparison: CRITERION_COMPARISONS.ALL,
        },
      },
      comparison: REQUIREMENT_COMPARISONS.ONE_OF,
    },
    {
      requirement_type: REQUIREMENT_TYPES.COMPOSE,
      data: [
        {
          requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
          data: {
            targetProfileId: {
              data: firstTargetProfile.id,
              comparison: CRITERION_COMPARISONS.EQUAL,
            },
          },
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
        {
          requirement_type: REQUIREMENT_TYPES.COMPOSE,
          data: [
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
              data: {
                targetProfileId: {
                  data: thirdTargetProfile.id,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
              comparison: REQUIREMENT_COMPARISONS.ALL,
            },
            {
              requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
              data: {
                targetProfileId: {
                  data: secondTargetProfile.id,
                  comparison: CRITERION_COMPARISONS.EQUAL,
                },
              },
              comparison: REQUIREMENT_COMPARISONS.ALL,
            },
          ],
          comparison: REQUIREMENT_COMPARISONS.ALL,
        },
      ],
      comparison: REQUIREMENT_COMPARISONS.ONE_OF,
    },
  ];

  const capptedTubesFirstTargetProfile = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', firstTargetProfile.id);
  const capptedTubesSecondTargetProfile = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', secondTargetProfile.id);
  const capptedTubesThirdTargetProfile = await knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where('targetProfileId', thirdTargetProfile.id);

  const questSuccessRequirements = [
    {
      requirement_type: REQUIREMENT_TYPES.COMPOSE,
      data: [
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: {
            cappedTubes: capptedTubesFirstTargetProfile,
            threshold: 50,
          },
        },
        {
          requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
          data: {
            cappedTubes: [capptedTubesSecondTargetProfile, capptedTubesThirdTargetProfile].flat(),
            threshold: 50,
          },
        },
      ],
      comparison: REQUIREMENT_COMPARISONS.ONE_OF,
    },
  ];

  databaseBuilder.factory.buildQuest({
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
    eligibilityRequirements: questEligibilityRequirements,
    successRequirements: questSuccessRequirements,
  });
};

const buildTargetProfile = (databaseBuilder, organization, index, tubes) => {
  const targetProfile = databaseBuilder.factory.buildTargetProfile({
    description: `parcours attestation 6 eme numero ${index + 1}`,
    name: `parcours attestation 6 eme numero ${index + 1}`,
    ownerOrganizationId: organization.id,
  });
  tubes.map(({ id, level }) =>
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: targetProfile.id,
      tubeId: id,
      level,
    }),
  );

  return targetProfile;
};

const buildTargetProfiles = (databaseBuilder, organization) =>
  TARGET_PROFILE_TUBES.map((tubes, index) => buildTargetProfile(databaseBuilder, organization, index, tubes));

const buildCampaigns = (databaseBuilder, organization, targetProfiles) =>
  targetProfiles.map((targetProfile, index) => {
    const { id: campaignId } = databaseBuilder.factory.buildCampaign({
      ...CAMPAIGN[index],
      targetProfileId: targetProfile.id,
      organizationId: organization.id,
      title: `Attestation 6ème ${index + 1}`,
    });

    CAMPAIGN_SKILLS[index].map((skillId) =>
      databaseBuilder.factory.buildCampaignSkill({
        campaignId,
        skillId,
      }),
    );

    return campaignId;
  });

export const buildQuests = async (databaseBuilder) => {
  // Create USERS
  const [successUser, successSharedUser, failedUser, pendingUser, blankUser, disabledUser] =
    buildUsers(databaseBuilder);

  // Create organization
  const organization = buildOrganization(databaseBuilder);

  // Add admin-orga@example.net as Admin in organization
  databaseBuilder.factory.buildMembership({
    organizationId: organization.id,
    organizationRole: Membership.roles.ADMIN,
    userId: USER_ID_ADMIN_ORGANIZATION,
  });

  // Add member-orga@example.net as Member in organization
  databaseBuilder.factory.buildMembership({
    organizationId: organization.id,
    organizationRole: Membership.roles.MEMBER,
    userId: USER_ID_MEMBER_ORGANIZATION,
  });

  // Associate attestation feature to organization
  databaseBuilder.factory.buildOrganizationFeature({
    organizationId: organization.id,
    featureId: FEATURE_ATTESTATIONS_MANAGEMENT_ID,
    params: JSON.stringify([ATTESTATIONS.SIXTH_GRADE]),
  });

  // Associate tag to organization
  databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: AEFE_TAG.id });

  // Create organizationLearners
  const organizationLearnersData = [
    { userId: successUser.id, division: '6emeA', firstName: 'attestation-success', lastName: 'attestation-success' },
    {
      userId: successSharedUser.id,
      division: '6emeA',
      firstName: 'attestation-success-shared',
      lastName: 'attestation-success-shared',
    },
    { userId: failedUser.id, division: '6emeA', firstName: 'attestation-failed', lastName: 'attestation-failed' },
    { userId: pendingUser.id, division: '6emeB', firstName: 'attestation-pending', lastName: 'attestation-pending' },
    { userId: disabledUser.id, division: '6emeB', firstName: 'Disabled', lastName: 'attestation', isDisabled: true },
    { userId: blankUser.id, division: '6emeB', firstName: 'attestation-blank', lastName: 'attestation-blank' },
  ];

  const [
    successOrganizationLearner,
    successSharedOrganizationLearner,
    failedOrganizationLearner,
    pendingOrganizationLearner,
    disabledOrganizationLearner,
  ] = buildOrganizationLearners(databaseBuilder, organization, organizationLearnersData);

  // Create target profile
  const targetProfiles = buildTargetProfiles(databaseBuilder, organization);

  await databaseBuilder.commit();
  // Create campaigns
  const campaigns = buildCampaigns(databaseBuilder, organization, targetProfiles);

  // Create campaignParticipations
  buildCampaignParticipations(databaseBuilder, [
    {
      user: successUser,
      campaignId: campaigns[0],
      organizationLearner: successOrganizationLearner,
      sharedAt: null,
      status: CampaignParticipationStatuses.TO_SHARE,
    },
    {
      user: successUser,
      campaignId: campaigns[1],
      organizationLearner: successOrganizationLearner,
      sharedAt: null,
      status: CampaignParticipationStatuses.TO_SHARE,
    },
    {
      user: successUser,
      campaignId: campaigns[2],
      organizationLearner: successOrganizationLearner,
      sharedAt: null,
      status: CampaignParticipationStatuses.TO_SHARE,
    },
    {
      user: successSharedUser,
      campaignId: campaigns[0],
      organizationLearner: successSharedOrganizationLearner,
    },
    {
      user: failedUser,
      campaignId: campaigns[0],
      organizationLearner: failedOrganizationLearner,
    },
    {
      user: pendingUser,
      campaignId: campaigns[0],
      organizationLearner: pendingOrganizationLearner,
    },
    {
      user: disabledUser,
      campaignId: campaigns[0],
      organizationLearner: disabledOrganizationLearner,
    },
  ]);

  // Create attestation quest
  const { id: rewardId } = databaseBuilder.factory.buildAttestation({
    templateName: 'sixth-grade-attestation-template',
    key: ATTESTATIONS.SIXTH_GRADE,
  });

  // Create quests
  await buildSixthGradeQuests(databaseBuilder, rewardId, targetProfiles);
  const parenthoodAttestationId = await buildParenthoodQuest(databaseBuilder);

  // Create reward for success user
  databaseBuilder.factory.buildProfileReward({
    userId: successUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
  });

  const { id: sharedProfileRewardId } = databaseBuilder.factory.buildProfileReward({
    userId: successSharedUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
  });

  const { id: disabledUserProfileRewardId } = databaseBuilder.factory.buildProfileReward({
    userId: disabledUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
  });

  // Create link between profile reward and organization
  databaseBuilder.factory.buildOrganizationsProfileRewards({
    organizationId: organization.id,
    profileRewardId: sharedProfileRewardId,
  });

  databaseBuilder.factory.buildOrganizationsProfileRewards({
    organizationId: organization.id,
    profileRewardId: disabledUserProfileRewardId,
  });

  // Insert job count in temporary storage for pending user
  await profileRewardTemporaryStorage.increment(pendingUser.id);

  // Create learner with profile rewards for SCO organization without import
  const { id: otherUserId } = databaseBuilder.factory.buildUser({ firstName: 'Alex', lastName: 'Tension' });
  databaseBuilder.factory.buildOrganizationLearner({
    organizationId: SCO_ORGANIZATION_ID,
    userId: otherUserId,
  });
  const { id: otherUserProfileRewardId } = databaseBuilder.factory.buildProfileReward({
    userId: otherUserId,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
  });
  databaseBuilder.factory.buildOrganizationsProfileRewards({
    organizationId: SCO_ORGANIZATION_ID,
    profileRewardId: otherUserProfileRewardId,
  });

  const attestationsData = [
    { templateName: 'edu-incontournables-attestation-template', key: 'EDUINCONTOURNABLES' },
    { templateName: 'edu-documents-attestation-template', key: 'EDUDOC' },
    { templateName: 'edu-veille-attestation-template', key: 'EDUVEILLE' },
    { templateName: 'edu-culture-numerique-attestation-template', key: 'EDUCULTURENUM' },
    { templateName: 'edu-ressources-attestation-template', key: 'EDURESSOURCES' },
    { templateName: 'edu-supports-attestation-template', key: 'EDUSUPPORT' },
    { templateName: 'edu-securite-attestation-template', key: 'EDUSECU' },
    { templateName: 'edu-collaborer-attestation-template', key: 'EDUCOLLAB' },
    { templateName: 'edu-ia-attestation-template', key: 'EDUIA' },
    { templateName: 'minarm-attestation-template', key: 'MINARM' },
  ];

  const educationAttestations = attestationsData.map(({ templateName, key }) =>
    databaseBuilder.factory.buildAttestation({ templateName, key }),
  );

  // Create user with all available attestations
  const allAttestationsUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'All',
    lastName: 'Attestations',
    email: 'all-attestations@example.net',
  });

  // Create profile rewards for all available attestation types using existing attestations
  const allAttestationIds = [
    rewardId, // sixth-grade attestation
    parenthoodAttestationId, // parenthood attestation
  ];

  allAttestationIds.forEach((attestationId) => {
    databaseBuilder.factory.buildProfileReward({
      userId: allAttestationsUser.id,
      rewardType: REWARD_TYPES.ATTESTATION,
      rewardId: attestationId,
    });
  });

  educationAttestations.forEach((attestation) => {
    const rewardId = databaseBuilder.factory.buildProfileReward({
      userId: allAttestationsUser.id,
      rewardType: REWARD_TYPES.ATTESTATION,
      rewardId: attestation.id,
    }).id;

    if (['MINARM', 'EDUSECU'].includes(attestation.key)) {
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        userId: allAttestationsUser.id,
        organizationId: PRO_ORGANIZATION_ID,
        profileRewardId: rewardId,
      });
    }
  });
};
