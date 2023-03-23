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

  get hasFirstSkillStage() {
    return Boolean(this._stages.find((stage) => stage.isFirstSkill === true));
  }

  get stages() {
    return this._stages;
  }

  get totalStages() {
    return this._totalStages;
  }

  get regularStages() {
    return this._stages.filter((stage) => !stage.isFirstSkill);
  }

  getReachedStage(validatedSkillCount, masteryPercentage) {
    if (!this.hasStage)
      return {
        id: null,
        totalStage: null,
        reachedStage: null,
        prescriberTitle: null,
        prescriberDescription: null,
      };
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

  get firstSkillStage() {
    const potentialFirstSkillStage = this._stages?.[1];
    if (potentialFirstSkillStage?.isFirstSkill) return potentialFirstSkillStage;
    return {};
  }

  isZeroStageId(stageId) {
    return this._stages[0].id === stageId;
  }

  isFirstSkillStageId(stageId) {
    return this.firstSkillStage.id === stageId;
  }

  /*
  A little word about boundaries. Let's define 4 stages such as :
    - S_0, the "zero" stage (mandatory)
    - S_fs, the "first skill" stage
    - S_a, a stage with a threshold Th_a
    - S_b, another with a higher threshold Th_b

  First case scenario : the campaign has the following stages : S_0, S_a and S_b
  Then, threshold boundaries are defined as such :
    - For S_0, from 0 to Th_a - 1
    - For S_a, from Th_a to Th_b - 1
    - For S_b, from Th_b to 100

  Other scenario : the campaign has the following stages : S_0, S_fs, S_a and S_b
  Then, threshold boundaries are defined as such :
    - For S_0, from 0 to 0
    - For S_fs, from 0 to Th_a - 1
    - For S_a, from Th_a to Th_b - 1
    - For S_b, from Th_b to 100
  The "first skill" stage is reached as soon as the participant has at least one validated skill. This does not
  automatically mean that their mastery percentage will be above 0 (in case of a campaign with many skills to evaluate).
  That's why, when campaign stages has a "first skill" stage, two more conditions must be checked to dispatch participants
  in boundaries appropriately :
  - For S_0, ensure that participant has strictly 0 validated skill
  - For S_fs, ensure that participant has at least 1 validated skill
    */
  getThresholdBoundaries() {
    const boundaries = [];
    let lastTo;
    if (this.hasFirstSkillStage) {
      boundaries.push({ id: this._stages[0].id, from: 0, to: 0 });
      boundaries.push({ id: this._stages[1].id, from: 0, to: this._stages[2] ? this._stages[2].threshold - 1 : 100 });
      lastTo = boundaries[1].to;
    } else {
      boundaries.push({ id: this._stages[0].id, from: 0, to: this._stages[1] ? this._stages[1].threshold - 1 : 100 });
      lastTo = boundaries[0].to;
    }

    for (let index = this.hasFirstSkillStage ? 2 : 1; index < this._stages.length; ++index) {
      const currentStage = this._stages[index];
      let to, from;

      if (lastTo === null) {
        from = currentStage.threshold;
      } else {
        from = lastTo + 1;
      }

      if (index + 1 >= this._stages.length) {
        to = 100;
      } else {
        const nextThreshold = this._stages[index + 1].threshold;
        to = Math.max(from, nextThreshold - 1);
      }

      lastTo = to;
      boundaries.push({ id: currentStage.id, from, to });
    }
    return boundaries;
  }

  getThresholdBoundariesForRegularStages() {
    let lastTo = null;
    const regularStages = this.regularStages;

    return regularStages.map((currentStage, index) => {
      let to, from;

      if (lastTo === null) {
        from = currentStage.threshold;
      } else {
        from = lastTo + 1;
      }

      if (index + 1 >= regularStages.length) {
        to = 100;
      } else {
        const nextThreshold = regularStages[index + 1].threshold;
        to = Math.max(from, nextThreshold - 1);
      }

      lastTo = to;
      return { id: currentStage.id, from, to };
    });
  }

  getThresholdBoundariesForFirstSkillStage() {
    const hasNextStage = Boolean(this._stages[2]);
    return {
      from: 0,
      to: hasNextStage ? this._stages[2].threshold - 1 : 100,
    };
  }
}

module.exports = StageCollection;
