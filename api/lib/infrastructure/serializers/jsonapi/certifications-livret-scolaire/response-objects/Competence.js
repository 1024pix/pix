class Competence {

  constructor({
    id,
    // attributes
    name,
    area,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    // relationship
    this.area = area;
  }

}

module.exports = Competence;
