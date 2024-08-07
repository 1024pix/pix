import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class List extends Controller {
  //TODO rename this service
  @service currentLearner;
  @service router;
  @service intl;

  @action
  isMissionCompleted(missionId) {
    return this.model.organizationLearner.completedMissionIds?.includes(missionId);
  }

  @action
  isMissionStarted(missionId) {
    return this.model.organizationLearner.startedMissionIds?.includes(missionId);
  }

  #getStatus(missionId) {
    return this.isMissionStarted(missionId) ? 'started' : 'to-start';
  }

  @action
  getMissionLabelStatus(missionId) {
    const status = this.#getStatus(missionId);
    return this.intl.t(`pages.missions.list.status.${status}.label`);
  }

  @action
  getMissionButtonLabel(missionId) {
    const status = this.#getStatus(missionId);
    return this.intl.t(`pages.missions.list.status.${status}.button-label`);
  }

  get schoolUrl() {
    return this.currentLearner.learner.schoolUrl + '/students?division=' + this.model.organizationLearner.division;
  }

  #disableCards() {
    const cards = document.getElementsByClassName('card');
    for (const card of cards) {
      card.classList.add('card--loading');
      card.setAttribute('disabled', '');
    }
  }

  @action
  goToMission(missionId) {
    this.#disableCards();

    let route = 'identified.missions.mission';
    if (this.isMissionStarted(missionId)) {
      route += '.resume';
    }
    this.router.transitionTo(route, missionId);
  }
}
