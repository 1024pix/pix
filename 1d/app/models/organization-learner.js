import Model, { attr } from '@ember-data/model';

export default class OrganizationLearner extends Model {
  @attr id;
  @attr lastName;
  @attr firstName;
  @attr division;
  @attr organizationId;
}
