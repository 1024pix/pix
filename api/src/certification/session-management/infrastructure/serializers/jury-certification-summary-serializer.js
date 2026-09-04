const { Serializer } = jsonapiSerializer;

import jsonapiSerializer from 'jsonapi-serializer';

export function serialize(juryCertificationSummary, meta, { translate }) {
  return new Serializer('jury-certification-summary', {
    transform(juryCertificationSummary) {
      // eslint-disable-next-line no-unused-vars
      const { certificationIssueReports, ...result } = juryCertificationSummary;
      result.certificationObtained = juryCertificationSummary.getCertificationLabel(translate);
      result.examinerComment = extractExaminerComment(juryCertificationSummary);
      result.numberOfCertificationIssueReports = juryCertificationSummary.certificationIssueReports.length;
      result.reachedResultKey = juryCertificationSummary.reachedResultKey;
      result.numberOfCertificationIssueReportsWithRequiredAction =
        juryCertificationSummary.certificationIssueReports.filter(
          (issueReport) => issueReport.isImpactful && issueReport.resolvedAt === null,
        ).length;
      return result;
    },
    attributes: [
      'firstName',
      'lastName',
      'status',
      'pixScore',
      'algorithmVersion',
      'reachedResultKey',
      'createdAt',
      'lastAnswerAt',
      'isPublished',
      'examinerComment',
      'numberOfCertificationIssueReports',
      'numberOfCertificationIssueReportsWithRequiredAction',
      'isFlaggedAborted',
      'certificationFramework',
    ],
    meta,
  }).serialize(juryCertificationSummary);
}

function extractExaminerComment(juryCertificationSummary) {
  if (juryCertificationSummary.certificationIssueReports.length > 0) {
    return juryCertificationSummary.certificationIssueReports[0].description;
  }
}
