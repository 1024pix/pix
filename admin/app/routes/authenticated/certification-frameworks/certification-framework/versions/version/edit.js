import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkEditRoute extends Route {
  @service store;
  @service router;

  model() {
    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    return this.store.findRecord('certification-version', versionId);
  }

  afterModel(version) {
    if (!version.isDraft) {
      this.router.transitionTo('authenticated.certification-frameworks.certification-framework');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting && controller.model.hasDirtyAttributes) {
      controller.model.rollbackAttributes();
    }
  }
}
