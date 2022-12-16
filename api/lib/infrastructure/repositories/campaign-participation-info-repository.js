const { knex } = require('../../../db/knex-database-connection');
const Assessment = require('../../domain/models/Assessment');
const CampaignParticipationInfo = require('../../domain/read-models/CampaignParticipationInfo');

module.exports = {
  async findByCampaignId(campaignId) {
    const results = await knex
      .with('campaignParticipationWithUserAndRankedAssessment', (qb) => {
        qb.select([
          'campaign-participations.*',
          'assessments.state',
          _assessmentRankByCreationDate(),
          'organization-learners.firstName',
          'organization-learners.lastName',
          'organization-learners.studentNumber',
          'organization-learners.division',
          'organization-learners.group',
        ])
          .from('campaign-participations')
          .join('assessments', 'campaign-participations.id', 'assessments.campaignParticipationId')
          .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
          .where({ campaignId, isImproved: false, deletedAt: null });
      })
      .from('campaignParticipationWithUserAndRankedAssessment')
      .where({ rank: 1 });

    return results.map(_rowToCampaignParticipationInfo);
  },
};

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
  });
}
