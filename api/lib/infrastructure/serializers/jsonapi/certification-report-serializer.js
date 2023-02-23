const { Serializer, Deserializer } = require('jsonapi-serializer');

const CertificationReport = require('../../../domain/models/CertificationReport.js');

module.exports = {
  serialize(certificationReports) {
    return new Serializer('certification-report', {
      attributes: [
        'certificationCourseId',
        'firstName',
        'lastName',
        'examinerComment',
        'hasSeenEndTestScreen',
        'certificationIssueReports',
        'isCompleted',
        'abortReason',
      ],
      certificationIssueReports: {
        ref: 'id',
        attributes: ['category', 'description', 'subcategory', 'questionNumber'],
      },
    }).serialize(certificationReports);
  },

  async deserialize(jsonApiData) {
    const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
    const deserializedReport = await deserializer.deserialize(jsonApiData);
    return new CertificationReport(deserializedReport);
  },
};
