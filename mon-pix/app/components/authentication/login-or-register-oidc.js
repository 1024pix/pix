import Component from '@glimmer/component';
import IdentityProviders from 'mon-pix/identity-providers';
import { inject as service } from '@ember/service';

export default class LoginOrRegisterOidcComponent extends Component {
  @service url;

  get identityProviderOrganizationName() {
    return IdentityProviders[this.args.identityProviderSlug].organizationName;
  }

  get homeUrl() {
    return this.url.homeUrl;
  }
}
