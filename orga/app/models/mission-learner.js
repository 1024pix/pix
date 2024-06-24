import Model, { attr } from '@ember-data/model';

export default class MissionLearner extends Model {
  @attr('string') division;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') organizationId;
  @attr('string') status;

  get displayableStatus() {
    return `pages.missions.details.learners.list.mission-status.${this.status}`;
  }
}
