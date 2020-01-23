const { Serializer } = require('jsonapi-serializer');

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
};
