import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulePreviewRoute extends Route {
  @service router;
  @service featureToggles;

  beforeModel() {
    if (!this.featureToggles.featureToggles.isModulePreviewEnabled) {
      this.router.transitionTo('authenticated.index');
    }
  }
}
