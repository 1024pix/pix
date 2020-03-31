class Competence {

  constructor({
    id,
    // attributes
    area,
    name,
    index,
    description,
    origin,
    // includes
    skillIds = [],
  } = {}) {
    this.id = id;
    // attributes
    this.area = area;
    this.name = name;
    this.index = index;
    this.description = description;
    this.origin = origin;
    this.level = -1;
    // includes
    this.skillIds = skillIds;
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

module.exports = Competence;
