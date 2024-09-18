import Model, { attr } from '@ember-data/model';

export default class MissionLearner extends Model {
  @attr('string') division;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') organizationId;
  @attr('string') missionStatus;
  @attr result;

  get displayableStatus() {
    return `pages.missions.mission.table.activities.mission-status.${this.missionStatus}`;
  }

  get displayableGlobalResult() {
    return `pages.missions.mission.table.result.mission-result.${this.result?.global}`;
  }

  get displayableDareResult() {
    return `pages.missions.mission.table.result.mission-dare-result.${this.result?.dare}`;
  }
}
