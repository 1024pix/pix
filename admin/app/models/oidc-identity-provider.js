import Model, { attr } from '@ember-data/model';

export default class OidcIdentityProvider extends Model {
  @attr() code;
  @attr() organizationName;
  @attr() shouldCloseSession;
  @attr() source;
}
