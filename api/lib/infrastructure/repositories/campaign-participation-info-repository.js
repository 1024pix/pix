const { knex } = require('../bookshelf');
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
          'schooling-registrations.firstName',
          'schooling-registrations.lastName',
          'schooling-registrations.studentNumber',
          'schooling-registrations.division',
          'schooling-registrations.group',
        ])
          .from('campaign-participations')
          .join('assessments', 'campaign-participations.id', 'assessments.campaignParticipationId')
          .join(
            'schooling-registrations',
            'schooling-registrations.id',
            'campaign-participations.schoolingRegistrationId'
          )
          .where({ campaignId: campaignId, isImproved: false });
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
