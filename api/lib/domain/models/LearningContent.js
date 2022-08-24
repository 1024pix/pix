module.exports = class LearningContent {
  constructor(areas) {
    this.areas = areas;
  }

  get competences() {
    return this.areas.flatMap((area) => area.competences);
  }

  get tubes() {
    return this.competences.flatMap((competence) => competence.tubes);
  }

  get skills() {
    return this.tubes.flatMap((tube) => tube.skills);
  }
};
