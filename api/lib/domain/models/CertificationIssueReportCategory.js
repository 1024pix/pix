const CertificationIssueReportCategories = {
  OTHER: 'OTHER',
  CANDIDATE_INFORMATIONS_CHANGES: 'CANDIDATE_INFORMATIONS_CHANGES',
  SIGNATURE_ISSUE: 'SIGNATURE_ISSUE',
  CONNECTION_OR_END_SCREEN: 'CONNECTION_OR_END_SCREEN',
  IN_CHALLENGE: 'IN_CHALLENGE',
  FRAUD: 'FRAUD',
  TECHNICAL_PROBLEM: 'TECHNICAL_PROBLEM',
  NON_BLOCKING_CANDIDATE_ISSUE: 'NON_BLOCKING_CANDIDATE_ISSUE',
  NON_BLOCKING_TECHNICAL_ISSUE: 'NON_BLOCKING_TECHNICAL_ISSUE',
  LATE_OR_LEAVING: 'LATE_OR_LEAVING',
};
const CertificationIssueReportSubcategories = {
  LEFT_EXAM_ROOM: 'LEFT_EXAM_ROOM',
  NAME_OR_BIRTHDATE: 'NAME_OR_BIRTHDATE',
  EXTRA_TIME_PERCENTAGE: 'EXTRA_TIME_PERCENTAGE',
  IMAGE_NOT_DISPLAYING: 'IMAGE_NOT_DISPLAYING',
  LINK_NOT_WORKING: 'LINK_NOT_WORKING',
  EMBED_NOT_WORKING: 'EMBED_NOT_WORKING',
  FILE_NOT_OPENING: 'FILE_NOT_OPENING',
  WEBSITE_UNAVAILABLE: 'WEBSITE_UNAVAILABLE',
  WEBSITE_BLOCKED: 'WEBSITE_BLOCKED',
  EXTRA_TIME_EXCEEDED: 'EXTRA_TIME_EXCEEDED',
  SOFTWARE_NOT_WORKING: 'SOFTWARE_NOT_WORKING',
  UNINTENTIONAL_FOCUS_OUT: 'UNINTENTIONAL_FOCUS_OUT',
  OTHER: 'OTHER',
  SKIP_ON_OOPS: 'SKIP_ON_OOPS',
  ACCESSIBILITY_ISSUE: 'ACCESSIBILITY_ISSUE',
};

const ImpactfulCategories = [
  CertificationIssueReportCategories.TECHNICAL_PROBLEM,
  CertificationIssueReportCategories.OTHER,
  CertificationIssueReportCategories.FRAUD,
];

const ImpactfulSubcategories = [
  CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
  CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
  CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
  CertificationIssueReportSubcategories.FILE_NOT_OPENING,
  CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
  CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
  CertificationIssueReportSubcategories.LINK_NOT_WORKING,
  CertificationIssueReportSubcategories.OTHER,
  CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
  CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
  CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
  CertificationIssueReportSubcategories.SKIP_ON_OOPS,
  CertificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
];

const DeprecatedCategories = [
  CertificationIssueReportCategories.TECHNICAL_PROBLEM,
  CertificationIssueReportCategories.OTHER,
  CertificationIssueReportCategories.LATE_OR_LEAVING,
  CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN,
];

const DeprecatedSubcategories = [
  CertificationIssueReportSubcategories.LINK_NOT_WORKING,
  CertificationIssueReportSubcategories.OTHER,
  CertificationIssueReportSubcategories.LEFT_EXAM_ROOM,
];

export default {
  CertificationIssueReportCategories,
  CertificationIssueReportSubcategories,
  ImpactfulCategories,
  ImpactfulSubcategories,
  DeprecatedCategories,
  DeprecatedSubcategories,
};
