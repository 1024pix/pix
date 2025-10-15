import {
  CampaignParticipationStatuses,
  CombinedCourseParticipationStatuses,
} from '../../../../src/prescription/shared/domain/constants.js';
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
import {
  ADMINISTRATION_TEAM_SOLO_ID,
  AEFE_TAG,
  FEATURE_ATTESTATIONS_MANAGEMENT_ID,
  PRO_ORGANIZATION_ID,
  SCO_ORGANIZATION_ID,
  USER_ID_ADMIN_ORGANIZATION,
  USER_ID_MEMBER_ORGANIZATION,
} from '../common/constants.js';
import { QUEST_OFFSET, TARGET_PROFILE_BADGES_STAGES_ID, TARGET_PROFILE_NO_BADGES_NO_STAGES_ID } from './constants.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');
const firstTrainingfrFRId = QUEST_OFFSET + 1;
const secondTrainingfrFRId = QUEST_OFFSET + 2;
const firstTrainingFRId = QUEST_OFFSET + 3;
const secondTrainingFRId = QUEST_OFFSET + 4;

function buildCombinedCourseQuest(databaseBuilder, organizationId) {
  const targetProfile = buildTargetProfile(databaseBuilder, { id: organizationId }, 0, TARGET_PROFILE_TUBES[0]);
  const campaign = databaseBuilder.factory.buildCampaign({
    name: 'Je teste mes compétences',
    organizationId,
    code: 'CODE123',
    targetProfileId: targetProfile.id,
    customResultPageButtonText: 'Continuer',
    customResultPageButtonUrl: '/parcours/COMBINIX1',
  });
  CAMPAIGN_SKILLS[0].map((skillId) =>
    databaseBuilder.factory.buildCampaignSkill({
      campaignId: campaign.id,
      skillId,
    }),
  );
  databaseBuilder.factory.buildTraining({
    id: firstTrainingfrFRId,
    type: 'modulix',
    title: 'Demo combinix 1',
    link: '/modules/demo-combinix-1',
    locale: 'fr-fr',
  });
  databaseBuilder.factory.buildTraining({
    id: secondTrainingfrFRId,
    type: 'modulix',
    title: 'Demo combinix 2',
    link: '/modules/demo-combinix-2',
    locale: 'fr-fr',
  });

  // For now, we make doubles of the previous trainings because training does not accept multiple locales
  // The behaviour is the same in production

  databaseBuilder.factory.buildTraining({
    id: firstTrainingFRId,
    type: 'modulix',
    title: 'Demo combinix 1',
    link: '/modules/demo-combinix-1',
    locale: 'fr',
  });
  databaseBuilder.factory.buildTraining({
    id: secondTrainingFRId,
    type: 'modulix',
    title: 'Demo combinix 2',
    link: '/modules/demo-combinix-2',
    locale: 'fr',
  });

  databaseBuilder.factory.buildCombinedCourse({
    name: 'Combinix',
    code: 'COMBINIX1',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    illustration: 'https://assets.pix.org/combined-courses/illu_ia.svg',
    organizationId,
    eligibilityRequirements: [],
    successRequirements: [
      {
        requirement_type: 'campaignParticipations',
        comparison: 'all',
        data: {
          campaignId: {
            data: campaign.id,
            comparison: 'equal',
          },
          status: {
            data: 'SHARED',
            comparison: 'equal',
          },
        },
      },
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
            comparison: 'equal',
          },
          isTerminated: {
            data: true,
            comparison: 'equal',
          },
        },
      },
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: 'f32a2238-4f65-4698-b486-15d51935d335',
            comparison: 'equal',
          },
          isTerminated: {
            data: true,
            comparison: 'equal',
          },
        },
      },
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: 'ab82925d-4775-4bca-b513-4c3009ec5886',
            comparison: 'equal',
          },
          isTerminated: {
            data: true,
            comparison: 'equal',
          },
        },
      },
    ],
  });
  const trainingTriggerIds = [
    databaseBuilder.factory.buildTrainingTrigger({
      trainingId: firstTrainingfrFRId,
      threshold: 0,
      type: 'prerequisite',
    }).id,
    databaseBuilder.factory.buildTrainingTrigger({ trainingId: firstTrainingfrFRId, threshold: 50, type: 'goal' }).id,
    databaseBuilder.factory.buildTrainingTrigger({
      trainingId: secondTrainingfrFRId,
      threshold: 50,
      type: 'prerequisite',
    }).id,
    databaseBuilder.factory.buildTrainingTrigger({ trainingId: secondTrainingfrFRId, threshold: 100, type: 'goal' }).id,
    databaseBuilder.factory.buildTrainingTrigger({
      trainingId: firstTrainingFRId,
      threshold: 0,
      type: 'prerequisite',
    }).id,
    databaseBuilder.factory.buildTrainingTrigger({ trainingId: firstTrainingFRId, threshold: 50, type: 'goal' }).id,
    databaseBuilder.factory.buildTrainingTrigger({
      trainingId: secondTrainingFRId,
      threshold: 51,
      type: 'prerequisite',
    }).id,
    databaseBuilder.factory.buildTrainingTrigger({ trainingId: secondTrainingFRId, threshold: 100, type: 'goal' }).id,
  ];
  trainingTriggerIds.forEach((trainingTriggerId) =>
    TARGET_PROFILE_TUBES[0].map((tube) =>
      databaseBuilder.factory.buildTrainingTriggerTube({ trainingTriggerId, tubeId: tube.id, level: tube.level }),
    ),
  );
}

