const { knex } = require('../../../db/knex-database-connection');
const OrganizationLearnerParticipation = require('../../domain/read-models/OrganizationLearnerParticipation');
const OrganizationLearnerActivity = require('../../domain/read-models/OrganizationLearnerActivity');

async function get(organizationLearnerId) {
  const organizationLearnerParticipations = await knex('campaign-participations')
    .select(
      'campaign-participations.createdAt',
      'campaign-participations.sharedAt',
      'campaign-participations.status',
      'campaigns.name',
      'campaigns.type'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.organizationLearnerId', '=', organizationLearnerId)
    .orderBy('campaign-participations.createdAt', 'desc');
  const participations = organizationLearnerParticipations.map(
    (organizationLearnerLine) =>
      new OrganizationLearnerParticipation({
        createdAt: organizationLearnerLine.createdAt,
        sharedAt: organizationLearnerLine.sharedAt,
        status: organizationLearnerLine.status,
        campaignName: organizationLearnerLine.name,
        campaignType: organizationLearnerLine.type,
      })
  );
  return new OrganizationLearnerActivity({ participations });
}

module.exports = { get };
