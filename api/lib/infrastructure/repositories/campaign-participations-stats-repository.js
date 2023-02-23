const { knex } = require('../../../db/knex-database-connection.js');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses.js');

const { SHARED } = CampaignParticipationStatuses;

const CampaignParticipationsStatsRepository = {
  async getParticipationsActivityByDate(campaignId) {
    const [startedParticipations, sharedParticipations] = await Promise.all([
      _getCumulativeParticipationCountsByDay(campaignId, 'createdAt'),
      _getCumulativeParticipationCountsByDay(campaignId, 'sharedAt'),
    ]);
    return { startedParticipations, sharedParticipations };
  },

  async countParticipationsByMasteryRate({ campaignId }) {
    return knex('campaign-participations')
      .select('masteryRate')
      .count()
      .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null })
      .whereNotNull('masteryRate')
      .groupBy('masteryRate')
      .orderBy('masteryRate', 'ASC');
  },
};

async function _getCumulativeParticipationCountsByDay(campaignId, column) {
  const { rows: data } = await knex.raw(
    `
    SELECT CAST(:column: AS DATE) AS "day", SUM(COUNT(*)) OVER (ORDER BY CAST(:column: AS DATE)) AS "count"
    FROM "campaign-participations"
    WHERE "campaignId" = :campaignId AND :column: IS NOT NULL AND "isImproved" = false AND "deletedAt" is null
    GROUP BY "day"`,
    { column, campaignId }
  );

  return data.map(({ day, count }) => ({ day, count: Number(count) }));
}

module.exports = CampaignParticipationsStatsRepository;
