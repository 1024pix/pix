class Stage {

  constructor({
    id,
    title,
    message,
    threshold,
    prescriberTitle,
    prescriberDescription,
    targetProfileId,
  } = {}) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.threshold = threshold;
    this.prescriberTitle = prescriberTitle;
    this.prescriberDescription = prescriberDescription;
    this.targetProfileId = targetProfileId;
  }

  getMinSkillsCountToReachStage(totalSkills) {
    return Math.ceil(totalSkills * (this.threshold / 100));
  }
}

module.exports = Stage;
