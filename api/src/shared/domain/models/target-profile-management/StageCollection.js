class StageCollection {
  constructor({ id, stages, maxLevel }) {
    this._id = id;
    this._maxLevel = maxLevel;
    this._stages = [];

    stages.forEach((stage) => {
      this._stages.push({
        id: stage.id,
        targetProfileId: id,
        level: stage.level,
        threshold: stage.threshold,
        isFirstSkill: stage.isFirstSkill,
        title: stage.title,
        message: stage.message,
        prescriberTitle: stage.prescriberTitle,
        prescriberDescription: stage.prescriberDescription,
      });
    });
  }

  get stages() {
    return this._stages;
  }

  get id() {
    return this._id;
  }

  get maxLevel() {
    return this._maxLevel;
  }

  toDTO() {
    return {
      id: this._id,
      targetProfileId: this._id,
      stages: this._stages.map((stage) => ({
        id: stage.id,
        level: stage.level,
        threshold: stage.threshold,
        isFirstSkill: stage.isFirstSkill,
        title: stage.title,
        message: stage.message,
        prescriberTitle: stage.prescriberTitle,
        prescriberDescription: stage.prescriberDescription,
      })),
    };
  }
}

export { StageCollection };
