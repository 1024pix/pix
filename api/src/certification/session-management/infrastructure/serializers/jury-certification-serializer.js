import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(juryCertification, { translate }) {
  return new Serializer('certifications', {
    transform(juryCertification) {
      return {
        id: juryCertification.certificationCourseId,
        ...juryCertification,
        competencesWithMark: juryCertification.competenceMarks,
        commentForOrganization: juryCertification.commentForOrganization.getComment(translate),
        commentForCandidate: juryCertification.commentForCandidate.getComment(translate),
        reachedResultKey: juryCertification.reachedResultKey,
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
      'status',
      'isPublished',
      'isRejectedForFraud',
      'juryId',
      'pixScore',
      'reachedResultKey',
      'competencesWithMark',
      'commentForCandidate',
      'commentForOrganization',
      'commentByJury',
      'commonComplementaryCertificationCourseResult',
      'complementaryCertificationCourseResultWithExternal',
      'certificationIssueReports',
      'version',
      'certificationFramework',
      'lastAnswerAt',
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
}
