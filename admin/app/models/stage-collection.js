import Model, { hasMany } from '@ember-data/model';

export default class StageCollection extends Model {
  @hasMany('stage') stages;

  get isLevelType() {
    const zeroStage = this.stages.find((stage) => stage.isZeroStage);
    return zeroStage?.isTypeLevel;
  }

  get hasStages() {
    return this.stages.length > 0;
  }
}
