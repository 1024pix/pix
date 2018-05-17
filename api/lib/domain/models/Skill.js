const _ = require('lodash');
class Skill {
  constructor({ name } = {}) {
    this.name = name;
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }

  get tubeName() {
    return this.name.slice(1, -1);
  }

  getEasierWithin(tubes) {
    return tubes[this.tubeName].filter(skill => skill.difficulty <= this.difficulty);
  }

  getHarderWithin(tubes) {
    return tubes[this.tubeName].filter(skill => skill.difficulty >= this.difficulty);
  }

  computePixScore(competenceSkills) {
    const numberOfSkillsByDifficulty= _.filter(competenceSkills, skill => skill.difficulty === this.difficulty).length;

    return Math.min(4, 8 / numberOfSkillsByDifficulty);
  }

}

module.exports = Skill;
