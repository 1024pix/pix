class Skill {
  constructor(name) {
    this.name = name;
    this.tubeName = name.slice(0, -1);
    this.difficulty = parseInt(name.slice(-1));
  }

  getEasierWithin(tubes) {
    return tubes[this.tubeName].filter(skill => skill.difficulty <= this.difficulty);
  }

  getHarderWithin(tubes) {
    return tubes[this.tubeName].filter(skill => skill.difficulty >= this.difficulty);
  }
}

module.exports = Skill;
