import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class StudentScoController extends Controller {
  @service campaignStorage;
  @service router;

  @action
  async reconcile(schoolingRegistration, adapterOptions) {
    const mustNotRedirectAfterSave = adapterOptions.withReconciliation === false;
    await schoolingRegistration.save({ adapterOptions });

    if (mustNotRedirectAfterSave) {
      return;
    }

    this.campaignStorage.set(this.model.code, 'associationDone', true);
    return this.router.transitionTo('campaigns.invited.fill-in-participant-external-id', this.model.code);
  }
}
