class TargetedArea {
  constructor({
    id,
    title,
    competences = [],
  } = {}) {
    this.id = id;
    this.title = title;
    this.competences = competences;
  }

  hasCompetence(competenceId) {
    return this.competences.some((competence) => competence.id === competenceId);
  }
}

module.exports = TargetedArea;
