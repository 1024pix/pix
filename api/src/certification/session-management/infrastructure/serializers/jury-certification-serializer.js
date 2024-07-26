import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (juryCertification, { translate }) {
  return new Serializer('certifications', {
    transform(juryCertification) {
      return {
        id: juryCertification.certificationCourseId,
        ...juryCertification,
        competencesWithMark: juryCertification.competenceMarks,
        commentForOrganization: juryCertification.commentForOrganization.getComment(translate),
        commentForCandidate: juryCertification.commentForCandidate.getComment(translate),
      };
    },
    attributes: [
      'sessionId',
      'assessmentId',
      'userId',
      'firstName',
      'lastName',
      'birthdate',
      'sex',
      'birthplace',
      'birthCountry',
      'birthINSEECode',
      'birthPostalCode',
      'createdAt',
      'completedAt',
      'status',
      'isCancelled',
      'isPublished',
      'isRejectedForFraud',
      'juryId',
      'pixScore',
      'competencesWithMark',
      'commentForCandidate',
      'commentForOrganization',
      'commentByJury',
      'commonComplementaryCertificationCourseResult',
      'complementaryCertificationCourseResultWithExternal',
      'certificationIssueReports',
      'version',
    ],

    commonComplementaryCertificationCourseResult: {
      ref: 'id',
      attributes: ['label', 'status'],
    },
    complementaryCertificationCourseResultWithExternal: {
      ref: 'complementaryCertificationCourseId',
      attributes: [
        'complementaryCertificationCourseId',
        'pixResult',
        'externalResult',
        'finalResult',
        'allowedExternalLevels',
        'defaultJuryOptions',
      ],
    },
    certificationIssueReports: {
      ref: 'id',
      attributes: [
        'category',
        'description',
        'subcategory',
        'questionNumber',
        'isImpactful',
        'resolvedAt',
        'resolution',
        'hasBeenAutomaticallyResolved',
      ],
    },
  }).serialize(juryCertification);
};

export { serialize };
