import Model, { attr } from '@warp-drive/legacy/model';

export default class OidcIdentityProvider extends Model {
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() code;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() organizationName;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() slug;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() shouldCloseSession;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() source;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() isVisible;
}
