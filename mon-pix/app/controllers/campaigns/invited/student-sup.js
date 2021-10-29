import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class StudentSupController extends Controller {
  @service campaignStorage;
  @service router;

  @action
  async reconcile(schoolingRegistration) {
    await schoolingRegistration.save({ adapterOptions: { reconcileSup: true } });

    this.campaignStorage.set(this.model.code, 'associationDone', true);
    return this.router.transitionTo('campaigns.invited.fill-in-participant-external-id', this.model.code);
  }
}
