import Model, { attr } from '@ember-data/model';

export default class StudentDependentUser extends Model {

  // attributes
  @attr('date-only') birthdate;
  @attr('string') campaignCode;
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') password;
  @attr('string') username;
  @attr('boolean') withUsername;
}
