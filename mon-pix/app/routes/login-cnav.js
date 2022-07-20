import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * @deprecated use the new route connexion/:identity_provider_name
 */
export default class LoginCnavRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('authentication.login-oidc', 'cnav');
  }
}
