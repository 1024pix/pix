const omit = require('lodash/omit');
const get = require('lodash/get');

const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(juryCertificationSummary) {
    return new Serializer('jury-certification-summary', {
      transform(juryCertificationSummary) {
        const result = omit(juryCertificationSummary, 'certificationIssueReports');
        result.examinerComment =
          get(juryCertificationSummary, 'certificationIssueReports[0].description');
        return result;
      },
      attributes: [
        'firstName',
        'lastName',
        'status',
        'pixScore',
        'createdAt',
        'completedAt',
        'isPublished',
        'examinerComment',
        'hasSeenEndTestScreen',
        'cleaCertificationStatus',
      ],
    }).serialize(juryCertificationSummary);
  },
};
