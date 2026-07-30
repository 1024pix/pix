import Model, { attr } from '@warp-drive/legacy/model';

export default class AuthenticationMethod extends Model {
  @attr() identityProvider;
  @attr() authenticationComplement;
  @attr() lastLoggedAt;
}
