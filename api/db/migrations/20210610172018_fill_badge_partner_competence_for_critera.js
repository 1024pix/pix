import bluebird from 'bluebird';
import _ from 'lodash';

export const up = async function (knex) {
  const badgesAndPartnerCompetences = await knex('badges')
    .select('badges.id as badgeId', 'badge-partner-competences.id as partnerCompetenceId')
    .leftJoin('badge-criteria', 'badges.id', 'badge-criteria.badgeId')
    .leftJoin('badge-partner-competences', 'badges.id', 'badge-partner-competences.badgeId')
    .where({
      'badge-criteria.scope': 'EveryPartnerCompetence',
    });

  let badgesWithPartnerCompetences = _.groupBy(badgesAndPartnerCompetences, 'badgeId');
  badgesWithPartnerCompetences = _.map(badgesWithPartnerCompetences, (partnerCompetencesInfos, badgeId) => {
    const partnerCompetenceIds = _(partnerCompetencesInfos).map('partnerCompetenceId').filter(null).value();
    return [badgeId, partnerCompetenceIds];
  });

  await bluebird.mapSeries(badgesWithPartnerCompetences, async (badgeWithPartnerCompetences) => {
    const badgeId = badgeWithPartnerCompetences[0];
    const partnerCompetenceIds = badgeWithPartnerCompetences[1];
    await knex('badge-criteria')
      .update({ partnerCompetenceIds, scope: 'SomePartnerCompetences' })
      .where({ badgeId, scope: 'EveryPartnerCompetence' });
  });
};

export const down = function () {
  return;
};
