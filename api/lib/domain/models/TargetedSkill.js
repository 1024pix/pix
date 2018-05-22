const _ = require('lodash');
const Skill = require('./Skill');

class TargetedSkill {
  constructor({ skills }) {
    this.skills = skills;
  }

  static fromListOfSkill(listOfSkill) {

    const completeListOfSkills = [];

    listOfSkill.forEach((skill) => {
      for(let skillLevel = skill.difficulty; skillLevel > 0; skillLevel--) {
        completeListOfSkills.push(new Skill({ name: `${skill.tubeNameWithAt}${skillLevel}` }));
      }
    });
    const listOfUniqueSkills =_.uniqWith(completeListOfSkills, _.isEqual);

    return new TargetedSkill({ skills: listOfUniqueSkills });
  }
}

module.exports = TargetedSkill;
