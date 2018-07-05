class Area {

  constructor({
    id,
    // attributes
    code,
    name,
    title,
    // embedded
    competences = [], // list of Competence domain objects
    // relations
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.title = title;
    // embedded
    this.competences = competences;
    // relations
  }
}

module.exports = Area;
