class Skill {
  constructor(name) {
    this.name = name;
    this.difficulty = parseInt(name.slice(-1));
  }
}

module.exports = Skill;
