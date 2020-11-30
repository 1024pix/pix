const { Serializer } = require('jsonapi-serializer');
const omit = require('lodash/omit');
const get = require('lodash/get');

module.exports = {

  serialize(certificationResult) {
    return new Serializer('results', {
      transform(certificationResult) {
        return {
          ...omit(certificationResult, 'certificationIssueReports'),
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
      ],
    }).serialize(certificationResult);
  },
};
