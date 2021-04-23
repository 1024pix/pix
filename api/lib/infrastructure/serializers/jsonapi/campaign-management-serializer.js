const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(campaignManagement, meta) {
    return new Serializer('campaign', {
      attributes: ['name', 'code', 'type', 'createdAt', 'archivedAt',
        'creatorId', 'creatorLastName', 'creatorFirstName'],
      meta,
    }).serialize(campaignManagement);
  },
};
