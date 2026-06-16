import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FrameworkVersionEditRoute extends Route {
  @service store;
  @service router;
  @service accessControl;

  isNotDraftVersion(draftVersion) {
    return !!draftVersion.startDate && !!draftVersion.expirationDate;
  }

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin'], 'authenticated.certification-frameworks.item.framework');
    //todo ajouter une toaster pour dire "vous n'avez pas les droits"
  }

  async model(params) {
    const item = await this.modelFor('authenticated.certification-frameworks.item');
    const draftVersion = await this.store.findRecord('certification-version', params.version_id);

    return RSVP.hash({
      scope: item.frameworkKey,
      draftVersion,
    });
  }

  async afterModel(model) {
    if (!model.draftVersion?.id || this.isNotDraftVersion(model.draftVersion)) {
      this.router.transitionTo('authenticated.certification-frameworks.item.framework', model.scope);
    }
  }
}
