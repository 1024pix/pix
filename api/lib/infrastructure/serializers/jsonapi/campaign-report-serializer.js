const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(campaignReports, meta, { tokenForCampaignResults } = {}) {
    return new Serializer('campaign', {
      transform: (record) => {
        const campaign = Object.assign({}, record);
        campaign.tokenForCampaignResults = tokenForCampaignResults;
        campaign.isArchived = record.isArchived;
        return campaign;
      },
      attributes: ['name', 'code', 'title', 'type', 'createdAt', 'customLandingPageText', 'isArchived',
        'tokenForCampaignResults', 'idPixLabel', 'targetProfileId', 'targetProfileName', 'targetProfileImageUrl',
        'creatorId', 'creatorLastName', 'creatorFirstName', 'participationsCount', 'sharedParticipationsCount',
        'campaignCollectiveResult', 'campaignAnalysis', 'divisions', 'stages', 'badges'],
      stages: {
        ref: 'id',
        included: true,
        attributes: ['prescriberTitle', 'prescriberDescription', 'threshold'],
      },
      badges: {
        ref: 'id',
        included: true,
        attributes: ['title'],
      },
      campaignCollectiveResult: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/collective-results`;
          },
        },
      },
      campaignAnalysis: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/analyses`;
          },
        },
      },
      divisions: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/campaigns/${parent.id}/divisions`;
          },
        },
      },
      meta,
    }).serialize(campaignReports);
  },
};
