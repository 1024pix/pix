const { Serializer } = require('jsonapi-serializer');
const get = require('lodash/get');

module.exports = {

  serialize(certificationResult) {
    return new Serializer('certifications', {
      transform(certificationResult) {
        return {
          ...certificationResult,
          examinerComment: get(certificationResult, 'certificationIssueReports[0].description'),
        };
      },
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
        'certificationIssueReports',
      ],
      certificationIssueReports: {
        ref: 'id',
        attributes: [
          'category',
          'description',
          'subcategory',
          'questionNumber',
          'isActionRequired',
        ],
      },
    }).serialize(certificationResult);
  },
};
