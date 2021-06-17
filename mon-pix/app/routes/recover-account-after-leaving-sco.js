import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RecoverAccountAfterLeavingScoRoute extends Route {
  @service featureToggles;

  beforeModel() {
    if (!this.featureToggles.featureToggles.isScoAccountRecoveryEnabled) {
      this.replaceWith('/connexion');
    }
  }

}
