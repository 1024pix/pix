import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkEditRoute extends Route {
  @service store;

  async model() {
    const { version_id: versionId } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework.versions.version',
    );
    const { certification_framework_key: scope } = this.paramsFor(
      'authenticated.certification-frameworks.certification-framework',
    );
    const version = await this.store.findRecord('certification-version', versionId);
    return {
      scope,
      version,
    };
  }
}
