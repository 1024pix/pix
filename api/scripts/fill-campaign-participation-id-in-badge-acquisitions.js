import { knex, disconnect } from '../db/knex-database-connection';
import bluebird from 'bluebird';

async function getAllBadgeAcquistionsWithoutCampaignParticipationId() {
  return knex('badge-acquisitions').select().where({ campaignParticipationId: null });
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

async function getCampaignParticipationFromBadgeAcquisition(badgeAcquisition) {
  const dateBeforeBadgeAcquisition = new Date(badgeAcquisition.createdAt);
  dateBeforeBadgeAcquisition.setHours(badgeAcquisition.createdAt.getHours() - 1);
  const dateAfterBadgeAcquisition = new Date(badgeAcquisition.createdAt);
  dateAfterBadgeAcquisition.setHours(badgeAcquisition.createdAt.getHours() + 1);

  const badge = await knex('badges').select('targetProfileId').where({ id: badgeAcquisition.badgeId }).first();
  let campaignsParticipations = await knex('campaign-participations')
    .select('campaign-participations.id')
    .innerJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .where({
      'campaign-participations.userId': badgeAcquisition.userId,
      'campaigns.targetProfileId': badge.targetProfileId,
      'assessments.state': 'completed',
    })
    .where(function () {
      this.whereBetween('campaign-participations.sharedAt', [
        dateBeforeBadgeAcquisition,
        dateAfterBadgeAcquisition,
      ]).orWhereBetween('assessments.updatedAt', [dateBeforeBadgeAcquisition, dateAfterBadgeAcquisition]);
    });
  if (campaignsParticipations.length === 0) {
    campaignsParticipations = await knex('campaign-participations')
      .select('campaign-participations.id')
      .innerJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
      .where({
        'campaign-participations.userId': badgeAcquisition.userId,
        'campaigns.targetProfileId': badge.targetProfileId,
        'assessments.state': 'completed',
      });
  }
  return campaignsParticipations;
}

async function updateBadgeAcquisitionWithCampaignParticipationId(badgeAcquisition, campaignParticipations) {
  const campaignsParticipationIds = campaignParticipations.map((c) => c.id).filter(onlyUnique);
  if (campaignsParticipationIds.length === 1) {
    const campaignParticipationId = campaignParticipations[0].id;
    await knex('badge-acquisitions').update({ campaignParticipationId }).where({ id: badgeAcquisition.id });
    return;
  }
  console.log(
    `${badgeAcquisition.id} ;${badgeAcquisition.badgeId} ;${campaignParticipations.length};${campaignParticipations.map(
      (c) => c.id
    )}`
  );
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const badgeAcquisitionsWithoutCampaignParticipationId = await getAllBadgeAcquistionsWithoutCampaignParticipationId();
  console.log(`${badgeAcquisitionsWithoutCampaignParticipationId.length} badges without campaignParticipationId.`);
  console.log('badgeAcquisitionId;BadgeId;Possibility;ListOfCampaignParticipations');

  await bluebird.mapSeries(badgeAcquisitionsWithoutCampaignParticipationId, async (badgeAcquisition) => {
    const campaignsParticipations = await getCampaignParticipationFromBadgeAcquisition(badgeAcquisition);
    await updateBadgeAcquisitionWithCampaignParticipationId(badgeAcquisition, campaignsParticipations);
  });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  main,
  getAllBadgeAcquistionsWithoutCampaignParticipationId,
  getCampaignParticipationFromBadgeAcquisition,
  updateBadgeAcquisitionWithCampaignParticipationId,
};
