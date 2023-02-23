const { knex } = require('../../../db/knex-database-connection.js');
const CampaignParticipationForUserManagement = require('../../domain/read-models/CampaignParticipationForUserManagement.js');

module.exports = {
  async findByUserId(userId) {
    const campaignParticipations = await knex('campaign-participations')
      .select({
        id: 'campaign-participations.id',
        participantExternalId: 'campaign-participations.participantExternalId',
        status: 'campaign-participations.status',
        campaignId: 'campaigns.id',
        campaignCode: 'campaigns.code',
        createdAt: 'campaign-participations.createdAt',
        sharedAt: 'campaign-participations.sharedAt',
        deletedAt: 'campaign-participations.deletedAt',
        deletedBy: 'deletedByUsers.id',
        deletedByFirstName: 'deletedByUsers.firstName',
        deletedByLastName: 'deletedByUsers.lastName',
        organizationLearnerFirstName: 'organization-learners.firstName',
        organizationLearnerLastName: 'organization-learners.lastName',
      })
      .innerJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .innerJoin('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
      .leftJoin('users as deletedByUsers', 'deletedByUsers.id', 'campaign-participations.deletedBy')
      .where('campaign-participations.userId', userId)
      .orderBy('createdAt', 'desc');

    return campaignParticipations.map((attributes) => new CampaignParticipationForUserManagement(attributes));
  },
};
