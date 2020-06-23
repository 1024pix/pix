const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationResult) {
    return new Serializer('results', {
      attributes: [
        'assessmentId',
        'pixScore',
        'createdAt',
        'resultCreatedAt',
        'status',
        'completedAt',
        'emitter',
        'juryId',
        'commentForCandidate',
        'commentForOrganization',
        'commentForJury',
        'competencesWithMark',
        'firstName',
        'lastName',
        'birthdate',
        'birthplace',
        'sessionId',
        'externalId',
        'isPublished',
        'isV2Certification',
        'examinerComment',
        'hasSeenEndTestScreen',
        'cleaCertificationStatus',
      ],
    }).serialize(certificationResult);
  },
};
