import { TARGET_PROFILE_BADGES_STAGES_ID } from './constants.js';

async function createAttestationQuest(databasebuilder) {
  const campaigns = await retrieveCampaigns(databasebuilder);
  const evaluatedSkills = await retrieveEvaluatedSkills(databasebuilder, campaigns);
  const successfulUsers = await retrieveSuccessfulUsers(databasebuilder, campaigns);

  const { id: rewardId } = await databasebuilder.factory.buildAttestation({
    templateName: '6eme-pdf',
  });

  const questEligibilityRequirements = [
    {
      type: 'organization',
      data: {
        type: 'SCO',
      },
    },
    {
      type: 'organization',
      data: {
        isManagingStudents: true,
        tagNames: ['AEFE'],
      },
      comparison: 'one-of',
    },
    {
      type: 'organization-learner',
      data: {
        MEFCode: '10010012110',
      },
    },
    {
      type: 'campaign-participation',
      data: {
        targetProfileIds: [TARGET_PROFILE_BADGES_STAGES_ID],
      },
    },
  ];
  const questSuccessRequirements = [
    {
      type: 'skill',
      data: {
        ids: evaluatedSkills.map((skill) => skill.skillId),
        threshold: 50,
      },
    },
  ];

  await databasebuilder.factory.buildQuest({
    rewardType: 'attestation',
    rewardId,
    eligibilityRequirements: questEligibilityRequirements,
    successRequirements: questSuccessRequirements,
  });

  await Promise.all(
    successfulUsers.map(({ userId }) => {
      return databasebuilder.factory.buildProfileReward({
        userId,
        rewardType: 'attestation',
        rewardId,
      });
    }),
  );
}

export function buildQuests(databaseBuilder) {
  return createAttestationQuest(databaseBuilder);
}

async function retrieveCampaigns(databaseBuilder) {
  return databaseBuilder.knex('campaigns').select('id').where({
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
  });
}

async function retrieveEvaluatedSkills(databaseBuilder, campaigns) {
  return databaseBuilder
    .knex('campaign_skills')
    .distinct('skillId')
    .whereIn(
      'campaignId',
      campaigns.map((campaign) => campaign.id),
    );
}

async function retrieveSuccessfulUsers(databaseBuilder, campaigns) {
  return databaseBuilder
    .knex('campaign-participations')
    .distinct('userId')
    .whereIn(
      'campaignId',
      campaigns.map((campaign) => campaign.id),
    )
    .andWhere('masteryRate', '>=', 0.5);
}
