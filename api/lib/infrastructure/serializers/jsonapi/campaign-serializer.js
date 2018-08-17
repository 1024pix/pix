const _ = require('lodash');
const { Serializer, Deserializer } = require('jsonapi-serializer');

const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(answers) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'createdAt'],
    }).serialize(answers);
  },

  deserialize(json) {
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then((campaign) => {
        campaign.targetProfileId = _.get(json.data, ['relationships', 'target-profile', 'data', 'id']);
        return campaign;
      })
      .then(new Campaign);
  }

};
