const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ organizationParticipants, meta }) {
    return new Serializer('organization-participants', {
      id: 'id',
      attributes: [
        'firstName',
        'lastName',
        'participationCount',
        'lastParticipationDate',
        'campaignName',
        'campaignType',
        'participationStatus',
        'isCertifiable',
        'certifiableAt',
      ],
      meta,
    }).serialize(organizationParticipants);
  },
};
