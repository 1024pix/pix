const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(model) {
    return new Serializer('organization-attach-target-profiles', {
      id: 'organizationId',
      attributes: ['duplicatedIds', 'attachedIds'],
    }).serialize(model);
  },
};
