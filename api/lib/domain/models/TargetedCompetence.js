class TargetedCompetence {
  constructor({
    id,
    name,
    index,
    areaId,
    tubes = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.areaId = areaId;
    this.tubes = tubes;
  }
}

module.exports = TargetedCompetence;
