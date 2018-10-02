const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const CampaignParticipation = require('../../../domain/models/CampaignParticipation');

module.exports = {

  serialize(campaignParticipation) {
    return new Serializer('campaign-participation', {
      attributes: ['isShared', 'sharedAt', 'campaign', 'assessment'],
      campaign: {
        ref: 'id',
        includes: false,
      },
      assessment: {
        ref: 'id',
        includes: false,
      },
      transform: (campaignParticipation) => {
        const updatedCampaignParticipation = Object.assign({}, campaignParticipation);
        updatedCampaignParticipation.assessment = { id: updatedCampaignParticipation.assessmentId };
        updatedCampaignParticipation.campaign = { id: updatedCampaignParticipation.campaignId };
        return updatedCampaignParticipation;
      },
    }).serialize(campaignParticipation);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((campaignParticipation) => {
        campaignParticipation.campaignId = _.get(json.data, ['relationships', 'campaign', 'data', 'id']);
        return new CampaignParticipation(campaignParticipation);
      });
  }
};
