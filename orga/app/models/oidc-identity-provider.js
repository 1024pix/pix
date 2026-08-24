import Model, { attr } from '@warp-drive/legacy/model';

export default class OidcIdentityProvider extends Model {
  @attr() code;
  @attr() organizationName;
  @attr() slug;
  @attr() shouldCloseSession;
  @attr() source;
  @attr() isVisible;
}
