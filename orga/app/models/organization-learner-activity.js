import Model, { hasMany } from '@ember-data/model';

export default class OrganizationLearnerActivity extends Model {
  @hasMany('OrganizationLearnerParticipation') organizationLearnerParticipations;
  @hasMany('OrganizationLearnerStatistic') organizationLearnerStatistics;
}
