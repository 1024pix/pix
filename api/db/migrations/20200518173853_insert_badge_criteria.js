const TABLE_NAME = 'badge-criteria';

export const up = async function (knex) {
  const badgeClea = await knex('badges').select('id').where('key', 'PIX_EMPLOI_CLEA');
  if (badgeClea.length > 0) {
    await knex(TABLE_NAME).insert({ scope: 'CampaignParticipation', threshold: 85, badgeId: badgeClea[0].id });
    await knex(TABLE_NAME).insert({ scope: 'EveryPartnerCompetence', threshold: 75, badgeId: badgeClea[0].id });
  }
};

export const down = async function (knex) {
  const badgeClea = await knex('badges').select('id').where('key', 'PIX_EMPLOI_CLEA');
  if (badgeClea.length > 0) {
    await knex(TABLE_NAME).where('badgeId', badgeClea[0].id).delete();
  }
};
