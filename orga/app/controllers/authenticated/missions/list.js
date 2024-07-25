import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MissionList extends Controller {
  @service router;
  @service currentUser;
  @service currentDomain;

  @action
  goToMissionDetails(id) {
    this.router.transitionTo('authenticated.missions.details', id);
  }

  get schoolCode() {
    return this.currentUser.organization.schoolCode ?? '';
  }

  get juniorUrl() {
    return this.currentDomain.getJuniorBaseUrl();
  }
}
