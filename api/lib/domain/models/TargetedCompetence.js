const _ = require('lodash');

class TargetedCompetence {
  constructor({ id, name, index, origin, areaId, tubes = [], thematics = [] } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.origin = origin;
    this.areaId = areaId;
    this.tubes = tubes;
    this.thematics = thematics;
  }

  get skillCount() {
    return _.sumBy(this.tubes, (tube) => tube.skills.length);
  }
}

module.exports = TargetedCompetence;
