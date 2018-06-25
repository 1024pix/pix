const { Serializer } = require('jsonapi-serializer');
const Campaign = require('../../../domain/models/Campaign');

module.exports = {

  serialize(answers) {
    return new Serializer('campaign', {
      attributes: ['name', 'code'],
    }).serialize(answers);
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
