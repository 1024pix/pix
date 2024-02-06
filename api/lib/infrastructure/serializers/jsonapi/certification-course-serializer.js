import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCourse) {
  return new Serializer('certification-course', {
    transform(currentCertificationCourse) {
      const certificationCourseDTO = currentCertificationCourse.toDTO();
      certificationCourseDTO.nbChallenges = currentCertificationCourse.getNumberOfChallenges();
      certificationCourseDTO.examinerComment = certificationCourseDTO.certificationIssueReports?.[0]?.description;
      return certificationCourseDTO;
    },
    attributes: [
      'assessment',
      'nbChallenges',
      'examinerComment',
      'hasSeenEndTestScreen',
      'firstName',
      'lastName',
      'version',
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
};

export { serialize };
