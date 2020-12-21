class Area {

  constructor({
    id,
    code,
    name,
    title,
    color,
    competences = [], // list of Competence domain objects
  } = {}) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.title = title;
    this.color = color;
    this.competences = competences;
  }
}

module.exports = Area;
