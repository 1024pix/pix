import { service } from '@ember/service';
import Model, { attr } from '@ember-data/model';

export default class OidcIdentityProvider extends Model {
  @service url;

  @attr() code;
  @attr() application;
  @attr() applicationTld;
  @attr() organizationName;
  @attr() slug;
  @attr() shouldCloseSession;
  @attr() source;

  get contextualizedName() {
    return `${this.organizationName} – ${this.url.getApplicationHost(this.application, this.applicationTld)}`;
  }
}
