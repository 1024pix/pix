class Skill {
  constructor({ name } = {}) {
    this.name = name;
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }

}

module.exports = Skill;
