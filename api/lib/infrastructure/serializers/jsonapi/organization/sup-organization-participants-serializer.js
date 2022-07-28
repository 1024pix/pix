const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ supOrganizationParticipants, pagination }) {
    return new Serializer('sup-organization-participants', {
      id: 'id',
      attributes: [
        'lastName',
        'firstName',
        'birthdate',
        'studentNumber',
        'group',
        'participationCount',
        'lastParticipationDate',
        'campaignName',
        'campaignType',
        'participationStatus',
      ],
      meta: pagination,
    }).serialize(supOrganizationParticipants);
  },
};
