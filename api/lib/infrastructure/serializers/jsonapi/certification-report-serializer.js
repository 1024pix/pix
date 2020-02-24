const _ = require('lodash');

const { Serializer, Deserializer } = require('jsonapi-serializer');

const CertificationReport = require('../../../domain/models/CertificationReport');

module.exports = {
  serialize(certificationReports) {
    return new Serializer('certification-report', {
      attributes: [
        'certificationCourseId',
        'firstName',
        'lastName',
        'examinerComment',
        'hasSeenEndTestScreen',
      ],
    }).serialize(certificationReports);
  },

  async deserialize(jsonApiData) {
    const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
    const deserializedReport = await deserializer.deserialize(jsonApiData);
    if (_.isEmpty(_.trim(deserializedReport.examinerComment))) {
      deserializedReport.examinerComment = null;
    }
    return new CertificationReport(deserializedReport);
  },
};
