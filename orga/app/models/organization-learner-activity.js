import Model, { hasMany } from '@ember-data/model';

export default class OrganizationLearnerActivity extends Model {
  @hasMany('organization-learner-participation', { async: true, inverse: 'organizationLearnerActivity' })
  organizationLearnerParticipations;
  @hasMany('organization-learner-statistic', { async: true, inverse: 'organizationLearnerActivity' })
  organizationLearnerStatistics;
}
