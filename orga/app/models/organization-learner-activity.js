import Model, { hasMany } from '@ember-data/model';

export default class OrganizationLeanerActivity extends Model {
  @hasMany('OrganizationLearnerParticipation') organizationLearnerParticipations;
}
