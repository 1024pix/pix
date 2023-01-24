function issueReportCategoriesBuilder({ databaseBuilder }) {
  const otherCategoryId = databaseBuilder.factory.buildIssueReportCategory({
    name: 'OTHER',
    isDeprecated: true,
    isImpactful: true,
  }).id;

  const candidateInformationChangeId = databaseBuilder.factory.buildIssueReportCategory({
    name: 'CANDIDATE_INFORMATIONS_CHANGES',
    isDeprecated: false,
    isImpactful: false,
  }).id;
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'SIGNATURE_ISSUE',
    isDeprecated: false,
    isImpactful: false,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'CONNECTION_OR_END_SCREEN',
    isDeprecated: true,
    isImpactful: false,
  });
  const inChallengeId = databaseBuilder.factory.buildIssueReportCategory({
    name: 'IN_CHALLENGE',
    isDeprecated: false,
    isImpactful: false,
  }).id;
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'FRAUD',
    isDeprecated: false,
    isImpactful: true,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'TECHNICAL_PROBLEM',
    isDeprecated: true,
    isImpactful: true,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'NON_BLOCKING_CANDIDATE_ISSUE',
    isDeprecated: false,
    isImpactful: false,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'NON_BLOCKING_TECHNICAL_ISSUE',
    isDeprecated: false,
    isImpactful: false,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'LATE_OR_LEAVING',
    isDeprecated: true,
    isImpactful: false,
  });

  databaseBuilder.factory.buildIssueReportCategory({
    name: 'LEFT_EXAM_ROOM',
    isDeprecated: true,
    isImpactful: false,
    issueReportCategoryId: otherCategoryId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'NAME_OR_BIRTHDATE',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: candidateInformationChangeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'EXTRA_TIME_PERCENTAGE',
    isDeprecated: false,
    isImpactful: false,
    issueReportCategoryId: candidateInformationChangeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'IMAGE_NOT_DISPLAYING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'LINK_NOT_WORKING',
    isDeprecated: true,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'EMBED_NOT_WORKING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'FILE_NOT_OPENING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'WEBSITE_UNAVAILABLE',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'WEBSITE_BLOCKED',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'EXTRA_TIME_EXCEEDED',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'SOFTWARE_NOT_WORKING',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'OTHER',
    isDeprecated: true,
    isImpactful: true,
    issueReportCategoryId: otherCategoryId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'SKIP_ON_OOPS',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
  databaseBuilder.factory.buildIssueReportCategory({
    name: 'ACCESSIBILITY_ISSUE',
    isDeprecated: false,
    isImpactful: true,
    issueReportCategoryId: inChallengeId,
  });
}

module.exports = { issueReportCategoriesBuilder };
