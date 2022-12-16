import Model, { attr } from '@ember-data/model';

export default class OrganizationLearnerIdentity extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
}
