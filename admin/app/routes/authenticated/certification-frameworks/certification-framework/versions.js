import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class VersionsRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework',
    );
  }

  async model() {
    const { frameworkKey, frameworkHistory } = this.modelFor(
      'authenticated.certification-frameworks.certification-framework',
    );
    const activeVersion = frameworkHistory.activeHistory
      ? await this.store.findRecord('certification-version', frameworkHistory.activeHistory.id)
      : null;
    return { frameworkKey, activeVersion };
  }
}
