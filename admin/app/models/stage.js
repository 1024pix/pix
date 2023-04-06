import Model, { attr, belongsTo } from '@ember-data/model';

export default class Stage extends Model {
  @belongsTo('stage-collection') stageCollection;

  @attr('number') threshold;
  @attr('number') level;
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

  get isTypeLevel() {
    return this.level != null;
  }

  get isBeingCreated() {
    return !this.id;
  }
}
