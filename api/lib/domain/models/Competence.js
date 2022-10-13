class Competence {
  constructor({ id, area, name, index, description, origin, skillIds = [], thematicIds = [], tubes = [] } = {}) {
    this.id = id;
    this.area = area;
    this.name = name;
    this.index = index;
    this.description = description;
    this.origin = origin;
    this.level = -1;
    this.skillIds = skillIds;
    this.thematicIds = thematicIds;
    this.tubes = tubes;
  }

  get fullName() {
    return this.index + ' ' + this.name;
  }

  get skills() {
    return this.tubes.flatMap((tube) => tube.skills);
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

  get areaId() {
    return this.area.id;
  }

  get skillCount() {
    return this.skills.length;
  }

  hasSkill(skillId) {
    return this.getSkill(skillId) !== null;
  }

  getSkill(skillId) {
    return this.skills.find((skill) => skill.id === skillId) ?? null;
  }
}

module.exports = Competence;
