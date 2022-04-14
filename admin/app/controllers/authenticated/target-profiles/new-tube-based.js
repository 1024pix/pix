import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewTubeBasedController extends Controller {
  @service notifications;
  @service store;
  @service router;

  @action
  goBackToTargetProfileList() {
    this.store.deleteRecord(this.model.targetProfile);

    this.router.transitionTo('authenticated.target-profiles.list');
  }
}
