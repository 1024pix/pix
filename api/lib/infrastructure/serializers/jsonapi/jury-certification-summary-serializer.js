const omit = require('lodash/omit');
const get = require('lodash/get');

const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(juryCertificationSummary) {
    return new Serializer('jury-certification-summary', {
      transform(juryCertificationSummary) {
        const result = omit(juryCertificationSummary, 'certificationIssueReports');
        result.examinerComment = get(juryCertificationSummary, 'certificationIssueReports[0].description');
        result.numberOfCertificationIssueReports = juryCertificationSummary.certificationIssueReports.length;
        result.numberOfCertificationIssueReportsWithRequiredAction =
          juryCertificationSummary.certificationIssueReports.filter(
            (issueReport) => issueReport.isImpactful && issueReport.resolvedAt === null
          ).length;
        result.cleaCertificationStatus = juryCertificationSummary.getCleaCertificationStatus();
        result.pixPlusDroitMaitreCertificationStatus =
          juryCertificationSummary.getPixPlusDroitMaitreCertificationStatus();
        result.pixPlusDroitExpertCertificationStatus =
          juryCertificationSummary.getPixPlusDroitExpertCertificationStatus();
        result.pixPlusEduAutonomeCertificationStatus =
          juryCertificationSummary.getPixPlusEduAutonomeCertificationStatus();
        result.pixPlusEduInitieCertificationStatus = juryCertificationSummary.getPixPlusEduInitieCertificationStatus();
        result.pixPlusEduExpertCertificationStatus = juryCertificationSummary.getPixPlusEduExpertCertificationStatus();
        result.pixPlusEduFormateurCertificationStatus =
          juryCertificationSummary.getPixPlusEduFormateurCertificationStatus();
        return result;
      },
      attributes: [
        'firstName',
        'lastName',
        'status',
        'pixScore',
        'createdAt',
        'completedAt',
        'isPublished',
        'examinerComment',
        'numberOfCertificationIssueReports',
        'numberOfCertificationIssueReportsWithRequiredAction',
        'hasSeenEndTestScreen',
        'isFlaggedAborted',
        'cleaCertificationStatus',
        'pixPlusDroitMaitreCertificationStatus',
        'pixPlusDroitExpertCertificationStatus',
        'pixPlusEduAutonomeCertificationStatus',
        'pixPlusEduInitieCertificationStatus',
        'pixPlusEduExpertCertificationStatus',
        'pixPlusEduFormateurCertificationStatus',
      ],
    }).serialize(juryCertificationSummary);
  },
};
