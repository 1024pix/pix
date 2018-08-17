const { Serializer } = require('jsonapi-serializer');
const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(campaigns, tokenToResult) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'createdAt', 'tokenToResult'],
      transform: (record) => {
        const campaign = Object.assign({}, record);
        campaign.tokenToResult = tokenToResult;
        return campaign;
      }

    }).serialize(campaigns);
  },

  serializeCsv(csvResult) {
    return new Serializer('campaign-result-csv', {
      attributes: ['data', 'filename'],
    }).serialize(csvResult);
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
