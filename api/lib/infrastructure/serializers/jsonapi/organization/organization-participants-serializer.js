const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ organizationParticipants, pagination }) {
    return new Serializer('organization-participants', {
      id: 'id',
      attributes: ['firstName', 'lastName'],
      meta: pagination,
    }).serialize(organizationParticipants);
  },
};
