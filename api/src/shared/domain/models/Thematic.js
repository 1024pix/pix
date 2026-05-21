class Thematic {
  constructor({ id, name, index, competenceId, tubeIds = [], tubes = [] } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;
    this.tubes = tubes;
  }
}

export { Thematic };
