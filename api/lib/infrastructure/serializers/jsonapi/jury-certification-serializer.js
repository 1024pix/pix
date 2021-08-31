const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(juryCertification) {
    return new Serializer('certifications', {
      transform(juryCertification) {
        return {
          id: juryCertification.certificationCourseId,
          ...juryCertification,
          competencesWithMark: juryCertification.competenceMarks,
          cleaCertificationStatus: juryCertification.cleaCertificationResult.status,
          pixPlusDroitMaitreCertificationStatus: juryCertification.pixPlusDroitMaitreCertificationResult.status,
          pixPlusDroitExpertCertificationStatus: juryCertification.pixPlusDroitExpertCertificationResult.status,
        };
      },
      attributes: [
        'sessionId',
        'status',
        'createdAt',
        'completedAt',
        'isPublished',
        'cleaCertificationStatus',
        'pixPlusDroitMaitreCertificationStatus',
        'pixPlusDroitExpertCertificationStatus',
        'firstName',
        'lastName',
        'birthdate',
        'birthplace',
        'sex',
        'birthCountry',
        'birthINSEECode',
        'birthPostalCode',
        'userId',
        'certificationIssueReports',
        'assessmentId',
        'commentForCandidate',
        'commentForOrganization',
        'commentForJury',
        'juryId',
        'pixScore',
        'competencesWithMark',
      ],
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
        ],
      },
    }).serialize(juryCertification);
  },
};
