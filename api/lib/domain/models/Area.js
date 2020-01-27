class Area {

  constructor({
    id,
    // attributes
    code,
    name,
    title,
    color,
    // includes
    competences = [], // list of Competence domain objects
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.title = title;
    this.color = color;
    // includes
    this.competences = competences;
    // references
  }
}

module.exports = Area;
