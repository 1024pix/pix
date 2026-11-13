import _ from 'lodash';

const up = async function (knex) {
  const badgesAndPartnerCompetences = await knex('badges')
    .select('badges.id as badgeId', 'badge-partner-competences.id as partnerCompetenceId')
    .leftJoin('badge-criteria', 'badges.id', 'badge-criteria.badgeId')
    .leftJoin('badge-partner-competences', 'badges.id', 'badge-partner-competences.badgeId')
    .where({
      'badge-criteria.scope': 'EveryPartnerCompetence',
    });

  let badgesWithPartnerCompetences = _.groupBy(badgesAndPartnerCompetences, 'badgeId');
  badgesWithPartnerCompetences = Object.entries(badgesWithPartnerCompetences).map(
    ([badgeId, partnerCompetencesInfos]) => {
      const partnerCompetenceIds = partnerCompetencesInfos
        .map(({ partnerCompetenceId }) => partnerCompetenceId)
        .filter(Boolean);
      return [badgeId, partnerCompetenceIds];
    },
  );

  for (const badgeWithPartnerCompetences of badgesWithPartnerCompetences) {
    const badgeId = badgeWithPartnerCompetences[0];
    const partnerCompetenceIds = badgeWithPartnerCompetences[1];
    await knex('badge-criteria')
      .update({ partnerCompetenceIds, scope: 'SomePartnerCompetences' })
      .where({ badgeId, scope: 'EveryPartnerCompetence' });
  }
};

const down = function () {
  return;
};

export { down, up };
