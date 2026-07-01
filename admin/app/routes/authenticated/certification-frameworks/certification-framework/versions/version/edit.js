import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkEditRoute extends Route {
  @service store;

  model() {
    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    return this.store.findRecord('certification-version', versionId);
  }

  resetController(controller, isExiting) {
    if (isExiting && controller.model.hasDirtyAttributes) {
      controller.model.rollbackAttributes();
    }
  }
}
