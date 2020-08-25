const { knex } = require('../bookshelf');
const Assessment = require('../../domain/models/Assessment');
const CampaignParticipationInfo = require('../../domain/read-models/CampaignParticipationInfo');

module.exports = {
  async findByCampaignId(campaignId) {
    const results = await knex.with('campaignParticipationWithUserAndRankedAssessment',
      (qb) => {
        qb.select([
          'campaign-participations.*',
          'assessments.state',
          _assessmentRankByCreationDate(),
          'users.firstName',
          'users.lastName',
          'schooling-registrations.studentNumber',
        ])
          .from('campaign-participations')
          .join('users', 'campaign-participations.userId', 'users.id')
          .join('assessments', 'campaign-participations.id', 'assessments.campaignParticipationId')
          .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
          .leftJoin('schooling-registrations', function() {
            this.on('schooling-registrations.userId', 'campaign-participations.userId')
              .andOn('schooling-registrations.organizationId', 'campaigns.organizationId');
          })
          .where({ campaignId: campaignId });
      })
      .from('campaignParticipationWithUserAndRankedAssessment')
      .where({ rank: 1 });

    return results.map(_rowToCampaignParticipationInfo);
  },
};

function _assessmentRankByCreationDate() {
  return knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', ['assessments.campaignParticipationId', 'assessments.createdAt']);
}

function _rowToCampaignParticipationInfo(row) {
  return new CampaignParticipationInfo({
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    participantExternalId: row.participantExternalId,
    studentNumber: row.studentNumber,
    userId: row.userId,
    isCompleted: row.state === Assessment.states.COMPLETED,
    createdAt: new Date(row.createdAt),
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
  });
}
