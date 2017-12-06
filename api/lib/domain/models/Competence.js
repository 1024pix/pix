class Competence {

  constructor(model = {}) {
    this.id = model.id;
    this.name = model.name;
    this.index = model.index;
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

module.exports = Competence;
