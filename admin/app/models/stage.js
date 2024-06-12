import Model, { attr, belongsTo } from '@ember-data/model';

export default class Stage extends Model {
  @belongsTo('stage-collection', { async: true, inverse: 'stages' }) stageCollection;

  @attr('number') threshold;
  @attr('number') level;
  @attr() isFirstSkill;
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
    return this.level !== null;
  }

  get isBeingCreated() {
    return !this.id;
  }

  get isZeroStage() {
    return this.level === 0 || this.threshold === 0;
  }

  get levelAsString() {
    return this.level.toString();
  }
}
