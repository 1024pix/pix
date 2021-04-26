import Model, { attr, belongsTo } from '@ember-data/model';

export const certificationIssueReportCategories = {
  OTHER: 'OTHER',
  CANDIDATE_INFORMATIONS_CHANGES: 'CANDIDATE_INFORMATIONS_CHANGES',
  LATE_OR_LEAVING: 'LATE_OR_LEAVING',
  CONNECTION_OR_END_SCREEN: 'CONNECTION_OR_END_SCREEN',
  IN_CHALLENGE: 'IN_CHALLENGE',
  FRAUD: 'FRAUD',
  TECHNICAL_PROBLEM: 'TECHNICAL_PROBLEM',
};

export const certificationIssueReportSubcategories = {
  NAME_OR_BIRTHDATE: 'NAME_OR_BIRTHDATE',
  EXTRA_TIME_PERCENTAGE: 'EXTRA_TIME_PERCENTAGE',
  LEFT_EXAM_ROOM: 'LEFT_EXAM_ROOM',
  SIGNATURE_ISSUE: 'SIGNATURE_ISSUE',
  IMAGE_NOT_DISPLAYING: 'IMAGE_NOT_DISPLAYING',
  LINK_NOT_WORKING: 'LINK_NOT_WORKING',
  EMBED_NOT_WORKING: 'EMBED_NOT_WORKING',
  FILE_NOT_OPENING: 'FILE_NOT_OPENING',
  WEBSITE_UNAVAILABLE: 'WEBSITE_UNAVAILABLE',
  WEBSITE_BLOCKED: 'WEBSITE_BLOCKED',
  OTHER: 'OTHER',
};

export const categoryToLabel = {
  [certificationIssueReportCategories.OTHER]: 'Autre (si aucune des catégories ci-dessus ne correspond au signalement)',
  [certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: 'Modification infos candidat',
  [certificationIssueReportCategories.LATE_OR_LEAVING]: 'Retard, absence ou départ',
  [certificationIssueReportCategories.FRAUD]: 'Suspicion de fraude',
  [certificationIssueReportCategories.TECHNICAL_PROBLEM]: 'Problème technique non bloquant',
  [certificationIssueReportCategories.CONNECTION_OR_END_SCREEN]: 'Le candidat n’a pas pu terminer, faute de temps',
  [certificationIssueReportCategories.IN_CHALLENGE]: 'Problème sur une épreuve',
};

export const subcategoryToLabel = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'Modification des prénom/nom/date de naissance',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]: 'Ajout/modification du temps majoré',
  [certificationIssueReportSubcategories.LEFT_EXAM_ROOM]: 'Écran de fin de test non vu',
  [certificationIssueReportSubcategories.SIGNATURE_ISSUE]: 'Était présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne',
  [certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]: 'L\'image ne s\'affiche pas',
  [certificationIssueReportSubcategories.EMBED_NOT_WORKING]: 'Le simulateur/l\'application ne s\'affiche pas',
  [certificationIssueReportSubcategories.FILE_NOT_OPENING]: 'Le fichier à télécharger ne s\'ouvre pas',
  [certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]: 'Le site à visiter est indisponible/en maintenance/inaccessible',
  [certificationIssueReportSubcategories.WEBSITE_BLOCKED]: 'Le site est bloqué par les restrictions réseau de l\'établissement (réseaux sociaux par ex.)',
  [certificationIssueReportSubcategories.LINK_NOT_WORKING]: 'Le lien ne fonctionne pas',
  [certificationIssueReportSubcategories.OTHER]: 'Autre incident lié à une question',
};

export const categoryToCode = {
  [certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: 'C1-C2',
  [certificationIssueReportCategories.LATE_OR_LEAVING]: 'C3-C4',
  [certificationIssueReportCategories.CONNECTION_OR_END_SCREEN]: 'C5',
  [certificationIssueReportCategories.IN_CHALLENGE]: 'E1-E7',
  [certificationIssueReportCategories.FRAUD]: 'C6',
  [certificationIssueReportCategories.TECHNICAL_PROBLEM]: 'A1',
  [certificationIssueReportCategories.OTHER]: 'A2',
};

export const subcategoryToCode = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'C1',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]: 'C2',
  [certificationIssueReportSubcategories.LEFT_EXAM_ROOM]: 'C3',
  [certificationIssueReportSubcategories.SIGNATURE_ISSUE]: 'C4',
  [certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]: 'E1',
  [certificationIssueReportSubcategories.EMBED_NOT_WORKING]: 'E2',
  [certificationIssueReportSubcategories.FILE_NOT_OPENING]: 'E3',
  [certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]: 'E4',
  [certificationIssueReportSubcategories.WEBSITE_BLOCKED]: 'E5',
  [certificationIssueReportSubcategories.LINK_NOT_WORKING]: 'E6',
  [certificationIssueReportSubcategories.OTHER]: 'E7',
};

export const subcategoryToTextareaLabel = {
  [certificationIssueReportSubcategories.LEFT_EXAM_ROOM]: 'Précisez et indiquez l’heure de sortie',
  [certificationIssueReportSubcategories.SIGNATURE_ISSUE]: 'Précisez',
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'Précisez les informations à modifier',
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
