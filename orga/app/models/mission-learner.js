import Model, { attr } from '@ember-data/model';

export default class MissionLearner extends Model {
  @attr('string') division;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') organizationId;
  @attr('string') status;
  @attr('string') result;

  get displayableStatus() {
    return `pages.missions.mission.table.activities.mission-status.${this.status}`;
  }

  get displayableResult() {
    return `pages.missions.mission.table.result.mission-result.${this.result}`;
  }
}