function buildProCombinedCourseQuest(databaseBuilder, organizationId) {
  const targetProfile = buildTargetProfile(databaseBuilder, { id: organizationId }, 0, TARGET_PROFILE_TUBES[0]);
  const campaign = databaseBuilder.factory.buildCampaign({
    name: 'Je teste mes compétences',
    organizationId,
    code: 'CODEABC',
    targetProfileId: targetProfile.id,
    customResultPageButtonText: 'Continuer',
    customResultPageButtonUrl: '/parcours/COMBINIX2',
  });
  CAMPAIGN_SKILLS[0].map((skillId) =>
    databaseBuilder.factory.buildCampaignSkill({
      campaignId: campaign.id,
      skillId,
    }),
  );

  const combinix2 = databaseBuilder.factory.buildCombinedCourse({
    name: 'Combinix',
    code: 'COMBINIX2',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    illustration: 'https://assets.pix.org/combined-courses/illu_ia.svg',
    organizationId,
    eligibilityRequirements: [],
    successRequirements: [
      {
        requirement_type: 'campaignParticipations',
        comparison: 'all',
        data: {
          campaignId: {
            data: campaign.id,
            comparison: 'equal',
          },
          status: {
            data: 'SHARED',
            comparison: 'equal',
          },
        },
      },
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: '65b761ab-3ebd-44a9-84b7-8b5e151aee76',
            comparison: 'equal',
          },
          isTerminated: {
            data: true,
            comparison: 'equal',
          },
        },
      },
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: 'd4c4a2b2-0046-471d-ad9c-15f9cfc8f1f6',
            comparison: 'equal',
          },
          isTerminated: {
            data: true,
            comparison: 'equal',
          },
        },
      },
      {
        requirement_type: 'passages',
        comparison: 'all',
        data: {
          moduleId: {
            data: 'ab82925d-4775-4bca-b513-4c3009ec5886',
            comparison: 'equal',
          },
          isTerminated: {
            data: true,
            comparison: 'equal',
          },
        },
      },
    ],
  });

  const bernardUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Bernard',
    lastName: 'Peur',
    email: 'bernard.peur@example.net',
  });
  const bernardLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Bernard',
    lastName: 'Peur',
    userId: bernardUser.id,
    organizationId,
  });
  databaseBuilder.factory.buildCombinedCourseParticipation({
    combinedCourseId: combinix2.id,
    questId: combinix2.questId,
    organizationId,
    organizationLearnerId: bernardLearner.id,
    status: CombinedCourseParticipationStatuses.STARTED,
  });
  const participationBernard = databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign.id,
    userId: bernardUser.id,
    organizationLearnerId: bernardLearner.id,
    status: CampaignParticipationStatuses.STARTED,
  });
  databaseBuilder.factory.buildAssessment({
    userId: bernardUser.id,
    courseId: null,
    state: Assessment.states.STARTED,
    competenceId: null,
    lastQuestionState: null,
    type: Assessment.types.CAMPAIGN,
    campaignParticipationId: participationBernard.id,
  });

  const jacquelineUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Jacqueline',
    lastName: 'Colson',
    email: 'jacqueline.colson@example.net',
  });
  const jacquelineLearner = databaseBuilder.factory.buildOrganizationLearner({
    firstName: 'Jacqueline',
    lastName: 'Colson',
    userId: jacquelineUser.id,
    organizationId,
  });
  databaseBuilder.factory.buildCombinedCourseParticipation({
    combinedCourseId: combinix2.id,
    questId: combinix2.questId,
    organizationId,
    organizationLearnerId: jacquelineLearner.id,
    status: CombinedCourseParticipationStatuses.STARTED,
  });
  databaseBuilder.factory.buildCampaignParticipation({
    campaignId: campaign.id,
    organizationLearnerId: jacquelineLearner.id,
  });
}

