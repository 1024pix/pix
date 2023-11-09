import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class Missions extends Controller {
  //TODO rename this service
  @service currentLearner;
  @service router;

  @action
  missionCompleted(missionId) {
    return this.model.completedMissionIds.includes(missionId);
  }
  get schoolUrl() {
    return this.currentLearner.learner.schoolUrl + '/students?division=' + this.model.division;
  }

  @action
  goToMission(id) {
    const cards = document.getElementsByClassName('card');
    for (const card of cards) {
      card.classList.add('card--loading');
      card.setAttribute('disabled', '');
    }
    this.router.transitionTo('identified.missions.mission', id);
  }
}
