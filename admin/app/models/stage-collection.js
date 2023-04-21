import Model, { hasMany } from '@ember-data/model';

export default class StageCollection extends Model {
  @hasMany('stage') stages;

  get isLevelType() {
    const zeroStage = this.stages.find((stage) => stage.level === 0 || stage.threshold === 0);
    return zeroStage.level === 0;
  }
}
