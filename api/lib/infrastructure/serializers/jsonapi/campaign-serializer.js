const { Serializer } = require('jsonapi-serializer');
const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(campaigns, tokenForCampaignResults) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'createdAt', 'tokenForCampaignResults'],
      transform: (record) => {
        const campaign = Object.assign({}, record);
        campaign.tokenForCampaignResults = tokenForCampaignResults;
        return campaign;
      }

    }).serialize(campaigns);
  },

  deserialize(json) {
    const campaign = new Campaign({
      id: json.data.id,
      name: json.data.attributes.name,
      organizationId: json.data.attributes['organization-id'],
    });

    return campaign;
  }

};
