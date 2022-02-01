const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationCourse, isEndTestScreenRemovalEnabled) {
    return new Serializer('certification-course', {
      transform(currentCertificationCourse) {
        const certificationCourseDTO = currentCertificationCourse.toDTO();
        certificationCourseDTO.nbChallenges = certificationCourseDTO?.challenges?.length ?? 0;
        certificationCourseDTO.examinerComment = certificationCourseDTO.certificationIssueReports?.[0]?.description;
        certificationCourseDTO.isEndTestScreenRemovalEnabled = isEndTestScreenRemovalEnabled;
        return certificationCourseDTO;
      },
      attributes: [
        'assessment',
        'nbChallenges',
        'examinerComment',
        'hasSeenEndTestScreen',
        'firstName',
        'lastName',
        'isEndTestScreenRemovalEnabled',
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
