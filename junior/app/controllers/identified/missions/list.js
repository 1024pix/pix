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
  _hasMissionStarted(missionId) {
    return this.model.organizationLearner.startedMissionIds?.includes(missionId);
  }

  _getStatus(missionId) {
    return this._hasMissionStarted(missionId) ? 'started' : 'to-start';
  }

  @action
  getMissionLabelStatus(missionId) {
    const status = this._getStatus(missionId);
    return this.intl.t(`pages.missions.list.status.${status}.label`);
  }

  @action
  getMissionButtonLabel(missionId) {
    const status = this._getStatus(missionId);
    return this.intl.t(`pages.missions.list.status.${status}.button-label`);
  }

  get schoolUrl() {
    return this.currentLearner.learner.schoolUrl + '/students?division=' + this.model.organizationLearner.division;
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
