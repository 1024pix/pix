class Skill {
  constructor(tubeName, difficulty) {
    this.tubeName = tubeName;
    this.difficulty = difficulty;
  }

  getEasierWithin(tubes) {
    return tubes[this.tubeName].filter(skill => skill.difficulty <= this.difficulty);
  }

  getHarderWithin(tubes) {
    return tubes[this.tubeName].filter(skill => skill.difficulty >= this.difficulty);
  }
}

module.exports = Skill;
