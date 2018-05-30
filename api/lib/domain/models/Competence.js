class Competence {

  constructor({ id, name, index } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }
}

module.exports = Competence;
