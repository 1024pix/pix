class Stage {

  constructor({
    id,
    title,
    message,
    threshold,
  } = {}) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.threshold = threshold;
  }

  getMinSkillsCountToReachStage(totalSkills) {
    return Math.ceil(totalSkills * (this.threshold / 100));
  }
}

module.exports = Stage;
