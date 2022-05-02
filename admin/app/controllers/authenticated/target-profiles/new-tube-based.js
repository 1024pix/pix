import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewTubeBasedController extends Controller {
  @service router;

  @action
  goBackToTargetProfileList() {
    this.router.transitionTo('authenticated.target-profiles.list');
  }
}
