import Model, { attr, belongsTo } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';
import isNull from 'lodash/isNull';

export const certificationIssueReportCategories = {
  OTHER: 'OTHER',
  CANDIDATE_INFORMATIONS_CHANGES: 'CANDIDATE_INFORMATIONS_CHANGES',
  LATE_OR_LEAVING: 'LATE_OR_LEAVING',
  SIGNATURE_ISSUE: 'SIGNATURE_ISSUE',
  CONNECTION_OR_END_SCREEN: 'CONNECTION_OR_END_SCREEN',
  IN_CHALLENGE: 'IN_CHALLENGE',
  FRAUD: 'FRAUD',
  TECHNICAL_PROBLEM: 'TECHNICAL_PROBLEM',
  NON_BLOCKING_CANDIDATE_ISSUE: 'NON_BLOCKING_CANDIDATE_ISSUE',
  NON_BLOCKING_TECHNICAL_ISSUE: 'NON_BLOCKING_TECHNICAL_ISSUE',
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
  EXTRA_TIME_EXCEEDED: 'EXTRA_TIME_EXCEEDED',
  SOFTWARE_NOT_WORKING: 'SOFTWARE_NOT_WORKING',
  UNINTENTIONAL_FOCUS_OUT: 'UNINTENTIONAL_FOCUS_OUT',
  SKIP_ON_OOPS: 'SKIP_ON_OOPS',
  ACCESSIBILITY_ISSUE: 'ACCESSIBILITY_ISSUE',
};

export const categoryToLabel = {
  [certificationIssueReportCategories.OTHER]: 'Autre (si aucune des catégories ci-dessus ne correspond au signalement)',
  [certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: 'Modification infos candidat',
  [certificationIssueReportCategories.LATE_OR_LEAVING]: 'Retard, absence ou départ',
  [certificationIssueReportCategories.SIGNATURE_ISSUE]:
    'Était présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne',
  [certificationIssueReportCategories.FRAUD]: 'Suspicion de fraude',
  [certificationIssueReportCategories.TECHNICAL_PROBLEM]: 'Problème technique non bloquant',
  [certificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE]: 'Incident technique non bloquant',
  [certificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE]: 'Incident lié au candidat non bloquant',
  [certificationIssueReportCategories.CONNECTION_OR_END_SCREEN]: 'Le candidat n’a pas pu terminer, faute de temps',
  [certificationIssueReportCategories.IN_CHALLENGE]: 'Problème technique sur une question',
};

export const subcategoryToLabel = {
  [certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]: 'Modification des prénom/nom/date de naissance',
  [certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]: 'Ajout/modification du temps majoré',
  [certificationIssueReportSubcategories.LEFT_EXAM_ROOM]: 'Écran de fin de test non vu',
  [certificationIssueReportSubcategories.SIGNATURE_ISSUE]:
    'Était présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne',
  [certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING]: "L'image ne s'affiche pas",
  [certificationIssueReportSubcategories.EMBED_NOT_WORKING]: "Le simulateur/l'application ne s'affiche pas",
  [certificationIssueReportSubcategories.FILE_NOT_OPENING]:
    "Le fichier à télécharger ne se télécharge pas ou ne s'ouvre pas",
  [certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE]:
    'Le site à visiter est indisponible/en maintenance/inaccessible',
  [certificationIssueReportSubcategories.WEBSITE_BLOCKED]:
    "Le site est bloqué par les restrictions réseau de l'établissement (réseaux sociaux par ex.)",
  [certificationIssueReportSubcategories.LINK_NOT_WORKING]: 'Le lien ne fonctionne pas',
  [certificationIssueReportSubcategories.OTHER]: 'Autre incident lié à une question',
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

export const subcategoryToCode = {
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

export default class CertificationIssueReportModel extends Model {
  @attr('string') category;
  @attr('string') subcategory;
  @attr('string') description;
  @attr('string') questionNumber;
  @attr('boolean') isImpactful;
  @attr() resolvedAt;
  @attr() resolution;
  @attr('boolean') hasBeenAutomaticallyResolved;

  @belongsTo('certification') certification;

  get categoryLabel() {
    return categoryToLabel[this.category];
  }

  get subcategoryLabel() {
    return this.subcategory ? subcategoryToLabel[this.subcategory] : '';
  }

  get isResolved() {
    return !isNull(this.resolvedAt);
  }

  get canBeResolved() {
    return this.isImpactful && !this.isResolved;
  }

  get canBeModified() {
    return this.isResolved && this.isImpactful && !this.hasBeenAutomaticallyResolved;
  }

  resolve = memberAction({
    type: 'patch',
    before(resolution) {
      const payload = { data: { resolution } };
      return payload;
    },
  });
}
