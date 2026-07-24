import Model, { attr } from '@warp-drive/legacy/model';

export default class AuthenticationMethod extends Model {
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() identityProvider;
}
