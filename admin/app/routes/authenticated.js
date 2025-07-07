import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Oauth2Code from 'pix-admin/authenticators/oauth2-code';

export default class AuthenticatedRoute extends Route {
  @service session;

  async beforeModel(transition) {
    const encodedRedirectUri = encodeURIComponent(window.location.href);
    const authorizationUri = await Oauth2Code.buildAuthorizationUri(encodedRedirectUri);
    this.session.requireAuthentication(transition, () => {
      window.location.href = authorizationUri;
    });
  }
}
