import Model, { attr } from '@ember-data/model';

export default class EmailVerificationCode extends Model {
  @attr('string') newEmail;
  @attr('string') password;
}
