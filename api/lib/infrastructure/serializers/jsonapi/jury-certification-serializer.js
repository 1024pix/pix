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
        'isPublished',
        'juryId',
        'pixScore',
        'competencesWithMark',
        'commentForCandidate',
        'commentForOrganization',
        'commentForJury',
        'cleaCertificationStatus',
        'pixPlusDroitMaitreCertificationStatus',
        'pixPlusDroitExpertCertificationStatus',
        'certificationIssueReports',
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
