class Stage {
  constructor({ id, title, message, threshold, level, prescriberTitle, prescriberDescription, targetProfileId } = {}) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.threshold = threshold;
    this.level = level;
    this.prescriberTitle = prescriberTitle;
    this.prescriberDescription = prescriberDescription;
    this.targetProfileId = targetProfileId;
  }
}

export default Stage;
