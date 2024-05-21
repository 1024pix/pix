import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';

const { TO_SHARE, SHARED, STARTED } = CampaignParticipationStatuses;

const getParticipationsActivityByDate = async function (campaignId) {
  const [startedParticipations, sharedParticipations] = await Promise.all([
    _getCumulativeParticipationCountsByDay(campaignId, 'createdAt'),
    _getCumulativeParticipationCountsByDay(campaignId, 'sharedAt'),
  ]);
  return { startedParticipations, sharedParticipations };
};

const countParticipationsByMasteryRate = async function ({ campaignId }) {
  return knex('campaign-participations')
    .select('masteryRate')
    .count()
    .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null })
    .whereNotNull('masteryRate')
    .groupBy('masteryRate')
    .orderBy('masteryRate', 'ASC');
};

async function _getCumulativeParticipationCountsByDay(campaignId, column) {
  const { rows: data } = await knex.raw(
    `
    SELECT CAST(:column: AS DATE) AS "day", SUM(COUNT(*)) OVER (ORDER BY CAST(:column: AS DATE)) AS "count"
    FROM "campaign-participations"
    WHERE "campaignId" = :campaignId AND :column: IS NOT NULL AND "isImproved" = false AND "deletedAt" is null
    GROUP BY "day"`,
    { column, campaignId },
  );

  return data.map(({ day, count }) => ({ day, count: Number(count) }));
}

const getAllParticipationsByCampaignId = async function (campaignId) {
  const result = await knex
    .select('masteryRate', 'validatedSkillsCount')
    .from('campaign-participations')
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .where('campaign-participations.deletedAt', 'is', null)
    .where('campaign-participations.status', 'SHARED');

  return result;
};

const countParticipationsByStatus = async function (campaignId, campaignType) {
  const row = await knex('campaign-participations')
    .select([
      knex.raw(`sum(case when status = ? then 1 else 0 end) as shared`, SHARED),
      knex.raw(`sum(case when status = ? then 1 else 0 end) as completed`, TO_SHARE),
      knex.raw(`sum(case when status = ? then 1 else 0 end) as started`, STARTED),
    ])
    .where({ campaignId, isImproved: false, deletedAt: null })
    .groupBy('campaignId')
    .first();

  return _mapToParticipationByStatus(row, campaignType);
};

function _mapToParticipationByStatus(row = {}, campaignType) {
  const participationByStatus = {
    shared: row.shared || 0,
    completed: row.completed || 0,
  };
  if (campaignType === CampaignTypes.ASSESSMENT) {
    participationByStatus.started = row.started || 0;
  }
  return participationByStatus;
}

export {
  countParticipationsByMasteryRate,
  countParticipationsByStatus,
  getAllParticipationsByCampaignId,
  getParticipationsActivityByDate,
};
