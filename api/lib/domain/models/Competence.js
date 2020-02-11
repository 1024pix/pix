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
    skills = [],
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
    this.skills = skills; // TODO remplacer par un vrai tableau de SKills
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

module.exports = Competence;
