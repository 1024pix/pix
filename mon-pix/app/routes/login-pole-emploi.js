import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * @deprecated use the new route connexion/:identity_provider_name
 */
export default class LoginPoleEmploiRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('authentication.login-oidc', 'pole-emploi');
  }
}
