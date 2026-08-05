import Model, { attr } from '@warp-drive/legacy/model';

export default class ResetExpiredPasswordDemand extends Model {
  @attr('string') passwordResetToken;
  @attr('string') newPassword;
  @attr('string') login;
}
