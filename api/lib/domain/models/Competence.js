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

  get reference() {
    return `${this.index} ${this.name}`;
  }

  get areaId() {
    return this.area.id;
  }
}

module.exports = Competence;
