const _ = require('lodash');

class UserCompetence {

  constructor({
    id,
    // attributes
    index,
    name,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.index = index;
    this.name = name;
    // includes
    this.skills = [];
    this.challenges = [];
    // references
  }

  addSkill(newSkill) {
    const hasAlreadySkill = _(this.skills).filter(skill => skill.name === newSkill.name).size();

    if (!hasAlreadySkill) {
      this.skills.push(newSkill);
    }
  }

  addChallenge(newChallenge) {
    const hasAlreadyChallenge = _(this.challenges).filter(challenge => challenge.id === newChallenge.id).size();

    if (!hasAlreadyChallenge) {
      this.challenges.push(newChallenge);
    }
  }
}

module.exports = UserCompetence;
