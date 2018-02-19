class Skill {
  constructor(model = {}) {
    this.name = model.name;
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }

}

module.exports = Skill;
