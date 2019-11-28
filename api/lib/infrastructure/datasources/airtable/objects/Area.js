class Area {
  constructor({
    id,
    code,
    name,
    title,
    competenceIds,
  } = {}) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.title = title;
    this.competenceIds = competenceIds;
  }
}

module.exports = Area;
