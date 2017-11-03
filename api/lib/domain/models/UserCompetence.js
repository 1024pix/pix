const _ = require('lodash');

class UserCompetence {

  constructor(model) {
    this.id = model.id;
    this.index = model.index;
    this.name = model.name;
    this.skills = [];
  }

  addSkill(newSkill) {
    const hasAlreadySkill = _(this.skills).filter(skill => skill.name === newSkill.name).size();

    if(!hasAlreadySkill) {
      this.skills.push(newSkill);
    }
  }

}

module.exports = UserCompetence;
