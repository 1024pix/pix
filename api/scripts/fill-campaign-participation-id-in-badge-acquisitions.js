const _ = require('lodash');
const { knex } = require('../db/knex-database-connection');
const BadgeAcquisitonsRepository = require('../lib/infrastructure/repositories/badge-acquisition-repository');

async function fillCampaignParticipationIdInBadgeAcquisitions() {
  return knex('badge-acquisitions').select().where({ campaignParticipationId: null });
}

async function getCampaignParticipationFromBadgeAcquisition(badgeAcquisition) {
  const dateBeforeBadgeAcquisition = new Date(badgeAcquisition.createdAt);
  dateBeforeBadgeAcquisition.setDate(badgeAcquisition.createdAt.getDate() - 1);

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
    .whereBetween('assessments.updatedAt', [dateBeforeBadgeAcquisition, badgeAcquisition.createdAt]);
}

async function main() {
  try {
    console.log('Coucou');

    // Récupérer les badges acquisitions sans campaignParticipationid
    const badgeAcquisitionsWithoutCPI = await fillCampaignParticipationIdInBadgeAcquisitions();
    // Récupérer pour chacun la campagne qui va bien

    // Update chaque ligne avec sa campagne qui va bien

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
  fillCampaignParticipationIdInBadgeAcquisitions,
  getCampaignParticipationFromBadgeAcquisition,
};
