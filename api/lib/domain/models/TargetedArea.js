class TargetedArea {
  constructor({ id, code, title, color, competences = [] } = {}) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.color = color;
    this.competences = competences;
  }

  hasCompetence(competenceId) {
    return this.competences.some((competence) => competence.id === competenceId);
  }
}

module.exports = TargetedArea;
