import Model, { hasMany } from '@ember-data/model';

export default class OrganizationLearnerActivity extends Model {
  @hasMany('OrganizationLearnerParticipation', { async: true, inverse: 'organizationLearnerActivity' })
  organizationLearnerParticipations;
  @hasMany('OrganizationLearnerStatistic', { async: true, inverse: 'organizationLearnerActivity' })
  organizationLearnerStatistics;
}
