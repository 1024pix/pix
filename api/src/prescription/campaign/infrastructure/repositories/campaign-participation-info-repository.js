import { knex } from '../../../../../db/knex-database-connection.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { CampaignParticipationInfo } from '../../../../../lib/domain/read-models/CampaignParticipationInfo.js';

const findByCampaignId = async function (campaignId) {
  const results = await knex
    .with('campaignParticipationWithUserAndRankedAssessment', (qb) => {
      qb.select([
        'campaign-participations.*',
        'assessments.state',
        _assessmentRankByCreationDate(),
        'view-active-organization-learners.firstName',
        'view-active-organization-learners.lastName',
        'view-active-organization-learners.studentNumber',
        'view-active-organization-learners.division',
        'view-active-organization-learners.group',
      ])
        .from('campaign-participations')
        .join('assessments', 'campaign-participations.id', 'assessments.campaignParticipationId')
        .join(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'campaign-participations.organizationLearnerId',
        )
        .where({ campaignId, isImproved: false, 'campaign-participations.deletedAt': null });
    })
    .from('campaignParticipationWithUserAndRankedAssessment')
    .where({ rank: 1 });

  return results.map(_rowToCampaignParticipationInfo);
};

export { findByCampaignId };

function _assessmentRankByCreationDate() {
  return knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', [
    'assessments.campaignParticipationId',
    'assessments.createdAt',
  ]);
}

function _rowToCampaignParticipationInfo(row) {
  return new CampaignParticipationInfo({
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    participantExternalId: row.participantExternalId,
    studentNumber: row.studentNumber,
    userId: row.userId,
    campaignParticipationId: row.id,
    isCompleted: row.state === Assessment.states.COMPLETED,
    createdAt: new Date(row.createdAt),
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    division: row.division,
    group: row.group,
    masteryRate: row.masteryRate,
    validatedSkillsCount: row.validatedSkillsCount,
  });
}
