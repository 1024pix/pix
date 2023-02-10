const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(juryCertification) {
    return new Serializer('certifications', {
      transform(juryCertification) {
        return {
          id: juryCertification.certificationCourseId,
          ...juryCertification,
          competencesWithMark: juryCertification.competenceMarks,
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
        'juryId',
        'pixScore',
        'competencesWithMark',
        'commentForCandidate',
        'commentForOrganization',
        'commentForJury',
        'commonComplementaryCertificationCourseResults',
        'complementaryCertificationCourseResultsWithExternal',
        'certificationIssueReports',
      ],

      commonComplementaryCertificationCourseResults: {
        ref: 'id',
        attributes: ['label', 'status'],
      },
      complementaryCertificationCourseResultsWithExternal: {
        ref: 'complementaryCertificationCourseId',
        attributes: [
          'complementaryCertificationCourseId',
          'pixResult',
          'externalResult',
          'finalResult',
          'allowedExternalLevels',
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
  },
};
