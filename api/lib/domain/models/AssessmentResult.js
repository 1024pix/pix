class CompetenceMark {
  constructor(model) {
    this.id = model.id;
    this.level = model.level;
    this.pixScore = model.pixScore;
    this.emitter = model.emitter;
    this.comment = model.comment;
    this.assessmentId = model.assessmentId;
    this.createdAt = model.createdAt;
  }
}

module.exports = CompetenceMark;
