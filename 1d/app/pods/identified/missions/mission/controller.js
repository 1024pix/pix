import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';

export default class Home extends Controller {
  @service router;

  @action
  async goToResume() {
    await this.router.transitionTo('identified.missions.mission.resume');
  }
}
