import Model, { attr } from '@warp-drive/legacy/model';

export default class AccountInfo extends Model {
  @attr('string') email;
  @attr('string') username;
  @attr('boolean') canSelfDeleteAccount;
  @attr('boolean') canAddEmailConnectionMethod;
}
