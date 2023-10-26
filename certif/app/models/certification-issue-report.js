import Model, { attr, belongsTo } from '@ember-data/model';

export const v3CertificationIssueReportCategories = {
  CANDIDATE_INFORMATIONS_CHANGES: 'CANDIDATE_INFORMATIONS_CHANGES',
  SIGNATURE_ISSUE: 'SIGNATURE_ISSUE',
  FRAUD: 'FRAUD',
  NON_BLOCKING_CANDIDATE_ISSUE: 'NON_BLOCKING_CANDIDATE_ISSUE',
  NON_BLOCKING_TECHNICAL_ISSUE: 'NON_BLOCKING_TECHNICAL_ISSUE',
};

export const certificationIssueReportCategories = {
  ...v3CertificationIssueReportCategories,
  IN_CHALLENGE: 'IN_CHALLENGE',
};

export const certificationIssueReportSubcategories = {
  NAME_OR_BIRTHDATE: 'NAME_OR_BIRTHDATE',
  EXTRA_TIME_PERCENTAGE: 'EXTRA_TIME_PERCENTAGE',
  IMAGE_NOT_DISPLAYING: 'IMAGE_NOT_DISPLAYING',
  EMBED_NOT_WORKING: 'EMBED_NOT_WORKING',
  FILE_NOT_OPENING: 'FILE_NOT_OPENING',
  WEBSITE_UNAVAILABLE: 'WEBSITE_UNAVAILABLE',
  WEBSITE_BLOCKED: 'WEBSITE_BLOCKED',
  EXTRA_TIME_EXCEEDED: 'EXTRA_TIME_EXCEEDED',
  SOFTWARE_NOT_WORKING: 'SOFTWARE_NOT_WORKING',
  UNINTENTIONAL_FOCUS_OUT: 'UNINTENTIONAL_FOCUS_OUT',
  SKIP_ON_OOPS: 'SKIP_ON_OOPS',
  ACCESSIBILITY_ISSUE: 'ACCESSIBILITY_ISSUE',
};

export const inChallengeIssueReportSubCategories = [
  certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
  certificationIssueReportSubcategories.EMBED_NOT_WORKING,
  certificationIssueReportSubcategories.FILE_NOT_OPENING,
  certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
  certificationIssueReportSubcategories.WEBSITE_BLOCKED,
  certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
  certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
  certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
  certificationIssueReportSubcategories.SKIP_ON_OOPS,
  certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
];

export const categoryToLabel = {
  [certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]:
    'pages.session-finalization.add-issue-modal.category-labels.candidate-informations-changes',
  [certificationIssueReportCategories.SIGNATURE_ISSUE]:
    'pages.session-finalization.add-issue-modal.category-labels.signature-issue',
  [certificationIssueReportCategories.FRAUD]: 'pages.session-finalization.add-issue-modal.category-labels.fraud',
  [certificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE]:
    'pages.session-finalization.add-issue-modal.category-labels.non-blocking-technical-issue',
  [certificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE]:
    'pages.session-finalization.add-issue-modal.category-labels.non-blocking-candidate-issue',
  [certificationIssueReportCategories.IN_CHALLENGE]:
    'pages.session-finalization.add-issue-modal.category-labels.in-challenge',
};

export const subcategoryToLabel = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.name-or-birthdate',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.extra-time-percentage',
  [certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.image-not-displaying',
  [certificationIssueReportSubcategories.EMBED_NOT_WORKING]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.embed-not-working',
  [certificationIssueReportSubcategories.FILE_NOT_OPENING]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.file-not-opening',
  [certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.website-unavailable',
  [certificationIssueReportSubcategories.WEBSITE_BLOCKED]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.website-blocked',
  [certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.extra-time-exceeded',
  [certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.software-not-working',
  [certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.unintentional-focus-out',
  [certificationIssueReportSubcategories.SKIP_ON_OOPS]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.skip-on-oops',
  [certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE]:
    'pages.session-finalization.add-issue-modal.subcategory-labels.accessibility-issue',
};

export const categoryToCode = {
  [certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: 'C1-C2',
  [certificationIssueReportCategories.SIGNATURE_ISSUE]: 'C4',
  [certificationIssueReportCategories.FRAUD]: 'C6',
  [certificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE]: 'C7',
  [certificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE]: 'C8',
  [certificationIssueReportCategories.IN_CHALLENGE]: 'E1-E12',
};

export const subcategoryToCode = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'C1',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]: 'C2',
  [certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]: 'E1',
  [certificationIssueReportSubcategories.EMBED_NOT_WORKING]: 'E2',
  [certificationIssueReportSubcategories.FILE_NOT_OPENING]: 'E3',
  [certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]: 'E4',
  [certificationIssueReportSubcategories.WEBSITE_BLOCKED]: 'E5',
  [certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]: 'E8',
  [certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]: 'E9',
  [certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]: 'E10',
  [certificationIssueReportSubcategories.SKIP_ON_OOPS]: 'E11',
  [certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE]: 'E12',
};

export const subcategoryToTextareaLabel = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]:
    'pages.session-finalization.add-issue-modal.subcategory-to-textarea-labels.name-or-birthdate',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]:
    'pages.session-finalization.add-issue-modal.subcategory-to-textarea-labels.extra-time-percentage',
};

export default class CertificationIssueReport extends Model {
  @attr('string') category;
  @attr('string') subcategory;
  @attr('string') description;
  @attr('string') questionNumber;

  @belongsTo('certification-report', { async: false, inverse: 'certificationIssueReports' }) certificationReport;

  get categoryLabel() {
    return categoryToLabel[this.category];
  }

  get subcategoryLabel() {
    return this.subcategory ? subcategoryToLabel[this.subcategory] : '';
  }

  get categoryCode() {
    return categoryToCode[this.category];
  }

  get subcategoryCode() {
    return subcategoryToCode[this.subcategory];
  }
}
