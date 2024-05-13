import Model, { attr } from '@ember-data/model';

export default class Assessment extends Model {
  @attr('string') state;
  @attr('string') missionId;
  @attr('string') organizationLearnerId;
}
