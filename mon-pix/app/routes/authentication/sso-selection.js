import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SsoSelectionRoute extends Route {
  @service currentDomain;
  @service router;

  // Controller and template are defined here because this route is used for 2 paths
  // /connexion/sso-selection and /inscription/sso-selection
  controllerName = 'authentication.sso-selection';
  templateName = 'authentication.sso-selection';

  redirect() {
    if (this.currentDomain.isFranceDomain) return;

    this.router.transitionTo('authentication');
  }
}
