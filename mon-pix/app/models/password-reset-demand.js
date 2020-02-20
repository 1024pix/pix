import Model, { attr } from '@ember-data/model';

export default class PasswordResetDemand extends Model {

  // attributes
  @attr('string') email;
}
