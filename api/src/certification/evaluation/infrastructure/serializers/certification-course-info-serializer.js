import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCourseInfo) {
  return new Serializer('certification-course', {
    transform(certificationCourseInfo) {
      return {
        id: certificationCourseInfo.id,
        firstName: certificationCourseInfo.firstName,
        lastName: certificationCourseInfo.lastName,
        nbChallenges: certificationCourseInfo.nbChallenges,
        isAdjustedForAccessibility: certificationCourseInfo.isAdjustedForAccessibility,
        version: certificationCourseInfo.version,
        assessment: { id: certificationCourseInfo.assessmentId },
      };
    },
    attributes: ['assessment', 'nbChallenges', 'firstName', 'lastName', 'version', 'isAdjustedForAccessibility'],
    assessment: {
      ref: 'id',
      ignoreRelationshipData: true,
      relationshipLinks: {
        related(record, current) {
          return `/api/assessments/${current.id}`;
        },
      },
    },
  }).serialize(certificationCourseInfo);
};

export { serialize };
