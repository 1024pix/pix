import Model, { attr } from '@ember-data/model';

export default class DependentUser extends Model {
  // attributes
  @attr('date-only') birthdate;
  @attr('string') redirectionUrl;
  @attr('number') organizationId;
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('string') username;
  @attr('boolean') withUsername;
}
