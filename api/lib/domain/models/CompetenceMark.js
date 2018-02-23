class CompetenceMark {
  constructor(model) {
    this.id = model.id;
    this.level = model.level;
    this.score = model.score;
    this.area_code = model.area_code;
    this.competence_code = model.competence_code;
    this.correctionId = model.correctionId;
  }
}

module.exports = CompetenceMark;
