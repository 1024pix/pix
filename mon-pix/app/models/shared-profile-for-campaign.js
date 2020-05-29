import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class SharedProfileForCampaign extends Model {
  @attr('number') pixScore;
  @attr('date') sharedAt;
  @hasMany('scorecard') scorecards;

  @computed('scorecards.@each.area')
  get areasCode() {
    return this.scorecards.mapBy('area.code').uniq();
  }
}
