import Model, { attr } from '@ember-data/model';

export default class SchoolingRegistrationDependentUser extends Model {

  @attr() organizationId;
  @attr() schoolingRegistrationId;
  @attr() generatedPassword;

}
