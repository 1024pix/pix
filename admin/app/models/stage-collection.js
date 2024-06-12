import Model, { hasMany } from '@ember-data/model';

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

  get sortedStages() {
    const persistedStages = this.hasMany('stages')
      .value()
      .filter((stage) => !stage.isBeingCreated);
    const beingCreatedStages = this.hasMany('stages')
      .value()
      .filter((stage) => stage.isBeingCreated);
    return [
      ...persistedStages.sort((stageA, stageB) => {
        let stageAValue, stageBValue;
        if (this.isLevelType) {
          stageAValue = stageA.isFirstSkill ? 0.5 : stageA.level;
          stageBValue = stageB.isFirstSkill ? 0.5 : stageB.level;
        } else {
          stageAValue = stageA.isFirstSkill ? 0.5 : stageA.threshold;
          stageBValue = stageB.isFirstSkill ? 0.5 : stageB.threshold;
        }
        return stageAValue - stageBValue;
      }),
      ...beingCreatedStages,
    ];
  }
}
