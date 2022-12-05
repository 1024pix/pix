import Model, { attr } from '@ember-data/model';

export default class UserLogin extends Model {
  @attr() blockedAt;
  @attr() temporaryBlockedUntil;
  @attr() failureCount;
}
