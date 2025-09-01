import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { getLatestParticipationSharedForOneLearner } from './helpers/get-latest-participation-shared-for-one-learner.js';

const { TO_SHARE, SHARED, STARTED } = CampaignParticipationStatuses;

const getParticipationsActivityByDate = async function (campaignId) {
  const [startedParticipations, sharedParticipations] = await Promise.all([
    _getCumulativeParticipationCountsByDay(campaignId, 'createdAt'),
    _getCumulativeParticipationCountsByDay(campaignId, 'sharedAt'),
  ]);
  return { startedParticipations, sharedParticipations };
};

const countParticipationsByMasteryRate = async function ({ campaignId }) {
  const results = await knex
    .select('masteryRate')
    .count('masteryRate')
    .from(
      knex
        .from('campaign-participations as cp')
        .select(['organizationLearnerId', getLatestParticipationSharedForOneLearner(knex, 'masteryRate', campaignId)])
        .groupBy('organizationLearnerId')
        .where('status', SHARED)
        .where('deletedAt', null)
        .where({ campaignId })
        .as('subQuery'),
    )
    .whereNotNull('masteryRate')
    .groupBy('masteryRate')
    .orderBy('masteryRate', 'asc');

  return results;
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

const getAllParticipationsByCampaignId = (campaignId) =>
  knex
    .select('id', 'masteryRate', 'validatedSkillsCount')
    .from('campaign-participations')
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .where('campaign-participations.deletedAt', 'is', null)
    .where('campaign-participations.status', 'SHARED');

const countParticipationsByStatus = async (campaignId) => {
  const row = await knex('campaign-participations')
    .select([
      knex.raw(`sum(case when status = ? then 1 else 0 end) as shared`, SHARED),
      knex.raw(`sum(case when status in (?, ?) then 1 else 0 end) as started`, [TO_SHARE, STARTED]),
    ])
    .where({ campaignId, isImproved: false, deletedAt: null })
    .groupBy('campaignId')
    .first();

  return {
    started: row?.started || 0,
    shared: row?.shared || 0,
  };
};

export {
  countParticipationsByMasteryRate,
  countParticipationsByStatus,
  getAllParticipationsByCampaignId,
  getParticipationsActivityByDate,
};
