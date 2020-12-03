import Model, { attr, belongsTo } from '@ember-data/model';

export const certificationIssueReportCategoriesLabel = {
  OTHER: 'Autre incident',
  CANDIDATE_INFORMATIONS_CHANGES: 'Modification infos candidat',
  LATE_OR_LEAVING: 'Retard, absence ou départ',
  CONNEXION_OR_END_SCREEN: 'Connexion et fin de test',
};

export default class CertificationIssueReport extends Model {
  @attr('string') category;
  @attr('string') description;

  @belongsTo('certification-report') certificationReport;
}
