import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ImportRoute extends Route {
  @service featureToggles;
  @service router;

  beforeModel() {
    const { isMassiveSessionManagementEnabled } = this.featureToggles.featureToggles;

    if (!isMassiveSessionManagementEnabled) {
      return this.router.replaceWith('authenticated.sessions.list');
    }
  }

  resetController(controller) {
    controller.reset();
  }
}
