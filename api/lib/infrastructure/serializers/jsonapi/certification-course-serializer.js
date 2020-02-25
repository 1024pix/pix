const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationCourse) {

    return new Serializer('certification-course', {
      transform(currentCertificationCourse) {
        const certificationCourse = Object.assign({}, currentCertificationCourse);
        certificationCourse.nbChallenges = currentCertificationCourse.challenges ? currentCertificationCourse.challenges.length : 0;

        return certificationCourse;
      },
      attributes: [
        'assessment',
        'nbChallenges',
        'examinerComment',
        'hasSeenEndTestScreen',
      ],
      assessment: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/assessments/${current.id}`;
          }
        }
      },
    }).serialize(certificationCourse);
  },
};
