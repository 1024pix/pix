const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(campaignParticipation) {
    return new Serializer('user-participation', {
      attributes: [
        'participantExternalId',
        'status',
        'campaignId',
        'campaignCode',
        'createdAt',
        'sharedAt',
        'deletedAt',
        'deletedBy',
        'deletedByFullName',
        'organizationLearnerFullName',
      ],
    }).serialize(campaignParticipation);
  },
};
