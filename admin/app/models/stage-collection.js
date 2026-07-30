import Model, { hasMany } from '@warp-drive/legacy/model';

export default class StageCollection extends Model {
  @hasMany('stage', { async: true, inverse: 'stageCollection' }) stages;

  get isLevelType() {
    const zeroStage = this.hasMany('stages')
      .value()
      .find((stage) => stage.isZeroStage);
    return zeroStage?.isTypeLevel;
  }

  get hasStages() {
    return this.hasMany('stages').value().length > 0;
  }
}
