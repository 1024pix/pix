const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationResultInformation) {
    return new Serializer('certifications', {
      transform(certificationResultInformation) {
        return {
          id: certificationResultInformation.certificationCourseId,
          ...certificationResultInformation,
          competencesWithMark: certificationResultInformation.competenceMarks,
          cleaCertificationStatus: certificationResultInformation.cleaCertificationResult.status,
        };
      },
      attributes: [
        'sessionId',
        'status',
        'createdAt',
        'completedAt',
        'isPublished',
        'isV2Certification',
        'cleaCertificationStatus',
        'firstName',
        'lastName',
        'birthdate',
        'birthplace',
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
          'isActionRequired',
        ],
      },
    }).serialize(certificationResultInformation);
  },
};
