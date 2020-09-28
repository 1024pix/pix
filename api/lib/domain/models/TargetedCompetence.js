const _ = require('lodash');

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

  get skillCount() {
    return _.sumBy(this.tubes, (tube) => tube.skills.length);
  }
}

module.exports = TargetedCompetence;
