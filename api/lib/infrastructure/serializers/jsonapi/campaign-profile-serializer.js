const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignProfile) {
    return new Serializer('campaign-profiles', {
      id: 'campaignParticipationId',
      attributes: [
        'firstName',
        'lastName',
        'externalId',
        'createdAt',
        'sharedAt',
        'isShared',
        'campaignId',
        'pixScore',
        'competencesCount',
        'certifiableCompetencesCount',
        'isCertifiable',
      ],
    }).serialize(campaignProfile);
  },
};
