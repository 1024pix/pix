const { knex } = require('../db/knex-database-connection');
const bluebird = require('bluebird');

async function getAllBadgeAcquistionsWithoutCampaignParticipation() {
  return knex('badge-acquisitions').select().where({ campaignParticipationId: null });
}

async function getCampaignParticipationFromBadgeAcquisition(badgeAcquisition) {
  const dateBeforeBadgeAcquisition = new Date(badgeAcquisition.createdAt);
  dateBeforeBadgeAcquisition.setHours(badgeAcquisition.createdAt.getHours() - 1);

  const dateAfterBadgeAcquisition = new Date(badgeAcquisition.createdAt);
  dateAfterBadgeAcquisition.setHours(badgeAcquisition.createdAt.getHours() + 1);

  const badge = await knex('badges').select('targetProfileId').where({ id: badgeAcquisition.badgeId }).first();

  return knex('campaign-participations')
    .select('campaign-participations.id')
    .innerJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .where({
      'campaign-participations.userId': badgeAcquisition.userId,
      'campaigns.targetProfileId': badge.targetProfileId,
      'assessments.state': 'completed',
    })
    .whereBetween('assessments.updatedAt', [dateBeforeBadgeAcquisition, dateAfterBadgeAcquisition]);
}

async function updateBadgeAcquisitionWithCampaignParticipationId(badgeAcquisition, campaignParticipations) {
  if (campaignParticipations.length === 1) {
    const campaignParticipationId = campaignParticipations[0].id;
    await knex('badge-acquisitions').update({ campaignParticipationId }).where({ id: badgeAcquisition.id });
    return;
  }
  console.log(`ERROR with badgeAcquisition #${badgeAcquisition.id} : campaignParticipations has ${campaignParticipations.length} possibilities.`);
}

async function main() {
  try {
    console.log('START');

    const badgeAcquisitionsWithoutCPI = await getAllBadgeAcquistionsWithoutCampaignParticipation();
    console.log(`${badgeAcquisitionsWithoutCPI.length} badges without campaignParticipationId.`);

    await bluebird.mapSeries(badgeAcquisitionsWithoutCPI,
      async (badgeAcquisition) => {
        const campaignsParticipations = await getCampaignParticipationFromBadgeAcquisition(badgeAcquisition);
        await updateBadgeAcquisitionWithCampaignParticipationId(badgeAcquisition, campaignsParticipations);
      });

    console.log('FINISH');

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = {
  main,
  getAllBadgeAcquistionsWithoutCampaignParticipation,
  getCampaignParticipationFromBadgeAcquisition,
  updateBadgeAcquisitionWithCampaignParticipationId,
};
