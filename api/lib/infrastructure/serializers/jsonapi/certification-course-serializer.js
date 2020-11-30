const { Serializer } = require('jsonapi-serializer');
const get = require('lodash/get');

module.exports = {

  serialize(certificationCourse) {

    return new Serializer('certification-course', {
      transform(currentCertificationCourse) {
        const certificationCourseDTO = Object.assign({}, currentCertificationCourse);
        certificationCourseDTO.nbChallenges = currentCertificationCourse.challenges ? currentCertificationCourse.challenges.length : 0;
        certificationCourseDTO.examinerComment = get(currentCertificationCourse, 'certificationIssueReports[0].description');

        return certificationCourseDTO;
      },
      attributes: [
        'assessment',
        'nbChallenges',
        'examinerComment',
        'hasSeenEndTestScreen',
        'firstName',
        'lastName',
      ],
      assessment: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current) {
            return `/api/assessments/${current.id}`;
          },
        },
      },
    }).serialize(certificationCourse);
  },
};
