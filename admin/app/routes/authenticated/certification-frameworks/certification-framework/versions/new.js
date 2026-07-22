import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FrameworkNewRoute extends Route {
  @service store;
  @service router;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework',
    );
  }

  async model() {
    const frameworks = await this.store.findAll('framework');
    const item = await this.modelFor('authenticated.certification-frameworks.certification-framework.versions');

    return RSVP.hash({
      frameworks,
      scope: item.frameworkKey,
      activeVersion: item.activeVersion,
    });
  }
}
