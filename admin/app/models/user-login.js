import Model, { attr } from '@warp-drive/legacy/model';

export default class UserLogin extends Model {
  @attr() blockedAt;
  @attr() temporaryBlockedUntil;
  @attr() failureCount;
}
