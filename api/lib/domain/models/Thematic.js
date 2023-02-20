class Thematic {
  constructor({ id, name, index, competenceId, tubeIds = [] } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;
  }
}

export default Thematic;
