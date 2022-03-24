const { Serializer, Deserializer } = require('jsonapi-serializer');

const Campaign = require('../../../domain/models/Campaign');
const CampaignParticipation = require('../../../domain/models/CampaignParticipation');

module.exports = {
  serialize(campaignParticipation) {
    return new Serializer('campaign-participation', {
      transform: (campaignParticipation) => {
        const campaignParticipationForSerialization = new CampaignParticipation(campaignParticipation);
        if (campaignParticipation.lastAssessment) {
          campaignParticipationForSerialization.assessment = { id: campaignParticipation.lastAssessment.id };
        }
        return campaignParticipationForSerialization;
      },

      attributes: ['isShared', 'sharedAt', 'createdAt', 'participantExternalId', 'campaign', 'assessment', 'deletedAt'],
      campaign: {
        ref: 'id',
        attributes: ['code', 'title', 'type'],
      },
      assessment: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record) {
            return `/api/assessments/${record.assessment.id}`;
          },
        },
      },
    }).serialize(campaignParticipation);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(json).then((campaignParticipation) => {
      let campaign;
      if (json.data?.relationships?.campaign) {
        campaign = new Campaign({ id: json.data.relationships.campaign.data.id });
      }

      return new CampaignParticipation({ ...campaignParticipation, campaign });
    });
  },
};
