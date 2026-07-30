import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkEditRoute extends Route {
  @service store;
  @service router;

  async model() {
    const { activeVersion } = this.modelFor('authenticated.certification-frameworks.certification-framework.versions');

    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    const draftVersion = await this.store.findRecord('certification-version', versionId);

    return {
      activeVersion,
      draftVersion,
    };
  }
}
