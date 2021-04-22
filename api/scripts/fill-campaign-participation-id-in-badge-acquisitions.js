const _ = require('lodash');
const { knex } = require('../db/knex-database-connection');
const BadgeAcquisitonsRepository = require('../lib/infrastructure/repositories/badge-acquisition-repository');

async function fillCampaignParticipationIdInBadgeAcquisitions() {
  return knex('badge-acquisitions').select().where({ campaignParticipationId: null });
}

async function getCampaignParticipationFromBadgeAcquisition(badgeAcquisition) {
  const badge = await knex('badges').select('targetProfileId').where({ id: badgeAcquisition.badgeId }).first();
  return knex('campaign-participations')
    .select('campaign-participations.id')
    .innerJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where({ 'campaign-participations.userId': badgeAcquisition.userId, 'campaigns.targetProfileId': badge.targetProfileId });
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
