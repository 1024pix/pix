import Model, { attr, belongsTo } from '@ember-data/model';

export default class Training extends Model {
  @attr('string') status;
  @attr('string') title;
  @attr('string') link;
  @attr('string') type;
  @attr('string') locale;
  @attr() duration;

  @belongsTo('campaign-participation') campaignParticpation;

  get isAutoformation() {
    return this.type === 'autoformation';
  }
}
