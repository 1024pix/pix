class TargetProfileWithLearningContent {
  constructor({
    id,
    name,
    skills = [],
    tubes = [],
    competences = [],
    areas = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.skills = skills;
    this.tubes = tubes;
    this.competences = competences;
    this.areas = areas;
  }
}

module.exports = TargetProfileWithLearningContent;
