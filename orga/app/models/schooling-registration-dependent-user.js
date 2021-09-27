import Model, { attr } from '@ember-data/model';

export default class SchoolingRegistrationDependentUser extends Model {
  @attr('number') organizationId;
  @attr('number') schoolingRegistrationId;
  @attr('string') generatedPassword;
  @attr('string') username;
}
