const _ = require('lodash');

class StageCollection {
  constructor({ campaignId, stages }) {
    this._id = campaignId;

    const sortedStages = _.sortBy(stages, 'threshold');

    const hasFirstSkillStage = Boolean(sortedStages.find((stage) => stage.isFirstSkill === true));
    if (hasFirstSkillStage) {
      const firstSkillStage = sortedStages.slice(sortedStages.length - 1);

      this._stages = sortedStages.slice(0, sortedStages.length - 1);
      this._stages.splice(1, 0, ...firstSkillStage);
    } else {
      this._stages = sortedStages;
    }
    this._totalStages = this._stages.length;
  }

  get hasStage() {
    return this._totalStages > 0;
  }

  get stages() {
    return this._stages;
  }

  get totalStages() {
    return this._totalStages;
  }

  getReachedStage(validatedSkillCount, masteryPercentage) {
    let reachedStageIndex;
    if (validatedSkillCount === 0) {
      reachedStageIndex = 0;
    } else {
      this._stages.forEach(({ threshold, isFirstSkill }, index) => {
        if (isFirstSkill || threshold <= masteryPercentage) reachedStageIndex = index;
        else return;
      });
    }

    const reachedStage = this._stages[reachedStageIndex];

    return {
      id: reachedStage.id,
      title: reachedStage.title,
      message: reachedStage.message,
      prescriberTitle: reachedStage.prescriberTitle,
      prescriberDescription: reachedStage.prescriberDescription,
      totalStage: this._totalStages,
      reachedStage: reachedStageIndex + 1,
    };
  }
}

module.exports = StageCollection;
