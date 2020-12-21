class Competence {

  constructor({
    id,
    area,
    name,
    index,
    description,
    origin,
    skillIds = [],
  } = {}) {
    this.id = id;
    this.area = area;
    this.name = name;
    this.index = index;
    this.description = description;
    this.origin = origin;
    this.level = -1;
    this.skillIds = skillIds;
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

module.exports = Competence;
