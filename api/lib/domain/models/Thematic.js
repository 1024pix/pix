class Thematic {
  constructor({ id, name, index, tubeIds = [] } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.tubeIds = tubeIds;
  }
}

module.exports = Thematic;
