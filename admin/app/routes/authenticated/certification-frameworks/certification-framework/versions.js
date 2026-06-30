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
    return this.modelFor('authenticated.certification-frameworks.certification-framework');
  }
}
