const { knex } = require('../../../db/knex-database-connection');

const CampaignParticipationsStatsRepository = {
  async getParticipationsActivityByDate(campaignId) {
    const [startedParticipations, sharedParticipations] = await Promise.all([
      _getCumulativeParticipationCountsByDay(campaignId, 'createdAt'),
      _getCumulativeParticipationCountsByDay(campaignId, 'sharedAt'),
    ]);
    return { startedParticipations, sharedParticipations };
  },
};

async function _getCumulativeParticipationCountsByDay(campaignId, column) {
  // eslint-disable-next-line knex/avoid-injections
  const { rows: data } = await knex.raw(`
    SELECT CAST(:column: AS DATE) AS "day", SUM(COUNT(*)) OVER (ORDER BY CAST(:column: AS DATE)) AS "count"
    FROM "campaign-participations"
    WHERE "campaignId" = :campaignId AND :column: IS NOT NULL AND "isImproved" = false
    GROUP BY "day"`,
  { column, campaignId });

  return data.map(({ day, count }) => ({ day, count: Number(count) }));
}

module.exports = CampaignParticipationsStatsRepository;
