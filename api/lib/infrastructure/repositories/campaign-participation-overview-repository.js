const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipationOverview = require('../../domain/read-models/CampaignParticipationOverview');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

function _toCampaignParticipationOverview(campaignParticipation) {
  const convertedCampaignParticipation = bookshelfToDomainConverter.buildDomainObject(BookshelfCampaignParticipation, campaignParticipation);
  const organization = campaignParticipation.related('campaign').related('organization');

  return new CampaignParticipationOverview({
    id: convertedCampaignParticipation.id,
    createdAt: convertedCampaignParticipation.createdAt,
    isShared: convertedCampaignParticipation.isShared,
    sharedAt: convertedCampaignParticipation.sharedAt,
    campaignCode: convertedCampaignParticipation.campaign.code,
    campaignTitle: convertedCampaignParticipation.campaign.title,
    organizationName: organization.get('name'),
    assessmentState: convertedCampaignParticipation.lastAssessment.state,
  });
}

module.exports = {

  async findByUserId(userId) {
    const campaignParticipations = await BookshelfCampaignParticipation
      .query((qb) => {
        qb.innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id');
        qb.innerJoin('organizations', 'campaigns.organizationId', 'organizations.id');
        qb.orderBy('campaign-participations.createdAt', 'DESC');
      })
      .where({ userId })
      .fetchAll({
        required: false,
        withRelated: ['campaign.organization', 'campaign', 'assessments'],
      });

    return campaignParticipations.map(_toCampaignParticipationOverview);
  },
};
