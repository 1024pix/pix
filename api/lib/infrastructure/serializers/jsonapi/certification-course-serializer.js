import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(certificationCourse) {
    return new Serializer('certification-course', {
      transform(currentCertificationCourse) {
        const certificationCourseDTO = currentCertificationCourse.toDTO();
        certificationCourseDTO.nbChallenges = certificationCourseDTO?.challenges?.length ?? 0;
        certificationCourseDTO.examinerComment = certificationCourseDTO.certificationIssueReports?.[0]?.description;
        return certificationCourseDTO;
      },
      attributes: ['assessment', 'nbChallenges', 'examinerComment', 'hasSeenEndTestScreen', 'firstName', 'lastName'],
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
