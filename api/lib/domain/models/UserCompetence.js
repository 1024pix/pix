const { MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY } = require('../constants.js');

const _ = require('lodash');

class UserCompetence {
  constructor({ id, index, name, areaId, pixScore, estimatedLevel, skills = [] } = {}) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.areaId = areaId;
    this.pixScore = pixScore;
    this.estimatedLevel = estimatedLevel;
    this.skills = skills;
  }

  addSkill(newSkill) {
    const hasAlreadySkill = _(this.skills)
      .filter((skill) => skill.name === newSkill.name)
      .size();

    if (!hasAlreadySkill) {
      this.skills.push(newSkill);
    }
  }

  isCertifiable() {
    return this.estimatedLevel >= MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY;
  }

  getSkillsAtLatestVersion() {
    const skillsSortedByNameAndVersion = _.orderBy(this.skills, ['name', 'version'], ['asc', 'desc']);
    return _.uniqWith(skillsSortedByNameAndVersion, (a, b) => a.name === b.name);
  }
}

module.exports = UserCompetence;
