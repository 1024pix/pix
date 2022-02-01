import Model, { attr, belongsTo } from '@ember-data/model';

export default class Stage extends Model {
  @belongsTo('target-profile') targetProfile;

  @attr('number') threshold;
  @attr('string') title;
  @attr('string') message;
  @attr('string') prescriberTitle;
  @attr('string') prescriberDescription;

  get hasPrescriberTitle() {
    return Boolean(this.prescriberTitle);
  }

  get hasPrescriberDescription() {
    return Boolean(this.prescriberDescription);
  }
}