function buildParenthoodQuest(databaseBuilder) {
  const { id: rewardId } = databaseBuilder.factory.buildAttestation({
    templateName: 'parenthood-attestation-template',
    key: ATTESTATIONS.PARENTHOOD,
  });

  databaseBuilder.factory.buildQuest({
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
    successRequirements: [],
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

const buildSixthGradeQuests = (
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

  const questSuccessRequirements = [
    {
      requirement_type: REQUIREMENT_TYPES.SKILL_PROFILE,
      data: {
        skillIds: [CAMPAIGN_SKILLS[1], CAMPAIGN_SKILLS[2]].flat(),
        threshold: 50,
      },
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
  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: targetProfile.id,
    trainingId: firstTrainingfrFRId,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: targetProfile.id,
    trainingId: secondTrainingfrFRId,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: targetProfile.id,
    trainingId: firstTrainingFRId,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: targetProfile.id,
    trainingId: secondTrainingFRId,
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
  buildSixthGradeQuests(databaseBuilder, rewardId, targetProfiles);
  const parenthoodAttestationId = buildParenthoodQuest(databaseBuilder);
  buildProCombinedCourseQuest(databaseBuilder, PRO_ORGANIZATION_ID);
  buildCombinedCourseQuest(databaseBuilder, organization.id);

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

  const eduIncontournablesAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-incontournables-attestation-template',
    key: 'EDUINCONTOURNABLES',
  });
  const eduDocAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-documents-attestation-template',
    key: 'EDUDOC',
  });
  const eduVeilleAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-veille-attestation-template',
    key: 'EDUVEILLE',
  });
  const eduCultureNumAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-culture-numerique-attestation-template',
    key: 'EDUCULTURENUM',
  });
  const eduRessourcesAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-ressources-attestation-template',
    key: 'EDURESSOURCES',
  });
  const eduSupportAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-supports-attestation-template',
    key: 'EDUSUPPORT',
  });
  const eduSecuAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-securite-attestation-template',
    key: 'EDUSECU',
  });
  const eduCollabAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-collaborer-attestation-template',
    key: 'EDUCOLLAB',
  });
  const eduIaAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'edu-ia-attestation-template',
    key: 'EDUIA',
  });
  const minarmAttestation = databaseBuilder.factory.buildAttestation({
    templateName: 'minarm-attestation-template',
    key: 'MINARM',
  });

  // Create user with all available attestations
  const allAttestationsUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'All',
    lastName: 'Attestations',
    email: 'all-attestations@example.net',
  });

  // Create profile rewards for all available attestation types using existing attestations
  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId, // sixth-grade attestation already created above
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: parenthoodAttestationId, // parenthood attestation already created above
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduIncontournablesAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduDocAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduVeilleAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduCultureNumAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduRessourcesAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduSupportAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduSecuAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduCollabAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: eduIaAttestation.id,
  });

  databaseBuilder.factory.buildProfileReward({
    userId: allAttestationsUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId: minarmAttestation.id,
  });
};
