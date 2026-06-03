import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { getLatestParticipationSharedForOneLearner } from './helpers/get-latest-participation-shared-for-one-learner.js';

const { SHARED, STARTED } = CampaignParticipationStatuses;

const getParticipationsActivityByDate = async function (campaignId) {
  const knexConn = DomainTransaction.getConnection();
  const startedParticipations = await _getCumulativeParticipationCountsByDay(campaignId, 'createdAt', knexConn);
  const sharedParticipations = await _getCumulativeParticipationCountsByDay(campaignId, 'sharedAt', knexConn);

  return { startedParticipations, sharedParticipations };
};

const countParticipationsByMasteryRate = async function ({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select('masteryRate')
    .count('masteryRate')
    .from(
      knexConn
        .from('campaign-participations as cp')
        .select([
          'organizationLearnerId',
          getLatestParticipationSharedForOneLearner(knexConn, 'masteryRate', campaignId),
        ])
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

async function _getCumulativeParticipationCountsByDay(campaignId, column, knexConn) {
  const { rows: data } = await knexConn.raw(
    `
    SELECT CAST(:column: AS DATE) AS "day", SUM(COUNT(*)) OVER (ORDER BY CAST(:column: AS DATE)) AS "count"
    FROM "campaign-participations"
    WHERE "campaignId" = :campaignId AND :column: IS NOT NULL AND "isImproved" = false AND "deletedAt" is null
    GROUP BY "day"`,
    { column, campaignId },
  );

  return data.map(({ day, count }) => ({ day, count: Number(count) }));
}

const getAllParticipationsByCampaignId = (campaignId) => {
  const knexConn = DomainTransaction.getConnection();

  return knexConn
    .select('id', 'masteryRate', 'validatedSkillsCount')
    .from('campaign-participations')
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .where('campaign-participations.deletedAt', 'is', null)
    .where('campaign-participations.status', 'SHARED');
};

const countParticipationsByStatus = async (campaignId) => {
  const knexConn = DomainTransaction.getConnection();

  const row = await knexConn('campaign-participations')
    .select([
      knexConn.raw(`sum(case when status = ? then 1 else 0 end) as shared`, SHARED),
      knexConn.raw(`sum(case when status = ? then 1 else 0 end) as started`, STARTED),
    ])
    .where({ campaignId, isImproved: false, deletedAt: null })
    .groupBy('campaignId')
    .first();

  return {
    started: row?.started || 0,
    shared: row?.shared || 0,
  };
};

const countParticipantsByOrganizationId = async (organizationId) => {
  const knexConn = DomainTransaction.getConnection();

  const [{ count }] = await knexConn
    .count('* as count')
    .from(
      knexConn('campaign-participations')
        .select('campaign-participations.organizationLearnerId')
        .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
        .where('campaigns.organizationId', organizationId)
        .groupBy('campaign-participations.organizationLearnerId'),
    );

  return count;
};

const countParticipantsByOrganizationIdGroupedByYear = async (organizationId) => {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('campaign-participations')
    .select(knexConn.raw('EXTRACT(YEAR FROM "campaign-participations"."createdAt")::int AS year'))
    .countDistinct('campaign-participations.organizationLearnerId AS count')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaigns.organizationId', organizationId)
    .groupBy('year')
    .orderBy('year', 'asc');

  return result;
};

export {
  countParticipantsByOrganizationId,
  countParticipantsByOrganizationIdGroupedByYear,
  countParticipationsByMasteryRate,
  countParticipationsByStatus,
  getAllParticipationsByCampaignId,
  getParticipationsActivityByDate,
};
