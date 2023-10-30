import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class Missions extends Controller {
  //TODO rename this service
  @service currentLearner;

  @action
  missionCompleted(missionId) {
    return this.model.completedMissionIds.includes(missionId);
  }
  get schoolUrl() {
    return this.currentLearner.learner.schoolUrl + '/students?division=' + this.model.division;
  }
}
