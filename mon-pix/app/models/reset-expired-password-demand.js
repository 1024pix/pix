import Model, { attr } from '@ember-data/model';

export default class ResetExpiredPasswordDemand extends Model {
  @attr('string') username;
  @attr('string') newPassword;
  @attr('string') oneTimePassword;
}

