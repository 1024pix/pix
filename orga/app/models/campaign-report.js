import Model, { attr, hasMany } from '@ember-data/model';

export default class CampaignReport extends Model {
  @attr('number') participationsCount;
  @attr('number') sharedParticipationsCount;

  @hasMany('stage') stages;

  get hasStages() {
    return Boolean(this.stages) && this.stages.length > 0;
  }
}
