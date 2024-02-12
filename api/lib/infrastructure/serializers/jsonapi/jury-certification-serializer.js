import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (juryCertification, { translate }) {
  return new Serializer('certifications', {
    transform(juryCertification) {
      return {
        id: juryCertification.certificationCourseId,
        ...juryCertification,
        competencesWithMark: juryCertification.competenceMarks,
        commentForOrganization: _translateJuryComment(juryCertification.commentForOrganization, translate),
        commentForCandidate: _translateJuryComment(juryCertification.commentForCandidate, translate),
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

const _translateJuryComment = (commentJury, translate) =>
  commentJury.shouldBeTranslated() ? translate(commentJury.getKeyToTranslate()) : commentJury.getFallbackComment();
