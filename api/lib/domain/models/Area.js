class Area {

  constructor({
    id,
    // attributes
    code,
    name,
    title,
    // includes
    competences = [], // list of Competence domain objects
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.title = title;
    // includes
    this.competences = competences;
    // references
  }
}

module.exports = Area;
