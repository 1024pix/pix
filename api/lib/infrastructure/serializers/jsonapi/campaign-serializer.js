const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(campaigns, tokenForCampaignResults) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'title', 'createdAt', 'customLandingPageText', 'tokenForCampaignResults', 'idPixLabel'],
      transform: (record) => {
        const campaign = Object.assign({}, record);
        campaign.tokenForCampaignResults = tokenForCampaignResults;
        return campaign;
      }

    }).serialize(campaigns);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((campaign) => {
        campaign.targetProfileId = parseInt(_.get(json.data, ['relationships', 'target-profile', 'data', 'id']));
        return new Campaign(campaign);
      });
  }

};
