class TargetedArea {
  constructor({ id, code, title, color, frameworkId, competences = [] } = {}) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.color = color;
    this.frameworkId = frameworkId;
    this.competences = competences;
  }

  hasCompetence(competenceId) {
    return this.competences.some((competence) => competence.id === competenceId);
  }
}

module.exports = TargetedArea;
