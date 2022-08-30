const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ scoOrganizationParticipants, pagination }) {
    return new Serializer('sco-organization-participants', {
      id: 'id',
      attributes: [
        'lastName',
        'firstName',
        'birthdate',
        'username',
        'userId',
        'email',
        'isAuthenticatedFromGAR',
        'division',
        'participationCount',
        'lastParticipationDate',
        'campaignName',
        'campaignType',
        'participationStatus',
        'isCertifiable',
      ],
      meta: pagination,
    }).serialize(scoOrganizationParticipants);
  },
};
