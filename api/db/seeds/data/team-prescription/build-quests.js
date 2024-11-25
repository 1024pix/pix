import { ATTESTATIONS } from '../../../../src/profile/domain/constants.js';
import { REWARD_TYPES } from '../../../../src/quest/domain/constants.js';
import { COMPARISON } from '../../../../src/quest/domain/models/Quest.js';
import { Assessment, Tag } from '../../../../src/shared/domain/models/index.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/temporary-storage/index.js';
import { TARGET_PROFILE_BADGES_STAGES_ID } from './constants.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

const USERS = [
  {
    firstName: 'attestation-success',
    lastName: 'attestation',
    email: 'attestation-success@example.net',
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
];
const ORGANIZATION = { name: 'attestation', type: 'SCO', isManagingStudents: true };
const ORGANIZATION_TAG = Tag.AEFE;
const CAMPAIGN = { code: 'ATESTTEST', multipleSendings: true };

const TUBES = [
  {
    id: 'tube2e715GxaaWzNK6',
    level: 2,
  },
  {
    id: 'recs1vdbHxX8X55G9',
    level: 2,
  },
  {
    id: 'reccqGUKgzIOK8f9U',
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
  {
    id: 'recPOjwrHFhM21yGE',
    level: 2,
  },
];

const SKILLS = [
  'skill2wQfMYrOHlL6HI',
  'skill1QAVccgLO16Rx8',
  'skillX5Rpk2rucNfnF',
  'skill1aj7jVAKrVgUye',
  'reczOCGv8pz976Acl',
  'skill2mIMdudcltFsaz',
];

const buildUsers = (databaseBuilder) => USERS.map((user) => databaseBuilder.factory.buildUser.withRawPassword(user));

const buildOrganization = (databaseBuilder) => databaseBuilder.factory.buildOrganization(ORGANIZATION);

const buildOrganizationLearners = (databaseBuilder, organization, users) =>
  users.map((user) =>
    databaseBuilder.factory.buildOrganizationLearner({
      userId: user.id,
      organizationId: organization.id,
    }),
  );

const buildCampaignParticipations = (databaseBuilder, campaignId, users) =>
  users.map(({ user, organizationLearner }) =>
    databaseBuilder.factory.buildCampaignParticipation({
      userId: user.id,
      campaignId,
      masteryRate: 1,
      organizationLearnerId: organizationLearner.id,
    }),
  );

const buildQuest = (databaseBuilder, rewardId, targetProfileId) => {
  const questEligibilityRequirements = [
    {
      type: 'organization',
      data: {
        type: 'SCO',
      },
      comparison: COMPARISON.ALL,
    },
    {
      type: 'organization',
      data: {
        isManagingStudents: true,
        tags: [ORGANIZATION_TAG],
      },
      comparison: COMPARISON.ONE_OF,
    },
    {
      type: 'campaignParticipations',
      data: {
        targetProfileIds: [targetProfileId],
      },
      comparison: COMPARISON.ALL,
    },
  ];

  const questSuccessRequirements = [
    {
      type: 'skill',
      data: {
        ids: SKILLS,
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

const buildFirstStages = async (
  databaseBuilder,
  successUser,
  successParticipation,
  failedUser,
  failedParticipation,
  pendingUser,
  pendingParticipation,
) => {
  const stages = await databaseBuilder.knex('stages').where({ targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID });

  const stageZero = stages.find((stage) => stage.level === 0 || stage.threshold === 0);

  databaseBuilder.factory.buildStageAcquisition({
    stageId: stageZero.id,
    userId: successUser.id,
    campaignParticipationId: successParticipation.id,
  });
  databaseBuilder.factory.buildStageAcquisition({
    stageId: stageZero.id,
    userId: failedUser.id,
    campaignParticipationId: failedParticipation.id,
  });
  databaseBuilder.factory.buildStageAcquisition({
    stageId: stageZero.id,
    userId: pendingUser.id,
    campaignParticipationId: pendingParticipation.id,
  });
};

const buildTargetProfile = (databaseBuilder, organization) => {
  const targetProfile = databaseBuilder.factory.buildTargetProfile({
    description: 'parcours attestation 6 eme',
    name: 'parcours attestation 6 eme',
    ownerOrganizationId: organization.id,
  });

  TUBES.map(({ tubeId, level }) =>
    databaseBuilder.factory.buildTargetProfileTube({
      targetProfileId: targetProfile.id,
      tubeId,
      level,
    }),
  );

  return targetProfile;
};

export const buildQuests = async (databaseBuilder) => {
  // Create USERS

  const [successUser, failedUser, pendingUser, blankUser] = buildUsers(databaseBuilder);

  // Create organization

  const organization = buildOrganization(databaseBuilder);

  // Get organization tag id

  const { id: tagId } = await databaseBuilder.knex('tags').select('id').where({ name: ORGANIZATION_TAG }).first();

  // Associate tag to organization

  databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tagId });

  // Create organizationLearners

  const [successOrganizationLearner, failedOrganizationLearner, pendingOrganizationLearner] = buildOrganizationLearners(
    databaseBuilder,
    organization,
    [successUser, failedUser, pendingUser, blankUser],
  );

  // Create target profile

  const targetProfile = buildTargetProfile(databaseBuilder, organization);

  // Create campaigns

  const { id: campaignId } = databaseBuilder.factory.buildCampaign({
    ...CAMPAIGN,
    targetProfileId: targetProfile.id,
    organizationId: organization.id,
  });

  SKILLS.map((skillId) =>
    databaseBuilder.factory.buildCampaignSkill({
      campaignId,
      skillId,
    }),
  );

  // Create campaignParticipations

  const [successParticipation, failedParticipation, pendingParticipation] = buildCampaignParticipations(
    databaseBuilder,
    campaignId,
    [
      {
        user: successUser,
        organizationLearner: successOrganizationLearner,
      },
      {
        user: failedUser,
        organizationLearner: failedOrganizationLearner,
      },
      {
        user: pendingUser,
        organizationLearner: pendingOrganizationLearner,
      },
    ],
  );

  // Create assessments

  databaseBuilder.factory.buildAssessment({
    userId: successUser.id,
    type: Assessment.types.CAMPAIGN,
    campaignParticipationId: successParticipation.id,
  });
  databaseBuilder.factory.buildAssessment({
    userId: failedUser.id,
    type: Assessment.types.CAMPAIGN,
    campaignParticipationId: failedParticipation.id,
  });
  databaseBuilder.factory.buildAssessment({
    userId: pendingUser.id,
    type: Assessment.types.CAMPAIGN,
    campaignParticipationId: pendingParticipation.id,
  });

  // Create first stage

  await buildFirstStages(
    databaseBuilder,
    successUser,
    successParticipation,
    failedUser,
    failedParticipation,
    pendingUser,
    pendingParticipation,
  );

  // Create attestation quest

  const { id: rewardId } = databaseBuilder.factory.buildAttestation({
    templateName: 'sixth-grade-attestation-template',
    key: ATTESTATIONS.SIXTH_GRADE,
  });

  // Create quest

  buildQuest(databaseBuilder, rewardId, targetProfile.id);

  // Create reward for success user

  databaseBuilder.factory.buildProfileReward({
    userId: successUser.id,
    rewardType: REWARD_TYPES.ATTESTATION,
    rewardId,
  });

  // Insert job count in temporary storage for pending user

  profileRewardTemporaryStorage.increment(pendingUser.id);
};
