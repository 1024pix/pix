import Model, { attr, belongsTo } from '@ember-data/model';

export const certificationIssueReportCategories = {
  CANDIDATE_INFORMATIONS_CHANGES: 'CANDIDATE_INFORMATIONS_CHANGES',
  SIGNATURE_ISSUE: 'SIGNATURE_ISSUE',
  IN_CHALLENGE: 'IN_CHALLENGE',
  FRAUD: 'FRAUD',
  NON_BLOCKING_CANDIDATE_ISSUE: 'NON_BLOCKING_CANDIDATE_ISSUE',
  NON_BLOCKING_TECHNICAL_ISSUE: 'NON_BLOCKING_TECHNICAL_ISSUE',
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

export const categoryToLabel = {
  [certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: 'Modification infos candidat',
  [certificationIssueReportCategories.SIGNATURE_ISSUE]:
    'Était présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne',
  [certificationIssueReportCategories.FRAUD]: 'Suspicion de fraude',
  [certificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE]: 'Incident technique non bloquant',
  [certificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE]: 'Incident lié au candidat non bloquant',
  [certificationIssueReportCategories.IN_CHALLENGE]: 'Problème technique sur une question',
};

export const subcategoryToLabel = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'Modification des prénom/nom/date de naissance',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]: 'Ajout/modification du temps majoré',
  [certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]: "L'image ne s'affiche pas",
  [certificationIssueReportSubcategories.EMBED_NOT_WORKING]: "Le simulateur/l'application ne s'affiche pas",
  [certificationIssueReportSubcategories.FILE_NOT_OPENING]:
    "Le fichier à télécharger ne se télécharge pas ou ne s'ouvre pas",
  [certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]:
    'Le site à visiter est indisponible/en maintenance/inaccessible',
  [certificationIssueReportSubcategories.WEBSITE_BLOCKED]:
    "Le site est bloqué par les restrictions réseau de l'établissement (réseaux sociaux par ex.)",
  [certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED]:
    "Le candidat bénéficie d'un temps majoré et n'a pas pu répondre à la question dans le temps imparti",
  [certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING]:
    "Le logiciel installé sur l'ordinateur n'a pas fonctionné",
  [certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT]:
    'Le candidat a été contraint de cliquer en dehors du cadre autorisé pour une question en mode focus',
  [certificationIssueReportSubcategories.SKIP_ON_OOPS]:
    'Une page «Oups une erreur est survenue» ou tout autre problème technique lié à la plateforme a empêché le candidat de répondre à la question',
  [certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE]:
    'Problème avec l’accessibilité de la question (ex : daltonisme)',
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
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'Renseignez les informations correctes',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]: 'Précisez le temps majoré',
};

export default class CertificationIssueReport extends Model {
  @attr('string') category;
  @attr('string') subcategory;
  @attr('string') description;
  @attr('string') questionNumber;

  @belongsTo('certification-report') certificationReport;

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
