import Model, { attr } from '@ember-data/model';

export default class OidcIdentityProvider extends Model {
  @attr() code;
  @attr() organizationName;
  @attr() slug;
  @attr() shouldCloseSession;
  @attr() source;
}
