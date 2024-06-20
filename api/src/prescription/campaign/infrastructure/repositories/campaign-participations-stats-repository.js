import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
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
