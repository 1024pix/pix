module.exports = class TargetedThematic {
  constructor({ id, name, index, tubes = [] } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.tubes = tubes;
  }
};
