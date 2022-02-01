const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('target-profile-attach-organization', {
      id: 'targetProfileId',
      attributes: ['duplicatedIds', 'attachedIds'],
    }).serialize(model);
  },
};
