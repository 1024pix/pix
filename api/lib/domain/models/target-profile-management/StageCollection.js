class StageCollection {
  constructor({ id, stages, maxLevel }) {
    this._id = id;
    this._maxLevel = maxLevel;
    this._stages = [];

    stages.forEach((stage, index) => {
      this._stages.push({
        id: stage.id,
        targetProfileId: id,
        level: stage.level,
        threshold: stage.threshold,
        title: stage.title,
        message: stage.message,
        prescriberTitle: stage.prescriberTitle,
        prescriberDescription: stage.prescriberDescription,
      });

      if (index === 0) this._canAddStageTypeOfLevel = stage.level !== null;
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
        title: stage.title,
        message: stage.message,
        prescriberTitle: stage.prescriberTitle,
        prescriberDescription: stage.prescriberDescription,
      })),
    };
  }
}

module.exports = StageCollection;
