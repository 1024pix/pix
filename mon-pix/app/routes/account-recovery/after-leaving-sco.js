import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AfterLeavingScoRoute extends Route {
  @service featureToggles;

  beforeModel() {
    if (!this.featureToggles.featureToggles.isScoAccountRecoveryEnabled) {
      this.replaceWith('/connexion');
    }
  }

}
