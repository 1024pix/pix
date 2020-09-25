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
}

module.exports = TargetedArea;
