import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class StudentScoController extends Controller {
  @service campaignStorage;
  @service router;

  @action
  async reconcile(scoOrganizationLearner, adapterOptions) {
    const mustNotRedirectAfterSave = adapterOptions.withReconciliation === false;
    await scoOrganizationLearner.save({ adapterOptions });

    if (mustNotRedirectAfterSave) {
      return;
    }

    this.campaignStorage.set(this.model.code, 'associationDone', true);
    this.router.transitionTo('campaigns.invited.fill-in-participant-external-id', this.model.code);
    return;
  }
}
