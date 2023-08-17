import jsonapiSerializer from 'jsonapi-serializer';

import { config } from './../../../config.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCourse) {
  return new Serializer('certification-course', {
    transform(currentCertificationCourse) {
      const certificationCourseDTO = currentCertificationCourse.toDTO();
      certificationCourseDTO.nbChallenges = _getChallengesNumberDependingOnVersion(certificationCourseDTO);
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

function _getChallengesNumberDependingOnVersion(certificationCourseDTO) {
  if (certificationCourseDTO.version === 3) {
    return config.v3Certification.numberOfChallengesPerCourse;
  }
  return certificationCourseDTO?.challenges?.length ?? 0;
}

export { serialize };
